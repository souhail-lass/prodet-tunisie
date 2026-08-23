import { and, asc, count, desc, eq, gte, inArray, isNull, lt, sql, sum } from 'drizzle-orm';
import {
  type PortalOrderStatus,
  type PortalRequestMetadata,
  extractPortalRequestMetadata,
  portalStatusLabels,
  summarizeProducts,
} from './request-history';
import type { Locale } from '@/i18n/routing';

export type ClientDashboardMetric = {
  id: 'total' | 'review' | 'approved' | 'rejected' | 'latest' | 'usual_products';
  label: string;
  value: string;
  detail: string;
  tone: 'neutral' | 'info' | 'success' | 'danger';
  href?: string;
};

export type ClientDashboardRecentRequest = {
  id: string;
  referenceCode: string;
  createdAt: Date;
  updatedAt: Date;
  status: PortalOrderStatus;
  lineCount: number;
  linePreview: string[];
  productSummary: string;
  metadata: PortalRequestMetadata;
};

export type ClientDashboardUsualProductPreview = {
  id: string;
  productName: string;
  categoryName: string | null;
  conditionnement: string | null;
  unitOfSale: string | null;
  defaultQuantity: number;
  note: string | null;
};

export type ClientDashboardCue = {
  id: string;
  label: string;
  detail: string;
  tone: 'neutral' | 'info' | 'success' | 'danger';
  href?: string;
};

export type ClientDashboardTimelineEvent = {
  id: string;
  label: string;
  detail: string;
  createdAt: Date;
  tone: 'neutral' | 'info' | 'success' | 'danger';
};

export type ClientDashboardTopProduct = {
  productId: string;
  slug: string;
  productName: string;
  categoryName: string | null;
  /** Total quantity ordered across portal requests in the 90-day window. */
  totalQuantity: number;
  /** Number of distinct requests this product appeared in. */
  requestCount: number;
};

export type ClientDashboardActivityWindow = {
  /** Number of portal requests created in the last 90 days. */
  last90: number;
  /** Number of portal requests in the prior 90-day window (for trend). */
  previous90: number;
  /** Difference last90 - previous90 (may be negative). */
  delta: number;
  /** Average days between the last two requests. Null if < 2 requests. */
  averageDaysBetweenRequests: number | null;
};

export type ClientDashboardData = {
  statusCounts: Record<PortalOrderStatus, number>;
  totalRequests: number;
  currentMonthRequests: number;
  usualProductsCount: number;
  usualProductsPreview: ClientDashboardUsualProductPreview[];
  latestRequest: ClientDashboardRecentRequest | null;
  recentRequests: ClientDashboardRecentRequest[];
  topProducts: ClientDashboardTopProduct[];
  activity: ClientDashboardActivityWindow;
  metrics: ClientDashboardMetric[];
  cues: ClientDashboardCue[];
  timelinePreview: ClientDashboardTimelineEvent[];
};

const emptyStatusCounts: Record<PortalOrderStatus, number> = {
  parsing: 0,
  review: 0,
  approved: 0,
  exported: 0,
  rejected: 0,
};

export async function getClientDashboardData({
  customerId,
  locale,
}: {
  customerId: string;
  locale: Locale;
}): Promise<ClientDashboardData> {
  const { db, schema } = await import('@/db/client');
  const now = new Date();
  const startOfMonth = getStartOfCurrentMonth(now);
  const window90Start = addDays(now, -90);
  const window180Start = addDays(now, -180);
  const scopedDraftWhere = and(
    eq(schema.orderDraft.customerId, customerId),
    eq(schema.orderDraft.source, 'portal'),
    isNull(schema.orderDraft.deletedAt),
  );

  const [
    statusRows,
    monthRows,
    usualProductRows,
    usualProductsPreviewRows,
    recentDrafts,
    last90Rows,
    previous90Rows,
    cadenceRows,
    topProductRows,
  ] = await Promise.all([
      db
        .select({
          status: schema.orderDraft.status,
          value: count(),
        })
        .from(schema.orderDraft)
        .where(scopedDraftWhere)
        .groupBy(schema.orderDraft.status),
      db
        .select({ value: count() })
        .from(schema.orderDraft)
        .where(and(scopedDraftWhere, gte(schema.orderDraft.createdAt, startOfMonth))),
      db
        .select({ value: count() })
        .from(schema.customerUsualProduct)
        .innerJoin(schema.product, eq(schema.customerUsualProduct.productId, schema.product.id))
        .where(
          and(
            eq(schema.customerUsualProduct.customerId, customerId),
            eq(schema.customerUsualProduct.isActive, true),
            isNull(schema.product.deletedAt),
          ),
        ),
      db
        .select({
          id: schema.customerUsualProduct.id,
          translatedName: schema.productTranslation.name,
          nameCanonical: schema.product.nameCanonical,
          categoryNameFr: schema.category.nameFr,
          categoryNameEn: schema.category.nameEn,
          conditionnement: schema.product.conditionnement,
          unitOfSale: schema.product.unitOfSale,
          defaultQuantity: schema.customerUsualProduct.defaultQuantity,
          note: schema.customerUsualProduct.note,
        })
        .from(schema.customerUsualProduct)
        .innerJoin(schema.product, eq(schema.customerUsualProduct.productId, schema.product.id))
        .leftJoin(
          schema.productTranslation,
          and(
            eq(schema.productTranslation.productId, schema.product.id),
            eq(schema.productTranslation.locale, locale),
          ),
        )
        .leftJoin(schema.category, eq(schema.product.categoryId, schema.category.id))
        .where(
          and(
            eq(schema.customerUsualProduct.customerId, customerId),
            eq(schema.customerUsualProduct.isActive, true),
            isNull(schema.product.deletedAt),
          ),
        )
        .orderBy(asc(schema.category.displayOrder), asc(schema.product.nameCanonical))
        .limit(5),
      db
        .select({
          id: schema.orderDraft.id,
          referenceCode: schema.orderDraft.referenceCode,
          createdAt: schema.orderDraft.createdAt,
          updatedAt: schema.orderDraft.updatedAt,
          status: schema.orderDraft.status,
          rawInbound: schema.orderDraft.rawInbound,
          notesInternal: schema.orderDraft.notesInternal,
          approvedAt: schema.orderDraft.approvedAt,
          exportedAt: schema.orderDraft.exportedAt,
          rejectedAt: schema.orderDraft.rejectedAt,
        })
        .from(schema.orderDraft)
        .where(scopedDraftWhere)
        .orderBy(desc(schema.orderDraft.createdAt))
        .limit(5),
      // Activity windows: 90 days vs the prior 90 days. Trend = last90 - previous90.
      db
        .select({ value: count() })
        .from(schema.orderDraft)
        .where(and(scopedDraftWhere, gte(schema.orderDraft.createdAt, window90Start))),
      db
        .select({ value: count() })
        .from(schema.orderDraft)
        .where(
          and(
            scopedDraftWhere,
            gte(schema.orderDraft.createdAt, window180Start),
            lt(schema.orderDraft.createdAt, window90Start),
          ),
        ),
      // Cadence: average gap between consecutive request creations.
      db
        .select({ createdAt: schema.orderDraft.createdAt })
        .from(schema.orderDraft)
        .where(scopedDraftWhere)
        .orderBy(desc(schema.orderDraft.createdAt))
        .limit(8),
      // Top requested products in the last 90 days. Aggregated over matched
      // product ids — lines without a matched product (unknown free text) are
      // excluded from the leaderboard because they have no canonical identity.
      db
        .select({
          productId: schema.product.id,
          slug: schema.product.slug,
          productNameCanonical: schema.product.nameCanonical,
          translatedName: schema.productTranslation.name,
          categoryNameFr: schema.category.nameFr,
          categoryNameEn: schema.category.nameEn,
          totalQuantity: sum(schema.orderLine.quantity).as('total_quantity'),
          requestCount: sql<number>`count(distinct ${schema.orderLine.orderDraftId})`.as(
            'request_count',
          ),
        })
        .from(schema.orderLine)
        .innerJoin(schema.orderDraft, eq(schema.orderLine.orderDraftId, schema.orderDraft.id))
        .innerJoin(schema.product, eq(schema.orderLine.matchedProductId, schema.product.id))
        .leftJoin(
          schema.productTranslation,
          and(
            eq(schema.productTranslation.productId, schema.product.id),
            eq(schema.productTranslation.locale, locale),
          ),
        )
        .leftJoin(schema.category, eq(schema.product.categoryId, schema.category.id))
        .where(
          and(
            eq(schema.orderDraft.customerId, customerId),
            eq(schema.orderDraft.source, 'portal'),
            isNull(schema.orderDraft.deletedAt),
            isNull(schema.product.deletedAt),
            gte(schema.orderDraft.createdAt, window90Start),
          ),
        )
        .groupBy(
          schema.product.id,
          schema.product.slug,
          schema.product.nameCanonical,
          schema.productTranslation.name,
          schema.category.nameFr,
          schema.category.nameEn,
        )
        .orderBy(sql`total_quantity desc`)
        .limit(5),
    ]);

  const statusCounts = { ...emptyStatusCounts };
  statusRows.forEach((row) => {
    statusCounts[row.status] = Number(row.value ?? 0);
  });

  const recentRequests = await hydrateRecentRequests({
    customerId,
    drafts: recentDrafts,
  });
  const latestRequest = recentRequests[0] ?? null;
  const totalRequests = Object.values(statusCounts).reduce((sum, value) => sum + value, 0);
  const currentMonthRequests = Number(monthRows[0]?.value ?? 0);
  const usualProductsCount = Number(usualProductRows[0]?.value ?? 0);
  const usualProductsPreview = usualProductsPreviewRows.map((row) => ({
    id: row.id,
    productName: row.translatedName || row.nameCanonical,
    categoryName: getCategoryName(row, locale),
    conditionnement: row.conditionnement,
    unitOfSale: row.unitOfSale,
    defaultQuantity: row.defaultQuantity,
    note: row.note,
  }));

  const last90 = Number(last90Rows[0]?.value ?? 0);
  const previous90 = Number(previous90Rows[0]?.value ?? 0);
  const activity: ClientDashboardActivityWindow = {
    last90,
    previous90,
    delta: last90 - previous90,
    averageDaysBetweenRequests: computeAverageDaysBetween(
      cadenceRows.map((row) => row.createdAt),
    ),
  };

  const topProducts: ClientDashboardTopProduct[] = topProductRows.map((row) => ({
    productId: row.productId,
    slug: row.slug,
    productName: row.translatedName || row.productNameCanonical,
    categoryName: getCategoryName(row, locale),
    totalQuantity: Number(row.totalQuantity ?? 0),
    requestCount: Number(row.requestCount ?? 0),
  }));

  return {
    statusCounts,
    totalRequests,
    currentMonthRequests,
    usualProductsCount,
    usualProductsPreview,
    latestRequest,
    recentRequests,
    topProducts,
    activity,
    metrics: buildMetrics({
      totalRequests,
      statusCounts,
      latestRequest,
      usualProductsCount,
    }),
    cues: buildOperationalCues({
      currentMonthRequests,
      statusCounts,
      latestRequest,
      usualProductsCount,
    }),
    timelinePreview: buildTimelinePreview(latestRequest),
  };
}

function computeAverageDaysBetween(dates: Date[]): number | null {
  if (dates.length < 2) return null;
  // Dates come ordered desc; we walk pairwise gaps.
  const gaps: number[] = [];
  for (let i = 0; i < dates.length - 1; i += 1) {
    const current = dates[i];
    const next = dates[i + 1];
    if (!current || !next) continue;
    const days = Math.abs(current.getTime() - next.getTime()) / 86_400_000;
    if (Number.isFinite(days)) gaps.push(days);
  }
  if (gaps.length === 0) return null;
  const total = gaps.reduce((acc, value) => acc + value, 0);
  return Number((total / gaps.length).toFixed(1));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function hydrateRecentRequests({
  customerId,
  drafts,
}: {
  customerId: string;
  drafts: Array<{
    id: string;
    referenceCode: string;
    createdAt: Date;
    updatedAt: Date;
    status: PortalOrderStatus;
    rawInbound: unknown;
    notesInternal: string | null;
    approvedAt: Date | null;
    exportedAt: Date | null;
    rejectedAt: Date | null;
  }>;
}): Promise<ClientDashboardRecentRequest[]> {
  if (drafts.length === 0) return [];

  const { db, schema } = await import('@/db/client');
  const draftIds = drafts.map((draft) => draft.id);
  const lines = await db
    .select({
      orderDraftId: schema.orderLine.orderDraftId,
      rawText: schema.orderLine.rawText,
      lineNumber: schema.orderLine.lineNumber,
    })
    .from(schema.orderLine)
    .innerJoin(schema.orderDraft, eq(schema.orderLine.orderDraftId, schema.orderDraft.id))
    .where(
      and(
        inArray(schema.orderLine.orderDraftId, draftIds),
        eq(schema.orderDraft.customerId, customerId),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .orderBy(asc(schema.orderLine.lineNumber));

  const linesByDraftId = new Map<string, typeof lines>();
  lines.forEach((line) => {
    const existing = linesByDraftId.get(line.orderDraftId) ?? [];
    existing.push(line);
    linesByDraftId.set(line.orderDraftId, existing);
  });

  return drafts.map((draft) => {
    const draftLines = linesByDraftId.get(draft.id) ?? [];

    return {
      id: draft.id,
      referenceCode: draft.referenceCode,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      status: draft.status,
      lineCount: draftLines.length,
      linePreview: draftLines.map((line) => line.rawText).slice(0, 4),
      productSummary: summarizeProducts(draftLines.map((line) => line.rawText)),
      metadata: extractPortalRequestMetadata(draft.rawInbound, draft.notesInternal),
    };
  });
}

function getCategoryName(
  row: {
    categoryNameFr: string | null;
    categoryNameEn: string | null;
  },
  locale: Locale,
): string | null {
  if (locale === 'en') return row.categoryNameEn || row.categoryNameFr;
  return row.categoryNameFr;
}

function buildMetrics({
  totalRequests,
  statusCounts,
  latestRequest,
  usualProductsCount,
}: {
  totalRequests: number;
  statusCounts: Record<PortalOrderStatus, number>;
  latestRequest: ClientDashboardRecentRequest | null;
  usualProductsCount: number;
}): ClientDashboardMetric[] {
  return [
    {
      id: 'total',
      label: 'Demandes portail',
      value: String(totalRequests),
      detail:
        totalRequests > 0
          ? `${totalRequests} demande${totalRequests > 1 ? 's' : ''} envoyée${
              totalRequests > 1 ? 's' : ''
            }`
          : 'Aucune demande envoyée',
      tone: 'neutral',
      href: '/client/historique',
    },
    {
      id: 'review',
      label: 'En revue',
      value: String(statusCounts.review),
      detail:
        statusCounts.review > 0
          ? `${statusCounts.review} demande${statusCounts.review > 1 ? 's' : ''} à vérifier`
          : 'Aucune demande en attente',
      tone: statusCounts.review > 0 ? 'info' : 'neutral',
      href: '/client/historique',
    },
    {
      id: 'approved',
      label: 'Confirmées',
      value: String(statusCounts.approved),
      detail:
        statusCounts.approved > 0
          ? `${statusCounts.approved} demande${statusCounts.approved > 1 ? 's' : ''} confirmée${
              statusCounts.approved > 1 ? 's' : ''
            }`
          : 'Aucune confirmée',
      tone: statusCounts.approved > 0 ? 'success' : 'neutral',
      href: '/client/historique',
    },
    {
      id: 'rejected',
      label: 'Refusées',
      value: String(statusCounts.rejected),
      detail:
        statusCounts.rejected > 0
          ? `${statusCounts.rejected} demande${statusCounts.rejected > 1 ? 's' : ''} refusée${
              statusCounts.rejected > 1 ? 's' : ''
            }`
          : 'Aucune refusée',
      tone: statusCounts.rejected > 0 ? 'danger' : 'neutral',
      href: '/client/historique',
    },
    {
      id: 'latest',
      label: 'Dernière demande',
      value: latestRequest ? portalStatusLabels[latestRequest.status] : 'Aucune',
      detail: latestRequest
        ? `${latestRequest.referenceCode} · ${formatDateShort(latestRequest.createdAt)}`
        : 'Envoyez une première demande',
      tone: latestRequest ? mapStatusTone(latestRequest.status) : 'neutral',
      href: latestRequest ? `/client/historique/${latestRequest.id}` : '/client/nouvelle-demande',
    },
    {
      id: 'usual_products',
      label: 'Produits habituels',
      value: String(usualProductsCount),
      detail:
        usualProductsCount > 0
          ? `${usualProductsCount} produit${usualProductsCount > 1 ? 's' : ''} configuré${
              usualProductsCount > 1 ? 's' : ''
            }`
          : 'À configurer avec Prodet',
      tone: usualProductsCount > 0 ? 'success' : 'neutral',
      href: '/client/produits-habituels',
    },
  ];
}

function buildOperationalCues({
  currentMonthRequests,
  statusCounts,
  latestRequest,
  usualProductsCount,
}: {
  currentMonthRequests: number;
  statusCounts: Record<PortalOrderStatus, number>;
  latestRequest: ClientDashboardRecentRequest | null;
  usualProductsCount: number;
}): ClientDashboardCue[] {
  const cues: ClientDashboardCue[] = [];

  cues.push(
    currentMonthRequests > 0
      ? {
          id: 'month-activity',
          label: `${currentMonthRequests} demande${
            currentMonthRequests > 1 ? 's' : ''
          } ce mois-ci`,
          detail: 'Activité calculée depuis vos demandes portail.',
          tone: 'info',
          href: '/client/historique',
        }
      : {
          id: 'month-activity',
          label: 'Aucune demande ce mois-ci',
          detail: 'Vous pouvez préparer une nouvelle demande quand nécessaire.',
          tone: 'neutral',
          href: '/client/nouvelle-demande',
        },
  );

  if (statusCounts.review > 0) {
    cues.push({
      id: 'review-waiting',
      label: `${statusCounts.review} demande${
        statusCounts.review > 1 ? 's' : ''
      } en attente de revue`,
      detail: 'Prodet doit vérifier ces demandes avant traitement.',
      tone: 'info',
      href: '/client/historique',
    });
  }

  if (latestRequest) {
    cues.push({
      id: 'latest-request',
      label: buildLatestRequestCue(latestRequest),
      detail: `${latestRequest.referenceCode} · ${formatDateShort(latestRequest.createdAt)}`,
      tone: mapStatusTone(latestRequest.status),
      href: `/client/historique/${latestRequest.id}`,
    });
  } else {
    cues.push({
      id: 'latest-request',
      label: 'Aucune demande récente',
      detail: 'Votre activité récente apparaîtra après votre premier envoi.',
      tone: 'neutral',
      href: '/client/nouvelle-demande',
    });
  }

  cues.push(
    usualProductsCount > 0
      ? {
          id: 'usual-products',
          label: `${usualProductsCount} produit${
            usualProductsCount > 1 ? 's' : ''
          } habituel${usualProductsCount > 1 ? 's' : ''}`,
          detail: 'Vous pouvez les reprendre dans une demande.',
          tone: 'success',
          href: '/client/produits-habituels',
        }
      : {
          id: 'usual-products',
          label: 'Configurez vos produits habituels',
          detail: 'L’équipe Prodet pourra les ajouter pour accélérer vos réapprovisionnements.',
          tone: 'neutral',
          href: '/client/produits-habituels',
        },
  );

  return cues;
}

function buildTimelinePreview(
  latestRequest: ClientDashboardRecentRequest | null,
): ClientDashboardTimelineEvent[] {
  if (!latestRequest) return [];

  const events: ClientDashboardTimelineEvent[] = [
    {
      id: 'submitted',
      label: 'Demande envoyée',
      detail: latestRequest.referenceCode,
      createdAt: latestRequest.createdAt,
      tone: 'info',
    },
  ];

  if (latestRequest.status !== 'parsing') {
    events.push({
      id: 'review',
      label: 'En revue chez Prodet',
      detail: 'Demande reçue pour vérification',
      createdAt: latestRequest.createdAt,
      tone: 'info',
    });
  }

  if (latestRequest.status === 'approved') {
    events.push({
      id: 'approved',
      label: 'Demande confirmée',
      detail: 'Statut mis à jour par Prodet',
      createdAt: latestRequest.updatedAt,
      tone: 'success',
    });
  }

  if (latestRequest.status === 'rejected') {
    events.push({
      id: 'rejected',
      label: 'Demande annulée ou refusée',
      detail: 'Statut mis à jour par Prodet',
      createdAt: latestRequest.updatedAt,
      tone: 'danger',
    });
  }

  if (latestRequest.status === 'exported') {
    events.push({
      id: 'exported',
      label: 'Demande clôturée',
      detail: 'Statut mis à jour par Prodet',
      createdAt: latestRequest.updatedAt,
      tone: 'success',
    });
  }

  if (latestRequest.status === 'parsing') {
    events.push({
      id: 'parsing',
      label: 'Brouillon technique',
      detail: 'Demande non encore envoyée à Prodet',
      createdAt: pickUpdatedAt(latestRequest),
      tone: 'neutral',
    });
  }

  return deduplicateTimelineEvents(events);
}

function buildLatestRequestCue(request: ClientDashboardRecentRequest): string {
  if (request.status === 'approved') return 'Votre dernière demande a été approuvée';
  if (request.status === 'rejected') return 'Votre dernière demande a été refusée';
  if (request.status === 'review') return 'Votre dernière demande est en revue';
  if (request.status === 'exported') return 'Votre dernière demande est clôturée';
  return 'Votre dernière demande est en brouillon';
}

function mapStatusTone(status: PortalOrderStatus): ClientDashboardMetric['tone'] {
  if (status === 'approved' || status === 'exported') return 'success';
  if (status === 'review') return 'info';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

function pickUpdatedAt(request: ClientDashboardRecentRequest): Date {
  return request.updatedAt.getTime() > request.createdAt.getTime()
    ? request.updatedAt
    : request.createdAt;
}

function deduplicateTimelineEvents(
  events: ClientDashboardTimelineEvent[],
): ClientDashboardTimelineEvent[] {
  return events.filter((event, index) => {
    const firstIndex = events.findIndex(
      (candidate) =>
        candidate.label === event.label &&
        candidate.createdAt.getTime() === event.createdAt.getTime(),
    );
    return firstIndex === index;
  });
}

function getStartOfCurrentMonth(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function formatDateShort(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(value);
}
