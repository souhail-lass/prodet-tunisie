import type { ProductCategory } from '../types';

export const SEED_CATEGORIES: readonly ProductCategory[] = [
  {
    key: 'detergents_surfaces',
    slug: 'detergents-surfaces',
    displayOrder: 10,
    nameByLocale: {
      fr: 'Détergents surfaces',
      ar: 'منظفات الأسطح',
      en: 'Surface detergents',
    },
  },
  {
    key: 'desinfectants',
    slug: 'desinfectants',
    displayOrder: 20,
    nameByLocale: {
      fr: 'Désinfectants',
      ar: 'المطهرات',
      en: 'Disinfectants',
    },
  },
  {
    key: 'lessives',
    slug: 'lessives',
    displayOrder: 30,
    nameByLocale: {
      fr: 'Lessives professionnelles',
      ar: 'مساحيق الغسيل المهنية',
      en: 'Professional laundry',
    },
  },
  {
    key: 'soin_personnel',
    slug: 'soin-personnel',
    displayOrder: 40,
    nameByLocale: {
      fr: 'Hygiène des mains',
      ar: 'نظافة اليدين',
      en: 'Hand hygiene',
    },
  },
  {
    key: 'cuisine',
    slug: 'cuisine',
    displayOrder: 50,
    nameByLocale: {
      fr: 'Cuisine et plonge',
      ar: 'المطبخ وغسيل الصحون',
      en: 'Kitchen and dishwashing',
    },
  },
  {
    key: 'sanitaires',
    slug: 'sanitaires',
    displayOrder: 60,
    nameByLocale: {
      fr: 'Sanitaires',
      ar: 'المرافق الصحية',
      en: 'Sanitary',
    },
  },
  {
    key: 'sols',
    slug: 'sols',
    displayOrder: 70,
    nameByLocale: {
      fr: 'Entretien des sols',
      ar: 'صيانة الأرضيات',
      en: 'Floor care',
    },
  },
] as const;
