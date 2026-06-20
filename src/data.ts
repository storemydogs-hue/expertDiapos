import { SlideTheme, PresentationData } from "./types";

export const THEMES: SlideTheme[] = [
  {
    id: "geometric-balance",
    name: "Équilibre Géométrique (Défaut)",
    description: "Contraste asymétrique orange vif et jais de jais, signature d'Expert Diapos.",
    bgClass: "bg-stone-50 border-stone-200",
    bgHex: "FAF9F5",
    cardBgHex: "1E293B",
    titleClass: "font-sans font-black text-slate-900 leading-[1.1] tracking-tight",
    titleHex: "0F172A",
    subtitleClass: "text-orange-600 font-bold uppercase tracking-[0.2em] text-xs sm:text-sm",
    subtitleHex: "EA580C",
    textClass: "text-slate-600 font-sans leading-relaxed",
    textHex: "334155",
    accentClass: "bg-orange-600 text-white",
    accentHex: "EA580C",
    fontTitle: "Outfit",
    fontBody: "Inter"
  },
  {
    id: "corporate-blue",
    name: "Bleu Corporatif",
    description: "Design business traditionnel, professionnel et sobre.",
    bgClass: "bg-white border-sky-100",
    bgHex: "FFFFFF",
    cardBgHex: "F0F9FF", // sky-50
    titleClass: "font-sans font-extrabold text-[#0B2545] tracking-tight",
    titleHex: "0B2545",
    subtitleClass: "text-[#134074] font-medium font-sans",
    subtitleHex: "134074",
    textClass: "text-[#1D2D44] font-sans",
    textHex: "1D2D44",
    accentClass: "bg-sky-500 text-white",
    accentHex: "00B4D8",
    fontTitle: "Outfit",
    fontBody: "Inter"
  },
  {
    id: "minimalist-charcoal",
    name: "Ardoise Minimaliste",
    description: "Ultra-épuré, contrastes raffinés et élégance scandinave.",
    bgClass: "bg-zinc-50 border-zinc-200",
    bgHex: "FAF9F6",
    cardBgHex: "F4F4F5", // zinc-100
    titleClass: "font-sans font-bold text-zinc-900 tracking-tight",
    titleHex: "18181B",
    subtitleClass: "text-zinc-500 font-sans",
    subtitleHex: "71717A",
    textClass: "text-zinc-700 font-sans",
    textHex: "3F3F46",
    accentClass: "bg-emerald-600 text-white",
    accentHex: "059669",
    fontTitle: "Outfit",
    fontBody: "Inter"
  },
  {
    id: "eclipse-dark",
    name: "Éclipse Sombre",
    description: "Palettes immersives sombres avec contrastes néon.",
    bgClass: "bg-slate-950 border-slate-800",
    bgHex: "0B0F19",
    cardBgHex: "1E293B", // slate-800
    titleClass: "font-sans font-semibold text-teal-400 tracking-tight",
    titleHex: "2DD4BF",
    subtitleClass: "text-purple-400 font-mono text-sm",
    subtitleHex: "C084FC",
    textClass: "text-slate-300 font-sans",
    textHex: "D1D5DB",
    accentClass: "bg-teal-500 text-slate-950",
    accentHex: "14B8A6",
    fontTitle: "Outfit",
    fontBody: "Inter"
  },
  {
    id: "academic-forest",
    name: "Forêt Académique",
    description: "Luxe de style classique avec sérifs raffinés et fond crème.",
    bgClass: "bg-[#FDFBF7] border-[#ECE5D8]",
    bgHex: "FDFBF7",
    cardBgHex: "F4EFEB",
    titleClass: "font-serif font-black text-[#1A3324] leading-tight",
    titleHex: "1A3324",
    subtitleClass: "text-[#4A5D4E] font-serif italic",
    subtitleHex: "4A5D4E",
    textClass: "text-[#2B2B2B] font-sans",
    textHex: "2B2B2B",
    accentClass: "bg-[#7A8B7B] text-white",
    accentHex: "5E6F60",
    fontTitle: "Playfair Display",
    fontBody: "Inter"
  },
  {
    id: "autumn-warmth",
    name: "Chaleur d'Automne",
    description: "Tons de terracotta réconfortants et typographies chaleureuses.",
    bgClass: "bg-[#FCF6F0] border-[#EAD5C3]",
    bgHex: "FCF6F0",
    cardBgHex: "F5E3D2",
    titleClass: "font-sans font-extrabold text-[#7C2D12] tracking-tight",
    titleHex: "7C2D12",
    subtitleClass: "text-[#C2410C] font-semibold",
    subtitleHex: "C2410C",
    textClass: "text-[#451A03] font-sans",
    textHex: "451A03",
    accentClass: "bg-amber-600 text-white",
    accentHex: "EA580C",
    fontTitle: "Outfit",
    fontBody: "Inter"
  }
];

export interface DemoPreset {
  id: string;
  name: string;
  description: string;
  tone: string;
  slideCount: number;
  content: string;
}

export const PRESETS: DemoPreset[] = [
  {
    id: "expert-diapos",
    name: "💡 Présentation d'Expert Diapos",
    description: "Démonstration du service de création de PowerPoint par IA.",
    tone: "commercial",
    slideCount: 15,
    content: `Expert Diapos est la plateforme leader pour créer instantanément des présentations PowerPoint professionnelles et structurées de 15 à 20 slides.
Le problème historique : Concevoir des diaporamas prend un temps astronomique. La mise en forme est fastidieuse, la formulation des textes est difficile, et trouver de bonnes idées de visuels est laborieux.
Notre solution innovante : Un moteur IA hybride utilisant Gemini 3.5 Flash relié à un exportateur de fichiers PPTX natifs direct pour garantir un format parfaitement éditable par le logiciel PowerPoint ou Google Slides.

Les piliers d'Expert Diapos :
1. Analyse sémantique de vos rapports complexes, PDF, notes brutes ou copier-coller de texte.
2. Structure stricte respectant les règles d'impact visuels (sommaire, transitions logiques, diapositives de bilan, notes de présentation complètes).
3. Choix de thèmes sophistiqués (Bleu Corporatif pour le sérieux, Ardoise Minimaliste pour l'élégance, Forêt Académique pour le classicisme).
4. Notes de présentation rédigées automatiquement pour l'orateur sur chaque slide.
5. Zéro faux-semblants : vous téléchargez un VRAI fichier PPTX modifiable, pas un format d'image gelé.

Modèle économique :
- Version d'essai gratuite avec génération standard.
- Formule Premium pour les entreprises avec intégration de leur charte graphique personnalisée, logos et assistance prioritaire.
- Fort taux de fidélisation de 84% constaté après le premier mois d'utilisation.`
  },
  {
    id: "rse-strategy",
    name: "🌱 Stratégie RSE 2026",
    description: "Exemple de plan environnemental et sociétal pour une entreprise.",
    tone: "professionnel",
    slideCount: 16,
    content: `Stratégie Nationale RSE Horizon 2026 pour le groupe industriel Novacorp.
Notre ambition : Réduire de 35% notre empreinte carbone nette d'ici un triennat, tout en améliorant la qualité de vie au travail et l'intégration locale.

Les enjeux majeurs de notre transformation :
1. Transition Énergétique : Éco-conception de nos usines de production, passage à 80% d'énergies renouvelables d'ici 2026 et suppression des emballages plastiques à usage unique.
2. Économie Circulaire : Réutilisation de 90% des métaux et déchets résiduels dans notre propre boucle fermée de production d'ici l'année prochaine.
3. Impact Social et Sociétal : Équité salariale stricte hommes/femmes avec un index cible à 98/100, et programme d'insertion de 15% d'alternants et de personnes éloignées de l'emploi.
4. Éthique et Transparence : Audit annuel externe indépendant de nos progrès avec publication de rapports en open-source.

Moyens financiers déployés :
- Plan d'investissement vert de 15 millions d'euros sur 3 ans.
- Création d'un Comité Scientifique RSE présidé par un expert du climat.
- Objectif global : Devenir une entreprise certifiée B-Corp d'ici fin 2026.`
  },
  {
    id: "ia-education",
    name: "🎓 L'IA Générative dans l'Éducation Moderne",
    description: "Analyse sur la révolution des méthodes pédagogiques à l'université.",
    tone: "académique",
    slideCount: 18,
    content: `Rapport académique sur l'émergence des technologies d'intelligence artificielle générative au sein de l'enseignement supérieur.
Introduction : L'apparition de ChatGPT et des grands modèles de langage modifie en profondeur la dynamique d'apprentissage et la validation des compétences universitaires.

Les opportunités majeures identifiées :
1. tuteurs personnalisés : L'étudiant bénéficie d'une explication sur mesure 24h/24 ajustée à son niveau de départ et à son rythme cognitif.
2. Assistance aux enseignants : Gain de temps significatif sur la conception d'exercices, d'études de cas complexes et de résumés de cours.
3. Apprentissage collaboratif : Utilisation de l'IA comme partenaire de brainstorming ou simulation de rôles délibératifs.

Les défis et risques académiques :
- Plagiat invisible et perte de la pensée critique directe si la recherche n'est plus accompagnée.
- Fracture numérique : Inégalités d'accès entre étudiants disposant d'outils payants premiums ou non.
- Hallucinations scientifiques : Les modèles génèrent parfois de fausses citations bibliographiques que les étudiants ne vérifient pas.

Recommendations de politiques éducatives :
- Adapter les méthodes d'évaluation en valorisant la démarche d'enquête, l'oral, la relecture critique et l'utilisation de l'IA plutôt que la simple mémorisation.
- Établir une Charte de l'Intégrité Numérique dans chaque faculté.
- Former 100% des enseignants aux fondamentaux du prompt engineering et à l'éthique algorithmique.`
  },
  {
    id: "startup-pitch",
    name: "🚀 Pitch Startup",
    description: "Structure dynamique et chiffrée pour convaincre des investisseurs.",
    tone: "persuasif",
    slideCount: 12,
    content: `Pitch de présentation pour Startup SaaS technologique.
    Objectif : Convaincre des investisseurs en capital-risque (VC) de participer au premier tour de table (Seed Round).
    
    Structure de la présentation :
    1. Le Problème (Pain Point) : Description du problème concret et douloureux que nous résolvons.
    2. La Solution (Value Proposition) : Notre solution technologique innovante et ses bénéfices immédiats.
    3. Le Marché (Total Addressable Market) : Taille du marché adressable, croissance annuelle et segmentation.
    4. Business Model : Comment nous générons de la valeur (abonnements, commissions, freemium).
    5. Traction : Nos résultats actuels, utilisateurs actifs, métriques clés de croissance.
    6. Compétition : Pourquoi nous sommes plus rapides, meilleurs et moins chers que l'existant.
    7. Équipe : Présentation des fondateurs et de l'expertise clé.
    8. Roadmap : Jalons passés et développements futurs cruciaux.
    9. Demande : Montant recherché et utilisation prévue des fonds.`
  },
  {
    id: "marketing-campaign",
    name: "📢 Campagne Marketing",
    description: "Plan de lancement pour un nouveau produit ou service.",
    tone: "créatif",
    slideCount: 14,
    content: `Présentation du plan de lancement produit pour la campagne automne-hiver 2026.
    
    Structure stratégique :
    1. Objectifs de la campagne : Notoriété de marque, conversion, fidélisation.
    2. Ciblage : Profil type du client idéal (Buyer Personas), attentes et points de friction.
    3. Positionnement créatif : Concept visuel fort, slogans et tonalité de communication.
    4. Marketing mix : Canaux exploités (réseaux sociaux, affichage, search, influenceurs).
    5. Calendrier de déploiement : Phase de teasing, lancement, sustain post-lancement.
    6. Budget : Répartition des dépenses par canal, coût d'acquisition cible (CAC).
    7. Indicateurs de performance (KPIs) : Comment mesurer le succès de l'opération.`
  },
  {
    id: "business-plan",
    name: "📊 Business Plan",
    description: "Analyse stratégique et financière complète.",
    tone: "professionnel",
    slideCount: 20,
    content: `Business Plan détaillé pour le développement sur 3 ans.
    Structure recommandée :
    1. Résumé exécutif.
    2. Analyse de marché et concurrentielle.
    3. Stratégie opérationnelle.
    4. Projections financières (P&L, Cash-flow).`
  },
  {
    id: "tech-innovation",
    name: "💻 Innovation Technologique",
    description: "Présentation d'une nouvelle solution technique ou d'un projet R&D.",
    tone: "technologique/start-up",
    slideCount: 18,
    content: `Présentation d'une nouvelle solution d'IA générative pour le secteur de la santé.
    Structure recommandée :
    1. Le défi technique.
    2. L'architecture de la solution.
    3. Performances et benchmarks.
    4. Intégration et scalabilité.`
  }
];

export const INITIAL_PRESENTATION: PresentationData = {
  title: "Initiation à Expert Diapos",
  subtitle: "Votre générateur de PowerPoint professionnel propulsé par l'IA",
  slides: [
    {
      number: 1,
      title: "Bienvenue sur Expert Diapos",
      content: [
        "Solution ultime pour générer des présentations percutantes en quelques secondes.",
        "Plus besoin de passer des heures sur PowerPoint ou Google Slides pour la mise en page.",
        "Un fichier PPTX entièrement éditable est téléchargeable après génération.",
        "Sélectionnez vos couleurs, ajustez votre ton et brillez devant votre audience."
      ],
      visualElements: "Une page de couverture élégante avec le logo 'Expert Diapos', des vagues de formes géométriques raffinées et un minimalisme marquant.",
      animation: "fade-in",
      notes: "Bonjour à tous. Je suis ravi de vous présenter Expert Diapos, l'outil qui va transformer votre manière de concevoir vos supports de présentation."
    },
    {
      number: 2,
      title: "Sommaire",
      content: [
        "1. Les défis de la création de slides traditionnelle.",
        "2. Comment Expert Diapos utilise l'IA Gemini.",
        "3. La personnalisation de vos thèmes graphiques.",
        "4. L'export PowerPoint natif 100% modifiable.",
        "5. Conclusion & démonstration pratique."
      ],
      visualElements: "Un schéma linéaire vertical style frise chronologique où chaque étape est illustrée par un icône discret et épuré.",
      animation: "slide-up-staggered",
      notes: "Voici le programme de notre présentation. Nous allons voir comment lever les obstacles habituels de la mise en page de diapositives."
    },
    {
      number: 3,
      title: "Le Problème : La Perte de Temps",
      content: [
        "Concevoir un bon diaporama prend en moyenne 4 à 8 heures de travail acharné.",
        "La mise en forme et l'alignement des boîtes de texte sont frustrants et répétitifs.",
        "La reformulation des contenus est souvent trop longue ou peu synthétique.",
        "Trouver des illustrations appropriées demande une recherche laborieuse d'images."
      ],
      visualElements: "Graphique à barres montrant la répartition du temps de création de présentation (65% formattage graphique, 20% recherche, 15% fond).",
      animation: "zoom-on-chart",
      notes: "Tout le monde s'accorde pour dire que la mise en forme prend beaucoup trop de temps au détriment de la préparation orale."
    },
    {
      number: 4,
      title: "La Solution : Notre Algorithme",
      content: [
        "Génération instantanée de structures de 15 à 20 slides logiques et équilibrées.",
        "Création automatique de l'index, de la conclusion et de vos remerciements.",
        "Rédaction de 3 à 5 points clés percutants par diapositive sans blabla superflu.",
        "Suggestions de graphiques pertinents pour étayer chaque argument clé."
      ],
      visualElements: "Infographie illustrant le processus IA : Texte brut ➔ Analyse sémantique ➔ Mise en page dynamique ➔ Fichier PPTX éditable.",
      animation: "fade-in",
      notes: "Expert Diapos s'occupe de la structure et du contenu en analysant précisément vos documents de base ou consignes brutes."
    },
    {
      number: 5,
      title: "Une Rich' Note de Présentation Automatique",
      content: [
        "Chaque diapositive est générée avec ses propres notes de présentation.",
        "Les notes guident l'orateur avec 2 ou 3 phrases complètes et engageantes.",
        "Elles permettent de préparer votre discours et de ne pas simplement lire l'écran.",
        "Vous pouvez réviser et modifier ces notes directement depuis l'éditeur."
      ],
      visualElements: "Icône de microphone stylisé à droite avec une boîte de citation pour mettre en valeur un exemple de notes d'orateur.",
      animation: "slide-right",
      notes: "Regardez juste en dessous de ce pavé d'édition : vous voyez les notes de présentation automatiques. Plus besoin d'improviser !"
    },
    {
      number: 6,
      title: "Flexibilité des Thèmes Graphiques",
      content: [
        "Plusieurs configurations esthétiques haut de gamme sont disponibles.",
        "Bénéficiez du sérieux de notre charte bleu corporative ou de la modernité de l'ardoise minimaliste.",
        "Tonalités chaudes d'automne ou sérieux des chartes universitaires de style forest.",
        "Les polices et contrastes de couleurs respectent les meilleures normes ergonomiques."
      ],
      visualElements: "Palette de couleurs montrant les 5 thèmes principaux avec des échantillons ronds et des étiquettes de polices de caractères correspondantes.",
      animation: "fade",
      notes: "Que vous présentiez à un conseil d'administration ou à un public d'étudiants, vous pouvez choisir l'ambiance visuelle idéale."
    },
    {
      number: 7,
      title: "Des Diapos 100% Modifiables",
      content: [
        "Nous n'exportons pas d'images statiques figées.",
        "Le fichier généré est un authentique .pptx Microsoft PowerPoint natif.",
        "Modifiez librement les textes, changez la couleur des formes ou déplacez les éléments.",
        "Incorporez vos propres modèles ou masques de diapositives d'entreprise."
      ],
      visualElements: "Double flèche symétrique montrant l'interopérabilité fluide entre notre interface web et Microsoft PowerPoint / Google Slides.",
      animation: "zoom",
      notes: "L'interopérabilité est totale. Une fois le document téléchargé, vous êtes totalement libre de modifier les polices ou les marges selon vos habitudes scolaires ou professionnelles."
    },
    {
      number: 8,
      title: "L'Analyse Précise des Documents",
      content: [
        "Importez vos notes brutes, documents copiés-collés d'articles ou rapports financiers.",
        "Idéal pour synthétiser un rapport d'activité annuel volumineux en un format concis.",
        "L'IA repère automatiquement les chiffres clés et faits marquants.",
        "Les grandes thématiques sont préservées grâce à un découpage en sections cohérentes."
      ],
      visualElements: "Illustration d'un grand livre se synthétisant dans de petites fiches thématiques ultra-ordonnées.",
      animation: "fade-in",
      notes: "Passez d'un texte de 10 pages à une présentation claire et mémorable en un seul clic grâce au traitement linguistique avancé."
    },
    {
      number: 9,
      title: "La Notion d'Impact Visuel",
      content: [
        "Pour chaque diapositive, l'IA propose un visuel adapté.",
        "Suggestions claires : carte mentale, entonnoir de vente, organigramme, graphique circulaire.",
        "Indication sur l'interprétation des données proposées.",
        "Réglementation de l'attention de l'auditeur sur la zone clé."
      ],
      visualElements: "Illustration d'un œil fixé sur un point central d'infographie mettant en avant le circuit de balayage visuel naturel d'un public.",
      animation: "slide-down",
      notes: "L'impact visuel est garanti car chaque suggestion proposée par l'application provient d'études d'ergonomie cognitive."
    },
    {
      number: 10,
      title: "Notre Technologie Client-Serveur",
      content: [
        "Le serveur gère l'appel à la puissante API Gemini de manière sécurisée.",
        "La clé d'API reste totalement invisible du navigateur de l'utilisateur.",
        "Le client compile les règles et génère le fichier binaire PowerPoint en local.",
        "Une rapidité et une sécurité des données inégalées pour votre entreprise."
      ],
      visualElements: "Un schéma de communication d'architecture Cloud de type Client ➔ Serveur Express sécurisé ➔ API Gemini ➔ Retour au client.",
      animation: "fade",
      notes: "Sachez que vos données sensibles sont sécurisées car l'analyse s'effectue au niveau de nos serveurs sécurisés et le fichier pptx final est assemblé directement sur votre machine."
    },
    {
      number: 11,
      title: "Maximiser la Prise de Parole",
      content: [
        "Ne lisez pas vos diapositives. Utilisez-les pour illustrer vos dires.",
        "Les listes à puces d'Expert Diapos résument l'esprit de vos thèses.",
        "Les notes automatiques fournissent les transitions idéales entre vos idées.",
        "Adoptez une gestuelle ouverte et un rythme calme pour capter l'intérêt."
      ],
      visualElements: "Schéma d'un présentateur souriant face à une salle d'audience, montrant les pourcentages de captabilité (70% langage corporel, 20% diaporama, 10% mots).",
      animation: "fade-in",
      notes: "Votre support visuel est un allié, pas un prompteur. Appuyez-vous sur les notes rédigées pour interagir avec sincérité."
    },
    {
      number: 12,
      title: "Outils Collaboratifs",
      content: [
        "Les diapositives PowerPoint exportées sont partageables avec vos collègues.",
        "Modifiables en équipe sur Teams, Microsoft 365 ou Google Drive.",
        "Partagez un document fiable et normalisé sans soucis de compatibilité.",
        "Uniformisation des productions de vos collaborateurs industriels."
      ],
      visualElements: "Bulles de dialogue connectées représentant le travail d'équipe et la fluidité des modifications en réseau.",
      animation: "spin-icon",
      notes: "Parce que nous générons le format universel PPTX, la collaboration avec vos équipes internes et clients externes est instantanée."
    },
    {
      number: 13,
      title: "Astuces : Choisir son Ton",
      content: [
        "Ton Académique : parfait pour l'enseignement, solide et rigoureux.",
        "Ton Commercial : persuasif, centré sur la promesse de valeur et le retour d'investissement.",
        "Ton Créatif : surprenant, plus décontracté, idéal pour l'art ou la communication.",
        "Ton Start-up : axé sur l'innovation technologique, dynamique et chiffré."
      ],
      visualElements: "Graphique en radar croisant les dimensions de formalité, créativité, densité technique et persuasion selon le profil de ton choisi.",
      animation: "fade-in",
      notes: "En choisissant le bon ton lors de l'envoi de votre base documentaire, l'IA adaptera l'ensemble du vocabulaire utilisé pour correspondre à vos attentes."
    },
    {
      number: 14,
      title: "Prochaines Innovations",
      content: [
        "Import direct de fichiers audio pour transcrire vos réunions en présentations.",
        "Intégration d'un générateur d'images vectorielles coordonnées au thème retenu.",
        "Déploiement de widgets de chartes d'entreprise importables en un fichier JSON.",
        "Extensions de modules pour les outils de visioconférence courants."
      ],
      visualElements: "Une liste chronologique élégante avec des cercles de progression colorés pour chaque jalon futur de construction.",
      animation: "slide-left",
      notes: "L'avenir d'Expert Diapos s'annonce passionnant avec des fonctions uniques de conversion de médias en diapo en un clin d’œil."
    },
    {
      number: 15,
      title: "Conclusion : Essayer Expert Diapos",
      content: [
        "Préparez une présentation d'expert en moins de 2 minutes chrono.",
        "Supprimez l'angoisse de la page blanche pour vos projets futurs.",
        "Une clarté d'exposition validée par des professionnels du design.",
        "Faites l'expérience dès aujourd'hui et libérez votre temps précieux !"
      ],
      visualElements: "Grand icône brillant de flèche vers la droite pointant vers un bouton d'action 'Exporter' entouré de petits éclats dorés.",
      animation: "zoom-on-action",
      notes: "Pour conclure, Expert Diapos redéfinit la productivité professionnelle. Nous vous invitons à exporter cette démo ou à générer votre PowerPoint personnalisé dès maintenant."
    }
  ]
};
