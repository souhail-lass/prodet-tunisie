-- Curation du catalogue public (phase 1) : placement et ordre manuels.
-- Les trois colonnes sont nullables et le restent : NULL = « laisser le
-- classifieur par mots-clés décider » (src/data/familles.ts), ce qui permet aux
-- produits existants et à ceux que Swiver ajoutera plus tard de se placer seuls
-- au lieu de disparaître. Seuls les produits explicitement curés sont figés.
ALTER TABLE public.catalogue_product
  ADD COLUMN IF NOT EXISTS famille_slug text,
  ADD COLUMN IF NOT EXISTS sous_categorie_slug text,
  ADD COLUMN IF NOT EXISTS sort_order integer;

CREATE INDEX IF NOT EXISTS catalogue_product_placement_idx
  ON public.catalogue_product (famille_slug, sous_categorie_slug, sort_order);
