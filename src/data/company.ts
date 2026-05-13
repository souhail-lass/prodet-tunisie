export const companyInfo = {
  name: 'Prodet Tunisie',
  addressLine: "20 Rue de Somalie, L'Aouina, Tunis 2045",
  addressFull: "20 Rue de Somalie, L'Aouina, Tunis 2045, Tunisie",
  phoneDisplay: '71 758 468',
  phoneHref: 'tel:+21671758468',
  email: 'prodet.tunisie@gmail.com',
  emailHref: 'mailto:prodet.tunisie@gmail.com',
  footerTagline: "Fabricant et distributeur de produits d'entretien professionnels · Tunis, Tunisie",
  deliveryZoneLabel: null,
  hoursLabel: null,
  whatsappNumber: null,
  copyrightYear: 2025,
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
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=20+Rue+de+Somalie,+L'Aouina,+Tunis+2045,+Tunisie",
} as const;
