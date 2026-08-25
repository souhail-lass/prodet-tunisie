/**
 * Editorial content for the 128 visible catalogue products that had no
 * description. Grouped by family: everything in a family shares the same
 * tagline/description/howToUse, and `dosage` is set ONLY where the product is
 * genuinely diluted — a bin bag or a glove must never show a dilution rate.
 *
 * Deliberately absent: pH, density, biodegradability. Those are measured lab
 * values; inventing them from a product name would put fabricated data on a
 * public B2B site. They stay empty until a real fiche technique supplies them.
 */

export const FAMILIES = {
  // ---------- Désodorisants ----------
  airfresh: {
    tagline: "Désodorisant d'ambiance en spray",
    description:
      "Désodorisant d'ambiance qui neutralise les odeurs et laisse un parfum frais dans les locaux traités. Adapté aux bureaux, sanitaires, chambres, réceptions et locaux communs.",
    howToUse:
      "Agiter avant emploi et vaporiser quelques secondes en direction du plafond, au centre de la pièce. Ne pas vaporiser directement sur les personnes, les aliments ou les surfaces alimentaires.",
  },
  deofreshLinge: {
    tagline: 'Parfum textile pour la finition du linge',
    description:
      "Parfum d'ambiance textile utilisé en finition de lavage pour laisser une odeur fraîche et durable sur le linge. S'utilise en blanchisserie professionnelle et en housekeeping.",
    howToUse:
      "Ajouter au dernier rinçage ou vaporiser sur le linge sec avant pliage, à distance d'environ 30 cm.",
    dosage: "Environ 20 à 30 ml par cycle de lavage, à ajuster selon la charge et l'intensité souhaitée.",
  },
  insecticide: {
    tagline: 'Insecticide en aérosol pour insectes volants et rampants',
    description:
      "Aérosol insecticide à effet immédiat sur les insectes volants et rampants. Destiné au traitement ponctuel des locaux professionnels, réserves et zones techniques.",
    howToUse:
      "Fermer portes et fenêtres, vaporiser 5 à 10 secondes au centre de la pièce puis quitter le local. Aérer avant de réoccuper. Ne pas utiliser en présence de denrées alimentaires découvertes.",
  },

  // ---------- Buanderie ----------
  lessivePoudre: {
    tagline: 'Lessive en poudre pour blanchisserie professionnelle',
    description:
      "Lessive en poudre à usage professionnel pour le lavage du linge en machine. Formulée pour un bon détachage et un rinçage facile, elle convient aux blanchisseries d'hôtels, restaurants et collectivités.",
    howToUse:
      "Introduire la poudre dans le bac à lessive de la machine en début de cycle. Adapter la dose à la dureté de l'eau et au degré de salissure du linge.",
    dosage: "Environ 8 à 15 g par kg de linge sec, à ajuster selon la salissure et la dureté de l'eau.",
  },
  lessiveLiquide: {
    tagline: 'Lessive liquide pour blanchisserie professionnelle',
    description:
      "Lessive liquide à usage professionnel, entièrement soluble, pour le lavage du linge en machine. Le format liquide facilite le dosage automatique et évite les dépôts sur les textiles.",
    howToUse:
      "Verser dans le bac à lessive ou raccorder à la pompe doseuse de la machine. Adapter la dose à la dureté de l'eau et au degré de salissure.",
    dosage: "Environ 10 à 20 ml par kg de linge sec, à ajuster selon la salissure et la dureté de l'eau.",
  },
  lessiveDelicat: {
    tagline: 'Lessive pour linge délicat et textiles fragiles',
    description:
      "Lessive formulée pour le linge délicat et les textiles fragiles : couleurs, fibres synthétiques et pièces nécessitant un lavage doux. Préserve la tenue des couleurs et la souplesse des fibres.",
    howToUse:
      "Utiliser sur programme délicat, à basse température. Introduire dans le bac à lessive en début de cycle.",
    dosage: "Environ 10 à 15 ml par kg de linge sec, à réduire pour les pièces très délicates.",
  },
  degraissantLinge: {
    tagline: 'Poudre de dégraissage pour linge gras et taché',
    description:
      "Additif de lavage en poudre destiné au linge fortement gras : tenues de cuisine, tabliers, torchons et linge de restauration. S'utilise en complément de la lessive principale.",
    howToUse:
      "Ajouter à la lessive principale en début de cycle, sur un programme à température élevée pour un dégraissage optimal.",
    dosage: "Environ 5 à 10 g par kg de linge sec, en complément de la lessive habituelle.",
  },
  adoucissant: {
    tagline: 'Adoucissant assouplissant pour linge professionnel',
    description:
      "Adoucissant qui assouplit le linge, facilite le repassage et réduit l'électricité statique. Laisse une odeur fraîche sur le linge de maison et les tenues professionnelles.",
    howToUse: "Introduire dans le bac prévu pour l'adoucissant, utilisé au dernier rinçage.",
    dosage: "Environ 5 à 10 ml par kg de linge sec.",
  },
  javelLiquide: {
    tagline: 'Eau de javel pour blanchiment et désinfection',
    description:
      "Solution chlorée pour le blanchiment du linge blanc et la désinfection des surfaces et sanitaires. Usage professionnel en collectivités, cuisines et sanitaires.",
    howToUse:
      "Diluer dans l'eau froide avant emploi. Ne jamais mélanger avec un détartrant, un produit acide ou un ammoniaqué. Rincer les surfaces en contact alimentaire à l'eau potable.",
    dosage: "Surfaces : environ 250 ml pour 10 L d'eau. Linge blanc : suivre les préconisations de la machine.",
  },
  detacheur: {
    tagline: 'Détachant pour taches tenaces sur textiles',
    description:
      "Détachant à action ciblée sur les taches difficiles (encre, gras, boisson, maquillage). S'utilise en prétraitement avant le passage en machine.",
    howToUse:
      "Appliquer directement sur la tache, laisser agir quelques minutes sans laisser sécher, tamponner puis laver normalement. Tester au préalable sur une zone peu visible.",
  },

  // ---------- Vaisselle machine ----------
  lavageMachine: {
    tagline: 'Détergent liquide pour lave-vaisselle professionnel',
    description:
      "Détergent liquide concentré pour le lavage automatique de la vaisselle en machine professionnelle. Dissout les salissures organiques et limite les dépôts calcaires sur la verrerie.",
    howToUse:
      "Raccorder le bidon à la pompe doseuse du lave-vaisselle. Ne pas utiliser pour le lavage manuel. Rincer la vaisselle en cas de contact prolongé.",
    dosage: "Réglage de la pompe doseuse selon la dureté de l'eau, généralement 1 à 3 ml par litre d'eau de lavage.",
  },
  rincage: {
    tagline: 'Liquide de rinçage pour lave-vaisselle professionnel',
    description:
      "Additif de rinçage qui accélère l'égouttage et le séchage de la vaisselle, évitant les traces et les auréoles sur les verres et couverts.",
    howToUse:
      "Raccorder à la pompe de rinçage du lave-vaisselle. Ajuster le débit jusqu'à obtenir un séchage sans traces.",
    dosage: "Environ 0,2 à 0,5 ml par litre d'eau de rinçage, à ajuster selon la dureté de l'eau.",
  },

  // ---------- Sols et surfaces ----------
  degraissantSols: {
    tagline: 'Dégraissant pour sols et surfaces de cuisine',
    description:
      "Dégraissant alcalin pour les sols et surfaces fortement encrassés des cuisines professionnelles, ateliers et zones de production. Décolle les graisses cuites et les dépôts tenaces.",
    howToUse:
      "Diluer dans l'eau chaude, appliquer à la serpillière ou en autolaveuse, laisser agir quelques minutes puis rincer. Porter des gants.",
    dosage: "Environ 200 à 500 ml pour 10 L d'eau selon le degré d'encrassement.",
  },
  vitres: {
    tagline: 'Nettoyant pour vitres et surfaces vitrées',
    description:
      "Nettoyant pour vitres, miroirs et surfaces vitrées. Élimine les traces de doigts et le film gras sans laisser d'auréoles, pour un séchage rapide et brillant.",
    howToUse:
      "Vaporiser sur la surface ou sur un chiffon microfibre, essuyer puis lustrer avec un chiffon sec ou une raclette. Éviter le plein soleil.",
  },
  gresil: {
    tagline: 'Nettoyant désinfectant parfumé pour sols',
    description:
      "Nettoyant désinfectant parfumé pour le lavage des sols et des surfaces lavables. Laisse une odeur persistante et convient aux sanitaires, couloirs et locaux communs.",
    howToUse:
      "Diluer dans l'eau, laver à la serpillière ou au balai microfibre. Rincer les surfaces en contact alimentaire à l'eau potable.",
    dosage: "Environ 100 à 200 ml pour 10 L d'eau.",
  },
  desinfectantSurfaces: {
    tagline: 'Nettoyant désinfectant toutes surfaces',
    description:
      "Nettoyant désinfectant pour l'entretien courant des sols, murs et surfaces lavables. Nettoie et désinfecte en une seule opération dans les locaux professionnels.",
    howToUse:
      "Diluer dans l'eau et appliquer à la serpillière, à l'éponge ou par pulvérisation. Laisser agir puis rincer les surfaces en contact alimentaire.",
    dosage: "Environ 200 ml pour 10 L d'eau, à renforcer selon le degré d'encrassement.",
  },
  cireBois: {
    tagline: 'Entretien et brillance pour meubles en bois',
    description:
      "Produit d'entretien pour les meubles et surfaces en bois. Nettoie, nourrit et fait briller en protégeant le support de la poussière.",
    howToUse:
      "Agiter, vaporiser à distance sur la surface ou sur un chiffon doux, puis lustrer. Ne pas utiliser sur les sols, risque de glissance.",
  },

  // ---------- Sanitaires ----------
  wcGel: {
    tagline: 'Gel nettoyant détartrant pour cuvettes WC',
    description:
      "Gel nettoyant détartrant pour cuvettes de WC. Sa texture épaisse adhère aux parois pour agir sur le calcaire et les salissures incrustées tout en désodorisant.",
    howToUse:
      "Appliquer sous le rebord de la cuvette, laisser agir puis brosser et tirer la chasse d'eau. Ne pas mélanger avec de l'eau de javel.",
  },
  detartrantSanitaire: {
    tagline: 'Détartrant pour sanitaires et robinetterie',
    description:
      "Détartrant acide pour éliminer le calcaire et les dépôts minéraux sur les sanitaires, robinetteries et surfaces carrelées. Redonne brillance et propreté.",
    howToUse:
      "Appliquer sur la surface, laisser agir quelques minutes, brosser puis rincer abondamment. Ne pas utiliser sur le marbre, l'émail fragile ou l'aluminium.",
  },
  deboucheur: {
    tagline: 'Déboucheur pour canalisations et siphons',
    description:
      "Déboucheur destiné aux canalisations obstruées par les graisses, cheveux et matières organiques. Agit sans démontage des installations.",
    howToUse:
      "Verser la dose dans le siphon, laisser agir plusieurs heures puis rincer abondamment à l'eau. Porter des gants et des lunettes de protection.",
  },
  chloreP: {
    tagline: 'Chlore en pastilles pour désinfection et blanchiment',
    description:
      "Pastilles de chlore à dissolution rapide pour la désinfection des surfaces et le traitement de l'eau. Dosage simple et stockage compact par rapport au chlore liquide.",
    howToUse:
      "Dissoudre le nombre de pastilles requis dans l'eau froide avant emploi. Ne jamais mélanger avec un produit acide ou détartrant.",
    dosage: "Nombre de pastilles selon le volume d'eau et la concentration recherchée, se référer à l'étiquette.",
  },
  poudreRecurer: {
    tagline: 'Poudre à récurer pour surfaces résistantes',
    description:
      "Poudre à récurer pour les surfaces résistantes fortement encrassées : éviers, plans de travail inox, casseroles et sanitaires. Action mécanique sur les dépôts incrustés.",
    howToUse:
      "Saupoudrer sur la surface humide, frotter à l'éponge puis rincer. Ne pas utiliser sur les surfaces fragiles ou brillantes.",
  },
  desinfectantMulti: {
    tagline: 'Désinfectant multi-usage pour surfaces',
    description:
      "Désinfectant multi-usage pour l'assainissement des surfaces dans les locaux professionnels, sanitaires et zones de passage.",
    howToUse:
      "Diluer selon l'usage ou utiliser pur en pulvérisation, laisser agir le temps de contact indiqué puis rincer les surfaces alimentaires.",
    dosage: "Se référer aux préconisations de l'étiquette selon le niveau de désinfection recherché.",
  },

  // ---------- Hygiène des mains ----------
  poudreMain: {
    tagline: 'Poudre lavante pour mains très sales',
    description:
      "Poudre lavante à action abrasive douce pour les mains fortement souillées : ateliers, garages, cuisines et zones techniques. Élimine graisses et salissures incrustées.",
    howToUse:
      "Prendre une dose dans le creux de la main humide, frotter pour décoller les salissures puis rincer abondamment à l'eau claire.",
  },
  savonVert: {
    tagline: 'Savon vert traditionnel pour le lavage des mains',
    description:
      "Savon vert traditionnel en bloc pour le lavage des mains et l'entretien courant. Économique et polyvalent, il convient aux cuisines et locaux communs.",
    howToUse: "Humidifier, frotter pour faire mousser puis rincer à l'eau claire.",
  },

  // ---------- Sacs ----------
  sacPoubelle: {
    tagline: 'Sacs poubelle pour collecte des déchets',
    description:
      "Sacs poubelle en polyéthylène pour la collecte des déchets courants en milieu professionnel. Résistants à la déchirure et adaptés aux corbeilles et conteneurs.",
    howToUse:
      "Placer le sac dans la corbeille ou le conteneur en rabattant les bords. Ne pas dépasser la charge que le sac peut supporter.",
  },
  sacBretelle: {
    tagline: 'Sacs bretelle pour le transport de marchandises',
    description:
      "Sacs plastique à poignées bretelle pour l'emballage et le transport de marchandises en commerce et restauration à emporter.",
    howToUse: "Charger sans dépasser la contenance prévue pour préserver la résistance des poignées.",
  },
  sacCongelation: {
    tagline: 'Sachets de congélation pour denrées alimentaires',
    description:
      "Sachets destinés à la congélation et au stockage des denrées alimentaires. Conformes au contact alimentaire, ils protègent les produits du dessèchement au froid.",
    howToUse:
      "Remplir sans excès, chasser l'air puis fermer hermétiquement. Étiqueter avec la date de congélation pour assurer la traçabilité.",
  },

  // ---------- Papier ----------
  papierHygienique: {
    tagline: 'Papier hygiénique pour sanitaires professionnels',
    description:
      "Papier hygiénique destiné aux sanitaires collectifs et professionnels. Bon compromis entre douceur, résistance et rendement pour les lieux à forte fréquentation.",
    howToUse: "Installer dans le distributeur adapté au format du rouleau.",
  },
  essuieTout: {
    tagline: 'Bobine d’essuyage pour usage professionnel',
    description:
      "Bobine d'essuyage absorbante pour le séchage des mains, l'essuyage des surfaces et les opérations de nettoyage en cuisine, atelier et zones de production.",
    howToUse:
      "Installer sur le support ou le distributeur adapté. Prélever la longueur nécessaire pour limiter la consommation.",
  },
  serviettesTable: {
    tagline: 'Serviettes en papier pour la table',
    description:
      "Serviettes en papier à usage unique pour la restauration et les collectivités. Format compact adapté au service en salle et à emporter.",
    howToUse: "Présenter en distributeur, en corbeille ou disposer directement sur la table.",
  },
  bavette: {
    tagline: 'Bavettes jetables à usage unique',
    description:
      "Bavettes jetables à plusieurs plis pour la protection des vêtements en restauration, en institut ou en milieu de soins.",
    howToUse: "Usage unique. Éliminer après emploi dans la filière de déchets appropriée.",
  },
  distributeurPapier: {
    tagline: 'Distributeur mural pour papier',
    description:
      "Distributeur mural pour papier hygiénique ou essuie-mains. Limite le gaspillage et protège la réserve de papier des salissures.",
    howToUse:
      "Fixer au mur à hauteur accessible. Recharger en respectant le format de rouleau ou de paquet prévu.",
  },
  distributeurSavon: {
    tagline: 'Distributeur mural pour savon liquide',
    description:
      "Distributeur mural pour savon liquide ou gel hydroalcoolique. Assure un dosage régulier et une hygiène maîtrisée aux points de lavage.",
    howToUse:
      "Fixer au mur près du point d'eau. Nettoyer complètement le réservoir et la pompe à chaque remplissage pour éviter toute contamination.",
  },
  corbeille: {
    tagline: 'Corbeille à papier pour bureaux et locaux',
    description:
      "Corbeille destinée à la collecte des papiers et petits déchets dans les bureaux, salles de réunion et locaux communs.",
    howToUse: "Utiliser avec un sac adapté au volume pour faciliter la vidange.",
  },

  // ---------- Gants ----------
  gantMenage: {
    tagline: 'Gants de ménage réutilisables',
    description:
      "Gants de ménage réutilisables protégeant les mains lors des opérations de nettoyage et du contact avec les produits d'entretien.",
    howToUse:
      "Enfiler sur des mains sèches. Rincer et sécher après usage. Remplacer dès l'apparition d'une perforation ou d'une usure.",
  },
  gantJetable: {
    tagline: 'Gants jetables à usage unique',
    description:
      "Gants jetables à usage unique pour la manipulation des denrées alimentaires, les soins et les opérations de nettoyage. Assurent une barrière hygiénique entre la main et le produit manipulé.",
    howToUse:
      "Enfiler sur des mains propres et sèches. Changer de paire entre deux tâches différentes et après tout contact contaminant. Ne pas réutiliser.",
  },

  // ---------- Éponges et abrasifs ----------
  eponge: {
    tagline: 'Éponge de nettoyage polyvalente',
    description:
      "Éponge pour le nettoyage courant des surfaces, de la vaisselle et des équipements. Absorbe et retient l'eau pour un lavage efficace.",
    howToUse:
      "Humidifier avant emploi. Rincer après chaque utilisation et laisser sécher. Réserver une éponge par zone pour éviter les contaminations croisées.",
  },
  tamponAbrasif: {
    tagline: 'Tampon abrasif pour surfaces résistantes',
    description:
      "Tampon abrasif pour décoller les salissures incrustées et les résidus cuits sur les surfaces résistantes : casseroles, plaques, grilles et inox.",
    howToUse:
      "Utiliser humide avec un détergent. Ne pas employer sur les surfaces fragiles, antiadhésives ou brillantes.",
  },

  // ---------- Textiles de nettoyage ----------
  lavette: {
    tagline: 'Lavette microfibre pour le nettoyage des surfaces',
    description:
      "Lavette en microfibre pour le nettoyage et le dépoussiérage des surfaces. Capte la poussière et les salissures sans peluches, avec ou sans détergent.",
    howToUse:
      "Utiliser humide ou sèche selon la surface. Laver en machine sans adoucissant pour préserver le pouvoir captant de la microfibre.",
  },
  serpilliere: {
    tagline: 'Serpillière pour le lavage des sols',
    description:
      "Serpillière absorbante pour le lavage et le séchage des sols dans les locaux professionnels et les zones de passage.",
    howToUse:
      "Utiliser avec un balai à frange ou à la main, avec la solution de nettoyage diluée. Rincer et laisser sécher après usage.",
  },
  chiffon: {
    tagline: 'Chiffon d’essuyage pour surfaces et vitres',
    description:
      "Chiffon d'essuyage pour le lustrage des surfaces, vitres et inox. Ne laisse ni traces ni peluches sur les supports brillants.",
    howToUse: "Utiliser sec pour lustrer ou légèrement humide pour nettoyer. Laver après usage.",
  },
  frange: {
    tagline: 'Frange de rechange pour balai à franges',
    description:
      "Frange de rechange en coton pour balai à franges, destinée au lavage des sols de grandes surfaces.",
    howToUse:
      "Monter sur le support adapté. Rincer après usage et laisser sécher. Remplacer lorsque les mèches sont usées.",
  },

  // ---------- Matériel ----------
  balai: {
    tagline: 'Balai pour le balayage des sols',
    description:
      "Balai destiné au balayage des sols intérieurs et extérieurs. Fibres adaptées à la collecte des poussières et des déchets courants.",
    howToUse: "Monter sur un manche adapté. Rincer et laisser sécher après usage.",
  },
  brosse: {
    tagline: 'Brosse de nettoyage pour surfaces et recoins',
    description:
      "Brosse de nettoyage destinée au récurage des surfaces, des recoins et des équipements difficiles d'accès.",
    howToUse: "Utiliser avec la solution de nettoyage adaptée. Rincer et laisser sécher après usage.",
  },
  brosseWc: {
    tagline: 'Brosse WC avec socle',
    description:
      "Brosse pour l'entretien des cuvettes de WC, livrée avec son socle de rangement qui contient l'égouttage.",
    howToUse:
      "Brosser la cuvette avec le produit d'entretien, rincer la brosse à la chasse d'eau puis replacer sur son socle.",
  },
  raclette: {
    tagline: 'Raclette pour l’évacuation de l’eau',
    description:
      "Raclette destinée à pousser et évacuer l'eau sur les sols après lavage, ou à sécher les surfaces vitrées selon le modèle.",
    howToUse:
      "Monter sur un manche adapté. Travailler par passes régulières en se dirigeant vers l'évacuation. Vérifier l'état de la lame en caoutchouc.",
  },
  manche: {
    tagline: 'Manche pour balai et accessoires de nettoyage',
    description:
      "Manche destiné à recevoir les balais, raclettes et accessoires de nettoyage compatibles.",
    howToUse: "Visser ou emboîter l'accessoire sur le manche jusqu'au blocage avant utilisation.",
  },
  pelle: {
    tagline: 'Pelle à poussière pour la collecte des déchets',
    description:
      "Pelle à poussière pour la collecte des déchets balayés dans les locaux professionnels et les zones de passage.",
    howToUse: "Utiliser avec une balayette ou un balai. Rincer après usage si nécessaire.",
  },
  teteDeLoup: {
    tagline: 'Tête de loup pour le dépoussiérage en hauteur',
    description:
      "Brosse tête de loup pour le dépoussiérage des plafonds, angles, luminaires et surfaces en hauteur difficiles d'accès.",
    howToUse:
      "Monter sur un manche, si possible télescopique. Dépoussiérer du haut vers le bas. Secouer ou laver après usage.",
  },

  // ---------- Emballage alimentaire ----------
  filmAlimentaire: {
    tagline: 'Film étirable pour la protection des aliments',
    description:
      "Film étirable pour la protection et la conservation des denrées alimentaires. Adhère aux contenants et limite le dessèchement des produits au froid.",
    howToUse:
      "Dérouler la longueur nécessaire et couper sur la lame du distributeur. Ne pas utiliser au four ni au contact direct d'une source de chaleur.",
  },
  aluminium: {
    tagline: 'Rouleau d’aluminium pour cuisine professionnelle',
    description:
      "Rouleau d'aluminium alimentaire pour la cuisson, la protection et la conservation des préparations en cuisine professionnelle.",
    howToUse:
      "Dérouler et couper la longueur nécessaire. Convient au four et au froid. Éviter le contact prolongé avec les aliments très acides ou salés.",
  },
  cureDent: {
    tagline: 'Cure-dents pour la restauration',
    description: "Cure-dents en bois à usage unique pour la restauration et le service en salle.",
    howToUse: 'Usage unique. Présenter en distributeur ou en sachet individuel.',
  },

  // Produit dont le nom seul ne permet pas de trancher l'usage : description
  // volontairement neutre, sans dosage, en attendant confirmation de Prodet.
  entretienGenerique: {
    tagline: "Produit d'entretien professionnel",
    description:
      "Produit d'entretien de la gamme commercialisée par Prodet, destiné au nettoyage en milieu professionnel. Contactez notre équipe pour le détail des usages et des surfaces compatibles.",
    howToUse:
      "Se référer aux indications portées sur l'emballage. En cas de doute sur l'usage ou la compatibilité d'une surface, contactez Prodet avant application.",
  },

  // ---------- Divers ----------
  alcoolBruler: {
    tagline: 'Alcool à brûler pour nettoyage et allumage',
    description:
      "Alcool à brûler à usage technique : nettoyage des surfaces, dégraissage léger et allumage. Produit inflammable réservé à un usage professionnel encadré.",
    howToUse:
      "Utiliser dans un local aéré, à l'écart de toute flamme et source de chaleur. Refermer soigneusement le bidon après emploi.",
  },
  eauDistillee: {
    tagline: 'Eau distillée pour équipements et fers à repasser',
    description:
      "Eau distillée déminéralisée destinée aux fers à repasser, centrales vapeur, batteries et équipements sensibles au calcaire.",
    howToUse:
      "Remplir directement le réservoir de l'appareil. Ne pas mélanger avec de l'eau du robinet pour préserver l'absence de calcaire.",
  },
};

/**
 * SKU → family, plus the packaging spec read from the product name.
 * `specs` here are factual (format, matière, conditionnement) — never invented
 * lab values.
 */
export const ASSIGNMENTS = [
  // Désodorisants
  ['P-00286', 'airfresh', [['Conditionnement', 'Flacon 500 ml'], ['Parfum', 'Fleur de printemps']]],
  ['P-00092', 'airfresh', [['Conditionnement', 'Aérosol 300 ml'], ['Parfum', 'Glade']]],
  ['P-00063', 'airfresh', [['Conditionnement', 'Aérosol 300 ml'], ['Parfum', 'Nassim']]],
  ['P-00261', 'deofreshLinge', [['Conditionnement', 'Bidon 5 kg']]],
  ['P-00058', 'insecticide', [['Conditionnement', 'Aérosol 500 ml']]],

  // Buanderie
  ['P-00070', 'lessivePoudre', [['Conditionnement', 'Sac 25 kg'], ['Usage', 'Linge blanc']]],
  ['P-00165', 'degraissantLinge', [['Conditionnement', 'Sac 25 kg']]],
  ['P-00164', 'lessivePoudre', [['Conditionnement', 'Bidon 20 kg']]],
  ['P-00100', 'lessivePoudre', [['Conditionnement', 'Bidon 5 kg']]],
  ['P-00066', 'lessivePoudre', [['Conditionnement', 'Bidon 20 kg']]],
  ['P-00099', 'lessivePoudre', [['Conditionnement', 'Bidon 5 kg']]],
  ['P-00185', 'lessiveDelicat', [['Conditionnement', 'Bidon 5 kg']]],
  ['P-00069', 'lessiveDelicat', [['Conditionnement', 'Bidon 20 kg']]],
  ['P-00065', 'lessiveLiquide', [['Conditionnement', 'Bidon 20 kg']]],
  ['P-00335', 'lessiveLiquide', [['Conditionnement', 'Bidon 5 L']]],
  ['P-00024', 'adoucissant', [['Conditionnement', 'Seau 5 L']]],
  ['P-00025', 'javelLiquide', [['Conditionnement', 'Bidon 20 kg']]],
  ['P-00146', 'detacheur', [['Conditionnement', 'Flacon 500 ml'], ['Cible', 'Encre']]],
  ['P-00068', 'detacheur', [['Conditionnement', 'Flacon 500 ml']]],

  // Vaisselle machine
  ['P-00178', 'lavageMachine', [['Conditionnement', 'Bidon 20 kg']]],
  ['P-00179', 'rincage', [['Conditionnement', 'Bidon 10 kg']]],
  ['P-00368', 'rincage', [['Conditionnement', 'Bidon 20 kg']]],

  // Sols et surfaces
  ['P-00128', 'degraissantSols', [['Conditionnement', 'Bidon 6 kg']]],
  ['P-00006', 'vitres', [['Conditionnement', 'Bidon 5 kg']]],
  ['P-00169', 'vitres', [['Conditionnement', 'Pulvérisateur 750 ml']]],
  ['P-00404', 'vitres', [['Conditionnement', 'Flacon 1 L']]],
  ['P-00214', 'vitres', [['Conditionnement', 'Pulvérisateur 500 ml']]],
  ['P-00052', 'chiffon', [['Conditionnement', 'Pièce'], ['Usage', 'Verres et vitres']]],
  ['P-00459', 'gresil', [['Conditionnement', 'Bidon 10 kg']]],
  ['P-00017', 'gresil', [['Conditionnement', 'Bidon 5 kg']]],
  ['P-00015', 'gresil', [['Conditionnement', 'Bidon 20 kg']]],
  ['P-00016', 'desinfectantSurfaces', [['Conditionnement', 'Bidon 5 kg']]],
  ['P-00057', 'desinfectantMulti', [['Conditionnement', 'Flacon 900 ml']]],
  ['P-00119', 'cireBois', [['Conditionnement', 'Aérosol 300 ml']]],
  ['P-00462', 'degraissantSols', [['Conditionnement', 'Flacon 250 ml']]],

  // Sanitaires
  ['P-00061', 'wcGel', [['Conditionnement', 'Flacon 750 ml']]],
  ['P-00503', 'wcGel', [['Conditionnement', 'Flacon 500 ml']]],
  ['P-00085', 'detartrantSanitaire', [['Conditionnement', 'Flacon 500 ml']]],
  ['P-00452', 'detartrantSanitaire', [['Conditionnement', 'Flacon 1 L']]],
  ['P-00464', 'detartrantSanitaire', [['Conditionnement', 'Flacon 250 ml']]],
  ['P-00491', 'detartrantSanitaire', [['Conditionnement', 'Flacon 500 ml']]],
  ['P-00318', 'detartrantSanitaire', [['Conditionnement', 'Bouteille 250 ml']]],
  ['P-00454', 'deboucheur', [['Conditionnement', 'Boîte 300 g']]],
  ['P-00253', 'chloreP', [['Conditionnement', 'Boîte 600 pastilles']]],
  ['P-00046', 'poudreRecurer', [['Conditionnement', 'Boîte 500 g']]],
  ['P-00084', 'entretienGenerique', [['Conditionnement', 'Pièce']]],

  // Hygiène des mains
  ['P-00383', 'poudreMain', [['Conditionnement', 'Seau 10 kg']]],
  ['P-00281', 'poudreMain', [['Conditionnement', 'Boîte 300 g']]],
  ['P-00343', 'poudreMain', [['Conditionnement', 'Boîte 350 g']]],
  ['P-00486', 'poudreMain', [['Conditionnement', 'Carton de 20 boîtes de 300 g']]],
  ['P-00252', 'poudreMain', [['Conditionnement', 'Boîte 280 g']]],
  ['P-00039', 'poudreMain', [['Conditionnement', 'Seau 10 kg']]],
  ['P-00157', 'savonVert', [['Conditionnement', 'Bloc 1 kg']]],
  ['P-00282', 'savonVert', [['Conditionnement', 'Bloc 850 g']]],
  ['P-00411', 'distributeurSavon', [['Conditionnement', 'Pièce']]],

  // Sacs
  ['P-00450', 'sacPoubelle', [['Conditionnement', 'Lot de 200'], ['Taille', 'Grand modèle'], ['Couleur', 'Blanc']]],
  ['P-00210', 'sacPoubelle', [['Conditionnement', 'Lot de 500'], ['Taille', 'Moyen modèle'], ['Couleur', 'Blanc']]],
  ['P-00010', 'sacPoubelle', [['Conditionnement', 'Lot de 500'], ['Taille', '50/60 moyen modèle'], ['Couleur', 'Noir']]],
  ['P-00009', 'sacPoubelle', [['Conditionnement', 'Lot de 200'], ['Taille', 'Grand modèle'], ['Couleur', 'Noir']]],
  ['P-00102', 'sacPoubelle', [['Conditionnement', 'Lot de 125'], ['Couleur', 'Noir']]],
  ['P-00091', 'sacPoubelle', [['Conditionnement', 'Lot de 25'], ['Taille', 'Moyen modèle'], ['Couleur', 'Noir']]],
  ['P-00422', 'sacBretelle', [['Conditionnement', 'Lot de 50'], ['Charge', '5 kg']]],
  ['P-00208', 'sacBretelle', [['Conditionnement', 'Lot de 1000'], ['Charge', '5 kg']]],
  ['P-00080', 'sacCongelation', [['Conditionnement', 'Lot de 50'], ['Charge', '5 kg']]],
  ['P-00328', 'sacCongelation', [['Conditionnement', 'Lot de 100'], ['Charge', '1 kg']]],
  ['P-00209', 'sacCongelation', [['Conditionnement', 'Lot de 1000']]],

  // Papier
  ['P-00044', 'papierHygienique', [['Conditionnement', 'Sac de 12 rouleaux'], ['Format', 'Jumbo T2, mandrin 70']]],
  ['P-00007', 'papierHygienique', [['Conditionnement', 'Lot de 48 rouleaux'], ['Qualité', 'Ultra doux']]],
  ['P-00130', 'papierHygienique', [['Conditionnement', 'Vrac 48 rouleaux']]],
  ['P-00237', 'essuieTout', [['Conditionnement', 'Lot de 6'], ['Format', 'Jumbo XL']]],
  ['P-00230', 'essuieTout', [['Conditionnement', 'Pièce'], ['Format', 'Jumbo XXL']]],
  ['P-00008', 'essuieTout', [['Conditionnement', 'Sac de 6'], ['Format', 'Jumbo XXL']]],
  ['P-00338', 'essuieTout', [['Conditionnement', 'Lot de 24'], ['Qualité', 'Extra']]],
  ['P-00037', 'serviettesTable', [['Conditionnement', 'Carton de 24 paquets'], ['Format', '30 x 30 cm']]],
  ['P-00056', 'serviettesTable', [['Conditionnement', 'Carton de 20 paquets'], ['Format', 'Enchevêtrées']]],
  ['P-00370', 'bavette', [['Conditionnement', 'Paquet de 50'], ['Format', 'Trois plis']]],
  ['P-00181', 'distributeurPapier', [['Conditionnement', 'Pièce'], ['Capacité', '100 feuilles']]],
  ['P-00060', 'distributeurPapier', [['Conditionnement', 'Pièce'], ['Capacité', '150 feuilles']]],
  ['P-00378', 'corbeille', [['Conditionnement', 'Pièce']]],

  // Gants
  ['P-00034', 'gantMenage', [['Conditionnement', 'Pièce']]],
  ['P-00121', 'gantMenage', [['Conditionnement', 'Pièce'], ['Marque', "Pol'Hop"]]],
  ['P-00342', 'gantMenage', [['Conditionnement', 'Pièce'], ['Marque', 'Vileda']]],
  ['P-00159', 'gantJetable', [['Conditionnement', 'Paquet de 100'], ['Matière', 'Latex poudré']]],
  ['P-00160', 'gantJetable', [['Conditionnement', 'Paquet de 100'], ['Matière', 'Nitrile'], ['Couleur', 'Bleu']]],
  ['P-00433', 'gantJetable', [['Conditionnement', 'Paquet de 100'], ['Matière', 'Nitrile'], ['Couleur', 'Noir']]],
  ['P-00038', 'gantJetable', [['Conditionnement', 'Paquet de 100'], ['Matière', 'Vinyle'], ['Couleur', 'Noir']]],
  ['P-00035', 'gantJetable', [['Conditionnement', 'Paquet de 100'], ['Matière', 'Vinyle']]],

  // Éponges et abrasifs
  ['P-00177', 'eponge', [['Conditionnement', 'Lot de 60'], ['Matière', 'Mousse']]],
  ['P-00372', 'eponge', [['Conditionnement', 'Pièce'], ['Matière', 'Mousse']]],
  ['P-00394', 'eponge', [['Conditionnement', 'Pièce'], ['Matière', 'Végétale']]],
  ['P-00012', 'tamponAbrasif', [['Conditionnement', 'Sac de 100'], ['Format', 'Carré']]],
  ['P-00186', 'tamponAbrasif', [['Conditionnement', 'Lot de 3'], ['Format', 'Extra']]],
  ['P-00021', 'tamponAbrasif', [['Conditionnement', 'Pièce'], ['Format', 'Fort géant']]],
  ['P-00020', 'tamponAbrasif', [['Conditionnement', 'Sac de 25'], ['Matière', 'Galvanisé']]],
  ['P-00310', 'tamponAbrasif', [['Conditionnement', 'Lot de 3'], ['Format', 'Tampon sur éponge']]],

  // Textiles de nettoyage
  ['P-00494', 'lavette', [['Conditionnement', 'Lot de 24'], ['Matière', 'Microfibre']]],
  ['P-00018', 'lavette', [['Conditionnement', 'Pièce'], ['Matière', 'Microfibre']]],
  ['P-00087', 'chiffon', [['Conditionnement', 'Pièce'], ['Type', 'Chamoisine']]],
  ['P-00296', 'chiffon', [['Conditionnement', 'Lot de 20'], ['Type', 'Cachemire blanc']]],
  ['P-00011', 'chiffon', [['Conditionnement', 'Lot de 25'], ['Type', 'Cachemire blanc']]],
  ['P-00043', 'chiffon', [['Conditionnement', 'Pièce'], ['Type', 'Côte boulanger']]],
  ['P-00031', 'serpilliere', [['Conditionnement', 'Lot de 12'], ['Format', '0,70 m']]],
  ['P-00495', 'serpilliere', [['Conditionnement', 'Lot de 12'], ['Matière', 'Microfibre']]],
  ['P-00053', 'serpilliere', [['Conditionnement', 'Pièce'], ['Matière', 'Microfibre']]],
  ['P-00366', 'frange', [['Conditionnement', 'Pièce'], ['Matière', 'Coton'], ['Format', '80 cm']]],
  ['P-00190', 'brosse', [['Conditionnement', 'Pièce'], ['Usage', 'Linge']]],

  // Matériel
  ['P-00288', 'balai', [['Conditionnement', 'Pièce'], ['Fibres', 'Dures']]],
  ['P-00344', 'balai', [['Conditionnement', 'Pièce']]],
  ['P-00203', 'brosse', [['Conditionnement', 'Pièce'], ['Matière', 'Métallique']]],
  ['P-00233', 'brosseWc', [['Conditionnement', 'Pièce avec socle']]],
  ['P-00032', 'raclette', [['Conditionnement', 'Pièce'], ['Largeur', '55 cm']]],
  ['P-00097', 'raclette', [['Conditionnement', 'Pièce']]],
  ['P-00301', 'raclette', [['Conditionnement', 'Pièce'], ['Largeur', '55 cm'], ['Format', 'Grand modèle']]],
  ['P-00471', 'raclette', [['Conditionnement', 'Pièce'], ['Format', 'Moyen modèle']]],
  ['P-00231', 'raclette', [['Conditionnement', 'Pièce'], ['Usage', 'Vitres']]],
  ['P-00051', 'manche', [['Conditionnement', 'Pièce'], ['Matière', 'Aluminium'], ['Longueur', '1,40 m']]],
  ['P-00183', 'manche', [['Conditionnement', 'Pièce'], ['Matière', 'Bois'], ['Longueur', '1,20 m']]],
  ['P-00019', 'manche', [['Conditionnement', 'Pièce'], ['Matière', 'Bois'], ['Longueur', '1,40 m']]],
  ['P-00415', 'manche', [['Conditionnement', 'Pièce'], ['Type', 'Télescopique'], ['Longueur', "Jusqu'à 3 m"]]],
  ['P-00182', 'pelle', [['Conditionnement', 'Pelle et balai'], ['Format', 'Grand modèle']]],
  ['P-00115', 'pelle', [['Conditionnement', 'Pièce'], ['Type', 'Ménagère']]],
  ['P-00276', 'teteDeLoup', [['Conditionnement', 'Pièce']]],

  // Emballage alimentaire
  ['P-00042', 'filmAlimentaire', [['Conditionnement', 'Rouleau 300 m']]],
  ['P-00041', 'aluminium', [['Conditionnement', 'Rouleau 100 m']]],
  ['P-00396', 'aluminium', [['Conditionnement', 'Rouleau 100 m']]],
  ['P-00096', 'cureDent', [['Conditionnement', 'Lot de 12']]],

  // Divers
  ['P-00275', 'alcoolBruler', [['Conditionnement', 'Bidon 5 L']]],
  ['P-00434', 'eauDistillee', [['Conditionnement', 'Bidon 5 L']]],
];
