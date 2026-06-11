import 'server-only';
import { request as httpsRequest } from 'node:https';
import { getServerEnv } from '@/lib/env';
import {
  SwiverNotConfiguredError,
  type SwiverAdapter,
  type SwiverCustomer,
  type SwiverCustomerPort,
  type SwiverDocumentKind,
  type SwiverDocumentPort,
  type SwiverDocumentSummary,
  type SwiverHealthPort,
  type SwiverOrderLineInput,
  type SwiverProduct,
  type SwiverProductPort,
} from './types';

/**
 * Live HTTP adapter for the Swiver Open API. The exact endpoint shapes are
 * derived from the authenticated Swiver Docs (Swagger) — Souhail has
 * confirmed the customers endpoint signature. Endpoints we have not yet
 * verified against the docs intentionally throw `SwiverEndpointNotMappedYet`
 * so a feature cannot silently get back fabricated data.
 *
 * Constructor never performs IO. The first call to a method exercises
 * `fetch`. This keeps `build` and `typecheck` free of network calls.
 */
export class SwiverEndpointNotMappedYet extends Error {
  constructor(endpoint: string) {
    super(
      `Swiver endpoint "${endpoint}" is not yet mapped in the HTTP adapter. ` +
        'Add a mapping with confirmed request/response shapes before relying on it.',
    );
    this.name = 'SwiverEndpointNotMappedYet';
  }
}

type RequestInitJson = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /** Override the default 10 s timeout for slow endpoints. */
  timeoutMs?: number;
};

class HttpTransport {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly defaultTimeoutMs = 10_000;

  constructor(params: { baseUrl: string; token: string }) {
    this.baseUrl = params.baseUrl.replace(/\/+$/, '');
    this.token = params.token;
  }

  async fetchJson<T>(path: string, init: RequestInitJson = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    if (init.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(key, String(value));
      }
    }

    const method = init.method ?? 'GET';
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Swiver Open API authenticates via the X-AUTH-TOKEN header
      // (confirmed live against server.swiver.io — NOT Bearer).
      'X-AUTH-TOKEN': this.token,
    };
    const bodyStr = init.body ? JSON.stringify(init.body) : undefined;
    const timeoutMs = init.timeoutMs ?? this.defaultTimeoutMs;

    // undici (the global fetch) has a request-framing quirk that makes Swiver's
    // server return HTML 500s on document WRITES (PUT/POST) — confirmed: the exact
    // same bytes succeed via curl and node:https but 500 via fetch. So route writes
    // through node:https, which behaves like curl. Reads stay on fetch.
    if (method !== 'GET') {
      return this.requestViaHttps<T>(url, method, headers, bodyStr, timeoutMs);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: bodyStr,
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new SwiverHttpError(response.status, response.statusText, text.slice(0, 500));
      }

      // Some endpoints return empty 204; treat as null.
      if (response.status === 204) return null as T;
      const json = (await response.json()) as T;
      return json;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Binary GET (PDF exports). Returns null on non-200 or non-PDF payloads. */
  async fetchPdf(path: string): Promise<Uint8Array | null> {
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    const controller = new AbortController();
    // PDF generation is slower than JSON reads — give it twice the budget.
    const timer = setTimeout(() => controller.abort(), this.defaultTimeoutMs * 2);
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/pdf', 'X-AUTH-TOKEN': this.token },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) return null;
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('pdf')) return null;
      return new Uint8Array(await response.arrayBuffer());
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  private requestViaHttps<T>(
    url: URL,
    method: string,
    headers: Record<string, string>,
    bodyStr: string | undefined,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const req = httpsRequest(
        url,
        {
          method,
          headers: {
            ...headers,
            ...(bodyStr ? { 'Content-Length': String(Buffer.byteLength(bodyStr)) } : {}),
          },
          timeout: timeoutMs,
        },
        (res) => {
          const status = res.statusCode ?? 0;
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (status < 200 || status >= 300) {
              reject(new SwiverHttpError(status, res.statusMessage ?? '', data.slice(0, 500)));
              return;
            }
            if (status === 204 || !data) {
              resolve(null as T);
              return;
            }
            try {
              resolve(JSON.parse(data) as T);
            } catch (error) {
              reject(error instanceof Error ? error : new Error('Invalid JSON from Swiver'));
            }
          });
        },
      );
      req.on('error', reject);
      req.on('timeout', () => req.destroy(new Error('Swiver request timeout')));
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }
}

export class SwiverHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly bodyPreview: string,
  ) {
    super(`Swiver HTTP ${status} ${statusText}: ${bodyPreview}`);
    this.name = 'SwiverHttpError';
  }
}

// ---------------------------------------------------------------------------
// Mappers — convert documented Swiver shapes to Prodet's typed entities.
// Only `customers` is confirmed today; the others stay defensive.
// ---------------------------------------------------------------------------

/**
 * Documented response shape for `GET /open_api/customers/`:
 *   { count, countArchived, countEnabled, rows: SwiverCustomerRaw[] }
 */
type SwiverCustomerRaw = {
  id: number | string;
  /** Almost always null on real data — the real label is `company_name`. */
  name?: string | null;
  company_name?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  phone3?: string | null;
  email?: string | null;
  type?: number | null;
  /** Customer code (e.g. "41100084"). */
  reference?: string | null;
  /** Tax registration / matricule fiscal. */
  registration?: string | null;
  vat_number?: string | null;
  external_code?: string | null;
  contact_address?: Array<{
    address?: {
      address?: string | null;
      zip_code?: string | null;
      region?: string | null;
      country?: string | null;
    } | null;
  }> | null;
  contact_phones?: Array<{ value?: string | null }> | null;
};

type SwiverCustomersListResponse = {
  count?: number;
  countArchived?: number;
  countEnabled?: number;
  rows?: SwiverCustomerRaw[];
};

function mapCustomer(raw: SwiverCustomerRaw): SwiverCustomer {
  const address = raw.contact_address?.[0]?.address ?? null;
  const label = (raw.company_name ?? raw.name)?.trim() || null;
  return {
    swiverId: String(raw.id),
    legalName: label ?? `(sans nom #${raw.id})`,
    displayName: label,
    externalCode: raw.reference ?? raw.external_code ?? null,
    email: raw.email?.trim() || null,
    phone: raw.phone1 ?? raw.phone2 ?? raw.phone3 ?? null,
    addressLine1: address?.address ?? null,
    city: address?.region ?? null,
    postalCode: address?.zip_code ?? null,
    country: address?.country ?? null,
    vatNumber: raw.registration ?? raw.vat_number ?? null,
    rawShape: raw,
  };
}

/** Documented list shape for `GET /open_api/products/`. */
type SwiverProductRaw = {
  id: number | string;
  name?: string | null;
  reference?: string | null;
  internal_ref?: string | null;
  enabled?: boolean | null;
  unit?: { code?: string | null; name?: string | null } | null;
  unit_price?: string | null;
  description?: string | null;
  category?: { label?: string | null } | null;
  brand?: { name?: string | null } | null;
  image?: { web_path?: string | null } | null;
};

type SwiverProductsListResponse = {
  count?: number;
  countArchived?: number;
  countEnabled?: number;
  rows?: SwiverProductRaw[];
};

function mapProduct(raw: SwiverProductRaw): SwiverProduct {
  const unitLabel = raw.unit?.name ?? raw.unit?.code ?? null;
  return {
    swiverId: String(raw.id),
    sku: raw.reference ?? raw.internal_ref ?? null,
    name: raw.name?.trim() || `(produit #${raw.id})`,
    unitOfSale: unitLabel,
    conditionnement: null,
    active: raw.enabled !== false,
    unitPrice: parseMoney(raw.unit_price),
    categoryLabel: raw.category?.label?.trim() || null,
    brandName: raw.brand?.name?.trim() || null,
    imageUrl: raw.image?.web_path?.trim() || null,
    description: raw.description?.trim() || null,
    rawShape: raw,
  };
}

/** Minimal subset of `GET /open_api/document/:id/` used for projections. */
type SwiverDocumentRaw = {
  id?: number | string | null;
  reference?: string | null;
  state?: string | null;
  type?: string | null;
  date?: string | null;
  due_date?: string | null;
  currency?: string | null;
  total_amount?: string | null;
  amount_to_pay?: string | null;
  default_total_amount_ht?: string | null;
  contact?: { id?: number | string | null } | null;
};

type SwiverDocumentListResponse = {
  count?: number;
  rows?: SwiverDocumentRaw[];
};

function mapSwiverDocumentKind(rawType: string | null | undefined): SwiverDocumentKind {
  const t = (rawType ?? '').toLowerCase().trim();
  if (t.includes('estimate') || t.includes('devis') || t.includes('quote')) return 'devis';
  if (t.includes('invoice') || t.includes('facture')) return 'facture';
  if (t.includes('delivery') || t.includes('livraison') || t.includes('bl')) return 'bon_de_livraison';
  if (t.includes('credit') || t.includes('avoir')) return 'avoir';
  if (t.includes('order') || t.includes('commande') || t.includes('purchase')) return 'bon_de_commande';
  return 'devis';
}

function mapSwiverDocumentStatus(rawState: string | null | undefined): SwiverDocumentSummary['status'] {
  const s = (rawState ?? '').toLowerCase().trim();
  if (!s) return 'unknown';
  if (s.includes('draft') || s.includes('brouillon')) return 'draft';
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('unpaid') || s.includes('impay')) return 'partially_paid';
  if (s.includes('paid') || s.includes('pay')) return 'paid';
  if (s.includes('sent') || s.includes('envoy')) return 'sent';
  // Live states observed on server.swiver.io: devis are 'created'/'accepted',
  // validated sale orders are 'valid'. All three mean "issued, not cancelled".
  if (s === 'valid' || s === 'accepted' || s === 'created') return 'sent';
  return 'unknown';
}

function parseMoney(value: string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const normalised = value.replace(/\s/g, '').replace(',', '.');
  const n = Number.parseFloat(normalised);
  return Number.isFinite(n) ? n : null;
}

function mapDocument(raw: SwiverDocumentRaw): SwiverDocumentSummary {
  const contactId = raw.contact?.id;
  const issueDate = raw.date ? new Date(raw.date) : new Date();
  const currency = raw.currency?.trim() || 'TND';
  const totalTtc = parseMoney(raw.total_amount) ?? parseMoney(raw.amount_to_pay);
  const totalHt = parseMoney(raw.default_total_amount_ht);
  const dueDate = raw.due_date ? new Date(raw.due_date) : null;

  // Live documents use numeric type codes ('1' facture, '4' bon de commande,
  // '6' devis); fall back to the keyword mapper for any verbose shapes.
  const typeCode = (raw.type ?? '').toString().trim();
  const kind =
    SWIVER_TYPE_TO_KIND[typeCode] ?? mapSwiverDocumentKind(raw.type ?? null);

  return {
    swiverId: raw.id != null ? String(raw.id) : '',
    kind,
    status: mapSwiverDocumentStatus(raw.state ?? null),
    documentNumber: raw.reference?.trim() ?? `(doc #${raw.id ?? '?'})`,
    customerSwiverId: contactId != null ? String(contactId) : '',
    issueDate: Number.isFinite(issueDate.getTime()) ? issueDate : new Date(),
    dueDate: dueDate && Number.isFinite(dueDate.getTime()) ? dueDate : null,
    totalHt,
    totalTtc,
    currency,
    rawShape: raw,
  };
}

/**
 * Numeric document type codes confirmed live against server.swiver.io:
 * 1 = facture FOURNISSEUR / purchase (FAF-…) — contacts are Prodet's
 *     suppliers (AGIL, producers), NOT clients;
 * 3 = facture client / sales invoice (FAC-…) — states paid/unpaid;
 * 4 = bon de commande / sales order (CDC-…);
 * 5 = bon de livraison / delivery note (BL-…);
 * 6 = devis (DEV-…).
 */
const SWIVER_TYPE_TO_KIND: Record<string, SwiverDocumentKind> = {
  '1': 'facture_fournisseur',
  '3': 'facture',
  '4': 'bon_de_commande',
  '5': 'bon_de_livraison',
  '6': 'devis',
};

const SWIVER_KIND_TO_TYPE: Partial<Record<SwiverDocumentKind, number>> = {
  facture_fournisseur: 1,
  facture: 3,
  bon_de_commande: 4,
  bon_de_livraison: 5,
  devis: 6,
};

// ---------------------------------------------------------------------------
// Ports
// ---------------------------------------------------------------------------

class HttpCustomerPort implements SwiverCustomerPort {
  constructor(private readonly transport: HttpTransport) {}

  async listCustomers(params: { updatedSince?: Date }): Promise<SwiverCustomer[]> {
    // Pagination: walk the documented offset/limit loop until rows are
    // shorter than `limit`. We cap total to 5_000 to keep a stray full
    // sweep from blowing up — the daily sync job will use a narrower
    // window via `updatedSince` once Swiver documents that filter.
    const limit = 200;
    const maxTotal = 5_000;
    let offset = 0;
    const accumulated: SwiverCustomer[] = [];

    void params.updatedSince; // Filter not yet confirmed by the docs.

    while (accumulated.length < maxTotal) {
      const response = await this.transport.fetchJson<SwiverCustomersListResponse>(
        '/open_api/customers/',
        {
          query: { offset, limit, enabled: 'true' },
        },
      );
      const rows = response.rows ?? [];
      accumulated.push(...rows.map(mapCustomer));
      if (rows.length < limit) break;
      offset += limit;
    }

    return accumulated;
  }

  async getCustomer(swiverId: string): Promise<SwiverCustomer | null> {
    try {
      // The docs show "Get a customer" — exact path expected to be
      // `/open_api/customers/{id}/`. Defensive against trailing slash.
      const raw = await this.transport.fetchJson<SwiverCustomerRaw>(
        `/open_api/customers/${encodeURIComponent(swiverId)}/`,
      );
      if (!raw) return null;
      return mapCustomer(raw);
    } catch (error) {
      if (error instanceof SwiverHttpError && error.status === 404) return null;
      throw error;
    }
  }
}

class HttpProductPort implements SwiverProductPort {
  constructor(private readonly transport: HttpTransport) {}

  async listProducts(params: { updatedSince?: Date }): Promise<SwiverProduct[]> {
    void params.updatedSince;

    const limit = 200;
    const maxTotal = 10_000;
    let offset = 0;
    const accumulated: SwiverProduct[] = [];

    while (accumulated.length < maxTotal) {
      const response = await this.transport.fetchJson<SwiverProductsListResponse>(
        '/open_api/products/',
        {
          query: { offset, limit, enabled: 'true' },
        },
      );
      const rows = response.rows ?? [];
      accumulated.push(...rows.map(mapProduct));
      if (rows.length < limit) break;
      offset += limit;
    }

    return accumulated;
  }

  async getProduct(swiverId: string): Promise<SwiverProduct | null> {
    try {
      const raw = await this.transport.fetchJson<SwiverProductRaw>(
        `/open_api/products/${encodeURIComponent(swiverId)}/`,
      );
      if (!raw) return null;
      return mapProduct(raw);
    } catch (error) {
      if (error instanceof SwiverHttpError && error.status === 404) return null;
      throw error;
    }
  }
}

class HttpDocumentPort implements SwiverDocumentPort {
  constructor(private readonly transport: HttpTransport) {}

  // GET /open_api/document/list?type=&contact=&offset=&limit= — confirmed
  // live (the endpoint 500s without `type`, so we query one kind at a time).
  async listDocumentsForCustomer(params: {
    customerSwiverId: string;
    kinds?: SwiverDocumentKind[];
    updatedSince?: Date;
    includeDrafts?: boolean;
  }): Promise<SwiverDocumentSummary[]> {
    void params.updatedSince; // No confirmed date filter on this endpoint.

    const kinds = params.kinds?.length ? params.kinds : (['devis', 'facture'] as SwiverDocumentKind[]);
    const typeCodes = kinds
      .map((k) => SWIVER_KIND_TO_TYPE[k])
      .filter((t): t is number => t != null);
    // The endpoint only returns validated docs unless state=draft is passed —
    // portal-pushed orders live as drafts, so callers may ask for both passes.
    const states: Array<string | undefined> = params.includeDrafts ? [undefined, 'draft'] : [undefined];

    const limit = 100;
    const maxPerKind = 500;
    const all: SwiverDocumentSummary[] = [];

    for (const type of typeCodes) {
      for (const state of states) {
        let offset = 0;
        while (offset < maxPerKind) {
          const response = await this.transport.fetchJson<SwiverDocumentListResponse>(
            '/open_api/document/list',
            {
              query: { type, contact: params.customerSwiverId, offset, limit, ...(state ? { state } : {}) },
              // Document lists are heavier than other reads; the default 10s was
              // timing out on cold loads and poisoning the spending cache.
              timeoutMs: 20_000,
            },
          );
          const rows = response.rows ?? [];
          all.push(...rows.map(mapDocument));
          if (rows.length < limit) break;
          offset += limit;
        }
      }
    }

    return all.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  }

  // Confirmed live: GET /open_api/document/pdf/{id} → application/pdf.
  async getDocumentPdf(swiverId: string): Promise<Uint8Array | null> {
    if (!/^\d+$/.test(swiverId)) return null;
    return this.transport.fetchPdf(`/open_api/document/pdf/${swiverId}`);
  }

  async getDocument(swiverId: string): Promise<SwiverDocumentSummary | null> {
    try {
      const raw = await this.transport.fetchJson<SwiverDocumentRaw>(
        `/open_api/document/${encodeURIComponent(swiverId)}/`,
      );
      if (!raw || raw.id == null) return null;
      return mapDocument(raw);
    } catch (error) {
      if (error instanceof SwiverHttpError && error.status === 404) return null;
      throw error;
    }
  }

  // POST /open_api/document/draft {type} (note: NO trailing slash).
  async createDraftDocument(
    type: number,
  ): Promise<{ swiverId: string; version: number; warehouseId: number | null } | null> {
    try {
      const res = await this.transport.fetchJson<{
        id?: number | string;
        version?: number;
        warehouse?: { id?: number | string } | null;
      }>('/open_api/document/draft', { method: 'POST', body: { type } });
      if (res?.id == null) return null;
      return {
        swiverId: String(res.id),
        version: res.version ?? 1,
        warehouseId: res.warehouse?.id != null ? Number(res.warehouse.id) : null,
      };
    } catch (error) {
      console.error('[swiver] createDraftDocument failed', error instanceof Error ? error.message : error);
      return null;
    }
  }

  // PUT /open_api/document/{id} — set contact + product lines on a draft.
  // Verified contract: refs are plain integer ids; lines need the FULL field
  // set (type:0, qty1/qty2/weight/taxes/discount) or Swiver 500s; `vat` is the
  // PERCENTAGE (19), not a tax id. unit_price/vat/unit come from the Swiver product.
  async updateDocument(
    swiverId: string,
    input: {
      contactSwiverId: string | number;
      lines: SwiverOrderLineInput[];
      version?: number;
      warehouseId?: number | null;
    },
  ): Promise<boolean> {
    try {
      // Prefer the version/warehouse handed in from create (no re-GET race).
      let version = input.version;
      let warehouseId = input.warehouseId ?? null;
      if (version == null) {
        const doc = await this.transport.fetchJson<{
          version?: number;
          warehouse?: { id?: number | string } | null;
        }>(`/open_api/document/${encodeURIComponent(swiverId)}/`);
        version = doc?.version ?? 1;
        if (warehouseId == null && doc?.warehouse?.id != null) warehouseId = Number(doc.warehouse.id);
      }

      // Resolve each line's vat% + unit from the Swiver product.
      const lines = await Promise.all(
        input.lines.map(async (l) => {
          let vatRate = 19;
          let unitId: number | undefined;
          let price = l.unitPrice;
          try {
            const p = await this.transport.fetchJson<{
              vat?: { vat?: number } | null;
              unit?: { id?: number } | null;
              unit_price?: string | null;
            }>(`/open_api/products/${encodeURIComponent(String(l.productSwiverId))}/`);
            if (p?.vat?.vat != null) vatRate = p.vat.vat;
            if (p?.unit?.id != null) unitId = p.unit.id;
            if (price == null && p?.unit_price != null) price = Number(p.unit_price);
          } catch {
            // Defaults (vat 19) are fine — operator finalises the draft in Swiver.
          }
          return {
            type: 0,
            product: Number(l.productSwiverId),
            qty: String(l.quantity),
            qty1: 0,
            qty2: 0,
            label: l.label,
            // Swiver's web UI renders `product_label` (not `label`) as the line
            // designation — confirmed by diffing a UI-created order against an
            // API-pushed one. Without it the UI shows only the reference + "--".
            product_label: l.label,
            unit_price: price != null ? String(price) : '0',
            vat: vatRate,
            discount: 0,
            weight: 0,
            taxes: [] as unknown[],
            ...(unitId != null ? { unit: unitId } : {}),
          };
        }),
      );

      const body = {
        id: Number(swiverId),
        type: '4',
        version,
        warehouse: warehouseId ?? undefined,
        contact: Number(input.contactSwiverId),
        document_lines: lines,
      };

      // PUT with one retry — Swiver occasionally returns a transient 500.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          await this.transport.fetchJson(`/open_api/document/${encodeURIComponent(swiverId)}`, {
            method: 'PUT',
            body,
          });
          return true;
        } catch (error) {
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 600));
            continue;
          }
          console.error('[swiver] updateDocument PUT failed', error instanceof Error ? error.message : error);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('[swiver] updateDocument failed', error instanceof Error ? error.message : error);
      return false;
    }
  }

  // PUT /open_api/document/state/{id} {transition}.
  async setDocumentState(swiverId: string, transition: string): Promise<boolean> {
    try {
      await this.transport.fetchJson(`/open_api/document/state/${encodeURIComponent(swiverId)}`, {
        method: 'PUT',
        body: { transition },
      });
      return true;
    } catch (error) {
      console.error('[swiver] setDocumentState failed', error instanceof Error ? error.message : error);
      return false;
    }
  }
}

class HttpHealthPort implements SwiverHealthPort {
  constructor(private readonly transport: HttpTransport) {}

  async ping(): Promise<boolean> {
    // Use the smallest documented read (customers list, limit=1) as the
    // canonical health probe. Always swallows errors per the port
    // contract — UI uses this to render a status pill.
    try {
      await this.transport.fetchJson<SwiverCustomersListResponse>('/open_api/customers/', {
        query: { offset: 0, limit: 1 },
        timeoutMs: 4_000,
      });
      return true;
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createHttpSwiverAdapter(params: {
  mode: 'sandbox' | 'production';
}): SwiverAdapter {
  const env = getServerEnv();
  if (!env.SWIVER_API_BASE_URL || !env.SWIVER_API_KEY) {
    throw new SwiverNotConfiguredError(
      'SWIVER_API_BASE_URL and SWIVER_API_KEY are required when SWIVER_MODE is not "disabled".',
    );
  }
  const transport = new HttpTransport({
    baseUrl: env.SWIVER_API_BASE_URL,
    token: env.SWIVER_API_KEY,
  });
  return {
    mode: params.mode,
    customers: new HttpCustomerPort(transport),
    products: new HttpProductPort(transport),
    documents: new HttpDocumentPort(transport),
    health: new HttpHealthPort(transport),
  };
}
