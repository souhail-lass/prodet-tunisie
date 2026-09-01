-- Fiche de données de sécurité (FDS) publiée à côté de la fiche technique.
-- Réglementaire : le client doit pouvoir la télécharger depuis la fiche produit
-- sans passer par une demande. Nullable — tous les produits n'en ont pas encore.
ALTER TABLE public.catalogue_product
  ADD COLUMN IF NOT EXISTS safety_sheet_url text;
