export const companyInfo = {
  name: 'Prodet Tunisie',
  legalName: 'PRODET TUNISIE',
  legalForm: 'SARL',
  shareCapitalTnd: 100_000,
  /** Identifiant unique RNE */
  rne: '0848611G',
  matriculeFiscal: '848611GAM000',
  publicationDirector: 'Mouldi Lassoued',
  manager: 'Houda Jlidi',
  activityStartDate: '2003-09-05',
  addressLine: "20 Rue de Somalie, Cité El Bassatine, L'Aouina 2045",
  addressFull: "20 Rue de Somalie, Cité El Bassatine, L'Aouina 2045, Tunisie",
  phoneDisplay: '71 758 468',
  phoneHref: 'tel:+21671758468',
  email: 'contact@prodet.com.tn',
  emailHref: 'mailto:contact@prodet.com.tn',
  footerTagline:
    "Fabricant et distributeur de produits d'entretien professionnels · Tunis, Tunisie",
  deliveryZoneLabel: null,
  hoursLabel: null,
  /** Mobile WhatsApp (distinct from the landline above). */
  whatsappDisplay: '98 997 833',
  whatsappE164: '+21698997833',
  whatsappHref: 'https://wa.me/21698997833',
  copyrightYear: 2026,
  // SEO entity signals. Fill these in as the brand's official profiles go live —
  // they feed the `sameAs` array in the Organization JSON-LD, which is what links
  // every Prodet profile into one entity for Google's Knowledge Panel.
  social: {
    facebook: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
  },
  // Area the business actually serves — surfaced in LocalBusiness structured data.
  areaServed: 'Tunisie',
  documents: [
    {
      id: 'attestation-1',
      label: 'Attestation 1',
      description: 'Document PDF téléchargeable',
      href: '/downloads/company/attestation-1.pdf',
    },
    {
      id: 'attestation-2',
      label: 'Attestation 2',
      description: 'Document PDF téléchargeable',
      href: '/downloads/company/attestation-2.pdf',
    },
    {
      id: 'homologation-ma',
      label: 'Homologation MA',
      description: 'Document PDF téléchargeable',
      href: '/downloads/company/homologation-ma.pdf',
    },
  ],
  /** Official Google Maps place pin (Prodet, L'Aouina). */
  mapHref: 'https://maps.app.goo.gl/tPg8ShuEjGD9C6BH8',
  /** Embed centred on the same pin — address text alone was resolving to nearby POIs. */
  mapEmbedSrc:
    'https://www.google.com/maps?q=36.8573115,10.2610844&z=17&hl=fr&output=embed',
} as const;
