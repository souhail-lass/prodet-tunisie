export type UseCaseId =
  | 'sols'
  | 'cuisine-degraissage'
  | 'sanitaires-desinfection'
  | 'linge-textiles'
  | 'hygiene-mains'
  | 'surfaces-vitres';

export type UseCaseIconName =
  | 'Mop'
  | 'ChefHat'
  | 'ShieldPlus'
  | 'Shirt'
  | 'HandSoap'
  | 'Sparkles';

export interface UseCase {
  id: UseCaseId;
  key: UseCaseId;
  slug: string;
  label: string;
  description: string;
  icon: UseCaseIconName;
  accentColor: string;
  displayOrder: number;
}
