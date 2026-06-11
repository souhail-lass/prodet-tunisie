/**
 * Locale overrides for catalogue CONTENT (products, sectors, use-cases).
 *
 * The base data in `src/data/*` is French. These maps provide the Arabic and
 * English equivalents, merged at read time by the `localize*` helpers. Product
 * NAMES are intentionally never translated (brand identity) — only marketing
 * and descriptive copy is localized. Fields absent from an override fall back
 * to the French base, so partial translations degrade gracefully.
 */
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/types/product';
import type { Sector } from '@/types/sector';
import type { UseCase } from '@/types/use-case';

type SpecL10n = { label?: string; value?: string };
type DilutionL10n = { label?: string; rate?: string };
type ProductL10n = {
  tagline?: string;
  description?: string;
  howToUse?: string;
  dosage?: string;
  formats?: string[];
  specs?: SpecL10n[];
  dilutionRates?: DilutionL10n[];
};
type SectorL10n = { label?: string; shortDescription?: string; supplyHighlights?: string[] };
type UseCaseL10n = { label?: string; description?: string };

type LocaleMap<T> = Record<'ar' | 'en', Record<string, T>>;

// ---------------------------------------------------------------------------
// USE CASES
// ---------------------------------------------------------------------------
const USE_CASES: LocaleMap<UseCaseL10n> = {
  en: {
    sols: { label: 'Floor cleaning', description: 'Degreasers, detergents and products for all floor surfaces' },
    'cuisine-degraissage': { label: 'Kitchen & degreasing', description: 'Degreasing solutions for professional kitchens and equipment' },
    'sanitaires-desinfection': { label: 'Sanitary & disinfection', description: 'Disinfectants and hygiene products for restrooms and common areas' },
    'linge-textiles': { label: 'Linen & textiles', description: 'Detergents and treatment products for professional laundry' },
    'hygiene-mains': { label: 'Hand hygiene', description: 'Liquid soaps and hand-hygiene solutions' },
    'surfaces-vitres': { label: 'Surfaces & glass', description: 'Surface cleaners and glass cleaners for professional spaces' },
  },
  ar: {
    sols: { label: 'تنظيف الأرضيات', description: 'مزيلات الشحوم والمنظّفات ومنتجات لكل أنواع الأرضيات' },
    'cuisine-degraissage': { label: 'المطبخ وإزالة الدهون', description: 'حلول إزالة الدهون للمطابخ والتجهيزات المهنية' },
    'sanitaires-desinfection': { label: 'الصرف الصحي والتطهير', description: 'مطهّرات ومنتجات نظافة للمرافق الصحية والمساحات المشتركة' },
    'linge-textiles': { label: 'الغسيل والمنسوجات', description: 'مساحيق ومنتجات معالجة الغسيل المهني' },
    'hygiene-mains': { label: 'نظافة اليدين', description: 'صابون سائل وحلول لنظافة اليدين' },
    'surfaces-vitres': { label: 'الأسطح والزجاج', description: 'منظّفات الأسطح والزجاج للمساحات المهنية' },
  },
};

// ---------------------------------------------------------------------------
// SECTORS
// ---------------------------------------------------------------------------
const SECTORS: LocaleMap<SectorL10n> = {
  en: {
    hotels: {
      label: 'Hotels & hospitality',
      shortDescription: 'Hygiene for rooms, linen and common areas.',
      supplyHighlights: ['Room linen detergent', 'Sanitary disinfectant', 'Liquid soap for dispensers'],
    },
    'restaurants-cafes': {
      label: 'Restaurants & cafés',
      shortDescription: 'Kitchen degreasing, dishwashing and service-area hygiene.',
      supplyHighlights: ['Kitchen degreaser', 'Concentrated dishwashing liquid', 'Kitchen floor cleaner'],
    },
    'societes-nettoyage': {
      label: 'Cleaning companies',
      shortDescription: 'Heavy-duty formats for recurring multi-site work.',
      supplyHighlights: ['20 L cans', 'Concentrated bleach', 'Multi-surface degreasers'],
    },
    entreprises: {
      label: 'Businesses',
      shortDescription: 'Daily upkeep of offices, restrooms and common areas.',
      supplyHighlights: ['Restroom liquid soap', 'Glass cleaner for lobbies & offices', 'Common-area disinfectants'],
    },
    'revendeurs-grossistes': {
      label: 'Resellers & wholesalers',
      shortDescription: 'Professional supply with simple, easy-to-reorder references.',
      supplyHighlights: ['Clear references', '5 L to 20 L formats', 'Multi-purpose supply'],
    },
    institutions: {
      label: 'Institutions',
      shortDescription: 'Schools, public bodies and community facilities.',
      supplyHighlights: ['Restroom hygiene', 'Floor maintenance', 'Community liquid soap'],
    },
  },
  ar: {
    hotels: {
      label: 'الفنادق والإقامة',
      shortDescription: 'نظافة الغرف والغسيل والمساحات المشتركة.',
      supplyHighlights: ['مسحوق غسيل لبياضات الغرف', 'مطهّر للمرافق الصحية', 'صابون سائل للموزّعات'],
    },
    'restaurants-cafes': {
      label: 'المطاعم والمقاهي',
      shortDescription: 'إزالة دهون المطبخ وغسل الأواني ونظافة مناطق الخدمة.',
      supplyHighlights: ['مزيل دهون المطبخ', 'سائل غسل أواني مركّز', 'منظّف أرضيات المطبخ'],
    },
    'societes-nettoyage': {
      label: 'شركات النظافة',
      shortDescription: 'صيغ مكثّفة للتدخّلات المتكرّرة متعدّدة المواقع.',
      supplyHighlights: ['بيدونات 20 ل', 'جافيل مركّز', 'مزيلات دهون متعدّدة الأسطح'],
    },
    entreprises: {
      label: 'الشركات',
      shortDescription: 'صيانة يومية للمكاتب والمرافق الصحية والمساحات المشتركة.',
      supplyHighlights: ['صابون سائل للمرافق الصحية', 'منظّف زجاج للاستقبال والمكاتب', 'مطهّرات للمساحات المشتركة'],
    },
    'revendeurs-grossistes': {
      label: 'الموزّعون وتجّار الجملة',
      shortDescription: 'تموين مهني بمراجع بسيطة وسهلة إعادة الطلب.',
      supplyHighlights: ['مراجع واضحة', 'صيغ من 5 ل إلى 20 ل', 'تموين متعدّد الاستعمالات'],
    },
    institutions: {
      label: 'المؤسسات',
      shortDescription: 'المدارس والإدارات والمنشآت ذات الاستعمال الجماعي.',
      supplyHighlights: ['نظافة المرافق الصحية', 'صيانة الأرضيات', 'صابون سائل للمجموعات'],
    },
  },
};

export function localizeUseCase(useCase: UseCase, locale: Locale): UseCase {
  if (locale === 'fr') return useCase;
  const t = USE_CASES[locale]?.[useCase.id];
  if (!t) return useCase;
  return { ...useCase, label: t.label ?? useCase.label, description: t.description ?? useCase.description };
}

export function localizeUseCases(list: readonly UseCase[], locale: Locale): UseCase[] {
  return locale === 'fr' ? [...list] : list.map((u) => localizeUseCase(u, locale));
}

export function localizeSector(sector: Sector, locale: Locale): Sector {
  if (locale === 'fr') return sector;
  const t = SECTORS[locale]?.[sector.id];
  if (!t) return sector;
  return {
    ...sector,
    label: t.label ?? sector.label,
    shortDescription: t.shortDescription ?? sector.shortDescription,
    supplyHighlights: t.supplyHighlights ?? sector.supplyHighlights,
  };
}

export function localizeSectors(list: readonly Sector[], locale: Locale): Sector[] {
  return locale === 'fr' ? [...list] : list.map((s) => localizeSector(s, locale));
}

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === 'fr') return product;
  const t = PRODUCTS[locale]?.[product.id];
  if (!t) return product;
  return {
    ...product,
    tagline: t.tagline ?? product.tagline,
    description: t.description ?? product.description,
    howToUse: t.howToUse ?? product.howToUse,
    dosage: t.dosage ?? product.dosage,
    formats: t.formats
      ? product.formats.map((f, i) => ({ ...f, label: t.formats?.[i] ?? f.label }))
      : product.formats,
    specs: t.specs
      ? product.specs?.map((s, i) => ({
          label: t.specs?.[i]?.label ?? s.label,
          value: t.specs?.[i]?.value ?? s.value,
        }))
      : product.specs,
    dilutionRates: t.dilutionRates
      ? product.dilutionRates?.map((d, i) => ({
          label: t.dilutionRates?.[i]?.label ?? d.label,
          rate: t.dilutionRates?.[i]?.rate ?? d.rate,
        }))
      : product.dilutionRates,
  };
}

export function localizeProducts(list: readonly Product[], locale: Locale): Product[] {
  return locale === 'fr' ? [...list] : list.map((p) => localizeProduct(p, locale));
}

// ---------------------------------------------------------------------------
// PRODUCTS — defined last (referenced by localizeProduct above via hoisting).
// ---------------------------------------------------------------------------
const PRODUCTS: LocaleMap<ProductL10n> = {
  en: {
    'prolax-liquide': {
      tagline: 'Professional liquid detergent for coloured and delicate linen',
      description: 'Liquid detergent for the main wash of professional linen. It covers everyday laundry rotations, positioned for coloured textiles and intensive hotel use.',
      howToUse: 'Use in the main wash cycle according to the soiling level and type of linen.',
      dosage: '10 to 15 ml per kg of laundry.',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Main wash of professional linen' }, { label: 'Packaging', value: 'Can 20 KG' }],
    },
    sanihand: {
      tagline: 'Liquid soap for everyday hand hygiene',
      description: 'Liquid soap for hygiene points in businesses, kitchens and communities. It simplifies dispenser refills with a professional format and ready-to-use application.',
      howToUse: 'Use undiluted on wet hands, then rinse with clean water.',
      dosage: 'Undiluted.',
      formats: ['Can 05 KG'],
      specs: [{ label: 'Use', value: 'Hand hygiene in professional settings' }, { label: 'Packaging', value: 'Can 05 KG' }],
    },
    alcogel: {
      tagline: 'Hydroalcoholic gel for hand disinfection',
      description: 'Ready-to-use hydroalcoholic gel for hand disinfection without water. Suited to receptions, production zones, kitchens and high-traffic areas.',
      howToUse: 'Apply undiluted on clean, dry hands, then rub until fully evaporated.',
      dosage: 'Undiluted.',
      formats: ['Can 05 KG', 'Bottle 500 ML'],
      specs: [{ label: 'Use', value: 'Rinse-free hand disinfection' }, { label: 'Packaging', value: 'Can 05 KG · Bottle 500 ML' }],
    },
    'javel-prodet': {
      tagline: 'Chlorine disinfectant for all surfaces',
      description: 'Chlorine disinfectant for routine cleaning on surfaces and technical zones. It meets disinfection needs in community, service and catering environments.',
      howToUse: 'Prepare the recommended dilution for the surface, then rinse if required by use.',
      dosage: '500 ml per 10 litres of water.',
      formats: ['Can 05 L'],
      specs: [{ label: 'Use', value: 'Multi-surface chlorine disinfection' }, { label: 'Packaging', value: 'Can 05 L' }],
      dilutionRates: [{ label: 'Standard dilution', rate: '500 ml per 10 litres of water' }],
    },
    profour: {
      tagline: 'Cleaner for ovens, fryers, grills and hoods',
      description: 'Shock cleaner for baked-on grease and carbonised deposits on kitchen equipment. It targets stations where residue build-up slows end-of-service cleaning.',
      howToUse: 'Use undiluted on the heaviest areas. For hoods, a 50% dilution may be used depending on fouling.',
      dosage: 'Undiluted, and 50% for hoods.',
      formats: ['Can 05 KG'],
      specs: [{ label: 'Use', value: 'Degreasing ovens, grills, fryers and hoods' }, { label: 'Packaging', value: 'Can 05 KG' }],
      dilutionRates: [{ label: 'Ovens and grills', rate: 'Undiluted' }, { label: 'Hoods', rate: '50% dilution depending on fouling' }],
    },
    provitre: {
      tagline: 'Cleaner for windows and glass surfaces',
      description: 'Ready-to-use cleaner for glass surfaces, mirrors and reception areas. Aimed at sites where the smallest mark shows immediately.',
      howToUse: 'Spray undiluted on the surface, then wipe with a clean, lint-free cloth.',
      dosage: 'Undiluted.',
      formats: ['Can 05 L', 'Spray 500 ML'],
      specs: [{ label: 'Use', value: 'Windows, mirrors and smooth surfaces' }, { label: 'Packaging', value: 'Can 05 L · Spray 500 ML' }],
    },
    prolav: {
      tagline: 'Washing liquid for machine dishwashing',
      description: 'Machine detergent for automatic dishwashing in professional kitchens. Its low dosage per litre of water suits regular cycles.',
      howToUse: 'Use with a machine doser suited to the volume and water hardness.',
      dosage: '3 ml per litre of water (0.2%).',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Machine dishwashing' }, { label: 'Packaging', value: 'Can 20 KG' }],
      dilutionRates: [{ label: 'Machine dosage', rate: '3 ml per litre of water (0.2%)' }],
    },
    prorinse: {
      tagline: 'Rinse aid for machine dishwashing',
      description: 'Rinse aid for automatic dishwashing cycles. It supports drying and helps limit residual marks as dishes leave the machine.',
      howToUse: 'Use with a rinse pump set to the water quality and the cycle used.',
      dosage: '0.2 to 0.3 ml per litre of water.',
      formats: ['Can 10 KG'],
      specs: [{ label: 'Use', value: 'Machine dishwashing rinse' }, { label: 'Packaging', value: 'Can 10 KG' }],
      dilutionRates: [{ label: 'Machine dosage', rate: '0.2 to 0.3 ml per litre of water' }],
    },
    'prolax-100': {
      tagline: 'Wetting agent and wash booster',
      description: 'Wash additive designed to improve linen wetting and reinforce the main cycle on professional textiles.',
      howToUse: 'Integrate into the wash cycle with the dosage adjusted to the type of linen.',
      dosage: '3 to 5 ml per kg of laundry.',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Textile wash booster' }, { label: 'Packaging', value: 'Can 20 KG' }],
    },
    'prolax-200': {
      tagline: 'Powerful degreaser for tough stains on linen',
      description: 'Textile booster formulated for greasy and stubborn stains. It complements the main detergent on heavily soiled professional linen.',
      howToUse: 'Add to the wash cycle according to the soiling level of the linen.',
      dosage: '5 to 10 ml per kg of laundry.',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Textile degreasing booster' }, { label: 'Packaging', value: 'Can 20 KG' }],
    },
    'prolax-400': {
      tagline: 'Chlorinated powder for whitening and disinfecting linen',
      description: 'Chlorinated powder for whitening and disinfecting white linen in professional laundries.',
      howToUse: 'Use on textile references compatible with chlorine whitening.',
      dosage: '3 to 5 grams per kg of laundry.',
      formats: ['Bucket 10 KG'],
      specs: [{ label: 'Use', value: 'Textile whitening and disinfection' }, { label: 'Packaging', value: 'Bucket 10 KG' }],
    },
    'prolax-500': {
      tagline: 'Softener and fabric conditioner for linen',
      description: 'Softener for the finishing cycles of professional linen, improving feel and textile comfort.',
      howToUse: 'Add at the final rinse or the dedicated textile finishing phase.',
      dosage: '10 to 15 ml per kg of laundry.',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Linen softening' }, { label: 'Packaging', value: 'Can 20 KG' }],
    },
    'prolax-couleur': {
      tagline: 'Main-wash powder for coloured linen',
      description: 'Main-wash powder for coloured linen in professional use, with a bag format suited to regular consumption.',
      howToUse: 'Use in the main wash on coloured linen according to load and soiling.',
      dosage: '10 to 20 grams per kg of laundry.',
      formats: ['Bag 25 KG'],
      specs: [{ label: 'Use', value: 'Main wash of coloured linen' }, { label: 'Packaging', value: 'Bag 25 KG' }],
    },
    'prolax-blanc': {
      tagline: 'Main-wash powder for white linen',
      description: 'Main-wash powder for white articles in professional laundries and communities.',
      howToUse: 'Use in the main cycle on white linen compatible with this wash method.',
      dosage: '10 to 20 grams per kg of laundry.',
      formats: ['Bag 25 KG'],
      specs: [{ label: 'Use', value: 'Main wash of white linen' }, { label: 'Packaging', value: 'Bag 25 KG' }],
    },
    'prolax-delicat': {
      tagline: 'Liquid detergent for guest and delicate textiles',
      description: 'Liquid detergent designed for guest linen and delicate textiles requiring more controlled treatment.',
      howToUse: 'Use on delicate references according to the wash parameters validated by the site.',
      dosage: '10 ml per kg of laundry.',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Delicate and guest linen' }, { label: 'Packaging', value: 'Can 20 KG' }],
    },
    proxy: {
      tagline: 'Oxygen bleaching agent for coloured linen',
      description: 'Oxygen bleaching agent designed to reinforce textile wash cycles without resorting to chlorine treatment.',
      howToUse: 'Use as a complementary bleaching agent on coloured or mixed linen.',
      dosage: '10 to 15 ml per kg of laundry.',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Oxygen textile bleaching' }, { label: 'Packaging', value: 'Can 20 KG' }],
    },
    'clorax-liquide': {
      tagline: 'Chlorine bleaching agent for white linen',
      description: 'Distributed chlorine bleaching reference for treating white linen in professional laundries.',
      howToUse: 'Use on white linen compatible with chlorine treatments.',
      dosage: '7 to 20 ml per kg of laundry.',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Chlorine whitening of white linen' }, { label: 'Packaging', value: 'Can 20 KG' }],
    },
    progras: {
      tagline: 'Degreasing powder for greasy and stained linen',
      description: 'Booster powder for treating very greasy or heavily stained linen, notably in catering and maintenance.',
      howToUse: 'Add to the main wash cycle when loads show high greasy soiling.',
      dosage: '15 to 20 grams per kg of laundry.',
      formats: ['Bag 25 KG'],
      specs: [{ label: 'Use', value: 'Reinforced textile degreasing' }, { label: 'Packaging', value: 'Bag 25 KG' }],
    },
    'deofresh-linge': {
      tagline: 'Textile fragrance for linen finishing',
      description: 'Scented finishing reference for linen after washing, reinforcing the feeling of freshness when returned to service.',
      howToUse: 'Use undiluted according to the finishing protocol chosen by the site.',
      dosage: 'Undiluted.',
      formats: ['Can 05 KG'],
      specs: [{ label: 'Use', value: 'Scented linen finishing' }, { label: 'Packaging', value: 'Can 05 KG' }],
    },
    manocid: {
      tagline: 'Bactericidal liquid soap for hands',
      description: 'Bactericidal liquid soap for hygiene points where a reinforced requirement applies to staff hands.',
      howToUse: 'Use undiluted on wet hands, then rinse thoroughly.',
      dosage: 'Undiluted.',
      formats: ['Can 05 KG'],
      specs: [{ label: 'Use', value: 'Bactericidal hand washing' }, { label: 'Packaging', value: 'Can 05 KG' }],
    },
    alcohand: {
      tagline: 'Disinfectant solution for hands, floors and surfaces',
      description: 'Multi-purpose disinfectant solution for hands, surfaces and floors. It suits environments that want to limit reference changes on routine protocols.',
      howToUse: 'Use undiluted on the area concerned according to the chosen hygiene protocol.',
      dosage: 'Undiluted.',
      formats: ['Can 05 KG'],
      specs: [{ label: 'Use', value: 'Disinfection of hands, floors and surfaces' }, { label: 'Packaging', value: 'Can 05 KG' }],
    },
    'sirafan-desinfectant': {
      tagline: 'Rinse-free disinfectant for all surfaces',
      description: 'Rinse-free disinfectant for surfaces and contact points in professional environments. It targets zones where speed of action matters as much as the hygiene result.',
      howToUse: 'Apply undiluted on the pre-cleaned surface and leave to act per the internal protocol.',
      dosage: 'Undiluted.',
      formats: ['Can 05 L'],
      specs: [{ label: 'Use', value: 'Rinse-free surface disinfection' }, { label: 'Packaging', value: 'Can 05 L' }],
    },
    prokill: {
      tagline: 'Disinfectant cleaner for all surfaces',
      description: 'Multi-surface disinfectant cleaner for equipment, preparation areas and contact points. It covers routine cleaning and disinfection needs on site.',
      howToUse: 'Dilute according to the soiling level, then apply to the surfaces to be treated.',
      dosage: '200 to 300 ml per 10 litres of water.',
      formats: ['Can 05 KG'],
      specs: [{ label: 'Use', value: 'Multi-surface disinfectant cleaning' }, { label: 'Packaging', value: 'Can 05 KG' }],
      dilutionRates: [{ label: 'Standard dilution', rate: '200 to 300 ml per 10 litres of water' }],
    },
    prolac: {
      tagline: 'Descaler for dishwashers and equipment',
      description: 'Descaler for dishwashers, bains-marie and equipment exposed to limescale deposits. Also used on laundry machine drums.',
      howToUse: 'Dilute according to the intensity of the scale and the nature of the equipment treated.',
      dosage: '1 to 2 litres per 10 litres of water (5 to 10%).',
      formats: ['Can 06 KG', 'Can 20 KG'],
      specs: [{ label: 'Use', value: 'Descaling equipment and machines' }, { label: 'Packaging', value: 'Can 06 KG · Can 20 KG' }],
      dilutionRates: [{ label: 'Dilution', rate: '1 to 2 litres per 10 litres of water (5 to 10%)' }],
    },
    'solitaire-vaisselle': {
      tagline: 'All-purpose detergent for dishwashing and surfaces',
      description: 'Versatile detergent for dishwashing, worktops and routine cleaning in kitchens.',
      howToUse: 'Dilute in warm water, then apply to the area or the wash basin.',
      dosage: '50 ml per 10 litres of water.',
      formats: ['Can 05 L'],
      specs: [{ label: 'Use', value: 'Dishwashing and kitchen surfaces' }, { label: 'Packaging', value: 'Can 05 L' }],
      dilutionRates: [{ label: 'Dilution', rate: '50 ml per 10 litres of water' }],
    },
    profon: {
      tagline: 'Strong acid cleaner for WC, urinals and hard surfaces',
      description: 'Strong acid cleaner for toilet bowls, urinals, pools and heavily scaled hard zones. It targets sites facing marked mineral deposits.',
      howToUse: 'Dilute according to the scaling level, or use more concentrated on critical zones.',
      dosage: '1 to 2 litres per 10 litres of water.',
      formats: ['Can 05 KG', 'Can 20 KG'],
      specs: [{ label: 'Use', value: 'Strong descaling of sanitary and hard surfaces' }, { label: 'Packaging', value: 'Can 05 KG · Can 20 KG' }],
      dilutionRates: [{ label: 'Dilution', rate: '1 to 2 litres per 10 litres of water' }],
    },
    pilax: {
      tagline: 'Powerful descaler for toilet bowls',
      description: 'Ready-to-use descaler for the targeted treatment of toilet bowls heavily marked by limescale.',
      howToUse: 'Apply undiluted to the area, then leave to act before brushing and rinsing.',
      dosage: 'Undiluted.',
      formats: ['Bottle 750 ML'],
      specs: [{ label: 'Use', value: 'Targeted descaling of WC' }, { label: 'Packaging', value: 'Bottle 750 ML' }],
    },
    prostar: {
      tagline: 'Disinfectant cleaner for bathrooms',
      description: 'Disinfectant cleaner for bathrooms, showers, fittings and sanitary zones exposed to frequent use.',
      howToUse: 'Use undiluted on contact zones and usual sanitary surfaces.',
      dosage: 'Undiluted.',
      formats: ['Can 05 KG', 'Bottle 750 ML'],
      specs: [{ label: 'Use', value: 'Bathroom and sanitary upkeep' }, { label: 'Packaging', value: 'Can 05 KG · Bottle 750 ML' }],
    },
    progerme: {
      tagline: 'Deodorising cleaner for all surfaces',
      description: 'Deodorising cleaner for routine upkeep of floors, sanitary areas and general surfaces in professional environments.',
      howToUse: 'Dilute for routine washing of floors and washable surfaces.',
      dosage: '200 ml per 10 litres of water.',
      formats: ['Can 05 KG'],
      specs: [{ label: 'Use', value: 'Multi-surface deodorising cleaning' }, { label: 'Packaging', value: 'Can 05 KG' }],
      dilutionRates: [{ label: 'Dilution', rate: '200 ml per 10 litres of water' }],
    },
    deofresh: {
      tagline: 'Air and surface deodoriser',
      description: 'Deodoriser for professional spaces, restrooms, lobbies and common areas where smell perception matters immediately.',
      howToUse: 'Use undiluted by spraying or according to the protocol chosen on site.',
      dosage: 'Undiluted.',
      formats: ['Can 05 KG', 'Bottle 750 ML'],
      specs: [{ label: 'Use', value: 'Air and surface deodorising' }, { label: 'Packaging', value: 'Can 05 KG · Bottle 750 ML' }],
    },
    'gresil-prodet': {
      tagline: 'Deodoriser for all surfaces',
      description: 'Surface deodoriser for routine upkeep on washable zones and shared spaces.',
      howToUse: 'Dilute before applying to the surfaces or floors to be maintained.',
      dosage: '200 ml per 10 litres of water.',
      formats: ['Can 05 L'],
      specs: [{ label: 'Use', value: 'Deodorising of surfaces and floors' }, { label: 'Packaging', value: 'Can 05 L' }],
      dilutionRates: [{ label: 'Dilution', rate: '200 ml per 10 litres of water' }],
    },
    'vit-net': {
      tagline: 'Drain unblocker for pipes',
      description: 'Unblocker for pipes and drainage points requiring strong action on obstructions.',
      howToUse: 'Use according to the safety protocol suited to the type of pipe treated.',
      dosage: '1 kg per 10 litres of water.',
      formats: ['Bucket 05 KG'],
      specs: [{ label: 'Use', value: 'Unblocking pipes' }, { label: 'Packaging', value: 'Bucket 05 KG' }],
    },
    pronet: {
      tagline: 'Daily degreasing cleaner for floors and walls',
      description: 'Degreasing cleaner designed for the daily upkeep of floors, walls and washable surfaces in professional settings.',
      howToUse: 'Dilute for daily washing according to the soiling level.',
      dosage: '0.5 to 1 litre per 10 litres of water.',
      formats: ['Can 06 KG'],
      specs: [{ label: 'Use', value: 'Daily upkeep of floors and walls' }, { label: 'Packaging', value: 'Can 06 KG' }],
      dilutionRates: [{ label: 'Dilution', rate: '0.5 to 1 litre per 10 litres of water' }],
    },
    'pronet-plus': {
      tagline: 'Intensive degreasing cleaner for very dirty floors',
      description: 'Reinforced version for the deep cleaning of very dirty floors and service zones heavily exposed to greasy deposits.',
      howToUse: 'Dilute according to the cleaning intensity required and the nature of the surface.',
      dosage: '0.5 to 1 litre per 10 litres of water.',
      formats: ['Can 20 KG'],
      specs: [{ label: 'Use', value: 'Deep cleaning of very dirty floors' }, { label: 'Packaging', value: 'Can 20 KG' }],
      dilutionRates: [{ label: 'Dilution', rate: '0.5 to 1 litre per 10 litres of water' }],
    },
    molkabin: {
      tagline: 'Maintenance and shine for stainless-steel equipment',
      description: 'Distributed reference for the maintenance and shine of stainless-steel surfaces and equipment in professional environments.',
      howToUse: 'Use undiluted on clean stainless steel, then wipe to bring out the shine.',
      dosage: 'Undiluted.',
      formats: ['Spray 500 ML'],
      specs: [{ label: 'Use', value: 'Stainless-steel shine and upkeep' }, { label: 'Packaging', value: 'Spray 500 ML' }],
    },
    'super-clean': {
      tagline: 'Shampoo for carpets and rugs',
      description: 'Distributed reference for cleaning carpets and rugs in hospitality, office and cleaning-service environments.',
      howToUse: 'Dilute before applying with the method chosen for upholstery textiles.',
      dosage: '200 ml per 10 litres of water.',
      formats: ['Can 05 KG'],
      specs: [{ label: 'Use', value: 'Carpet and rug shampoo' }, { label: 'Packaging', value: 'Can 05 KG' }],
      dilutionRates: [{ label: 'Dilution', rate: '200 ml per 10 litres of water' }],
    },
  },
  ar: {
    'prolax-liquide': {
      tagline: 'مسحوق غسيل سائل مهني للبياضات الملوّنة والرقيقة',
      description: 'مسحوق غسيل سائل للغسل الرئيسي للبياضات المهنية. يغطّي دورات الغسيل اليومية، بتموضع مناسب للأقمشة الملوّنة والاستعمال الفندقي المكثّف.',
      howToUse: 'يُستعمل في دورة الغسل الرئيسية حسب درجة الاتساخ ونوع البياضات.',
      dosage: '10 إلى 15 مل لكل كغ من الغسيل.',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'الغسل الرئيسي للبياضات المهنية' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
    },
    sanihand: {
      tagline: 'صابون سائل لنظافة اليدين اليومية',
      description: 'صابون سائل لنقاط النظافة في الشركات والمطابخ والمجموعات. يبسّط إعادة تعبئة الموزّعات بصيغة مهنية واستعمال صافٍ.',
      howToUse: 'يُستعمل صافياً على اليدين المبلّلتين ثم يُشطف بالماء النظيف.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'نظافة اليدين في الوسط المهني' }, { label: 'التعبئة', value: 'بيدون 05 كغ' }],
    },
    alcogel: {
      tagline: 'جل كحولي لتطهير اليدين',
      description: 'جل كحولي جاهز للاستعمال لتطهير اليدين دون ماء. يناسب الاستقبال ومناطق الإنتاج والمطابخ والمساحات كثيفة المرور.',
      howToUse: 'يُوضع صافياً على يدين نظيفتين وجافّتين ثم يُفرك حتى التبخّر الكامل.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 كغ', 'قارورة 500 مل'],
      specs: [{ label: 'الاستعمال', value: 'تطهير اليدين دون شطف' }, { label: 'التعبئة', value: 'بيدون 05 كغ · قارورة 500 مل' }],
    },
    'javel-prodet': {
      tagline: 'مطهّر كلوري لجميع الأسطح',
      description: 'مطهّر كلوري لعمليات التنظيف الاعتيادية على الأسطح والمناطق التقنية. يلبّي احتياجات التطهير في الأوساط الجماعية والخدمية والمطعمية.',
      howToUse: 'يُحضَّر التخفيف الموصى به حسب السطح المراد معالجته، ثم يُشطف إذا تطلّب الاستعمال ذلك.',
      dosage: '500 مل لكل 10 لترات من الماء.',
      formats: ['بيدون 05 ل'],
      specs: [{ label: 'الاستعمال', value: 'تطهير كلوري متعدّد الأسطح' }, { label: 'التعبئة', value: 'بيدون 05 ل' }],
      dilutionRates: [{ label: 'تخفيف اعتيادي', rate: '500 مل لكل 10 لترات من الماء' }],
    },
    profour: {
      tagline: 'منظّف للأفران والمقالي والمشاوي والشفّاطات',
      description: 'منظّف قوي للدهون المطبوخة والرواسب المتفحّمة على تجهيزات المطبخ. يستهدف المواقع التي يُبطئ فيها تراكم البقايا تنظيف نهاية الخدمة.',
      howToUse: 'يُستعمل صافياً على المناطق الأكثر اتساخاً. للشفّاطات يمكن اعتماد تخفيف بنسبة 50% حسب الاتساخ.',
      dosage: 'صافٍ، و50% للشفّاطات.',
      formats: ['بيدون 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'إزالة دهون الأفران والمشاوي والمقالي والشفّاطات' }, { label: 'التعبئة', value: 'بيدون 05 كغ' }],
      dilutionRates: [{ label: 'الأفران والمشاوي', rate: 'صافٍ' }, { label: 'الشفّاطات', rate: 'تخفيف بنسبة 50% حسب الاتساخ' }],
    },
    provitre: {
      tagline: 'منظّف للزجاج والأسطح الزجاجية',
      description: 'منظّف جاهز للاستعمال للأسطح الزجاجية والمرايا ومناطق الاستقبال. يستهدف المواقع التي يظهر فيها أدنى أثر فوراً.',
      howToUse: 'يُرشّ صافياً على السطح ثم يُمسح بقطعة نظيفة خالية من الوبر.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 ل', 'بخّاخ 500 مل'],
      specs: [{ label: 'الاستعمال', value: 'الزجاج والمرايا والأسطح الملساء' }, { label: 'التعبئة', value: 'بيدون 05 ل · بخّاخ 500 مل' }],
    },
    prolav: {
      tagline: 'سائل غسل للأواني في الآلة',
      description: 'منظّف آلة مخصّص للغسل الآلي للأواني في المطابخ المهنية. جرعته المنخفضة لكل لتر ماء تجعله مناسباً للوتيرة المنتظمة.',
      howToUse: 'يُستعمل بموزّع آلة مناسب للحجم وعسر الماء.',
      dosage: '3 مل لكل لتر ماء (0,2%).',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'غسل الأواني في الآلة' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
      dilutionRates: [{ label: 'جرعة الآلة', rate: '3 مل لكل لتر ماء (0,2%)' }],
    },
    prorinse: {
      tagline: 'مادة شطف مساعدة للأواني في الآلة',
      description: 'مادة شطف مساعدة لدورات الأواني الآلية. ترافق التجفيف وتساعد على الحدّ من الآثار المتبقّية عند خروج الأواني من الآلة.',
      howToUse: 'تُستعمل بمضخّة شطف مضبوطة حسب جودة الماء والدورة المستعملة.',
      dosage: '0,2 إلى 0,3 مل لكل لتر ماء.',
      formats: ['بيدون 10 كغ'],
      specs: [{ label: 'الاستعمال', value: 'شطف الأواني في الآلة' }, { label: 'التعبئة', value: 'بيدون 10 كغ' }],
      dilutionRates: [{ label: 'جرعة الآلة', rate: '0,2 إلى 0,3 مل لكل لتر ماء' }],
    },
    'prolax-100': {
      tagline: 'عامل ترطيب ومعزّز للغسل',
      description: 'مادة مضافة للغسل مصمّمة لتحسين ترطيب البياضات وتعزيز فعّالية الدورة الرئيسية على الأقمشة المهنية.',
      howToUse: 'تُدمج في دورة الغسل بجرعة معدّلة حسب نوع البياضات.',
      dosage: '3 إلى 5 مل لكل كغ من الغسيل.',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'تعزيز غسل الأقمشة' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
    },
    'prolax-200': {
      tagline: 'مزيل دهون قوي للبقع الصعبة على البياضات',
      description: 'معزّز للأقمشة مركّب للبقع الدهنية والاتساخات العنيدة. يكمّل المسحوق الرئيسي على البياضات المهنية شديدة الاتساخ.',
      howToUse: 'يُضاف إلى دورة الغسل حسب مستوى اتساخ البياضات المعالَجة.',
      dosage: '5 إلى 10 مل لكل كغ من الغسيل.',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'معزّز إزالة الدهون للأقمشة' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
    },
    'prolax-400': {
      tagline: 'مسحوق كلوري لتبييض وتطهير البياضات',
      description: 'مسحوق كلوري مخصّص لتبييض وتطهير البياضات البيضاء في المغاسل المهنية.',
      howToUse: 'يُستعمل على مراجع الأقمشة المتوافقة مع التبييض الكلوري.',
      dosage: '3 إلى 5 غرام لكل كغ من الغسيل.',
      formats: ['دلو 10 كغ'],
      specs: [{ label: 'الاستعمال', value: 'تبييض وتطهير الأقمشة' }, { label: 'التعبئة', value: 'دلو 10 كغ' }],
    },
    'prolax-500': {
      tagline: 'مادة ملطّفة ومنعّمة للبياضات',
      description: 'منعّم مخصّص لدورات إنهاء البياضات المهنية لتحسين الملمس وراحة الأقمشة.',
      howToUse: 'يُضاف عند الشطف الأخير أو في مرحلة الإنهاء المخصّصة للأقمشة.',
      dosage: '10 إلى 15 مل لكل كغ من الغسيل.',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'تنعيم البياضات' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
    },
    'prolax-couleur': {
      tagline: 'مسحوق غسل رئيسي للبياضات الملوّنة',
      description: 'مسحوق غسل رئيسي مخصّص للبياضات الملوّنة في الاستعمال المهني، بصيغة كيس مناسبة للاستهلاك المنتظم.',
      howToUse: 'يُستعمل في الغسل الرئيسي على البياضات الملوّنة حسب الحمولة والاتساخ.',
      dosage: '10 إلى 20 غرام لكل كغ من الغسيل.',
      formats: ['كيس 25 كغ'],
      specs: [{ label: 'الاستعمال', value: 'الغسل الرئيسي للبياضات الملوّنة' }, { label: 'التعبئة', value: 'كيس 25 كغ' }],
    },
    'prolax-blanc': {
      tagline: 'مسحوق غسل رئيسي للبياضات البيضاء',
      description: 'مسحوق غسل رئيسي للأصناف البيضاء في المغاسل المهنية والمجموعات.',
      howToUse: 'يُستعمل في الدورة الرئيسية على البياضات البيضاء المتوافقة مع طريقة الغسل هذه.',
      dosage: '10 إلى 20 غرام لكل كغ من الغسيل.',
      formats: ['كيس 25 كغ'],
      specs: [{ label: 'الاستعمال', value: 'الغسل الرئيسي للبياضات البيضاء' }, { label: 'التعبئة', value: 'كيس 25 كغ' }],
    },
    'prolax-delicat': {
      tagline: 'مسحوق غسيل سائل لبياضات الحرفاء والأقمشة الرقيقة',
      description: 'مسحوق غسيل سائل مصمّم لبياضات الحرفاء والأقمشة الرقيقة التي تتطلّب معالجة أكثر دقّة.',
      howToUse: 'يُستعمل على المراجع الرقيقة حسب معايير الغسل المعتمدة في الموقع.',
      dosage: '10 مل لكل كغ من الغسيل.',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'البياضات الرقيقة وبياضات الحرفاء' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
    },
    proxy: {
      tagline: 'عامل تبييض أكسجيني للبياضات الملوّنة',
      description: 'عامل تبييض أكسجيني مصمّم لتعزيز دورات غسل الأقمشة دون اللجوء إلى معالجة كلورية.',
      howToUse: 'يُستعمل كعامل تبييض مكمّل على البياضات الملوّنة أو المختلطة.',
      dosage: '10 إلى 15 مل لكل كغ من الغسيل.',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'تبييض أكسجيني للأقمشة' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
    },
    'clorax-liquide': {
      tagline: 'عامل تبييض كلوري للبياضات البيضاء',
      description: 'مرجع تبييض كلوري موزَّع لمعالجة البياضات البيضاء في المغاسل المهنية.',
      howToUse: 'يُستعمل على البياضات البيضاء المتوافقة مع المعالجات الكلورية.',
      dosage: '7 إلى 20 مل لكل كغ من الغسيل.',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'التبييض الكلوري للبياضات البيضاء' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
    },
    progras: {
      tagline: 'مسحوق إزالة دهون للبياضات الدهنية والمتّسخة',
      description: 'مسحوق معزّز لمعالجة البياضات شديدة الدهنية أو القوية الاتساخ، خاصة في المطعمة والصيانة.',
      howToUse: 'يُضاف إلى دورة الغسل الرئيسية عندما تُظهر الحمولات اتساخاً دهنياً مرتفعاً.',
      dosage: '15 إلى 20 غرام لكل كغ من الغسيل.',
      formats: ['كيس 25 كغ'],
      specs: [{ label: 'الاستعمال', value: 'إزالة دهون معزّزة للأقمشة' }, { label: 'التعبئة', value: 'كيس 25 كغ' }],
    },
    'deofresh-linge': {
      tagline: 'معطّر للأقمشة لإنهاء البياضات',
      description: 'مرجع إنهاء معطّر مخصّص للبياضات بعد الغسل، لتعزيز الإحساس بالانتعاش عند إعادة التشغيل.',
      howToUse: 'يُستعمل صافياً حسب بروتوكول الإنهاء المعتمد في الموقع.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'إنهاء معطّر للبياضات' }, { label: 'التعبئة', value: 'بيدون 05 كغ' }],
    },
    manocid: {
      tagline: 'صابون سائل مبيد للجراثيم لليدين',
      description: 'صابون سائل مبيد للجراثيم مخصّص لنقاط النظافة حيث ينطبق متطلّب معزّز على يدي العاملين.',
      howToUse: 'يُستعمل صافياً على اليدين المبلّلتين ثم يُشطف جيّداً.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'غسل اليدين المبيد للجراثيم' }, { label: 'التعبئة', value: 'بيدون 05 كغ' }],
    },
    alcohand: {
      tagline: 'محلول مطهّر لليدين والأرضيات والأسطح',
      description: 'محلول مطهّر متعدّد الاستعمالات لليدين والأسطح والأرضيات. يناسب الأوساط التي تريد الحدّ من تغيير المراجع في البروتوكولات الاعتيادية.',
      howToUse: 'يُستعمل صافياً على المنطقة المعنيّة حسب بروتوكول النظافة المعتمد.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'تطهير اليدين والأرضيات والأسطح' }, { label: 'التعبئة', value: 'بيدون 05 كغ' }],
    },
    'sirafan-desinfectant': {
      tagline: 'مطهّر لجميع الأسطح دون شطف',
      description: 'مطهّر دون شطف للأسطح ونقاط التماس في الوسط المهني. يستهدف المناطق التي تهمّ فيها سرعة التدخّل بقدر نتيجة النظافة.',
      howToUse: 'يُوضع صافياً على السطح المنظَّف مسبقاً ويُترك ليعمل حسب البروتوكول الداخلي.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 ل'],
      specs: [{ label: 'الاستعمال', value: 'تطهير الأسطح دون شطف' }, { label: 'التعبئة', value: 'بيدون 05 ل' }],
    },
    prokill: {
      tagline: 'منظّف مطهّر لجميع الأسطح',
      description: 'منظّف مطهّر متعدّد الأسطح للمعدّات ومناطق التحضير ونقاط التماس. يغطّي احتياجات التنظيف والتطهير الاعتيادية في الموقع.',
      howToUse: 'يُخفَّف حسب مستوى الاتساخ ثم يُوضع على الأسطح المراد معالجتها.',
      dosage: '200 إلى 300 مل لكل 10 لترات من الماء.',
      formats: ['بيدون 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'تنظيف مطهّر متعدّد الأسطح' }, { label: 'التعبئة', value: 'بيدون 05 كغ' }],
      dilutionRates: [{ label: 'تخفيف اعتيادي', rate: '200 إلى 300 مل لكل 10 لترات من الماء' }],
    },
    prolac: {
      tagline: 'مزيل ترسّبات لآلات غسل الأواني والتجهيزات',
      description: 'مزيل ترسّبات مخصّص لآلات غسل الأواني وأحواض التسخين والتجهيزات المعرّضة للترسّبات الكلسية. يُستعمل أيضاً على أسطوانات آلات المغاسل.',
      howToUse: 'يُخفَّف حسب شدّة الترسّبات وطبيعة التجهيز المعالَج.',
      dosage: '1 إلى 2 لتر لكل 10 لترات من الماء (5 إلى 10%).',
      formats: ['بيدون 06 كغ', 'بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'إزالة ترسّبات التجهيزات والآلات' }, { label: 'التعبئة', value: 'بيدون 06 كغ · بيدون 20 كغ' }],
      dilutionRates: [{ label: 'تخفيف', rate: '1 إلى 2 لتر لكل 10 لترات من الماء (5 إلى 10%)' }],
    },
    'solitaire-vaisselle': {
      tagline: 'منظّف متعدّد الاستعمالات للأواني والأسطح',
      description: 'منظّف متعدّد الاستعمالات لغسل الأواني وأسطح العمل والتنظيف الاعتيادي في المطبخ.',
      howToUse: 'يُخفَّف في ماء فاتر ثم يُوضع على المنطقة أو حوض الغسل.',
      dosage: '50 مل لكل 10 لترات من الماء.',
      formats: ['بيدون 05 ل'],
      specs: [{ label: 'الاستعمال', value: 'غسل الأواني وأسطح المطبخ' }, { label: 'التعبئة', value: 'بيدون 05 ل' }],
      dilutionRates: [{ label: 'تخفيف', rate: '50 مل لكل 10 لترات من الماء' }],
    },
    profon: {
      tagline: 'منظّف حمضي قوي للمراحيض والمباول والأسطح الصلبة',
      description: 'منظّف حمضي قوي لقيعان المراحيض والمباول والمسابح والمناطق الصلبة شديدة الترسّب. يستهدف المواقع التي تواجه ترسّبات معدنية واضحة.',
      howToUse: 'يُخفَّف حسب مستوى الترسّب أو يُستعمل أكثر تركيزاً على المناطق الحرجة.',
      dosage: '1 إلى 2 لتر لكل 10 لترات من الماء.',
      formats: ['بيدون 05 كغ', 'بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'إزالة ترسّبات قوية للمرافق الصحية والأسطح الصلبة' }, { label: 'التعبئة', value: 'بيدون 05 كغ · بيدون 20 كغ' }],
      dilutionRates: [{ label: 'تخفيف', rate: '1 إلى 2 لتر لكل 10 لترات من الماء' }],
    },
    pilax: {
      tagline: 'مزيل ترسّبات قوي لقيعان المراحيض',
      description: 'مزيل ترسّبات جاهز للاستعمال للمعالجة المركّزة لأحواض المراحيض شديدة التأثّر بالترسّبات الكلسية.',
      howToUse: 'يُوضع صافياً على المنطقة المراد معالجتها ثم يُترك ليعمل قبل الفرك والشطف.',
      dosage: 'صافٍ.',
      formats: ['قارورة 750 مل'],
      specs: [{ label: 'الاستعمال', value: 'إزالة ترسّبات مركّزة للمراحيض' }, { label: 'التعبئة', value: 'قارورة 750 مل' }],
    },
    prostar: {
      tagline: 'منظّف مطهّر للحمّامات',
      description: 'منظّف مطهّر للحمّامات والدشّ والحنفيات والمناطق الصحية المعرّضة للاستعمال المتكرّر.',
      howToUse: 'يُستعمل صافياً على مناطق التماس والأسطح الصحية المعتادة.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 كغ', 'قارورة 750 مل'],
      specs: [{ label: 'الاستعمال', value: 'صيانة الحمّامات والمرافق الصحية' }, { label: 'التعبئة', value: 'بيدون 05 كغ · قارورة 750 مل' }],
    },
    progerme: {
      tagline: 'منظّف معطّر لجميع الأسطح',
      description: 'منظّف معطّر للصيانة الاعتيادية للأرضيات والمرافق الصحية والأسطح العامة في الوسط المهني.',
      howToUse: 'يُخفَّف للغسل الاعتيادي للأرضيات والأسطح القابلة للغسل.',
      dosage: '200 مل لكل 10 لترات من الماء.',
      formats: ['بيدون 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'تنظيف معطّر متعدّد الأسطح' }, { label: 'التعبئة', value: 'بيدون 05 كغ' }],
      dilutionRates: [{ label: 'تخفيف', rate: '200 مل لكل 10 لترات من الماء' }],
    },
    deofresh: {
      tagline: 'معطّر للأجواء والأسطح',
      description: 'معطّر مخصّص للمساحات المهنية والمرافق الصحية والبهوات والمناطق المشتركة حيث يهمّ إدراك الرائحة فوراً.',
      howToUse: 'يُستعمل صافياً بالرشّ أو حسب البروتوكول المعتمد في الموقع.',
      dosage: 'صافٍ.',
      formats: ['بيدون 05 كغ', 'قارورة 750 مل'],
      specs: [{ label: 'الاستعمال', value: 'تعطير الأجواء والأسطح' }, { label: 'التعبئة', value: 'بيدون 05 كغ · قارورة 750 مل' }],
    },
    'gresil-prodet': {
      tagline: 'معطّر لجميع الأسطح',
      description: 'معطّر للأسطح مخصّص للاستعمالات الاعتيادية على المناطق القابلة للغسل والمساحات الجماعية.',
      howToUse: 'يُخفَّف قبل الوضع على الأسطح أو الأرضيات المراد صيانتها.',
      dosage: '200 مل لكل 10 لترات من الماء.',
      formats: ['بيدون 05 ل'],
      specs: [{ label: 'الاستعمال', value: 'تعطير الأسطح والأرضيات' }, { label: 'التعبئة', value: 'بيدون 05 ل' }],
      dilutionRates: [{ label: 'تخفيف', rate: '200 مل لكل 10 لترات من الماء' }],
    },
    'vit-net': {
      tagline: 'مزيل انسداد للقنوات',
      description: 'مزيل انسداد مخصّص للقنوات ونقاط التصريف التي تتطلّب فعلاً قوياً على الانسدادات.',
      howToUse: 'يُستعمل حسب بروتوكول السلامة المناسب لنوع القناة المعالَجة.',
      dosage: '1 كغ لكل 10 لترات من الماء.',
      formats: ['دلو 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'إزالة انسداد القنوات' }, { label: 'التعبئة', value: 'دلو 05 كغ' }],
    },
    pronet: {
      tagline: 'منظّف مزيل للدهون يومي للأرضيات والجدران',
      description: 'منظّف مزيل للدهون مصمّم للصيانة اليومية للأرضيات والجدران والأسطح القابلة للغسل في الوسط المهني.',
      howToUse: 'يُخفَّف للغسل اليومي حسب مستوى الاتساخ.',
      dosage: '0,5 إلى 1 لتر لكل 10 لترات من الماء.',
      formats: ['بيدون 06 كغ'],
      specs: [{ label: 'الاستعمال', value: 'الصيانة اليومية للأرضيات والجدران' }, { label: 'التعبئة', value: 'بيدون 06 كغ' }],
      dilutionRates: [{ label: 'تخفيف', rate: '0,5 إلى 1 لتر لكل 10 لترات من الماء' }],
    },
    'pronet-plus': {
      tagline: 'منظّف مزيل للدهون مكثّف للأرضيات شديدة الاتساخ',
      description: 'نسخة معزّزة للتنظيف العميق للأرضيات شديدة الاتساخ ومناطق الخدمة المعرّضة بقوّة للرواسب الدهنية.',
      howToUse: 'يُخفَّف حسب شدّة التنظيف المطلوب وطبيعة السطح.',
      dosage: '0,5 إلى 1 لتر لكل 10 لترات من الماء.',
      formats: ['بيدون 20 كغ'],
      specs: [{ label: 'الاستعمال', value: 'تنظيف عميق للأرضيات شديدة الاتساخ' }, { label: 'التعبئة', value: 'بيدون 20 كغ' }],
      dilutionRates: [{ label: 'تخفيف', rate: '0,5 إلى 1 لتر لكل 10 لترات من الماء' }],
    },
    molkabin: {
      tagline: 'صيانة ولمعان لتجهيزات الستانلس ستيل',
      description: 'مرجع موزَّع لصيانة ولمعان أسطح وتجهيزات الستانلس ستيل في الوسط المهني.',
      howToUse: 'يُستعمل صافياً على ستانلس ستيل نظيف ثم يُمسح لإبراز اللمعان.',
      dosage: 'صافٍ.',
      formats: ['بخّاخ 500 مل'],
      specs: [{ label: 'الاستعمال', value: 'لمعان وصيانة الستانلس ستيل' }, { label: 'التعبئة', value: 'بخّاخ 500 مل' }],
    },
    'super-clean': {
      tagline: 'شامبو للموكيت والسجّاد',
      description: 'مرجع موزَّع لتنظيف الموكيت والسجّاد في الأوساط الفندقية والمكتبية وخدمات النظافة.',
      howToUse: 'يُخفَّف قبل الوضع بالطريقة المعتمدة على أقمشة التأثيث.',
      dosage: '200 مل لكل 10 لترات من الماء.',
      formats: ['بيدون 05 كغ'],
      specs: [{ label: 'الاستعمال', value: 'شامبو الموكيت والسجّاد' }, { label: 'التعبئة', value: 'بيدون 05 كغ' }],
      dilutionRates: [{ label: 'تخفيف', rate: '200 مل لكل 10 لترات من الماء' }],
    },
  },
};
