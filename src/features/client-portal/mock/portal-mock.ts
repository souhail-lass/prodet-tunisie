/**
 * Client-portal DEMO data.
 *
 * Fake-data-first: these shapes mirror what the real Drizzle queries will
 * return, so wiring later is a drop-in. Product refs resolve against the real
 * catalogue (`src/data`) so images / taglines / formats stay consistent.
 *
 * No money/prices here on purpose (portal stays price-free for now).
 */
import { getProductBySlug } from '@/data/queries';

export type PortalAccount = {
  name: string;
  contact: string;
  role: string;
  initials: string;
  city: string;
  sector: string;
};

export type StatTone = 'blue' | 'green' | 'amber';
export type PortalStat = {
  id: string;
  label: string;
  value: string | number;
  icon: 'Truck' | 'PackageCheck' | 'FileText' | 'Clock';
  tone: StatTone;
};

export type OrderStatus = 'progress' | 'prep' | 'delivered' | 'cancelled';

export type PortalProductRef = {
  slug: string;
  name: string;
  tagline: string;
  image?: string;
  format: string;
  made: boolean;
  /** e.g. "Commandé 4×" — reorder hint. */
  last?: string;
  /** Swiver linkage for order push. */
  swiverId?: string | null;
  sku?: string | null;
  unitPrice?: number | null;
  /** Catalogue category label — powers the order-desk filter chips. */
  category?: string | null;
};

export type PortalOrderLine = PortalProductRef & { qty: number };

export type PortalOrder = {
  id: string;
  date: string;
  status: OrderStatus;
  items: number;
  units: number;
  ref: string;
  eta: string;
  lines: PortalOrderLine[];
};

export type PortalQuote = {
  id: string;
  date: string;
  status: OrderStatus;
  items: number;
  units: number;
};

export type PortalInvoice = {
  id: string;
  date: string;
  orderId: string;
  status: 'paid' | 'pending';
};

export type PortalDocument = {
  id: string;
  label: string;
  type: string;
  href: string;
};

/** Resolve a catalogue slug into a portal product ref (falls back gracefully). */
function ref(slug: string, last?: string): PortalProductRef {
  const product = getProductBySlug(slug);
  if (!product) {
    return { slug, name: slug.toUpperCase(), tagline: '', format: '—', made: true, last };
  }
  return {
    slug,
    name: product.name,
    tagline: product.tagline,
    image: product.image,
    format: product.formats[0]?.label ?? '—',
    made: product.category === 'manufactured',
    last,
  };
}

function line(slug: string, qty: number): PortalOrderLine {
  return { ...ref(slug), qty };
}

export const account: PortalAccount = {
  name: 'Hôtel Carthage',
  contact: 'Leïla Ben Salah',
  role: 'Responsable achats',
  initials: 'HC',
  city: 'Tunis',
  sector: 'hotels',
};

export const stats: PortalStat[] = [
  { id: 'progress', label: 'Commandes en cours', value: 2, icon: 'Truck', tone: 'blue' },
  { id: 'delivered', label: 'Livrées ce mois', value: 7, icon: 'PackageCheck', tone: 'green' },
  { id: 'quotes', label: 'Devis en attente', value: 1, icon: 'FileText', tone: 'amber' },
  { id: 'next', label: 'Prochaine livraison', value: 'Jeu. 12', icon: 'Clock', tone: 'blue' },
];

export const orders: PortalOrder[] = [
  {
    id: 'CMD-2026-0412',
    date: '04 juin 2026',
    status: 'progress',
    items: 6,
    units: 38,
    ref: 'Devis #DV-0412',
    eta: 'Livraison jeu. 12 juin',
    lines: [
      line('sirafan-desinfectant', 8),
      line('pronet-plus', 6),
      line('profour', 4),
      line('sanihand', 6),
      line('provitre', 6),
      line('prolax-500', 8),
    ],
  },
  {
    id: 'CMD-2026-0398',
    date: '28 mai 2026',
    status: 'prep',
    items: 4,
    units: 24,
    ref: 'Devis #DV-0398',
    eta: 'Préparation en cours',
    lines: [line('sirafan-desinfectant', 6), line('sanihand', 6), line('provitre', 6), line('profour', 6)],
  },
  {
    id: 'CMD-2026-0377',
    date: '19 mai 2026',
    status: 'delivered',
    items: 9,
    units: 52,
    ref: 'Devis #DV-0377',
    eta: 'Livré le 22 mai',
    lines: [
      line('sirafan-desinfectant', 8),
      line('pronet-plus', 8),
      line('profour', 4),
      line('prolav', 6),
      line('prorinse', 4),
      line('sanihand', 6),
      line('provitre', 6),
      line('prolax-500', 6),
      line('deofresh', 4),
    ],
  },
  {
    id: 'CMD-2026-0361',
    date: '07 mai 2026',
    status: 'delivered',
    items: 3,
    units: 12,
    ref: 'Devis #DV-0361',
    eta: 'Livré le 09 mai',
    lines: [line('sanihand', 4), line('provitre', 4), line('deofresh', 4)],
  },
  {
    id: 'CMD-2026-0340',
    date: '23 avr. 2026',
    status: 'cancelled',
    items: 5,
    units: 30,
    ref: 'Devis #DV-0340',
    eta: 'Annulée',
    lines: [line('pronet-plus', 10), line('profour', 6), line('prolav', 6), line('prorinse', 4), line('sirafan-desinfectant', 4)],
  },
];

export const frequentProducts: PortalProductRef[] = [
  ref('sirafan-desinfectant', 'Commandé 4×'),
  ref('pronet-plus', 'Commandé 6×'),
  ref('sanihand', 'Commandé 3×'),
  ref('profour', 'Commandé 2×'),
  ref('provitre', 'Commandé 5×'),
  ref('prolax-500', 'Commandé 2×'),
  ref('deofresh', 'Commandé 3×'),
  ref('prolav', 'Commandé 4×'),
];

export const nextDelivery = {
  date: 'Jeudi 12 juin',
  orderId: 'CMD-2026-0412',
  refs: 6,
  address: "20 Rue de Somalie, l'Aouina 2045, Tunis",
  statusLabel: 'En cours de préparation',
};

export const quotes: PortalQuote[] = [
  { id: 'DV-2026-0431', date: '06 juin 2026', status: 'progress', items: 5, units: 28 },
  { id: 'DV-2026-0412', date: '04 juin 2026', status: 'delivered', items: 6, units: 38 },
  { id: 'DV-2026-0398', date: '28 mai 2026', status: 'delivered', items: 4, units: 24 },
];

export const invoices: PortalInvoice[] = [
  { id: 'FAC-2026-0377', date: '22 mai 2026', orderId: 'CMD-2026-0377', status: 'paid' },
  { id: 'FAC-2026-0361', date: '09 mai 2026', orderId: 'CMD-2026-0361', status: 'paid' },
  { id: 'FAC-2026-0412', date: '12 juin 2026', orderId: 'CMD-2026-0412', status: 'pending' },
];

export const documents: PortalDocument[] = [
  { id: 'attestation-1', label: 'Attestation de conformité', type: 'PDF', href: '#' },
  { id: 'fiche-sirafan', label: 'Fiche technique — SIRAFAN', type: 'PDF', href: '#' },
  { id: 'homologation', label: 'Homologation Ministère', type: 'PDF', href: '#' },
];

export function getOrderById(id: string): PortalOrder | undefined {
  return orders.find((order) => order.id === id);
}
