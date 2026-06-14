# Images des familles de produits

Ce sont les **packshots détourés (PNG transparent)** affichés sur les tuiles
familles de l'accueil (champ `packshot` dans `src/data/familles.ts`). Pour
mettre à jour, remplace simplement le fichier en **gardant le même nom** —
aucun changement de code n'est nécessaire :

| Fichier | Famille | Photo détourée de… | État |
|---|---|---|---|
| `produits-nettoyage.png` | Produits de nettoyage | un bidon/flacon Prodet (ex. SIRAFAN) | ✅ transparent |
| `materiel-hygiene.png` | Matériel d'hygiène | seau + set de nettoyage | ✅ transparent |
| `papier-epi.png` | Papier & EPI jetables | bobines de papier essuyage | ✅ transparent |
| `parfums-ambiance.png` | Parfums d'ambiance | un diffuseur / désodorisant | ✅ transparent |
| `collecte-dechets.png` | Collecte des déchets | une poubelle à pédale | ⛔ **manquant** — le logo s'affiche en attendant |

Pour la famille **Collecte des déchets**, dépose un PNG transparent nommé
`collecte-dechets.png` ici, puis remplace `packshot: ''` par
`packshot: FAM_PACK('collecte-dechets.png')` dans `src/data/familles.ts`.

Format conseillé : carré (≈ 800×800), **fond transparent (PNG)**, produit centré.
