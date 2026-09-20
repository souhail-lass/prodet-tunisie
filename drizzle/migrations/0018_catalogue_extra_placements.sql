-- A product can appear in more than one sous-catégorie (and even more than
-- one famille). Primary home stays on famille_slug / sous_categorie_slug;
-- extra listings live in this JSON array so each copy can have its own
-- sort_order without a second table.
ALTER TABLE public.catalogue_product
  ADD COLUMN IF NOT EXISTS extra_placements jsonb NOT NULL DEFAULT '[]'::jsonb;
