import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
// @ts-ignore
import logo from "./assets/logo_Expert_Diapos.png";
import { 
  Sparkles, 
  FileOutput, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  ChevronDown, 
  Globe, 
  FolderClosed, 
  History, 
  User as UserIcon, 
  Search, 
  Menu, 
  Paperclip, 
  ArrowUp, 
  Plus, 
  Sparkle,
  Upload,
  AlertCircle,
  Image,
  ExternalLink,
  ChevronRight,
  Monitor,
  Zap,
  Target,
  LogOut
} from "lucide-react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { AuthModal } from "./components/AuthModal";
import { PersonalDetails } from "./components/PersonalDetails";
import { INITIAL_PRESENTATION, THEMES, PRESETS } from "./data";
import { PresentationData, Slide, SlideTheme } from "./types";
import { exportPresentationToPPTX } from "./pptxExporter";
import { translations, Language, Translation } from "./translations";

// Import custom modular components
import SidebarInput from "./components/SidebarInput";
import SlideList from "./components/SlideList";
import SlideViewer from "./components/SlideViewer";

// Bespoke mock presentation templates loaded when a recommendation is clicked
const TEMPLATE_PRESETS: Record<string, PresentationData & { themeId: string }> = {
  "geometric": {
    themeId: "geometric-balance",
    title: "Intelligence Artificielle & Productivité",
    subtitle: "Révolution des flux de travail en 2026",
    slides: [
      {
        number: 1,
        title: "L'IA Générative en Entreprise",
        content: [
          "Optimisation des processus opérationnels de 40%.",
          "Automatisation intelligente des tâches cognitives répétitives.",
          "Personnalisation massive du service client en temps réel.",
          "Génération de valeur ajoutée par l'analyse prédictive."
        ],
        visualElements: "Blocs asymétriques orange vif avec typographie noire imposante et contrastes élégants.",
        animation: "fade-in",
        notes: "Bienvenue à tous. Nous allons analyser l'intégration stratégique des intelligences artificielles au coeur de l'entreprise moderne."
      },
      {
        number: 2,
        title: "Sommaire Thématique",
        content: [
          "1. L'état de l'art technologique actuel.",
          "2. Les trois piliers de l'intégration IA.",
          "3. Analyse de rentabilité et KPIs clés.",
          "4. Plan de déploiement progressif.",
          "5. Synthèse et recommandations d'action."
        ],
        visualElements: "Frise numérique épurée avec alignements horizontaux précis.",
        animation: "slide-in-right",
        notes: "Voici l'ordre de passage de nos analyses pragmatiques de l'automatisation."
      },
      {
        number: 3,
        title: "Le Défi : Transition sans Friction",
        content: [
          "Besoin d'accompagnement au changement des équipes de production.",
          "Risque de perte de repères devant les nouveaux outils.",
          "Formation continue nécessaire pour maximiser l'adoption à 100%.",
          "Gestion éthique et sécurisée des données de l'entreprise."
        ],
        visualElements: "Schéma d'engrenage dual illustrant l'humain et la technologie travaillant de concert.",
        animation: "zoom-on-heading",
        notes: "Nous devons mettre l'accent sur l'accompagnement humain pour surmonter les réticences initiales."
      },
      {
        number: 4,
        title: "Conclusion : L'Humain Augmenté",
        content: [
          "L'intelligence artificielle ne remplace pas, elle décuple les talents.",
          "Focalisation des collaborateurs sur les tâches à haute valeur créative.",
          "Amélioration mesurable du bien-être au travail de 15%.",
          "Rejoignez le mouvement de la transformation agile dès aujourd'hui."
        ],
        visualElements: "Slide d'impact avec un fond sombre et texte en lettres majuscules orange vif.",
        animation: "fade-in",
        notes: "En somme, l'IA est un formidable levier d'émancipation créative pour vos salariés."
      }
    ]
  },
  "corporate": {
    themeId: "corporate-blue",
    title: "Rapport d'Activité Annuel Novacorp",
    subtitle: "Résultats opérationnels et financiers de l'année",
    slides: [
      {
        number: 1,
        title: "Rapport d'Activité Annuel",
        content: [
          "Croissance organique globale de +14.2% sur les douze derniers mois.",
          "Expansion réussie de nos activités sur le marché européen.",
          "Optimisation de la marge d'exploitation de +180 points de base.",
          "Investissement de 8.5M€ dans la décarbonation de nos flux logistiques."
        ],
        visualElements: "Design épuré sur fond blanc avec un coin bleu marine d'allure très traditionnelle.",
        animation: "fade-in",
        notes: "Bonjour mesdames et messieurs, je suis ravi de vous présenter nos résultats opérationnels records pour l'exercice écoulé."
      },
      {
        number: 2,
        title: "Performance par Division",
        content: [
          "Division Services : CA de 34M€, en progression notable de +19%.",
          "Division Solutions Cloud : Nouveau moteur de croissance solide du groupe.",
          "Activités historiques : Stabilité rassurante de la rentabilité opérationnelle.",
          "Synergies inter-filiales : Économies d'échelle substantielles constatées."
        ],
        visualElements: "Graphique à colonnes comparatif montrant les performances respectives des divisions.",
        animation: "zoom-on-chart",
        notes: "Nos investissements dans les services numériques portent leurs fruits avec une division cloud en plein essor."
      },
      {
        number: 3,
        title: "Perspectives Stratégiques 2026",
        content: [
          "Déploiement de notre offre d'infrastructures optimisées IA.",
          "Relocalisation d'usines de conditionnement en circuits courts.",
          "Objectif de croissance pérenne fixé à +12% pour l'exercice à venir.",
          "Maintien d'un dividende attractif de 2.40€ par action."
        ],
        visualElements: "Frise fléchée vers l'avant montrant la trajectoire de croissance.",
        animation: "slide-up-staggered",
        notes: "Notre feuille de route pour 2026 vise à consolider notre leadership tout en réduisant notre empreinte carbone."
      }
    ]
  },
  "minimalist": {
    themeId: "minimalist-charcoal",
    title: "Stratégie RSE Horizon 2026",
    subtitle: "Engagement pour un avenir industriel responsable",
    slides: [
      {
        number: 1,
        title: "Stratégie RSE Horizon 2026",
        content: [
          "Réduction drastique de -35% de notre empreinte carbone nette.",
          "Transition verte des usines : 80% d'énergies renouvelables d'ici 2026.",
          "Économie circulaire : Réutilisation de 90% des métaux résiduels.",
          "Index d'égalité salariale stricte hommes/femmes ciblé à 98/100."
        ],
        visualElements: "Mise en page ultra-minimaliste noire et blanche avec une touche subtile de vert émeraude.",
        animation: "fade-in",
        notes: "Aujourd'hui, nous présentons un plan d'actions concret, chiffré et audité pour notre responsabilité sociétale."
      },
      {
        number: 2,
        title: "Économie Circulaire Interne",
        content: [
          "Zéro plastique à usage unique dans l'ensemble de nos bureaux mondiaux.",
          "Valorisation totale de nos rebuts de cuivre et aluminium.",
          "Création d'une filière de réemploi avec des partenaires locaux.",
          "Réduction de 45% de notre consommation d'eau industrielle."
        ],
        visualElements: "Icône de boucle d'infographie épurée entourée de lignes minimalistes fines.",
        animation: "staggered-points",
        notes: "Chaque tonne de rebut de métal est réinjectée dans notre fonderie, réduisant notre besoin d'approvisionnement externe."
      }
    ]
  },
  "academic": {
    themeId: "academic-forest",
    title: "L'IA dans l'Éducation Supérieure",
    subtitle: "Rapport académique sur l'évolution de la pédagogie",
    slides: [
      {
        number: 1,
        title: "L'IA dans l'Éducation Moderne",
        content: [
          "Tutorat personnalisé disponible 24h/24 ajusté au profil cognitif.",
          "Soutien didactique aux enseignants pour la conception d'examens.",
          "Brainstorming interactif et simulation de scénarios de recherche.",
          "Besoin urgent de former les étudiants à l'éthique de la vérification."
        ],
        visualElements: "Modèle classique crème avec bordures forêt sombres et lettres élégantes en Playfair Display.",
        animation: "fade-in",
        notes: "Cette recherche étudie comment l'apparition de l'intelligence artificielle générative bouleverse la dynamique enseignant-étudiant."
      },
      {
        number: 2,
        title: "Recommandations Politiques",
        content: [
          "Adapter l'évaluation en valorisant la pensée critique et l'oral.",
          "Rédiger une Charte de l'Intégrité Numérique par établissement.",
          "Former 100% du corps enseignant au prompt engineering rigoureux.",
          "Garantir l'égalité d'accès pour éviter la fracture numérique."
        ],
        visualElements: "Tableau récapitulatif structuré sur fond beige avec séparateurs fins.",
        animation: "slide-up-staggered",
        notes: "Nous devons cesser de sanctionner l'usage de l'IA pour plutôt apprendre à l'utiliser avec rigueur scientifique."
      }
    ]
  }
};

export default function App() {
  const [viewMode, setViewMode] = useState<"home" | "editor" | "profile">("home");
  const [presentation, setPresentation] = useState<PresentationData>(INITIAL_PRESENTATION);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("geometric-balance");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Analyse en cours");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Oreate UI prompt and options states
  const [promptInput, setPromptInput] = useState<string>("");
  const [slideCount, setSlideCount] = useState<number>(15);
  const [currentTone, setCurrentTone] = useState<string>("professionnel");
  const [additionalInstructions, setAdditionalInstructions] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9 HD");
  const [language, setLanguage] = useState<Language>("FR");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommend" | "my">("recommend");

  // Translation helper
  const t = (key: keyof Translation) => {
    const lang = translations[language] || translations["FR"];
    return lang[key];
  };
  const isRTL = language === "AR";

  // AI Automatic Image generation options
  const [autoGenerateImages, setAutoGenerateImages] = useState<boolean>(true);
  const [imageStyle, setImageStyle] = useState<string>("realistic");
  const [mainTopic, setMainTopic] = useState<string>("");
  const [isAutoImageGenerating, setIsAutoImageGenerating] = useState<boolean>(false);
  const [autoImageProgress, setAutoImageProgress] = useState<{current: number, total: number} | null>(null);

  // Auth States
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setViewMode("home");
    triggerToast(t("toast_connected").replace("@gmail.com", "")); // generic logout msg
  };

  // File loading reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Retrieve current active color theme object
  const activeTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];

  // List of mock chat history items
  const [chatHistory, setChatHistory] = useState([
    { id: "h1", title: "🌱 Stratégie RSE Novacorp", type: "minimalist" },
    { id: "h2", title: "🎓 Intelligence Artificielle & Université", type: "academic" },
    { id: "h3", title: "💡 Présentation Expert Diapos v2", type: "geometric" },
    { id: "h4", title: "💼 Pitch Commercial Financer", type: "corporate" }
  ]);

  // Main generator connector
  const handleGenerateSlides = async (
    text: string,
    count: number,
    tone: string,
    instructions: string
  ) => {
    setLoading(true);
    setLoadingStep(t("loading_semantic"));
    
    // Simulate beautiful progressive steps for premium feel
    const stepIntervals = [
      setTimeout(() => setLoadingStep(t("loading_logic")), 2000),
      setTimeout(() => setLoadingStep(t("loading_narration")), 4500),
      setTimeout(() => setLoadingStep(t("loading_visuals")), 7000),
      setTimeout(() => setLoadingStep(t("loading_layout")), 9500),
      setTimeout(() => setLoadingStep(t("loading_polishing")), 12000)
    ];

    try {
      const response = await fetch("/api/generate-slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          slideCount: count,
          tone,
          additionalInstructions: instructions,
          language: language,
        }),
      });

      stepIntervals.forEach(clearTimeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || "Une erreur s'est produite lors de la génération avec l'IA.");
      }

      const data = await response.json();
      if (data && data.presentation) {
        // Formulate and inject slide index numbers properly
        const incomingSlides: Slide[] = data.presentation.slides.map((sl: any, idx: number) => ({
          number: idx + 1,
          title: sl.title || `Diapositive ${idx + 1}`,
          content: Array.isArray(sl.content) ? sl.content : [sl.content].filter(Boolean),
          visualElements: sl.visualElements || "Image illustrative",
          animation: sl.animation || "fade",
          notes: sl.notes || "Pas de notes de présentation prévues.",
        }));

        setPresentation({
          title: data.presentation.title || "Présentation Sans Titre",
          subtitle: data.presentation.subtitle || "Générée par Expert Diapos",
          slides: incomingSlides,
        });

        const extractedTopic = data.presentation.mainTopic || data.presentation.title || "Présentation";
        setMainTopic(extractedTopic);

        // Add to history
        const newHistoryItem = {
          id: Date.now().toString(),
          title: data.presentation.title || "Projet Généré " + (chatHistory.length + 1),
          type: "geometric"
        };
        setChatHistory([newHistoryItem, ...chatHistory]);

        setCurrentIndex(0); // View the newly generated cover slide
        setViewMode("editor"); // Transition to editor view!
        if (autoGenerateImages) {
          triggerToast("🎉 Présentation générée ! Démarrage de l'auto-génération des images IA...");
          handleAutoGenerateImages(incomingSlides, extractedTopic, imageStyle);
        } else {
          triggerToast("🎉 Présentation générée ! Les suggestions d'illustrations sont prêtes (génération d'images désactivée).");
        }
      } else {
        throw new Error("Le format renvoyé par le serveur de génération est incorrect.");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(`❌ Erreur : ${err?.message || "La connexion au serveur d'IA a échoué"}`);
    } finally {
      stepIntervals.forEach(clearTimeout);
      setLoading(false);
    }
  };

  const STYLE_PROMPTS: Record<string, string> = {
    "realistic": "realistic, high-quality detailed commercial studio photograph, realistic presentation-ready high quality layout",
    "illustration": "modern clean colorful detailed graphic vector illustration, corporate narrative flat art",
    "business": "polished corporate business design, crisp charts, premium professional diagrams, elegant executive style representation",
    "minimal": "ultra clean minimalist style, sparse elegant composition, white/light subtle background, spacious layout",
    "3D": "premium high-fidelity 3D rendering style, vibrant glossy clay and glass materials, depth of field isometric render"
  };

  const handleAutoGenerateImages = async (slidesList: Slide[], topic: string, styleKey: string) => {
    setIsAutoImageGenerating(true);
    setAutoImageProgress({ current: 0, total: slidesList.length });
    
    const updatedSlides = [...slidesList];
    const styleInstruction = STYLE_PROMPTS[styleKey] || STYLE_PROMPTS["realistic"];
    
    for (let i = 0; i < updatedSlides.length; i++) {
      setAutoImageProgress({ current: i + 1, total: updatedSlides.length });
      
      const slide = updatedSlides[i];
      if (slide.imageUrl) continue;
      
      try {
        const visualPrompt = slide.visualElements || "Professional corporate concept representation";
        const refinedPrompt = `Topic: ${topic}. Instruction: ${visualPrompt}. Style guidelines: ${styleInstruction}, professional, clean, presentation ready, 16:9 aspect ratio, high-quality, no watermarks, no text overlay, no text tags.`;
        
        console.log(`[Client Queue] Auto-generating image for slide ${i + 1} with prompt:`, refinedPrompt);
        
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: refinedPrompt,
            aspectRatio: "16:9",
          }),
        });
        
        if (res.ok) {
          const imgData = await res.json();
          if (imgData.base64) {
            updatedSlides[i] = {
              ...slide,
              imageUrl: `data:image/jpeg;base64,${imgData.base64}`
            };
            setPresentation(prev => ({
              ...prev,
              slides: [...updatedSlides]
            }));
          }
        }
      } catch (err) {
        console.error(`Auto image failed for slide ${i + 1}:`, err);
      }
      
      // small heartbeat delay
      await new Promise(r => setTimeout(r, 600));
    }
    
    setIsAutoImageGenerating(false);
    setAutoImageProgress(null);
    triggerToast("✨ Génération automatique de toutes les illustrations IA 16:9 terminée !");
  };

  // Trigger quick success alerts
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 5500);
  };

  // Directly load demo presets from Oreate template clicks
  const loadTemplatePreset = (key: string) => {
    const data = TEMPLATE_PRESETS[key];
    if (data) {
      setSelectedThemeId(data.themeId);
      setPresentation({
        title: data.title,
        subtitle: data.subtitle,
        slides: data.slides
      });
      setCurrentIndex(0);
      setViewMode("editor");
      triggerToast(`📁 Thème & Diapositives "${data.title}" importés avec succès !`);
    } else {
      // create a blank template
      setPresentation({
        title: "Nouvelle Présentation",
        subtitle: "Créée à partir du modèle vierge",
        slides: [
          {
            number: 1,
            title: "Titre de votre Diapositive de couverture",
            content: ["Ajoutez vos points de données ou d'argumentation ici", "Cliquez sur l'éditeur pour modifier les textes"],
            visualElements: "Fond uni élégant avec une grille fine de fond.",
            animation: "fade",
            notes: "Bonjour, voici le discours d'introduction rédigé."
          }
        ]
      });
      setCurrentIndex(0);
      setViewMode("editor");
      triggerToast("✨ Nouvelle présentation vierge créée !");
    }
  };

  // Update a single slide state immediately in cascade
  const handleUpdateSlide = (updatedSlide: Slide) => {
    const newSlides = [...presentation.slides];
    newSlides[currentIndex] = updatedSlide;
    setPresentation({
      ...presentation,
      title: currentIndex === 0 ? updatedSlide.title : presentation.title,
      slides: newSlides,
    });
  };

  // Manually insert a blank slide
  const handleAddSlide = () => {
    const newSlides = [...presentation.slides];
    const newSlideNum = newSlides.length + 1;
    const newSlide: Slide = {
      number: newSlideNum,
      title: "Nouvelle Diapositive",
      content: ["Élément clé 1", "Élément clé 2", "Élément clé 3"],
      visualElements: "Insérez la description des images à faire figurer ici.",
      animation: "fade",
      notes: "Voici vos notes d'allocution.",
    };

    newSlides.push(newSlide);
    setPresentation({ ...presentation, slides: newSlides });
    setCurrentIndex(newSlides.length - 1); // jump to new slide
    triggerToast("✨ Nouvelle diapositive ajoutée en fin de présentation !");
  };

  // Delete a slide
  const handleDeleteSlide = (indexToDelete: number) => {
    if (presentation.slides.length <= 1) return;

    const filteredSlides = presentation.slides.filter((_, index) => index !== indexToDelete);
    
    // Re-adjust sequential numbering
    const unifiedSlides = filteredSlides.map((slide, index) => ({
      ...slide,
      number: index + 1,
    }));

    setPresentation({ ...presentation, slides: unifiedSlides });
    
    // Adjust active index safely
    if (currentIndex >= unifiedSlides.length) {
      setCurrentIndex(unifiedSlides.length - 1);
    }
    triggerToast("🗑️ Diapositive supprimée de votre diaporama.");
  };

  // Slide reordering - Upwards
  const handleMoveSlideUp = (index: number) => {
    if (index === 0) return;
    const newSlides = [...presentation.slides];
    const target = newSlides[index];
    newSlides[index] = newSlides[index - 1];
    newSlides[index - 1] = target;

    // Harmonize sequence numbers
    const finalSlides = newSlides.map((slide, idx) => ({
      ...slide,
      number: idx + 1,
    }));

    setPresentation({ ...presentation, slides: finalSlides });
    setCurrentIndex(index - 1);
  };

  // Slide reordering - Downwards
  const handleMoveSlideDown = (index: number) => {
    if (index === presentation.slides.length - 1) return;
    const newSlides = [...presentation.slides];
    const target = newSlides[index];
    newSlides[index] = newSlides[index + 1];
    newSlides[index + 1] = target;

    // Harmonize sequence numbers
    const finalSlides = newSlides.map((slide, idx) => ({
      ...slide,
      number: idx + 1,
    }));

    setPresentation({ ...presentation, slides: finalSlides });
    setCurrentIndex(index + 1);
  };

  // Real PPTX export trigger
  const handleExportPPTX = () => {
    try {
      exportPresentationToPPTX(
        presentation.title,
        presentation.subtitle,
        presentation.slides,
        activeTheme
      );
      triggerToast("📥 Téléchargement démarré ! Votre PowerPoint .pptx est prêt.");
    } catch (err) {
      console.error(err);
      triggerToast("❌ Erreur lors de l'action de génération PowerPoint.");
    }
  };

  // Handle source file uploads
  const triggerFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setPromptInput(text);
          triggerToast(`📎 Document "${file.name}" importé ! Le contenu a été injecté dans la boîte de saisie.`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Rapid submit via prompt capsule
  const handleCapsuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) {
      triggerToast("⚠️ Veuillez entrer un sujet ou importer un document de base.");
      return;
    }
    handleGenerateSlides(promptInput, slideCount, currentTone, additionalInstructions);
  };

  return (
    <div className={`w-full h-screen bg-white font-sans flex text-slate-900 overflow-hidden select-none ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".txt,.md,.pdf,.docx" 
        className="hidden" 
      />

      {/* Toast Notification */}
      {successToast && (
        <div className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 animate-slide-in text-xs font-semibold backdrop-blur-sm bg-opacity-95`}>
          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Oreate AI Styled Left Collapsible Sidebar */}
      <aside 
        className={`bg-slate-50 border-r border-slate-150 h-full flex flex-col justify-between transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } shrink-0`}
      >
        <div className="flex flex-col">
          {/* Brand/Logo Area */}
          <div className="h-16 border-b border-slate-150 px-4 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div 
                className="flex items-center gap-2.5 cursor-pointer" 
                onClick={() => setViewMode("home")}
              >
                <img src={logo} alt="Expert Diapos Logo" className="w-8 h-8 object-contain mix-blend-multiply" />
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900">
                    Expert Diapos
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 -mt-1 uppercase tracking-widest leading-none">
                    Presentation Agent
                  </span>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div 
                className="w-8 h-8 flex items-center justify-center cursor-pointer mx-auto"
                onClick={() => setViewMode("home")}
              >
                <img src={logo} alt="Expert Diapos Logo" className="w-8 h-8 object-contain mix-blend-multiply" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="text-[10px] font-bold text-slate-500 bg-transparent cursor-pointer"
              >
                <option value="EN">EN</option>
                <option value="FR">FR</option>
                <option value="AR">AR</option>
                <option value="ES">ES</option>
                <option value="DE">DE</option>
              </select>
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer sm:block"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <button
              onClick={() => {
                setViewMode("home");
                setPromptInput("");
                triggerToast("💡 Nouveau projet initialisé ! Tapez votre sujet au centre.");
              }}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                viewMode === "home" && !promptInput
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${viewMode === "home" && !promptInput ? "text-orange-500 fill-orange-500" : "text-slate-500"}`} />
              {!sidebarCollapsed && <span>{t("nav_new_project")}</span>}
            </button>

            <button
              onClick={() => setViewMode("editor")}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                viewMode === "editor"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
              }`}
            >
              <FolderClosed className={`w-4 h-4 shrink-0 ${viewMode === "editor" ? "text-orange-500" : "text-slate-500"}`} />
              {!sidebarCollapsed && <span>{t("nav_my_documents")}</span>}
            </button>

            <button
              onClick={() => setViewMode("home")}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 cursor-pointer`}
            >
              <History className="w-4 h-4 shrink-0 text-slate-500" />
              {!sidebarCollapsed && <span>{t("nav_chat_history")}</span>}
            </button>
          </div>

          {/* Collapsible Recent Section */}
          {!sidebarCollapsed && (
            <div className="px-4 py-3 border-t border-slate-150 mt-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>{t("nav_recents")}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="space-y-1.5 h-44 overflow-y-auto pr-1">
                {chatHistory.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => loadTemplatePreset(h.type)}
                    className="w-full text-left py-1.5 px-2 hover:bg-slate-200/40 rounded-lg text-[11px] font-medium text-slate-600 hover:text-slate-900 truncate block transition-colors cursor-pointer"
                    title={h.title}
                  >
                    {h.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile/Footer area - Auth integrated */}
          <div className="p-3 border-t border-slate-150 bg-slate-100/40 cursor-pointer transition-colors group"
               onClick={() => {
                 if (currentUser) {
                   setViewMode("profile");
                 } else {
                   setAuthMode("login");
                   setAuthModalOpen(true);
                 }
               }}
          >
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full border border-orange-100 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 group-hover:border-orange-200 transition-colors">
                  <UserIcon className="w-4 h-4 text-orange-600" />
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-800 truncate leading-none group-hover:text-orange-700">
                    {currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0]) : t("nav_login")}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 truncate leading-tight">
                    {currentUser ? currentUser.email : t("nav_new_project")}
                  </span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && currentUser && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
            {!sidebarCollapsed && !currentUser && (
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-orange-400 transform group-hover:translate-x-0.5 transition-all" />
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        
        {/* Dynamic header navigation */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-16 border-b border-slate-150 px-6 flex items-center justify-between bg-white shrink-0 z-10 font-sans"
        >
          
          {/* Logo & Back/Forward Navigation */}
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setViewMode("home")}
            >
              <img src={logo} alt="Expert Diapos" className="h-8 w-auto mix-blend-multiply" />
            </div>

            <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
              <button
                onClick={() => setViewMode("home")}
                className={`text-xs font-bold px-3 py-1.5 pb-2 cursor-pointer transition-colors ${
                  viewMode === "home" 
                    ? "text-orange-600 border-b-2 border-orange-600" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t("nav_generator")}
              </button>
              <button
                onClick={() => {
                  setViewMode("home");
                  setTimeout(() => document.getElementById("hero-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer hidden lg:block"
              >
                {t("nav_home")}
              </button>
              <button
                onClick={() => {
                  setViewMode("home");
                  setTimeout(() => document.getElementById("branding-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer hidden lg:block"
              >
                {t("nav_about")}
              </button>
              <button
                onClick={() => {
                  setViewMode("home");
                  setTimeout(() => document.getElementById("input-section")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer hidden lg:block"
              >
                {t("nav_generate")}
              </button>
              <button
                className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer hidden lg:block"
                onClick={() => triggerToast(`🚀 ${t("toast_blog_soon")}`)}
              >
                {t("nav_blog")}
              </button>
            </div>
          </div>

          {/* Top-Right utility: Language & Log status */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="relative">
              <div 
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 hover:text-slate-900 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === "FR" ? "Français (FR)" : language === "EN" ? "English (EN)" : language === "AR" ? "العربية (AR)" : language === "ES" ? "Español (ES)" : "Deutsch (DE)"}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showLanguageMenu ? "rotate-180" : ""}`} />
              </div>

              {showLanguageMenu && (
                <div className={`absolute top-full mt-1 ${isRTL ? "left-0" : "right-0"} w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200`}>
                  {(["EN", "FR", "AR", "ES", "DE"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${language === lang ? "text-orange-600 font-bold" : "text-slate-600"}`}
                      dir={lang === "AR" ? "rtl" : "ltr"}
                    >
                      <span>{lang === "EN" ? "English" : lang === "FR" ? "Français" : lang === "AR" ? "العربية" : lang === "ES" ? "Español" : "Deutsch"}</span>
                      {language === lang && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {currentUser && (
                <button 
                  onClick={() => setViewMode("profile")}
                  className={`py-1.5 px-4 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    viewMode === "profile" 
                      ? "bg-orange-600 text-white border-orange-500 shadow-sm" 
                      : "bg-white text-slate-600 hover:text-orange-600 border-slate-200 hover:border-orange-100"
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Mon Profil
                </button>
              )}
              {currentUser ? (
                <button 
                  onClick={handleLogout}
                  className="py-1.5 px-4 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-[11px] font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t("nav_logout") || "Déconnexion"}
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setAuthMode("login");
                      setAuthModalOpen(true);
                    }}
                    className="py-1.5 px-4 rounded-xl text-[11px] font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    {t("nav_login")}
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthModalOpen(true);
                    }}
                    className="py-1.5 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold shadow-sm shadow-orange-200 transition-all cursor-pointer active:scale-95"
                  >
                    {t("nav_signup")}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        {viewMode === "home" ? (
          <div className="flex-1 overflow-y-auto bg-slate-50/30 font-sans">
            <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
              
              {/* Hero Section */}
              <section id="hero-section" className="text-center space-y-12 animate-in fade-in slide-in-from-top-6 duration-1000 ease-out">
                <div className="flex justify-center mb-8">
                  <img src={logo} alt="Expert Diapos" className={`h-20 w-auto mix-blend-multiply ${isRTL ? "scale-x-[-1]" : ""}`} />
                </div>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-[11px] font-black uppercase tracking-[0.2em] animate-bounce-subtle">
                    <Sparkles className="w-4 h-4 fill-orange-700" />
                    <span>{t("hero_badge")}</span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.95] max-w-5xl mx-auto">
                    {t("hero_title_part1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">{t("hero_title_accent")}</span> <br />
                    {t("hero_title_part2")}
                  </h1>
                  <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                    {t("hero_subtitle")}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => {
                      const el = document.getElementById("input-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-3 cursor-pointer"
                  >
                    {t("hero_cta_primary")}
                    <ChevronRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
                  </button>
                  <button 
                    onClick={() => {
                      const el = document.getElementById("branding-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="h-14 px-10 bg-white text-slate-700 border-2 border-slate-150 rounded-2xl font-bold text-base hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    {t("hero_cta_secondary")}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10">
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-slate-900">1s</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("stats_gen")}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-slate-900">100%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("stats_editable")}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-slate-900">4K</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("stats_images")}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-slate-900">Native</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("stats_pptx")}</p>
                  </div>
                </div>
              </section>

              {/* Feature Grid Section */}
              <section id="branding-section" className="pt-20 space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t("features_title")}</h2>
                  <p className="text-slate-500 font-medium max-w-xl mx-auto">
                    {t("features_subtitle")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{t("feature_speed_title")}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {t("feature_speed_desc")}
                    </p>
                  </div>

                  <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group md:translate-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{t("feature_precision_title")}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {t("feature_precision_desc")}
                    </p>
                  </div>

                  <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Monitor className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{t("feature_native_title")}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {t("feature_native_desc")}
                    </p>
                  </div>
                </div>
              </section>

              {/* Input conversational panel */}
              <section id="input-section" className="pt-20 space-y-12 max-w-4xl mx-auto">
                <div className="text-center space-y-4 mb-8">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {t("ready_title_part1")} <br /> 
                    <span className="text-orange-600 italic">{t("ready_title_accent")}</span>
                  </h2>
                </div>
              {/* Voice tone toggle selectors: Professional / Creative / Beautify */}
              <div className="flex justify-center items-center gap-2.5 max-w-sm mx-auto p-1 bg-slate-100 rounded-2xl border border-slate-150 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTone("professionnel");
                    triggerToast(`💼 Mode Ton '${t("input_tone_pro")}' activé.`);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentTone === "professionnel"
                      ? "bg-white text-orange-600 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Sparkle className="w-3 h-3 text-orange-500 fill-orange-500 animate-ping" />
                  <span>{t("input_tone_pro")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentTone("créatif");
                    triggerToast(`🎨 Mode Ton '${t("input_tone_creative")}' activé pour vos slides.`);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentTone === "créatif"
                      ? "bg-white text-orange-600 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>{t("input_tone_creative")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentTone("technologique/start-up");
                    setSelectedThemeId("eclipse-dark");
                    triggerToast(`🚀 Mode Ton '${t("input_tone_minimalist")}' d'inspiration Start-up & Tech sombre activé.`);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentTone === "technologique/start-up"
                      ? "bg-white text-orange-600 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>{t("input_tone_minimalist")}</span>
                </button>
              </div>

              {/* Magnificent central Oreate AI prompt capsule input card */}
              <form 
                onSubmit={handleCapsuleSubmit}
                className="max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-4 flex flex-col gap-3 transition-shadow focus-within:shadow-md"
              >
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={t("input_placeholder")}
                  className="w-full bg-transparent border-none text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 text-sm py-2 leading-relaxed resize-none min-h-[90px] outline-none"
                  disabled={loading}
                />

                {/* Bottom interactive controls line inside the card */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 select-none">
                    
                    {/* Agent badge */}
                    <div className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3 text-orange-500" />
                      <span>Oreate Agent</span>
                    </div>

                    {/* Slides count dropdown */}
                    <div className="relative inline-block text-[10px] font-bold">
                      <select
                        value={slideCount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSlideCount(val);
                          triggerToast(`📏 Format ajusté à un diaporama précis de ${val} diapositives.`);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl py-1.5 px-2.5 cursor-pointer outline-none focus:ring-1 focus:ring-orange-200"
                      >
                        <option value={15}>15 Slides</option>
                        <option value={16}>16 Slides</option>
                        <option value={18}>18 Slides</option>
                        <option value={20}>20 Slides</option>
                      </select>
                    </div>

                    {/* Aspect Ratio dropdown */}
                    <div className="relative inline-block text-[10px] font-bold">
                      <select
                        value={aspectRatio}
                        onChange={(e) => {
                          setAspectRatio(e.target.value);
                          triggerToast(`🖥️ Ratio d'affichage ajusté à ${e.target.value}`);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl py-1.5 px-2.5 cursor-pointer outline-none focus:ring-1 focus:ring-orange-200"
                      >
                        <option value="16:9 HD">16:9 HD</option>
                        <option value="4:3 Standard">4:3 Standard</option>
                        <option value="16:10 Wide">16:10 Wide</option>
                      </select>
                    </div>

                    {/* Image Style dropdown */}
                    <div className="relative inline-block text-[10px] font-bold">
                      <select
                        value={imageStyle}
                        onChange={(e) => {
                          setImageStyle(e.target.value);
                          triggerToast(`🎨 Style visuel de l'illustration défini sur : ${e.target.value}`);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-orange-200 text-orange-700 bg-orange-50/20 rounded-xl py-1.5 px-2.5 cursor-pointer outline-none focus:ring-1 focus:ring-orange-200"
                        title="Style visuel des illustrations générées automatiquement"
                      >
                        <option value="realistic">📸 Photo Réaliste</option>
                        <option value="illustration">🎨 Illustration Graphique</option>
                        <option value="business">💼 Professionnel Business</option>
                        <option value="minimal">📐 Épuré Minimaliste</option>
                        <option value="3D">🚀 Rendu Moderne 3D</option>
                      </select>
                    </div>

                    {/* Automatic Image generation toggle switch */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 hover:bg-slate-100">
                      <input 
                        type="checkbox"
                        checked={autoGenerateImages}
                        onChange={(e) => {
                          setAutoGenerateImages(e.target.checked);
                          triggerToast(e.target.checked ? "🖼️ Génération automatique des images activée." : "🚫 Génération de photos IA désactivée.");
                        }}
                        className="accent-orange-600 w-3.5 h-3.5 cursor-pointer rounded"
                      />
                      <span>Générer images IA</span>
                    </label>


                    {/* Attachment trigger paperclip */}
                    <button
                      type="button"
                      onClick={triggerFileUploadClick}
                      className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="Importer un fichier texte comme source (.txt, .md)"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right: Round submit orange arrow button */}
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-10 h-10 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Générer avec l'Agent"
                    >
                      <ArrowUp className="w-5 h-5 text-white stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Optional inline settings helper text */}
              <div className="max-w-2xl mx-auto flex items-center gap-2 px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-sans">
                <span className="p-0.5 px-1.5 rounded bg-orange-100 text-orange-900 font-bold uppercase text-[9px] tracking-wide">
                  Détail
                </span>
                <span>Copiez-collez vos notes de cours ou imports de rapports. L'IA structure tout en sections homogènes accompagnées d'illustrations d'impact.</span>
              </div>
            </section>

            {/* AI Generator In-progress Screen state */}
            {loading && (
              <div className="max-w-xl mx-auto p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl border border-slate-800 animate-pulse font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping shrink-0" />
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                    Machine IA Active
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold m-0">{loadingStep}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 italic">
                    "Votre diaporama structure de 15 diapositives éditables est en cours d'assemblage logique..."
                  </p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-600 h-full w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {/* Template Previewer Recommendations Section */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                <div className="flex items-center gap-6 font-sans">
                  <button
                    onClick={() => setActiveTab("recommend")}
                    className={`text-xs font-bold pb-2 cursor-pointer transition-all ${
                      activeTab === "recommend" 
                        ? "text-orange-600 border-b-2 border-orange-600 font-extrabold" 
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Recommend Templates
                  </button>
                  <button
                    onClick={() => setActiveTab("my")}
                    className={`text-xs font-bold pb-2 cursor-pointer transition-all ${
                      activeTab === "my" 
                        ? "text-orange-600 border-b-2 border-orange-600 font-extrabold" 
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    My Templates
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-150">
                  <span>Featured</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* Grid of bespoke cards */}
              {activeTab === "recommend" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  
                  {/* Card 1: Vierge / Create template manually */}
                  <div 
                    onClick={() => loadTemplatePreset("")}
                    className="border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-2xl bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer min-h-[170px] transition-all hover:bg-orange-50/10 group group-hover:shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-orange-100 text-slate-500 group-hover:text-orange-600 flex items-center justify-center transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 m-0 group-hover:text-orange-600 transition-colors">
                        Ajouter un modèle vierge
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Démarrez avec une structure de présentation vide.</p>
                    </div>
                  </div>

                  {/* Card 2: Geometric Balance (Défaut style Oreate with vivid orange elements) */}
                  <div 
                    onClick={() => loadTemplatePreset("geometric")}
                    className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="p-4 bg-slate-900 h-28 flex flex-col justify-between text-white relative">
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-[10px] font-bold">ED</div>
                      <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">DESIGN ASYMÉTRIQUE</span>
                      <h4 className="text-xs font-extrabold leading-tight text-white m-0 truncate">Intelligence Artificielle & Entreprises</h4>
                      <span className="text-[8px] opacity-65 font-mono">16:9 • 4 diapositives</span>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-700">Équilibre Géométrique</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                    </div>
                  </div>

                  {/* Card 3: Corporate Business Blue */}
                  <div 
                    onClick={() => loadTemplatePreset("corporate")}
                    className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="p-4 bg-[#0B2545] h-28 flex flex-col justify-between text-white">
                      <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">BUSINESS ÉPURÉ</span>
                      <h4 className="text-xs font-extrabold leading-tight text-white m-0 truncate">Rapport Trimestriel Novacorp</h4>
                      <span className="text-[8px] opacity-65 font-mono">16:9 • 3 diapositives</span>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-700">Bleu Corporatif</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    </div>
                  </div>

                  {/* Card 4: Minimalist Gray Carbon */}
                  <div 
                    onClick={() => loadTemplatePreset("minimalist")}
                    className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="p-4 bg-zinc-800 h-28 flex flex-col justify-between text-white">
                      <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">CLIMATE ROADMAP</span>
                      <h4 className="text-xs font-extrabold leading-tight text-white m-0 truncate">Rapport Écologique & RSE</h4>
                      <span className="text-[8px] opacity-65 font-mono">16:9 • 2 diapositives</span>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-700">Ardoise Minimaliste</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    </div>
                  </div>

                  {/* Card 5: Academic Forest Creme */}
                  <div 
                    onClick={() => loadTemplatePreset("academic")}
                    className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="p-4 bg-[#FDFBF7] border-b border-slate-150 h-28 flex flex-col justify-between text-[#1A3324]">
                      <span className="text-[9px] font-bold text-[#4A5D4E] uppercase tracking-widest">UNIVERSITY REPORT</span>
                      <h3 className="text-xs font-extrabold font-serif leading-tight text-[#1A3324] m-0 truncate">Intégration de l'IA aux Facultés</h3>
                      <span className="text-[8px] opacity-65 font-mono">16:9 • 2 diapositives</span>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-700 font-serif">Ardoise Académique Forest</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-800" />
                    </div>
                  </div>

                  {/* Card 6: Dark Eclipse Tech */}
                  <div 
                    onClick={() => {
                      setSelectedThemeId("eclipse-dark");
                      triggerToast("📱 Thème cyberpunk sombre 'Éclipse' activé. Testez-le sur l'éditeur !");
                      setViewMode("editor");
                    }}
                    className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="p-4 bg-slate-950 h-28 flex flex-col justify-between text-white">
                      <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">CYBERPUNK NEON</span>
                      <h4 className="text-xs font-extrabold leading-tight text-[#2DD4BF] m-0 truncate">Pitch Deck Start-Up Technologique</h4>
                      <span className="text-[8px] opacity-65 font-mono">16:9 • Sombre</span>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-700">Éclipse Sombre</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    </div>
                  </div>

                </div>
              ) : (
                /* My Templates list tab (lists previously loaded items) */
                <div className="p-8 border border-slate-200 rounded-2xl text-center text-slate-400 font-medium text-xs">
                  Aucun autre modèle sauvegardé localement d'une session précédente. <br />
                  Utilisez le bouton ci-dessus pour initier une structure.
                </div>
              )}

            {/* Standard humble footer elements matching picture margins */}
            <footer className="pt-8 border-t border-slate-150 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
              <span className="hover:text-slate-700 cursor-pointer">Affiliate Program</span>
              <span className="hover:text-slate-700 cursor-pointer">Guides</span>
              <span>© {new Date().getFullYear()} Slides Agent</span>
              <span className="hover:text-slate-700 cursor-pointer">Terms & Conditions</span>
              <span className="hover:text-slate-700 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-700 cursor-pointer text-slate-500 underline decoration-orange-500/50">Credits Rules</span>
            </footer>
            </section>
          </div>
        </div>
        ) : viewMode === "profile" ? (
          <PersonalDetails onBack={() => setViewMode("home")} language={language} user={currentUser} />
        ) : (
          /* Full Professional Slides Presentation WORKSPACE */
          <div className="flex-1 flex overflow-hidden transition-all duration-500 animate-in fade-in">
            
            {/* Left Sidebar slide list thumbnails column (SlideList) */}
            <aside className="w-56 lg:w-64 bg-slate-50 border-r border-slate-150 flex flex-col shrink-0 h-full overflow-hidden">
              <SlideList
                slides={presentation.slides}
                theme={activeTheme}
                currentIndex={currentIndex}
                onSelectSlide={(idx) => setCurrentIndex(idx)}
                onAddSlide={handleAddSlide}
                onDeleteSlide={handleDeleteSlide}
                onMoveSlideUp={handleMoveSlideUp}
                onMoveSlideDown={handleMoveSlideDown}
                onExport={handleExportPPTX}
              />
            </aside>

            {/* Active stage view center element (SlideViewer) */}
            <section className="flex-1 bg-slate-200/40 border-r border-slate-150 flex flex-col overflow-hidden h-full">
              <div className="flex-1 overflow-y-auto">
                <SlideViewer
                  slide={presentation.slides[currentIndex] || presentation.slides[0]}
                  theme={activeTheme}
                  currentIndex={currentIndex}
                  totalSlides={presentation.slides.length}
                  onUpdateSlide={handleUpdateSlide}
                  onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  onNext={() => setCurrentIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1))}
                  imageStyle={imageStyle}
                  mainTopic={mainTopic}
                />
              </div>
            </section>

            {/* Right sidebar granular parameter options & topic regenerator (SidebarInput) */}
            <aside className="w-80 bg-white h-full overflow-hidden hidden xl:flex flex-col shrink-0">
              <SidebarInput
                onGenerate={handleGenerateSlides}
                loading={loading}
                onLoadDemo={(preset) => {
                  setPromptInput(preset.content);
                  triggerToast(`💡 ${preset.name.split(" ").slice(1).join(" ")} ${t("toast_demo_selected")}`);
                }}
                t={t}
                language={language}
              />
            </aside>

          </div>
        )}

        {/* Crisp static footer status bar with indicator details */}
        <footer className="h-8 bg-slate-50 border-t border-slate-150 px-4 flex items-center justify-between text-[10px] text-slate-400 font-semibold shrink-0 select-none z-10 font-sans">
          <div className="flex items-center gap-4">
            <span>{t("footer_slides").replace("diaporamas", `${presentation.slides.length} diaporamas`)}</span>
            <span>{t("footer_ratio")} : {aspectRatio}</span>
            <span>{t("footer_format")}</span>
            {isAutoImageGenerating && autoImageProgress && (
              <span className="text-orange-600 animate-pulse font-bold flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                Génération des illustrations IA : {autoImageProgress.current} / {autoImageProgress.total}...
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-orange-600' : isAutoImageGenerating ? 'bg-orange-600 animate-ping' : 'bg-green-500'}`}></span>
              {loading ? (t("sidebar_generating")) : isAutoImageGenerating ? "Illustrations IA..." : "Slides Agent Sync"}
            </span>
          </div>
        </footer>

        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          initialMode={authMode} 
          language={language}
          onSuccess={() => {
            setAuthModalOpen(false);
            setViewMode("profile");
          }}
        />
      </div>
    </div>
  );
}
