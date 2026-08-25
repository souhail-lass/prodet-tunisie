# Fiches techniques produits

Documents source (Word) fournis par Prodet, et leur correspondance avec les
lignes du catalogue.

`source/` contient les fichiers Word d'origine (archive, non publiés).
`pdf/` contient les fiches **régénérées en PDF**, qui sont celles servies aux
clients : uploadées dans Supabase Storage (bucket public `product-assets`,
chemin `products/{productId}/sheet-{timestamp}.pdf`) et référencées dans
`catalogue_product.technical_sheet_url`.

### Pourquoi régénérer plutôt que convertir

Les 16 documents Word avaient chacun une mise en page différente (tableaux de
mise en forme imbriqués, sauts de page en dur, pieds de page intégrés). Passés
dans un convertisseur, les tableaux physico-chimiques s'aplatissaient en listes
verticales et les pieds de page se dupliquaient.

Le contenu a donc été transcrit dans `scripts/fiches-content.mjs` puis remis en
page par un gabarit unique : les 16 fiches sont désormais identiques, avec
en-tête Prodet, tableaux corrects et pied de page société. Les PDF ont une
couche texte (recherchable et copiable, ce ne sont pas des images).

Aucune valeur n'a été inventée : tout provient du document source correspondant.

Régénérer après modification de `fiches-content.mjs` : voir le gabarit dans ce
même dossier (`scripts/`), puis réuploader.

## Contenu importé

Pour chaque produit ci-dessous, quatre champs CMS ont été remplis à partir de la
fiche : `tagline`, `description`, `dosage`, `how_to_use`, plus `specs`
(propriétés physico-chimiques) et `technical_sheet_url`.

Ce sont des champs **override** : ils survivent à une resynchronisation Swiver.

| Fiche source | Produits du catalogue | Réf. |
|---|---|---|
| `ALCOGEL.docx` | ALCOGEL ANTISEPTIQUE 500ML / BIDON 5KG | P-00463, P-00118 |
| `ALCOHAND.docx` | ALCOHAND DESINFECTANT SANS RINÇAGE BID 05L | P-00408 |
| `DEOFRESH OFF.doc` | DEOFRESH 750ML / FLOWER ROSE / JASMIN / LAVANDE | P-00090, P-00027, P-00049, P-00054 |
| `fiche techn profon.docx` | PROFON DECAPANT FORT BID 05KG / 20KG | P-00132, P-00336 |
| `fiche techn prostar.docx` | PROSTAR ANTI CALCAIRE BID 05KG | P-00154 |
| `JAVEL PRODET.doc` | JAVEL PRODET BID 20KG / 5KG | P-00002, P-00013 |
| `manocid off.doc` | MANOCID SAVON BACTERICIDE BID 5KG | P-00033 |
| `molkabin off.doc` | MOLKABIN BRILLANT INOX PULV 500ML | P-00187 |
| `PILAX OFF.doc` | PILAX DETARTRANT WC 750ML | P-00145 |
| `PROFOUR.docx` | PROFOUR DEGRAISSANT FLACON 750ML / FOUR 5KG | P-00067, P-00014 |
| `progerme off.doc` | PROGERME BLANC 05KG / 20KG, PROGERME VERT 05KG | P-00022, P-00005, P-00023 |
| `PROLAC OFF.doc` | PROLAC DETARTRANT INOX BID 06KG / 20KG | P-00176, P-00334 |
| `SANIHAND OFF.doc` | SANIHAND FLACON 500ML, SAVON LIQUIDE 05KG / 20KG | P-00089, P-00029, P-00004 |
| `SIRAFAN DESINFECTANT.doc` | SIRAFAN DESINFECTANT SANS RINÇAGE BID 05KG | P-00062 |
| `solitaire vaisselle OFF.doc` | SOLITAIRE VAISSELLE (20KG LAVAGE, BID 20KG, CITRON 5L, NEUTRE 05KG, POMME 05L) | P-00122, P-00003, P-00001, P-00153, P-00360 |
| `VIT NET OFF.doc` | VIT NET DEBOUCHEUR SEAU 5KG | P-00093 |

**16 fiches → 32 lignes catalogue.** Une même fiche couvre plusieurs
conditionnements du même produit.

## Noms corrigés

Corrigés en `display_name` (doubles espaces, unités normalisées vers la
convention majoritaire du catalogue `BID 05KG` / `500ML`, sans espace) :

| Avant | Après |
|---|---|
| `ALCOHAND DESINFECTANT SANS RINSAGE BI 05 L` | `ALCOHAND DESINFECTANT SANS RINÇAGE BID 05L` |
| `PROLAC DETARTRANT INOX BID 20` | `PROLAC DETARTRANT INOX BID 20KG` |
| `SOLITAIRE VAISSELLE NEUTRE BID 05 KG` | `SOLITAIRE VAISSELLE NEUTRE BID 05KG` |
| `SOLITAIRE VAISSELLE CITRON␣␣5L` | `SOLITAIRE VAISSELLE CITRON 5L` |
| `SOLITAIRE VAISSELLE POMME␣␣05 L` | `SOLITAIRE VAISSELLE POMME 05L` |
| `PROGERME BLANC BID 05 KG` | `PROGERME BLANC BID 05KG` |
| `PROGERME VERT BID 05 KG` | `PROGERME VERT BID 05KG` |
| `PROSTAR ANTI CALCAIRE BID 05 KG` | `PROSTAR ANTI CALCAIRE BID 05KG` |
| `DEOFRESH FLOWER ROSE BID 05 KG` | `DEOFRESH FLOWER ROSE BID 05KG` |
| `MOLKABIN BRILLANT INOX PULV 500 ML` | `MOLKABIN BRILLANT INOX PULV 500ML` |

**Volontairement non modifié :**

- **Les accents.** 157 des 160 produits visibles sont en majuscules non
  accentuées (`DETARTRANT`, `DEGRAISSANT`…). Accentuer uniquement ces 16-là
  casserait la cohérence du catalogue. À traiter globalement, ou pas du tout.
- `SOLITAIRE VAISSELLE 20KG LAVAGE` — ordre des mots inhabituel, mais c'est
  peut-être une variante distincte de `SOLITAIRE VAISSELLE BID 20KG`.
  À confirmer avec Prodet.
- `ALCOGEL ANTISEPTIQUE BIDON 5KG` — garde `BIDON` (et non `BID`) pour rester
  aligné sur `PROLAX 500 BIDON 5KG` / `PROLAX 200 BIDON 5KG`.

## Contenu rédigé pour le reste du catalogue

Les 128 autres produits visibles n'avaient aucune description. Ils ont été
enrichis à partir de leur nom et de leur conditionnement, regroupés par famille
d'usage : `scripts/catalogue-content.mjs` conserve le texte source et la
correspondance SKU → famille.

Chaque produit a désormais `tagline`, `description`, `how_to_use` et `specs`.
**Le `dosage` n'est renseigné que sur les 24 produits réellement dilués**
(lessives, dégraissants, grésil, rinçage machine…). Un sac poubelle, un gant ou
un manche de balai n'en a pas — et la page produit n'affiche plus le panneau
« Taux de dilution » quand le champ est vide.

Total : **160 / 160 produits visibles** ont description + tagline + mode
d'emploi + spécifications. 56 ont un dosage, 32 une fiche technique.

### Ce qui n'a PAS été inventé

Aucune valeur de laboratoire (pH, densité, biodégradabilité) n'a été générée à
partir d'un nom de produit : ce sont des valeurs mesurées, et les afficher sans
source serait de la donnée fabriquée sur un site public. Les `specs` générées se
limitent au factuel lisible sur le produit : conditionnement, format, matière,
couleur. Les valeurs physico-chimiques n'existent que sur les 16 produits ayant
une vraie fiche technique.

### À confirmer avec Prodet

- `CHOC COMBAT` (P-00084) — ni format, ni image, nom non explicite. Description
  volontairement neutre, sans dosage, en attendant de savoir ce que c'est.

## À faire

- Relire les textes générés : ils sont plausibles et cohérents par famille, mais
  ils décrivent un usage type, pas la formulation réelle de chaque référence.
