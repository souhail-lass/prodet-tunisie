-- Ordre global de la liste « Tous les produits ».
--
-- `sort_order` est une position DANS une sous-catégorie : ses valeurs se
-- répètent d'une sous-catégorie à l'autre et ne peuvent donc pas ordonner une
-- liste plate de tout le catalogue. `catalogue_rank` est cet axe global, lui
-- aussi nullable (NULL = pas épinglé, tri alphabétique).
ALTER TABLE public.catalogue_product
  ADD COLUMN IF NOT EXISTS catalogue_rank integer;

CREATE INDEX IF NOT EXISTS catalogue_product_rank_idx
  ON public.catalogue_product (catalogue_rank);

-- Reprise du classement best-sellers (nombre de commandes distinctes) qui
-- vivait en dur dans src/data/catalogue-pin-order.ts. Il devient une donnée :
-- l'admin le redéplace dans /admin/produits/rangement sans déploiement.
--
-- Le même rang alimente les deux axes. En global il donne l'ordre demandé ;
-- dans une sous-catégorie, seules les positions RELATIVES comptent, donc les
-- best-sellers d'une même sous-catégorie s'y retrouvent en tête et dans le bon
-- ordre. Les trous (0, 4, 9, …) sont sans effet et disparaissent au premier
-- glisser-déposer, qui réécrit la sous-catégorie en séquence dense.
WITH ranking(sku, rank) AS (
  VALUES
    ('P-00001', 0),  -- SOLITAIRE VAISSELLE CITRON 5L
    ('P-00013', 1),  -- JAVEL PRODET BID 5KG
    ('P-00014', 2),  -- PROFOUR DEGRAISSANT FOUR 5KG
    ('P-00031', 3),  -- SERPILLERE SONIT 0.70 LOT 12P
    ('P-00002', 4),  -- JAVEL PRODET BID 20KG
    ('P-00009', 5),  -- SAC POUBELLE NOIR GM 90*120 35GR 200P
    ('P-00011', 6),  -- CACHEMIRE BLANC LOT 25P
    ('P-00003', 7),  -- SOLITAIRE VAISSELLE BID 20KG
    ('P-00012', 8),  -- JEX CARRE SAC DE 100P
    ('P-00029', 9),  -- SANIHAND SAVON LIQUIDE BID 05KG
    ('P-00008', 10), -- ESSUIE TOUT JUMBO XXL SAC 06P
    ('P-00023', 11), -- PROGERME VERT BID 05 KG
    ('P-00017', 12), -- GRESIL PRODET 5KG
    ('P-00049', 13), -- DEOFRESH JASMIN 05KG
    ('P-00006', 14)  -- PROVITRE BID 5KG
)
UPDATE public.catalogue_product AS p
SET catalogue_rank = r.rank,
    sort_order = COALESCE(p.sort_order, r.rank)
FROM ranking AS r
WHERE upper(btrim(p.sku)) = r.sku
  AND p.catalogue_rank IS NULL;
