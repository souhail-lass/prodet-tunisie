# Module — Curation du catalogue public (phase 1)

> Status: implémenté. Owner: Souhail. Last updated: 2026-09.
> Décide : quels produits apparaissent dans quelle sous-catégorie, et dans quel ordre, sans déploiement.

## Ce qui est en place

Quatre colonnes nullables sur `catalogue_product` (migrations `0016_catalogue_curation.sql` et
`0017_catalogue_rank_seed.sql`) :

| Colonne | Rôle | `NULL` signifie |
|---|---|---|
| `famille_slug` | famille imposée par l'admin | le classifieur par mots-clés décide |
| `sous_categorie_slug` | sous-catégorie imposée par l'admin | le classifieur par mots-clés décide |
| `sort_order` | position manuelle dans la sous-catégorie | produit non rangé, tri alphabétique |
| `catalogue_rank` | position dans la liste plate « Tous les produits » | produit non mis en avant, tri alphabétique |

La nullabilité est structurante : les ~160 produits existants et les nouveautés synchronisées depuis Swiver
continuent de se placer seuls. La curation reste partielle par construction — on range les vingt produits qui
comptent et on laisse la traîne tranquille.

## Résolution

`resolvePlacement()` ([`src/data/familles.ts`](../../../src/data/familles.ts)) : l'override gagne,
`classifyFamille` / `classifySousCategorie` restent le repli. Une sous-catégorie qui n'appartient pas à la
famille résolue est ignorée plutôt que suivie — la famille peut changer après coup, et un slug orphelin
créerait une page inaccessible.

Le tri est `sort_order NULLS LAST, nom affiché` ([`src/features/catalogue/placement.ts`](../../../src/features/catalogue/placement.ts)),
appliqué en TypeScript sur les lignes déjà mises en cache (`getCachedCatalogueRows`). Un seul comparateur
pour le site public et pour l'admin, sur le nom affiché (`display_name || name`) : renommer un produit
déplace désormais aussi sa position dans la liste, ce qui n'était pas le cas quand le SQL triait sur `name`.

Les compteurs des cartes famille et sous-catégorie, les pages de browse, la recherche famille et les produits
« à découvrir aussi » de la fiche produit passent tous par la même résolution : une carte n'annonce jamais un
nombre que sa page ne liste pas.

## Pourquoi deux axes d'ordre

`sort_order` est un rang **dans une sous-catégorie** : ses valeurs se répètent d'une sous-catégorie à
l'autre, donc elles ne peuvent pas ordonner « Tous les produits », qui est une liste plate de tout le
catalogue. Partager la même colonne entre les deux couplerait deux surfaces sans rapport : réordonner
« Nettoyage des sols » remonterait silencieusement ces produits en tête de la liste globale — exactement
l'objection faite à la réutilisation de `featured` pour le rangement.

`catalogue_rank` est donc l'axe global, et il ne concerne que la **tête** de la liste : les produits mis en
avant d'abord, dans l'ordre choisi, tout le reste par ordre alphabétique derrière. Un produit synchronisé
depuis Swiver arrive donc au milieu de l'alphabet, pas à la fin d'une liste figée.

Le classement best-sellers (nombre de commandes distinctes) qui vivait en dur dans
`src/data/catalogue-pin-order.ts` a été repris par la migration `0017` : le même entier alimente les deux
colonnes, ce qui place les 15 best-sellers en tête de « Tous les produits » dans l'ordre exact, et en tête de
leur propre sous-catégorie avec leur ordre relatif conservé. Le module en dur est supprimé.

## Surfaces admin

- **`/admin/produits/[id]`** — deux sélecteurs « Famille » et « Sous-catégorie », chacun avec une option
  « Automatique » qui affiche ce que le classifieur choisirait.
- **`/admin/produits/rangement`** — écran d'ordonnancement, une sous-catégorie à la fois. Les lignes se
  glissent (HTML5 `draggable` natif, aucune dépendance ajoutée) et se déplacent aussi aux flèches
  haut/bas, qui restent le chemin accessible au clavier et sur tactile. Le même écran ordonne la tête de
  « Tous les produits » (première entrée du sélecteur de famille) ; l'étoile de chaque ligne ajoute ou
  retire un produit de cette mise en avant.

## Mutations

Tout passe par une server action validée par Zod, `assertRole(...)` et une ligne `audit_log` :

| Action | Rôles | Ligne d'audit |
|---|---|---|
| `setProductPlacementAction` | `owner`/`admin` si la famille change, sinon + `operator` | `catalogue_product.placement_changed`, `diff = { from, to }` |
| `reorderSousCategorieAction` | `owner`/`admin`/`operator` | `catalogue_product.reordered`, `entity_id = null`, `diff = { before, after }` |
| `reorderCatalogueRankAction` | `owner`/`admin`/`operator` | `catalogue_product.rank_reordered`, `entity_id = null`, `diff = { before, after }` |
| `setCataloguePinAction` | `owner`/`admin`/`operator` | `catalogue_product.pinned` / `.unpinned` |

Deux garde-fous côté serveur : changer de famille efface une sous-catégorie devenue incohérente (cascade) et
remet `sort_order` à `NULL` (la position appartenait à la sous-catégorie d'origine, qui est réindexée de
façon dense dans la foulée) ; un réordonnancement n'est accepté que si la liste soumise est une permutation
exacte de la sous-catégorie, jamais une liste partielle.

La synchronisation Swiver (`syncSwiverCatalogue`) n'écrit qu'une liste explicite de champs de base : la
curation survit aux re-syncs, comme les champs CMS.

## Ce que la phase 1 ne fait pas

- Un produit a exactement une place. Le multi-placement est la phase 2 (`catalogue_placement`), à ouvrir
  quand un produit réel devra vivre dans deux sous-catégories.
- Créer une sous-catégorie reste un déploiement : la liste vit dans `familles.ts` et ses libellés dans
  `src/messages/{fr,en}/familles.json`. C'est la phase 3 (taxonomie en base).
- L'ordre des cartes de sous-catégories reste `displayOrder` en code.

Contexte complet et options écartées : document de décision « Curation des sous-catégories du catalogue
public », hors dépôt.
