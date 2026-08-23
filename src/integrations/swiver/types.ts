/**
 * Swiver adapter contract.
 *
 * The whole Prodet Platform talks to Swiver through this interface. No
 * feature should import an HTTP client directly — features depend on
 * `SwiverAdapter`, and the implementation behind it can be swapped between
 * a `null` no-op, a sandbox HTTP transport, a production HTTP transport,
 * and a CSV-import fallback without touching feature code.
 *
 * See `docs/02-architecture/adr/0012-swiver-integration-architecture.md`
 * for the broader rationale and the explicit list of prerequisites that
 * unblock the live HTTP implementation.
 */

export type SwiverDocumentKind =
  | 'devis'
  | 'bon_de_commande'
  | 'bon_de_livraison'
  | 'facture'
  /** Type 1 (FAF-) — Prodet's own supplier/purchase invoices, NOT client sales. */
  | 'facture_fournisseur'
  | 'avoir';

/**
 * Status as Swiver itself reports it for a given document. The mapping from
 * `SwiverDocumentStatusRaw` (free string returned by the API) to this enum
 * is finalised in the adapter implementation, not here.
 */
export type SwiverDocumentStatus =
  | 'draft'
  | 'sent'
  | 'partially_paid'
  | 'paid'
  | 'cancelled'
  | 'unknown';

export type SwiverCustomer = {
  swiverId: string;
  legalName: string;
  displayName: string | null;
  externalCode: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  vatNumber: string | null;
  rawShape: unknown;
};

export type SwiverProduct = {
  swiverId: string;
  sku: string | null;
  name: string;
  unitOfSale: string | null;
  conditionnement: string | null;
  active: boolean;
  /** Sale price (unit_price), parsed to a number. Private — never shown publicly. */
  unitPrice: number | null;
  categoryLabel: string | null;
  brandName: string | null;
  /** Public CDN URL of the product image (Swiver R2), if any. */
  imageUrl: string | null;
  /** Raw description (may contain HTML). */
  description: string | null;
  rawShape: unknown;
};

export type SwiverDocumentSummary = {
  swiverId: string;
  kind: SwiverDocumentKind;
  status: SwiverDocumentStatus;
  documentNumber: string;
  customerSwiverId: string;
  issueDate: Date;
  dueDate: Date | null;
  totalHt: number | null;
  totalTtc: number | null;
  currency: string;
  rawShape: unknown;
};

/**
 * Read-only customer port. Stage 2 candidate.
 */
/** Champs acceptés par la création client Swiver (POST /open_api/customers/new). */
export type SwiverCustomerInput = {
  /** Raison sociale — sert de `name` ET de `companyName` côté Swiver. */
  companyName: string;
  email?: string | null;
  phone?: string | null;
  /** Matricule fiscal (champ `registration`). */
  registration?: string | null;
  address?: string | null;
  postalCode?: string | null;
};

export interface SwiverCustomerPort {
  listCustomers(params: { updatedSince?: Date }): Promise<SwiverCustomer[]>;
  getCustomer(swiverId: string): Promise<SwiverCustomer | null>;
  /**
   * POST /open_api/customers/new — crée un client actif et renvoie son id.
   *
   * Attention : le POST attend des champs en **camelCase** (`companyName`,
   * `contactAddress`), alors que la lecture renvoie du snake_case
   * (`company_name`, `contact_address`). Vérifié en direct sur le tenant :
   * `/open_api/customers/` n'accepte que GET, c'est bien `/new` qui crée.
   * Renvoie null en cas d'échec — la création ne doit jamais bloquer
   * l'ouverture d'un accès portail.
   */
  createCustomer(input: SwiverCustomerInput): Promise<{ swiverId: string; reference: string | null } | null>;
}

/**
 * Read-only product port. Stage 2 candidate.
 */
export interface SwiverProductPort {
  listProducts(params: { updatedSince?: Date }): Promise<SwiverProduct[]>;
  getProduct(swiverId: string): Promise<SwiverProduct | null>;
}

/**
 * Read-only document port. Stage 2/3 candidate. Writing documents (devis,
 * BC) becomes a separate method (`createDevis`, `createBonDeCommande`) once
 * Stage 3 ships — kept out of this skeleton on purpose to avoid pretending
 * the write surface is ready.
 */
export type SwiverOrderLineInput = {
  productSwiverId: string | number;
  quantity: number;
  unitPrice?: number | null;
  label: string;
};

export interface SwiverDocumentPort {
  listDocumentsForCustomer(params: {
    customerSwiverId: string;
    kinds?: SwiverDocumentKind[];
    updatedSince?: Date;
    /** Also fetch state=draft docs (the list endpoint hides drafts by default). */
    includeDrafts?: boolean;
  }): Promise<SwiverDocumentSummary[]>;
  getDocument(swiverId: string): Promise<SwiverDocumentSummary | null>;
  /** GET /open_api/document/pdf/{id} — the real Swiver PDF, or null. */
  getDocumentPdf(swiverId: string): Promise<Uint8Array | null>;

  // ---- write surface (confirmed routes) ----
  /** POST /open_api/document/draft {type} → new draft (with version + warehouse). type 4 = sales order. */
  createDraftDocument(
    type: number,
  ): Promise<{ swiverId: string; version: number; warehouseId: number | null } | null>;
  /** PUT /open_api/document/{id} — set contact + lines on a draft (retries once on transient failure). */
  updateDocument(
    swiverId: string,
    input: {
      /**
       * Swiver contact to attach. Omit to leave the draft's client empty —
       * used by the public devis push, where the requester is a prospect with
       * no Swiver contact yet and an operator creates one by hand.
       */
      contactSwiverId?: string | number | null;
      lines: SwiverOrderLineInput[];
      version?: number;
      warehouseId?: number | null;
      /** Swiver document type code (4 = sale order, 6 = devis). Defaults to 4. */
      type?: number;
    },
  ): Promise<boolean>;
  /** PUT /open_api/document/state/{id} {transition} — e.g. 'to_canceled'. */
  setDocumentState(swiverId: string, transition: string): Promise<boolean>;
}

export interface SwiverHealthPort {
  /**
   * Returns true when the configured transport can reach Swiver and
   * authenticate. Must NEVER throw — implementations swallow errors and
   * return false. This is used by an admin status pill.
   */
  ping(): Promise<boolean>;
}

export interface SwiverAdapter {
  readonly mode: 'disabled' | 'sandbox' | 'production';
  customers: SwiverCustomerPort;
  products: SwiverProductPort;
  documents: SwiverDocumentPort;
  health: SwiverHealthPort;
}

export class SwiverNotConfiguredError extends Error {
  constructor(message = 'Swiver adapter is not configured (missing SWIVER_API_BASE_URL or SWIVER_API_KEY).') {
    super(message);
    this.name = 'SwiverNotConfiguredError';
  }
}
