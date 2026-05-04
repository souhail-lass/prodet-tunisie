import type { Sector } from '../types';

/**
 * Sectors served by Prodet at MVP. Order is the order they appear on
 * the homepage and on /[locale]/secteurs.
 *
 * Real long-form content per sector is intentionally short here. Phase 2
 * expands each sector into a dedicated landing with sector-specific
 * pain points and recommended product packs.
 */
export const SEED_SECTORS: readonly Sector[] = [
  {
    key: 'hotels',
    slug: 'hotellerie',
    displayOrder: 10,
    nameByLocale: {
      fr: 'Hôtels et hébergement',
      ar: 'الفنادق والإقامة',
      en: 'Hotels and lodging',
    },
    shortDescByLocale: {
      fr: 'Solutions hygiène pour chambres, parties communes et linge.',
      ar: 'حلول النظافة للغرف والأماكن المشتركة والبياضات.',
      en: 'Hygiene for guest rooms, public areas and linen.',
    },
    longDescByLocale: {
      fr: "Détergents, désinfectants surfaces, gels hydroalcooliques et lessives professionnelles, conditionnés pour les opérations housekeeping et lingerie d'un hôtel.",
      ar: 'منظفات ومطهرات أسطح ومعقمات وأخصاص غسيل مخصصة لعمليات التنظيف والغسيل في الفنادق.',
      en: 'Detergents, surface disinfectants, hand sanitizers and professional laundry products, sized for housekeeping and linen operations.',
    },
    recommendedProductSlugs: [
      'javel-prodet-bid-5kg',
      'multi-surface-prodet-5l',
      'gel-mains-prodet-5l',
      'lessive-pro-prodet-20kg',
      'desodorisant-air-prodet-5l',
    ],
  },
  {
    key: 'restaurants',
    slug: 'restaurants',
    displayOrder: 20,
    nameByLocale: {
      fr: 'Restaurants',
      ar: 'المطاعم',
      en: 'Restaurants',
    },
    shortDescByLocale: {
      fr: 'Cuisine, plonge, salle : produits adaptés aux normes HACCP.',
      ar: 'المطبخ والصحون والقاعة: منتجات تتوافق مع معايير HACCP.',
      en: 'Kitchen, dishwashing, dining area — HACCP-friendly products.',
    },
    longDescByLocale: {
      fr: "Dégraissants cuisine, liquide vaisselle pro, produits sols antidérapants, désinfectants alimentaires : tout l'essentiel pour un service propre et conforme.",
      ar: 'مزيلات الدهون للمطبخ، وسوائل غسيل الصحون المهنية، ومنتجات الأرضيات غير المنزلقة، ومطهرات الأسطح الغذائية: كل ما يلزم لخدمة نظيفة ومطابقة.',
      en: 'Kitchen degreasers, professional dishwashing liquid, anti-slip floor products, food-safe disinfectants: everything for a clean, compliant service.',
    },
    recommendedProductSlugs: [
      'degraissant-cuisine-prodet-5l',
      'liquide-vaisselle-prodet-5l',
      'detartrant-prodet-5l',
      'multi-surface-prodet-5l',
      'desinfectant-alimentaire-prodet-5l',
    ],
  },
  {
    key: 'cafes',
    slug: 'cafes',
    displayOrder: 30,
    nameByLocale: {
      fr: 'Cafés et salons de thé',
      ar: 'المقاهي وصالونات الشاي',
      en: 'Cafés and tea rooms',
    },
    shortDescByLocale: {
      fr: 'Petit format, livraison rapide, gamme essentielle.',
      ar: 'تشكيلات صغيرة، توصيل سريع، مجموعة أساسية.',
      en: 'Small formats, fast delivery, essentials only.',
    },
    longDescByLocale: {
      fr: 'Une sélection courte de produits indispensables, en formats adaptés aux petits commerces — sans surstock.',
      ar: 'مجموعة مختصرة من المنتجات الأساسية بتشكيلات تناسب المحلات الصغيرة دون تخزين زائد.',
      en: 'A short selection of essentials in small-business-friendly sizes — no overstock.',
    },
    recommendedProductSlugs: [
      'liquide-vaisselle-prodet-5l',
      'multi-surface-prodet-5l',
      'gel-mains-prodet-5l',
      'desodorisant-air-prodet-5l',
    ],
  },
  {
    key: 'cleaning_companies',
    slug: 'societes-de-nettoyage',
    displayOrder: 40,
    nameByLocale: {
      fr: 'Sociétés de nettoyage',
      ar: 'شركات النظافة',
      en: 'Cleaning companies',
    },
    shortDescByLocale: {
      fr: 'Tarifs B2B, gamme complète, livraisons régulières.',
      ar: 'أسعار B2B، تشكيلة كاملة، تسليمات منتظمة.',
      en: 'B2B pricing, full range, recurring deliveries.',
    },
    longDescByLocale: {
      fr: "L'interlocuteur idéal pour vos contrats : prix dégressifs, mêmes références à chaque commande, factures conformes Swiver.",
      ar: 'الشريك المثالي لعقودك: أسعار تنازلية، نفس المراجع في كل طلبية، فواتير مطابقة لـ Swiver.',
      en: 'Built for service contracts: tiered pricing, the same references every time, Swiver-compliant invoices.',
    },
    recommendedProductSlugs: [
      'javel-prodet-bid-5kg',
      'degraissant-cuisine-prodet-5l',
      'desinfectant-sol-prodet-5l',
      'multi-surface-prodet-5l',
      'detartrant-prodet-5l',
      'cire-sol-prodet-5l',
    ],
  },
  {
    key: 'wholesalers',
    slug: 'grossistes',
    displayOrder: 50,
    nameByLocale: {
      fr: 'Grossistes',
      ar: 'تجار الجملة',
      en: 'Wholesalers',
    },
    shortDescByLocale: {
      fr: 'Approvisionnement palette, marge revendeur, références stables.',
      ar: 'إمداد بالطبليات، هامش لتاجر التجزئة، مراجع ثابتة.',
      en: 'Pallet-level supply, reseller margins, stable references.',
    },
    longDescByLocale: {
      fr: "Conditions revendeur, formats palette, et stabilité dans le temps des références. C'est un partenariat, pas une commande ponctuelle.",
      ar: 'شروط لتجار التجزئة، تشكيلات بالطبليات، واستقرار طويل الأمد للمراجع. شراكة وليست طلبية عابرة.',
      en: 'Reseller terms, pallet-sized formats, and long-term reference stability. A partnership, not a one-off order.',
    },
    recommendedProductSlugs: [
      'javel-prodet-bid-5kg',
      'lessive-pro-prodet-20kg',
      'liquide-vaisselle-prodet-5l',
      'gel-mains-prodet-5l',
    ],
  },
  {
    key: 'institutions',
    slug: 'institutions',
    displayOrder: 60,
    nameByLocale: {
      fr: 'Institutions et collectivités',
      ar: 'المؤسسات والجماعات',
      en: 'Institutions',
    },
    shortDescByLocale: {
      fr: 'Établissements scolaires, administrations, cliniques.',
      ar: 'المؤسسات التعليمية والإدارية والعيادات.',
      en: 'Schools, public administrations, clinics.',
    },
    longDescByLocale: {
      fr: "Procédures d'achat conformes, fiches techniques sur demande, livraisons planifiées et facturation aux normes.",
      ar: 'إجراءات شراء مطابقة، بطاقات تقنية عند الطلب، تسليمات مجدولة وفوترة وفق المعايير.',
      en: 'Procurement-friendly process, technical sheets on request, scheduled deliveries and standards-compliant invoicing.',
    },
    recommendedProductSlugs: [
      'javel-prodet-bid-5kg',
      'desinfectant-sol-prodet-5l',
      'gel-mains-prodet-5l',
      'savon-mains-prodet-5l',
    ],
  },
  {
    key: 'industry',
    slug: 'industrie',
    displayOrder: 70,
    nameByLocale: {
      fr: 'Industrie et ateliers',
      ar: 'الصناعة وورشات العمل',
      en: 'Industry and workshops',
    },
    shortDescByLocale: {
      fr: 'Dégraissants techniques, formats vrac, sécurité des opérateurs.',
      ar: 'مزيلات دهون تقنية، تشكيلات سائبة، سلامة المشغلين.',
      en: 'Technical degreasers, bulk formats, operator safety.',
    },
    longDescByLocale: {
      fr: "Solutions adaptées aux ateliers : dégraissants haute performance, contenants 20L et plus, fiches de données de sécurité disponibles à l'avance.",
      ar: 'حلول مخصصة للورشات: مزيلات دهون عالية الأداء، عبوات 20 لتر وأكثر، بطاقات السلامة متوفرة مسبقًا.',
      en: 'Built for workshops: high-performance degreasers, 20L+ containers, safety data sheets available in advance.',
    },
    recommendedProductSlugs: [
      'degraissant-industriel-prodet-20l',
      'detartrant-prodet-5l',
      'savon-mains-prodet-5l',
    ],
  },
  {
    key: 'shops',
    slug: 'commerces-et-boutiques',
    displayOrder: 80,
    nameByLocale: {
      fr: 'Commerces et boutiques',
      ar: 'المحلات التجارية',
      en: 'Shops and retail',
    },
    shortDescByLocale: {
      fr: 'Entretien quotidien des espaces de vente.',
      ar: 'الصيانة اليومية لمساحات البيع.',
      en: 'Daily upkeep for retail spaces.',
    },
    longDescByLocale: {
      fr: 'Multi-surface, désodorisants, gels hydroalcooliques pour vos clients en caisse — tout ce qui rend une boutique propre et accueillante.',
      ar: 'منتجات للأسطح المتعددة ومعطرات الجو ومعقمات لزبائنك عند الصندوق — كل ما يجعل المحل نظيفًا ومرحبًا.',
      en: 'Multi-surface, air fresheners, sanitizers for the checkout counter — everything to keep a shop welcoming.',
    },
    recommendedProductSlugs: [
      'multi-surface-prodet-5l',
      'desodorisant-air-prodet-5l',
      'gel-mains-prodet-5l',
    ],
  },
] as const;
