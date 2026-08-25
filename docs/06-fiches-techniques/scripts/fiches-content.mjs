/**
 * Structured content for the 16 fiches techniques, transcribed from the Word
 * source files in ../source/.
 *
 * Why not convert the .doc files directly: each one was laid out differently in
 * Word (nested layout tables, hard page breaks, in-document footers). Running
 * them through textutil flattened the physico-chemical tables into vertical
 * lists and duplicated the footer. Rebuilding from structured content gives 16
 * identical, correctly typeset PDFs instead.
 *
 * Content is transcribed, not invented — every value here comes from the
 * corresponding source document.
 */

export const FICHES = [
  {
    slug: 'ALCOGEL',
    title: 'ALCOGEL',
    subtitle:
      'Gel hydroalcoolique désinfectant antiseptique pour les mains, sans colorant ni parfum.',
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          'ALCOGEL est bactéricide, levuricide et virucide.',
          "ALCOGEL est utilisé principalement dans le secteur agroalimentaire et en collectivités.",
          'ALCOGEL possède une très bonne tolérance dermique grâce aux effets de la glycérine.',
          "ALCOGEL a un haut pouvoir de désinfection grâce à sa teneur en dérivés alcooliques.",
        ],
      },
      {
        heading: 'Avantages',
        type: 'list',
        items: [
          'Action désinfectante particulièrement efficace et rapide.',
          "Gain de temps et praticité : sans rinçage ni séchage, utilisable en l'absence de point d'eau.",
          "Contient des agents hydratants empêchant le dessèchement et l'irritation de la peau.",
        ],
      },
      {
        heading: "Mode d'emploi — désinfection hygiénique",
        type: 'list',
        items: [
          'Appliquer 3 ml (2 ou 3 pressions sur le distributeur) dans le creux des mains propres et sèches, puis étaler sur les mains.',
          'Appliquer sur les mains sèches tout en enlevant montre et bagues.',
          'Frotter les mains entièrement, en veillant surtout au bout des doigts, pendant au moins 30 secondes.',
          'Ne pas rincer, ne pas sécher.',
        ],
      },
      {
        heading: 'Données techniques',
        type: 'table',
        rows: [
          ['pH', '6.85'],
          ['Densité moyenne', '0.9272 g/cm³'],
          ['Aspect du produit', 'Gel incolore'],
          ["Spectre d'activité et temps de contact", 'Conforme et approuvé par laboratoire TTS'],
          ['Stabilité du produit', 'Stable à une température ne dépassant pas 40 °C'],
        ],
      },
      {
        heading: 'Précautions et stockage',
        type: 'text',
        paragraphs: [
          "À chaque remplissage, un nettoyage complet du distributeur (pompe et réservoir) est indispensable pour éviter les risques de contamination. Des distributeurs sales ou contaminés peuvent rendre ce produit moins efficace.",
          "Nous déconseillons fortement le mélange de ce produit, même avec des produits de nature similaire, afin d'éviter tout risque d'interaction chimique (déphasages, agglomérats).",
          "Stocker le produit dans son emballage d'origine fermé, de préférence dans un endroit sombre, à l'abri des variations de températures (entre -5 °C et 30 °C), à l'écart de toute source de chaleur et d'ignition.",
          'Produit inflammable, irritant pour les yeux.',
        ],
      },
      {
        heading: 'Conformité',
        type: 'text',
        paragraphs: [
          'Produit conforme aux exigences de la directive européenne cosmétique.',
        ],
      },
    ],
    conditionnement: 'Bidon 5 L / Flacon 500 ml',
  },

  {
    slug: 'ALCOHAND',
    title: 'ALCOHAND',
    subtitle:
      "Solution hydroalcoolique antiseptique pour une désinfection rapide des mains, surfaces et ambiance.",
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          "ALCOHAND est une solution alcoolique antiseptique qui ne contient ni colorant ni parfum.",
          "ALCOHAND est utilisé principalement dans le secteur agroalimentaire et en collectivités.",
          "ALCOHAND possède un haut pouvoir de désinfection grâce à sa teneur en dérivés alcooliques.",
        ],
      },
      {
        heading: 'Avantages',
        type: 'list',
        items: [
          'Action désinfectante particulièrement efficace et rapide.',
          "Gain de temps et praticité : sans rinçage ni séchage, utilisable en l'absence de point d'eau.",
          'Sans parfum ni colorant, utilisable dans tous les secteurs alimentaires.',
          'Effet bactéricide, levuricide et virucide.',
          "Contient des agents hydratants empêchant le dessèchement et l'irritation de la peau.",
        ],
      },
      {
        heading: "Mode d'emploi — désinfection hygiénique",
        type: 'list',
        items: [
          'Appliquer 3 ml (2 ou 3 pressions sur le distributeur) dans le creux des mains propres et sèches, puis étaler sur les mains.',
          "Pour les surfaces, l'ambiance et les objets résistants aux alcools : utiliser non dilué et vaporiser à une distance de 30 cm, laisser agir 30 secondes.",
          "Après 30 secondes, ALCOHAND s'évapore.",
          'Ne pas rincer, ne pas sécher.',
        ],
      },
      {
        heading: 'Données techniques',
        type: 'table',
        rows: [
          ['pH', '6.81'],
          ['Densité moyenne', '0.9029 g/cm³'],
          ['Aspect du produit', 'Liquide incolore'],
          ["Spectre d'activité et temps de contact", 'Conforme et approuvé par laboratoire TTS'],
          ['Stabilité du produit', 'Stable à une température ne dépassant pas 40 °C'],
        ],
      },
      {
        heading: 'Précautions et stockage',
        type: 'text',
        paragraphs: [
          "À chaque remplissage, un nettoyage complet du distributeur (pompe et réservoir) est indispensable pour éviter les risques de contamination. Des distributeurs sales ou contaminés peuvent rendre ce produit moins efficace.",
          "Nous déconseillons fortement le mélange de ce produit, même avec des produits de nature similaire, afin d'éviter tout risque d'interaction chimique (déphasages, agglomérats).",
          "Stocker le produit dans son emballage d'origine fermé, de préférence dans un endroit sombre, à l'abri des variations de températures (entre -5 °C et 30 °C), à l'écart de toute source de chaleur et d'ignition.",
          'Produit inflammable, irritant pour les yeux.',
        ],
      },
      {
        heading: 'Conformité',
        type: 'text',
        paragraphs: [
          'Produit conforme aux exigences de la directive européenne cosmétique.',
        ],
      },
    ],
    conditionnement: 'Bidon 5 litres',
  },

  {
    slug: 'DEOFRESH',
    title: 'DEOFRESH',
    subtitle: "Produit désodorisant d'ambiance.",
    sections: [
      {
        heading: 'Description',
        type: 'text',
        paragraphs: [
          "Désodorisant d'ambiance par pulvérisation. DEOFRESH existe en plusieurs senteurs : citron, fell, jasmin, lavande et fleurs.",
        ],
      },
      {
        heading: "Domaine d'application",
        type: 'text',
        paragraphs: [
          "Chambres d'hôtels, réceptions d'hôtels, grandes surfaces, cliniques, hôpitaux, locaux communs, bureaux, etc.",
        ],
      },
      {
        heading: 'Propriétés',
        type: 'list',
        items: [
          'DEOFRESH ne contient pas de gaz propulseurs.',
          'DEOFRESH laisse une odeur fraîche et agréable dans les locaux traités.',
          "DEOFRESH neutralise très rapidement les odeurs de renfermé, de tabac… grâce à sa formulation exclusive.",
          "Facilité d'utilisation, sécurité des manipulateurs et protection de l'environnement.",
        ],
      },
      {
        heading: 'Composition',
        type: 'text',
        paragraphs: [
          'Solvants organiques concentrés, tensioactifs non ioniques et extraits de parfums.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "Remplir le pulvérisateur avec DEOFRESH sans le diluer avec l'eau (à l'état pur), puis vaporiser dans les pièces ou locaux à désodoriser.",
        ],
      },
      {
        heading: 'Conditions de stockage',
        type: 'table',
        rows: [['Température de conservation', '10 à 35 °C']],
      },
    ],
    conditionnement: 'Bidon 5 kg et pulvérisateur 750 ml',
  },

  {
    slug: 'PROFON',
    title: 'PROFON',
    subtitle:
      'Détartrant piscines, WC, urinoirs, surfaces dures (faïences et parterres) et aciers noirs (chaudières).',
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          "Nettoyant détartrant des bassins lors des vidanges : élimine les dépôts tenaces de calcaire et de rouille sur les revêtements, contient un inhibiteur de corrosion.",
          "Élimine le calcaire des WC et urinoirs, et décape les ciments pour les sols résistant aux acides (parterres et faïences).",
          "Détartre les équipements en acier noir (par exemple les chaudières). À ne pas utiliser sur les équipements en acier inoxydable et en aluminium.",
          "Formule très concentrée : acides + tensioactifs, qui redonne aux WC et urinoirs leur blancheur d'origine.",
          'PROFON dissout instantanément les dépôts de calcaire et les incrustations.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "<b>Nettoyer et détartrer les piscines, murs ou sols en faïence ou en grès :</b> diluer PROFON à raison de 1 à 2 litres pour 10 litres d'eau, laisser agir 5 minutes, brosser à l'aide d'une monobrosse puis rincer abondamment à l'eau.",
          "<b>Détartrer les WC et urinoirs :</b> tirer la chasse d'eau ou rincer l'urinoir, projeter PROFON sur les parois, laisser agir 30 minutes à 2 heures, brosser en cas de salissures tenaces puis tirer la chasse d'eau ou rincer à l'eau.",
        ],
      },
      {
        heading: "Précautions d'emploi",
        type: 'list',
        items: [
          "Ne pas mélanger PROFON avec l'eau de javel ou d'autres produits.",
          "Éviter d'utiliser PROFON sur le marbre, les carrelages et les équipements en acier inoxydable et aluminium.",
          "En cas de contact avec la peau ou les yeux, rincer abondamment à l'eau et contacter un médecin en cas de nécessité.",
          'Le port de gants et de lunettes est obligatoire (produit dangereux).',
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Forme', 'Liquide'],
          ['Couleur', 'Légèrement jaunâtre'],
          ['Densité', '1.14'],
          ['pH', '1.2'],
          ['Stockage', '0 à 40 °C'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
    ],
    conditionnement: 'Bidon de 5 ou 20 kg',
  },

  {
    slug: 'PROSTAR',
    title: 'PROSTAR',
    subtitle: 'Nettoyant désinfectant sanitaires et articles en aluminium.',
    sections: [
      {
        heading: 'Description',
        type: 'text',
        paragraphs: [
          'Liquide jaunâtre pour le nettoyage et la désinfection des sanitaires et de l’aluminium.',
        ],
      },
      {
        heading: "Domaine d'application",
        type: 'text',
        paragraphs: [
          "PROSTAR s'utilise pour le nettoyage et la désinfection des baignoires, robinetteries, douches, lavabos, intérieurs de WC, murs carrelés, portes et fenêtres en aluminium.",
        ],
      },
      {
        heading: 'Propriétés',
        type: 'list',
        items: [
          'PROSTAR dissout les dépôts d’origine minérale, les taches incrustées et décolle les souillures.',
          'PROSTAR nettoie, détartre et désinfecte en une seule opération.',
          'PROSTAR redonne un aspect brillant aux surfaces entartrées et ne laisse ni traces ni auréoles.',
          "PROSTAR s'utilise en action curative (détartrage) ou en action régulière selon les surfaces à traiter et la dureté de l'eau.",
        ],
      },
      {
        heading: 'Composition',
        type: 'text',
        paragraphs: [
          'Solvants organiques, tensioactifs non ioniques, acide citrique et inhibiteur de corrosion.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "Diluer PROSTAR de 30 à 50 %, c'est-à-dire 0,5 L de PROSTAR pour 0,5 L d'eau. Vaporiser sur la surface à traiter, laisser agir 5 minutes puis rincer à l'eau et laisser sécher. Les robinetteries doivent être essuyées avec un chiffon propre et sec.",
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Aspect', 'Liquide jaunâtre'],
          ['pH (solution aqueuse 1 %)', '3.2'],
          ['Densité', '1.13'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
      {
        heading: 'Conformité et sécurité',
        type: 'text',
        paragraphs: [
          "PROSTAR est conforme à la législation en vigueur relative aux produits de nettoyage des appareils et récipients destinés à être au contact des denrées alimentaires.",
          "Ne pas mélanger PROSTAR avec les produits alcalins et les oxydants (eau de javel, poudre chlorée et produits oxygénés). Porter des gants lors de l'utilisation.",
        ],
      },
    ],
    conditionnement: 'Bidon 5 kg ou pulvérisateur 750 ml',
  },

  {
    slug: 'JAVEL-PRODET',
    title: 'JAVEL PRODET',
    subtitle: 'Liquide de blanchiment et de désinfection.',
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          'Spécialement formulée pour satisfaire aux exigences des professionnels.',
          'Blanchit et désinfecte dès les basses températures (30 °C).',
          'Contient des dérivés chlorés stables à 12° chlore.',
          "Minimise l'usure des textiles en respectant la dose.",
          'Utilisable de par sa formulation sur le polyester/coton blanc et couleur grand teint.',
          'Très large spectre bactéricide, efficace sur levures, moisissures et spores.',
        ],
      },
      {
        heading: 'Caractéristiques',
        type: 'table',
        head: ['Caractéristique', 'Valeur minimale', 'Valeur maximale'],
        rows: [
          ['Densité à 20 °C', '1.055', '1.070'],
          ['Chlore actif — sortie d’usine', '13', '14'],
          ['Chlore actif — valeur tolérée sur le marché', '10', '12'],
          ['Chlore total (g/L)', '38', '44'],
          ['Alcali libre caustique (g/L)', '—', '2.5'],
        ],
      },
      {
        heading: 'Dosage',
        type: 'table',
        rows: [
          ['Dosage général', "200 à 500 ml pour 10 litres d'eau"],
          ['Linge éponge', '10 ml par kg de linge'],
          ["Linge draps et taies d'oreiller", '15 ml par kg de linge'],
          ['Linge restaurant blanc', '30 ml par kg de linge'],
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "La température d'utilisation s'étend de 30 à 50 °C. JAVEL PRODET s'utilise en association avec un détergent ou seul.",
          "Un traitement préalable des taches au moyen des détacheurs est parfois le complément idéal à l'action du JAVEL PRODET.",
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Forme', 'Liquide'],
          ['Couleur', 'Jaunâtre'],
          ['Degré du chlore', '12°'],
          ['pH', '12 ± 0.5'],
          ['Mousse', 'Non moussant'],
          ['Stockage', '0 à 25 °C'],
          ['Durée de stockage', 'Trois mois'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
    ],
    conditionnement: 'Bidon de 5 L ou 20 L',
  },

  {
    slug: 'MANOCID',
    title: 'MANOCID',
    subtitle: "Savon liquide bactéricide pour l'hygiène des mains.",
    sections: [
      {
        heading: 'Caractéristiques',
        type: 'list',
        items: [
          "MANOCID s'utilise régulièrement pour l'hygiène des mains afin de stopper la prolifération des germes véhiculés par les mains.",
          'MANOCID vous garantit une hygiène parfaite lors de la manipulation des denrées alimentaires.',
          "MANOCID contient un agent protecteur d'épiderme spécialement formulé pour peaux sensibles et délicates.",
        ],
      },
      {
        heading: 'Propriétés microbiologiques',
        type: 'text',
        paragraphs: [
          'MANOCID possède un pouvoir bactéricide sur les germes mésophiles et thermophiles, à savoir : Escherichia coli, Staphylococcus aureus, streptocoques, etc.',
        ],
      },
      {
        heading: 'Composition',
        type: 'text',
        paragraphs: [
          'Tensioactifs anioniques, triclosan et dérivés alcooliques comme principes actifs pour la désinfection, glycérine et additifs spécifiques.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "Se mouiller les mains et appliquer une dose de MANOCID à l'aide d'un distributeur de savon liquide. Frotter et utiliser une brosse pour les angles, puis rincer à l'eau claire. Prolonger le temps de contact jusqu'à 2 à 3 minutes pour obtenir une désinfection parfaite.",
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Forme', 'Liquide'],
          ['Couleur', 'Incolore et sans parfum'],
          ['Masse volumique', '1.024'],
          ['pH (pur)', '6.5 à 7.5'],
          ['Viscosité', '1495 mPa·s'],
          ['Stockage', '0 à 40 °C'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
      {
        heading: 'Conformité',
        type: 'text',
        paragraphs: [
          "MANOCID est conforme à la législation en vigueur relative aux produits de nettoyage des appareils et récipients destinés à être en contact des denrées alimentaires.",
          "PRODET TUNISIE est à votre disposition pour développer la meilleure utilisation du MANOCID.",
        ],
      },
    ],
    conditionnement: 'Carton de 4 bidons de 5 kg',
  },

  {
    slug: 'MOLKABIN',
    title: 'MOLKABIN',
    subtitle: 'Entretien des inox — polissage pour acier inoxydable.',
    sections: [
      {
        heading: 'Description',
        type: 'text',
        paragraphs: [
          "En utilisant MOLKABIN, la saleté et le ternissement sur les surfaces en acier inoxydable sont masqués et les surfaces retrouvent un bel éclat.",
          "Les taches de gravure causées par des fluides agressifs tels que la vapeur, les lessives, les acides ou la pierre à eau sont évitées.",
        ],
      },
      {
        heading: "Domaine d'application",
        type: 'text',
        paragraphs: ['Surfaces extérieures des équipements en acier inoxydable.'],
      },
      {
        heading: "Mode d'emploi",
        type: 'table',
        rows: [
          ['Températures', '0 °C à 30 °C'],
          ['Concentration', 'Appliqué sous forme concentrée'],
          [
            'Dosage / application',
            "La saleté grossière doit d'abord être éliminée, éventuellement à l'aide de nettoyants acides. Après séchage, le coton à polir doit être imbibé de MOLKABIN et frotté doucement sur la surface, puis lustré avec un chiffon propre et doux.",
          ],
        ],
      },
      {
        heading: 'Caractéristiques du produit',
        type: 'list',
        items: [
          "Ne mousse pas, ne contient pas d'antimousse.",
          "Non corrosif sur l'inox.",
          "Durée de conservation illimitée. Inflammable, à stocker à l'écart des sources d'ignition.",
          'Éviter le contact avec la peau et les yeux.',
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Forme', 'Liquide'],
          ['Couleur', 'Bleu'],
          ['Densité (concentré)', '0.85 g/ml'],
          ['Stockage', '-5 °C à +50 °C'],
        ],
      },
    ],
    conditionnement: 'Bidon 10 kg / Flacon 500 ml',
  },

  {
    slug: 'PILAX',
    title: 'PILAX',
    subtitle: 'Produit liquide détartrant concentré pour WC et urinoirs.',
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          "Produit liquide concentré qui dissout et enlève la rouille, les dépôts calcaires et les taches persistantes des surfaces en porcelaine des urinoirs et WC.",
          'Désinfecte et désodorise en même temps.',
          'Détruit efficacement les moisissures.',
          "Contient de l'acide chlorhydrique mais aussi des inhibiteurs pour protéger les tuyauteries, avec une excellente action détergente : suspend et émulsifie les salissures tenaces.",
        ],
      },
      {
        heading: "Domaine d'application",
        type: 'text',
        paragraphs: [
          'PILAX est utilisé pour les WC et les urinoirs.',
          'Ne pas utiliser sur les baignoires, éviers, surfaces en béton et appareils émaillés.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "<b>Pour les urinoirs :</b> verser PILAX pur sur une brosse et frotter, puis tirer la chasse d'eau.",
          "<b>Pour les WC :</b> enlever l'eau du vase puis appliquer environ 50 ml sur toute la surface au moyen d'une éponge ou d'une brosse appropriée. Laisser agir le temps de frotter puis tirer la chasse d'eau.",
        ],
      },
      {
        heading: 'Composition et caractéristiques',
        type: 'text',
        paragraphs: [
          'Éléments acides, substances réductrices et mouillantes.',
          "Ne pas mélanger PILAX avec l'eau de javel et les produits alcalins.",
        ],
      },
      {
        heading: "Précautions d'emploi",
        type: 'text',
        paragraphs: [
          "Contient de l'acide chlorhydrique. Éviter le contact avec la peau, les yeux et les vêtements. Ne pas laisser à la portée des enfants. En cas de projection, rincer immédiatement à l'eau.",
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [['Biodégradabilité', 'Supérieure à 90 %']],
      },
    ],
    conditionnement: 'Flacon de 750 ml',
  },

  {
    slug: 'PROFOUR',
    title: 'PROFOUR',
    subtitle: 'Nettoyage des surfaces très grasses (fours, grills, friteuses…).',
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          'Formule très concentrée : alcalin + solvant. Fort pouvoir désincrustant.',
          "Produit concentré prêt à l'emploi, d'une utilisation simple (pulvérisateur) et économique.",
          'Polyvalent : dégraissage de nombreuses surfaces.',
          'PROFOUR dissout instantanément les dépôts graisseux.',
          'Alcalin très puissant : action immédiate, PROFOUR pénètre, décolle et disperse les souillures grasses et carbonisées.',
        ],
      },
      {
        heading: 'Polyvalence',
        type: 'text',
        paragraphs: [
          "Utilisation d'un produit unique pour le dégraissage de nombreuses surfaces : fours, grills, pianos, friteuses, hottes d'aspiration, marmites en inox, filtres d'extraction et sols de cuisines.",
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "<b>Surfaces comportant des graisses carbonisées :</b> vaporiser PROFOUR à l'état pur sur les surfaces à traiter (pianos, fours et grills doivent être chauffés à 50-60 °C). Laisser agir 5 minutes puis rincer à l'eau.",
          "<b>Friteuses, filtres d'extraction et marmites :</b> préparer une solution de 2 à 3 % (2 à 3 litres de PROFOUR dans 100 litres d'eau), chauffer à 70 °C, laisser 20 minutes puis rincer à l'eau.",
          "<b>Sols, hottes et surfaces de travail :</b> préparer une solution 50/50 (1 litre de PROFOUR pour 1 litre d'eau), appliquer sur les surfaces à traiter ou vaporiser puis rincer à l'eau claire.",
          "PROFOUR est déconseillé sur l'aluminium, le cuivre et autres métaux légers et altérables.",
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Aspect', 'Liquide jaunâtre'],
          ['pH (solution aqueuse 1 %)', '13.6'],
          ['Densité', '1.038 à 1.048'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
      {
        heading: 'Conformité et sécurité',
        type: 'text',
        paragraphs: [
          "PROFOUR est conforme à la législation en vigueur relative aux produits de nettoyage des appareils et récipients destinés à être au contact des denrées alimentaires.",
          'Avant utilisation, lire attentivement les conseils de sécurité mentionnés sur la fiche de sécurité.',
        ],
      },
    ],
    conditionnement: 'Carton de 4 x 5 kg ou flacons de 12 x 750 ml',
  },

  {
    slug: 'PROGERME',
    title: 'PROGERME',
    subtitle: 'Nettoyant désinfectant toutes surfaces.',
    sections: [
      {
        heading: 'Description',
        type: 'text',
        paragraphs: [
          "Produit agréablement parfumé pour le nettoyage et l'entretien des surfaces.",
        ],
      },
      {
        heading: "Domaine d'application",
        type: 'text',
        paragraphs: [
          'Toutes surfaces telles que sols marbrés, bureaux, portes, vitres, carrelages, lavabos, WC, urinoirs…',
          "Il est particulièrement adapté à l'entretien des sols brillants et des salles de restauration.",
        ],
      },
      {
        heading: 'Propriétés',
        type: 'list',
        items: [
          "PROGERME est un produit de nettoyage et de désinfection d'efficacité rapide.",
          'Il assure une propreté hygiénique.',
          'Il possède une odeur agréable.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "PROGERME est utilisé à une concentration de 2 %, soit 200 ml pour 10 litres d'eau. Laver les surfaces avec la solution diluée. Ne pas rincer.",
          "Cependant, les surfaces en contact avec les denrées alimentaires devront être rincées à l'eau claire et potable avant utilisation.",
        ],
      },
      {
        heading: "Précautions d'emploi",
        type: 'list',
        items: [
          'Éviter le contact avec les yeux.',
          "En cas de contact avec les yeux, rincer abondamment à l'eau.",
          "Ne pas verser le produit concentré dans les eaux usées. Tenir hors de la portée des enfants.",
          "Conserver le produit dans son récipient d'origine.",
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Forme', 'Liquide'],
          ['Couleur', 'Blanc / Vert'],
          ['Densité', '1.005'],
          ['Mousse', 'Peu moussant'],
          ['pH (1 %)', '7.5'],
          ['Stockage', '0 à 40 °C'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
    ],
    conditionnement: 'Bidon de 5 et 20 kg',
  },

  {
    slug: 'PROLAC',
    title: 'PROLAC',
    subtitle: 'Détartrant liquide super concentré.',
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          'Élimine le calcaire des lave-vaisselle et tables à vapeur des services alimentaires.',
          "Nettoie l'équipement en acier inoxydable et en aluminium.",
          'Élimine les incrustations et taches dans les machines à café, augmentant ainsi la capacité de transfert de chaleur des surfaces.',
          'Enlève les taches et dépôts minéraux sur la verrerie de laboratoire.',
          'Efficace pour le détartrage des toilettes, des douches…',
          "Dans les centres de soins pour animaux (animaleries), élimine les incrustations d'urine et les dépôts minéraux.",
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "<b>Pour détartrer les lave-vaisselle :</b> remplir la machine, actionner le chauffe-eau, ajouter 5 litres de PROLAC et mettre la machine en marche jusqu'à ce que la couche de calcaire disparaisse. Appliquer pur aux endroits inaccessibles par les jets. Retirer au grattoir les dépôts importants de calcaire. Vidanger la machine, la remplir d'eau fraîche et la faire fonctionner pendant 5 minutes.",
          "<b>Pour détartrer les urnes à café :</b> remplir l'urne d'eau chaude, ajouter 100 ml par litre de PROLAC, chauffer et laisser agir pendant 15 minutes. Vider et rincer abondamment à l'eau.",
          "<b>Nettoyage de l'équipement en acier inoxydable et robinetterie :</b> appliquer une solution de 100 ml par litre d'eau chaude à l'aide d'un chiffon ou d'une éponge. Rincer à l'eau propre et essuyer.",
          "<b>Nettoyage de l'équipement en aluminium :</b> faire tremper les ustensiles dans une solution de 50 ml de PROLAC par litre d'eau jusqu'à ce qu'ils soient propres et brillants. Rincer abondamment à l'eau fraîche et laisser sécher. Pour les gros équipements, appliquer la solution à l'aide d'une éponge ou d'un chiffon imbibé.",
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Forme', 'Liquide'],
          ['Couleur', 'Incolore'],
          ['Densité', '1.004'],
          ['Mousse', 'Peu moussant'],
          ['Stockage', '0 à 40 °C'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
      {
        heading: 'Conformité et sécurité',
        type: 'text',
        paragraphs: [
          'PROLAC contient des acides. Ne pas mélanger avec des détergents.',
          "PROLAC est conforme à la législation relative au nettoyage du matériel pouvant se trouver en contact avec les denrées alimentaires.",
        ],
      },
    ],
    conditionnement: 'Bidon de 20 kg / Bidon de 6 kg',
  },

  {
    slug: 'SANIHAND',
    title: 'SANIHAND',
    subtitle: "Savon liquide parfumé pour l'hygiène des mains.",
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          'Spécialement formulé pour peaux sensibles et délicates.',
          'Nettoie et désinfecte en une seule opération.',
          "SANIHAND est recommandé pour l'hygiène des mains avant manipulation de tous produits alimentaires.",
          "SANIHAND se compose d'une combinaison de substances actives du point de vue nettoyage et protectrices de la peau, réalisée à partir d'acides gras naturels.",
          'SANIHAND contient un élément antibactérien qui peut assurer la désinfection des mains.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "Pour l'hygiène des mains, quelques giclées sur les mains, laver et rincer à l'eau.",
          'PRODET TUNISIE est à votre disposition pour développer la meilleure utilisation du SANIHAND.',
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Forme', 'Liquide'],
          ['Couleur', 'Bleu ou vert'],
          ['Masse volumique', '1.024'],
          ['pH (1 %)', '7 ± 0.5'],
          ['Viscosité', '1495 mPa·s'],
          ['Stockage', '0 à 40 °C'],
          ['Composition', 'Ne contient ni solvant ni abrasif'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
    ],
    conditionnement: 'Bidon de 20 kg ou bidon de 5 kg',
  },

  {
    slug: 'SIRAFAN-DESINFECTANT',
    title: 'SIRAFAN DESINFECTANT',
    subtitle: 'Désinfectant désodorisant ambiance et surfaces.',
    sections: [
      {
        heading: 'Description',
        type: 'list',
        items: [
          "Excellente action désinfectante et désodorisante pour l'ambiance et les surfaces : espaces confinés, locaux poubelles, placards et téléphones…",
          "Bactéricide de surfaces, appareils et matériaux. Ne pas mélanger avec autre chose que de l'eau.",
          "SIRAFAN DESINFECTANT est associé à des tensioactifs anioniques pour la fonction de nettoyage et à un ammonium quaternaire pour un large spectre de désinfection avec un effet rémanent.",
          "SIRAFAN DESINFECTANT est un désinfectant à base d'ammonium quaternaire, efficace sur la plupart des microorganismes.",
          "Peut être utilisé par pulvérisation ou manuellement. Il diffère des désinfectants chlorés par la sécurité du personnel et la non-corrosion du matériel.",
          'Supprime les mauvaises odeurs, désinfecte et désodorise sols, murs et lavabos.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "Éliminer les salissures, nettoyer la surface et rincer à l'eau.",
          "Préparer une solution de SIRAFAN DESINFECTANT à 5 % (500 ml pour 10 litres d'eau) en fonction du degré d'encrassement. Vaporiser la solution, laisser agir 5 minutes puis rincer à l'eau claire.",
          "Appliquer à l'aide d'un chiffon, d'un balai ou d'un vaporisateur mécanique. Bien mouiller la surface. Préparer une nouvelle solution quotidiennement au moins.",
          'SIRAFAN DESINFECTANT est réservé à un usage professionnel.',
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Forme', 'Liquide'],
          ['Couleur', 'Jaune'],
          ['Densité', '0.99 à 1'],
          ['pH', '5 à 8'],
          ['Stockage', '0 à 40 °C'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
        ],
      },
      {
        heading: 'Conformité',
        type: 'text',
        paragraphs: [
          "SIRAFAN DESINFECTANT est conforme à la législation en vigueur relative aux produits de nettoyage et désinfection des appareils et récipients destinés à être en contact avec les denrées alimentaires.",
          'PRODET TUNISIE est à votre disposition pour développer la meilleure utilisation du SIRAFAN DESINFECTANT.',
        ],
      },
    ],
    conditionnement: 'Bidon de 5 kg',
  },

  {
    slug: 'SOLITAIRE-VAISSELLE',
    title: 'SOLITAIRE VAISSELLE',
    subtitle: 'Détergent liquide neutre pour le nettoyage manuel de la vaisselle.',
    sections: [
      {
        heading: 'Indications',
        type: 'text',
        paragraphs: [
          'Détergent liquide pour le nettoyage manuel et le lavage des vaisselles et des surfaces.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'list',
        items: [
          "Dilution : 100 ml pour 5 litres d'eau, soit une concentration de 2 %.",
          'Temps de trempage minimum : 5 minutes.',
          'Brosser si nécessaire.',
          'Rincer soigneusement.',
          'Renouvellement de la solution de nettoyage à chaque utilisation.',
        ],
      },
      {
        heading: 'Composition qualitative',
        type: 'list',
        items: [
          'Les substances tensioactives exercent un pouvoir mouillant et émulsionnant sur les composants organiques.',
          'Les substances tensioactives dispersent et maintiennent les salissures en suspension dans le bain de lavage.',
          'Les substances tensioactives facilitent le rinçage et le séchage.',
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [
          ['Coloration', 'Incolore'],
          ['pH', 'Neutre (pH = 7)'],
          ['Biodégradabilité', 'Supérieure à 90 %'],
          ['Stabilité physico-chimique', "À dilution jusqu'à 60 °C"],
        ],
      },
      {
        heading: 'Assistance',
        type: 'text',
        paragraphs: [
          'PRODET TUNISIE est à votre disposition pour développer la meilleure utilisation du SOLITAIRE VAISSELLE.',
        ],
      },
    ],
    conditionnement: 'Bidons de 5 L et 20 litres',
  },

  {
    slug: 'VIT-NET',
    title: 'VIT NET',
    subtitle: 'Déboucheur pour tuyauteries et canalisations.',
    sections: [
      {
        heading: 'Description',
        type: 'text',
        paragraphs: [
          "Déboucheur pour tuyauteries avec une excellente action détergente : suspend et émulsifie les salissures tenaces.",
        ],
      },
      {
        heading: "Domaine d'application",
        type: 'list',
        items: [
          'VIT NET est le déboucheur universel des lavabos, éviers, baignoires, sanitaires et canalisations.',
          "Son action s'exerce sur les graisses qu'il désagrège et évacue grâce aux microbilles entrant dans sa formulation.",
          'Sur les sédiments graisseux formant obturation.',
          'Par gravité, en disloquant les dépôts formés sur les canalisations.',
          'VIT NET agit en quelques minutes sur les matières organiques, les cheveux et les fibres synthétiques, contribuant ainsi à la remise en service rapide, sans démontage des installations.',
        ],
      },
      {
        heading: 'Composition et caractéristiques',
        type: 'text',
        paragraphs: [
          'Éléments alcalins, substances réductrices et mouillants.',
          'VIT NET en solution dégage de la chaleur, ce qui contribue à la désinfection et à la désodorisation.',
        ],
      },
      {
        heading: "Mode d'emploi",
        type: 'text',
        paragraphs: [
          "Verser un demi-verre d'eau chaude dans le siphon, ajouter 2 à 3 cuillères à soupe de VIT NET, puis verser à nouveau un demi-verre d'eau chaude. Laisser agir 1 à 2 heures, ou de préférence toute une nuit. Rincer ensuite abondamment à l'eau froide. Si l'eau ne s'écoule pas, recommencer l'opération.",
        ],
      },
      {
        heading: "Précautions d'emploi",
        type: 'text',
        paragraphs: [
          "Éviter le contact avec la peau, les yeux et les vêtements. Ne pas laisser à la portée des enfants. En cas de projection, rincer immédiatement à l'eau.",
        ],
      },
      {
        heading: 'Propriétés physico-chimiques',
        type: 'table',
        rows: [['Biodégradabilité', 'Supérieure à 90 %']],
      },
    ],
    conditionnement: 'Seau de 5 kg',
  },
];
