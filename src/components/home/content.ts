import type { Locale } from '@/i18n/routing';

export interface HomeContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    microClaims: string[];
    packshotTitle: string;
    packshotSubtitle: string;
    packshotWeight: string;
    /** Factual caption under hero packshot — no unsubstantiated "certified" wording */
    packshotCaption: string;
  };
  featured: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  sectors: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  manufacturer: {
    eyebrow: string;
    title: string;
    body: string;
    claims: string[];
    strip: string[];
    visualEyebrow: string;
    visualTitle: string;
    visualBody: string;
  };
  workflow: {
    eyebrow: string;
    title: string;
    steps: Array<{ title: string; body: string }>;
  };
  trust: {
    eyebrow: string;
    title: string;
    pills: string[];
  };
  cta: {
    title: string;
    subtitle: string;
  };
}

export const HOME_CONTENT: Record<Locale, HomeContent> = {
  fr: {
    hero: {
      eyebrow: 'Fabrication tunisienne pour professionnels',
      title: "Des produits d'entretien pensés pour les achats B2B.",
      subtitle:
        "Prodet présente ses références avec des codes lisibles, des conditionnements clairs et une prise de contact directe. Le site doit inspirer confiance avant même le premier appel.",
      microClaims: ['Produits professionnels', 'Codes visibles', 'Devis sur demande'],
      packshotTitle: 'PROLAX LIQUIDE',
      packshotSubtitle: 'Lessive liquide pour textiles',
      packshotWeight: '20KG',
      packshotCaption: 'Gamme illustrative · même logique etiquetage que vos references',
    },
    featured: {
      eyebrow: 'Références repères',
      title: 'Voir les produits avant le discours',
      subtitle:
        'Les premières cartes doivent rendre la gamme immédiatement lisible : visuel, code et conditionnement.',
    },
    sectors: {
      eyebrow: 'Par usage',
      title: "Le site s'organise autour de votre activité",
      subtitle:
        "Chaque secteur doit trouver rapidement les produits qui correspondent à son opérationnel quotidien, sans jargon inutile.",
    },
    manufacturer: {
      eyebrow: 'Base industrielle',
      title: 'Un langage visuel plus fabricant, moins générique',
      body:
        "Même sans les photos finales, l'interface doit déjà parler fabrication, conditionnement, suivi et relation directe. Le visuel ne doit jamais ressembler à un template SaaS neutre.",
      claims: [
        'Fabrication locale à Tunis',
        'Conditionnements pensés pour les professionnels',
        'Fiches techniques sur demande',
        'Relation directe avec Prodet',
      ],
      strip: ['Fabrication', 'Conditionnement', 'Livraison', 'Suivi'],
      visualEyebrow: 'Site Prodet',
      visualTitle: "L'Aouina · Tunis",
      visualBody:
        "Le bloc photo final viendra ici. En attendant, on garde une présence industrielle assumée plutôt qu'un espace vide.",
    },
    workflow: {
      eyebrow: 'Parcours simple',
      title: 'Moins de friction, plus de clarté',
      steps: [
        {
          title: 'Identifiez les bons produits',
          body: 'Le catalogue expose les références utiles avec code, usage et conditionnement.',
        },
        {
          title: 'Décrivez vos volumes',
          body: 'Le devis reprend le même langage produit pour éviter les allers-retours inutiles.',
        },
        {
          title: 'Échange direct avec Prodet',
          body: 'WhatsApp, e-mail ou devis : le contact doit rester simple et humain.',
        },
      ],
    },
    trust: {
      eyebrow: 'Preuves visibles',
      title: 'La confiance vient des signaux concrets',
      pills: [
        'Fabrication tunisienne',
        'Produits professionnels',
        'Conditionnements lisibles',
        'Devis sur demande',
        'Grand Tunis',
        'FR / AR / EN',
      ],
    },
    cta: {
      title: 'Parlons besoins, volumes et conditionnements',
      subtitle:
        'Le prochain écran doit rapprocher le visiteur du devis, pas le perdre dans un discours générique.',
    },
  },
  en: {
    hero: {
      eyebrow: 'Tunisian manufacturing for professionals',
      title: 'Cleaning products presented like a real B2B supplier.',
      subtitle:
        'Prodet should show clear product codes, clear packaging formats and a direct path to contact. The site has to build trust before the first call.',
      microClaims: ['Professional range', 'Visible codes', 'Quote on request'],
      packshotTitle: 'PROLAX LIQUIDE',
      packshotSubtitle: 'Liquid laundry detergent',
      packshotWeight: '20KG',
      packshotCaption: 'Illustrative range · labeling logic matches real SKUs',
    },
    featured: {
      eyebrow: 'Key references',
      title: 'Let products speak first',
      subtitle:
        'The first cards should make the range immediately legible: visual, code and packaging.',
    },
    sectors: {
      eyebrow: 'By operation',
      title: 'The site follows how buyers think',
      subtitle:
        'Each sector should reach the right products quickly, without being forced through generic chemistry language.',
    },
    manufacturer: {
      eyebrow: 'Industrial base',
      title: 'More manufacturer presence, less generic website language',
      body:
        'Even before the final photo set lands, the interface should already signal manufacturing, packaging, follow-through and direct commercial contact.',
      claims: [
        'Local production in Tunis',
        'Professional packaging formats',
        'Technical sheets on request',
        'Direct exchange with Prodet',
      ],
      strip: ['Manufacturing', 'Packaging', 'Delivery', 'Follow-up'],
      visualEyebrow: 'Prodet site',
      visualTitle: "L'Aouina · Tunis",
      visualBody:
        'The final factory photography block will replace this panel. Until then, we keep a deliberate industrial presence instead of an empty placeholder.',
    },
    workflow: {
      eyebrow: 'Simple flow',
      title: 'Lower friction, clearer conversion',
      steps: [
        {
          title: 'Find the right references',
          body: 'The catalog surfaces the useful codes, use cases and packaging formats first.',
        },
        {
          title: 'Describe your volumes',
          body: 'The quote flow keeps the same product language and reduces back-and-forth.',
        },
        {
          title: 'Talk directly with Prodet',
          body: 'WhatsApp, email or quote request should all stay direct and human.',
        },
      ],
    },
    trust: {
      eyebrow: 'Visible proof',
      title: 'Trust should come from concrete signals',
      pills: [
        'Made in Tunisia',
        'Professional products',
        'Clear packaging sizes',
        'Quote on request',
        'Greater Tunis',
        'FR / AR / EN',
      ],
    },
    cta: {
      title: 'Talk volumes, use cases and packaging',
      subtitle:
        'The next click should move the buyer closer to a quote, not into generic marketing copy.',
    },
  },
  ar: {
    hero: {
      eyebrow: 'تصنيع تونسي للمهنيين',
      title: 'عرض منتجات النظافة بشكل يليق بمورد B2B حقيقي.',
      subtitle:
        'يجب أن يُظهر موقع Prodet المراجع بوضوح والعبوات بشكل مفهوم ومسار تواصل مباشر. الثقة يجب أن تبدأ قبل أول مكالمة.',
      microClaims: ['منتجات مهنية', 'مراجع واضحة', 'عرض سعر عند الطلب'],
      packshotTitle: 'PROLAX LIQUIDE',
      packshotSubtitle: 'سائل غسيل للمنسوجات',
      packshotWeight: '20KG',
      packshotCaption: 'تشكيلة توضيحية · نفس منطق البطاقة كالمراجع الفعلية',
    },
    featured: {
      eyebrow: 'مراجع أساسية',
      title: 'دع المنتجات تتكلم أولًا',
      subtitle:
        'أول البطاقات يجب أن تجعل التشكيلة مفهومة مباشرة: صورة، مرجع، وعبوة.',
    },
    sectors: {
      eyebrow: 'حسب الاستعمال',
      title: 'الموقع يتبع طريقة تفكير المشتري',
      subtitle:
        'كل قطاع يجب أن يصل بسرعة إلى المنتجات المناسبة له دون المرور عبر لغة تقنية عامة ومربكة.',
    },
    manufacturer: {
      eyebrow: 'قاعدة صناعية',
      title: 'حضور أقوى للمُصنِّع، ومظهر أقل عمومية',
      body:
        'حتى قبل إدماج الصور النهائية، يجب أن توحي الواجهة بالتصنيع والعبوات والمتابعة والعلاقة التجارية المباشرة.',
      claims: [
        'تصنيع محلي في تونس',
        'عبوات مناسبة للاستعمال المهني',
        'بطاقات تقنية عند الطلب',
        'تواصل مباشر مع Prodet',
      ],
      strip: ['تصنيع', 'تعبئة', 'توصيل', 'متابعة'],
      visualEyebrow: 'موقع Prodet',
      visualTitle: 'العوينة · تونس',
      visualBody:
        'ستأتي صور المصنع النهائية هنا لاحقًا. إلى ذلك الحين نحافظ على حضور صناعي واضح بدل مساحة فارغة.',
    },
    workflow: {
      eyebrow: 'مسار واضح',
      title: 'احتكاك أقل وتحويل أوضح',
      steps: [
        {
          title: 'اعثر على المرجع المناسب',
          body: 'الكتالوج يقدّم المراجع والاستعمالات والعبوات المهمة أولًا.',
        },
        {
          title: 'اشرح الكميات المطلوبة',
          body: 'طلب عرض السعر يحافظ على نفس لغة المنتجات ويقلّل الذهاب والإياب.',
        },
        {
          title: 'تواصل مباشر مع Prodet',
          body: 'واتساب أو البريد أو طلب السعر يجب أن تبقى كلها قنوات بسيطة ومباشرة.',
        },
      ],
    },
    trust: {
      eyebrow: 'دلائل واضحة',
      title: 'الثقة يجب أن تأتي من إشارات ملموسة',
      pills: [
        'تصنيع تونسي',
        'منتجات مهنية',
        'عبوات واضحة',
        'عرض سعر عند الطلب',
        'تونس الكبرى',
        'FR / AR / EN',
      ],
    },
    cta: {
      title: 'لنتحدث عن الكميات والاستعمالات والعبوات',
      subtitle: 'النقرة التالية يجب أن تقرّب الزائر من عرض السعر لا أن تدخله في خطاب عام.',
    },
  },
};

export function getHomeContent(locale: Locale): HomeContent {
  return HOME_CONTENT[locale];
}
