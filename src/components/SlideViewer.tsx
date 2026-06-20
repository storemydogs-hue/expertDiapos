import React, { useState } from "react";
import { Slide, SlideTheme } from "../types";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit3, Image, Video, FileText, Check, Sparkles, AlertCircle } from "lucide-react";

interface SlideViewerProps {
  slide: Slide;
  theme: SlideTheme;
  currentIndex: number;
  totalSlides: number;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onPrev: () => void;
  onNext: () => void;
  imageStyle?: string;
  mainTopic?: string;
}

const STYLE_PROMPTS: Record<string, string> = {
  "realistic": "realistic, high-quality detailed commercial studio photograph, realistic presentation-ready high quality layout",
  "illustration": "modern clean colorful detailed graphic vector illustration, corporate narrative flat art",
  "business": "polished corporate business design, crisp charts, premium professional diagrams, elegant executive style representation",
  "minimal": "ultra clean minimalist style, sparse elegant composition, white/light subtle background, spacious layout",
  "3D": "premium high-fidelity 3D rendering style, vibrant glossy clay and glass materials, depth of field isometric render"
};

export default function SlideViewer({
  slide,
  theme,
  currentIndex,
  totalSlides,
  onUpdateSlide,
  onPrev,
  onNext,
  imageStyle,
  mainTopic,
}: SlideViewerProps) {
  const [activeTab, setActiveTab] = useState<"text" | "notes">("text");
  const [imgGenerating, setImgGenerating] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  const handleTriggerImageGeneration = async () => {
    setImgGenerating(true);
    setImgError(null);
    try {
      const styleInstruction = STYLE_PROMPTS[imageStyle || "realistic"] || STYLE_PROMPTS["realistic"];
      const topicPrefix = mainTopic ? `Topic: ${mainTopic}. ` : "";
      const visualPrompt = slide.visualElements || "Professional modern graphic illustration";
      
      const refinedPrompt = `${topicPrefix}Request: ${visualPrompt}. Style guidelines: ${styleInstruction}, professional, clean, presentation ready, 16:9 aspect ratio, high-quality, no watermarks, no text overlay, no text tags.`;

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: refinedPrompt,
          aspectRatio: "16:9",
          title: slide.title,
          content: slide.content.join("\n"),
          style: imageStyle || "realistic"
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Une erreur est survenue lors de la génération de l'image.");
      }

      const data = await response.json();
      if (data.base64) {
        onUpdateSlide({
          ...slide,
          imageUrl: `data:image/jpeg;base64,${data.base64}`
        });
      }
    } catch (err: any) {
      console.error("Image generation failed:", err);
      setImgError(err?.message || "Échec de génération de l'image.");
    } finally {
      setImgGenerating(false);
    }
  };

  // Handle slide title changes
  const handleTitleChange = (val: string) => {
    onUpdateSlide({ ...slide, title: val });
  };

  // Handle specific bullet point edits
  const handleBulletChange = (index: number, val: string) => {
    const updatedBullets = [...slide.content];
    updatedBullets[index] = val;
    onUpdateSlide({ ...slide, content: updatedBullets });
  };

  // Delete a bullet point from the slide
  const handleDeleteBullet = (index: number) => {
    const updatedBullets = slide.content.filter((_, idx) => idx !== index);
    onUpdateSlide({ ...slide, content: updatedBullets });
  };

  // Add a new bullet point to the slide
  const handleAddBullet = () => {
    if (slide.content.length >= 6) return; // Cap at 6 bullets to prevent overflow
    onUpdateSlide({ ...slide, content: [...slide.content, "Nouveau point clé..."] });
  };

  // Edit visual advice
  const handleVisualChange = (val: string) => {
    onUpdateSlide({ ...slide, visualElements: val });
  };

  // Edit presentation notes
  const handleNotesChange = (val: string) => {
    onUpdateSlide({ ...slide, notes: val });
  };

  // Edit animation
  const handleAnimationChange = (val: string) => {
    onUpdateSlide({ ...slide, animation: val });
  };

  const isCover = slide.number === 1;

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full max-w-5xl mx-auto">
      {/* Slide Index Progress Tracker Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs font-sans">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center p-1.5 px-2.5 rounded-lg bg-orange-50 text-orange-850 font-bold text-xs font-mono">
            SLIDE {currentIndex + 1} / {totalSlides}
          </span>
          <p className="text-xs text-slate-500 font-medium hidden sm:inline">
            {isCover ? "Page de couverture" : `Section thématique • Transition recommandée : "${slide.animation || "fade"}"`}
          </p>
        </div>

        {/* Previous / Next Slides bar */}
        <div className="flex items-center gap-1 font-sans">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors rounded-lg flex items-center gap-1 text-xs font-medium cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Précédente
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === totalSlides - 1}
            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors rounded-lg flex items-center gap-1 text-xs font-medium cursor-pointer"
          >
            Suivante <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 16:9 Presentation Canvas Stage Mockup */}
      <div className="relative w-full aspect-[16/9] min-h-[280px] rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 transform select-none bg-slate-50">
        
        {/* Dynamic Theme background configuration */}
        <div className={`absolute inset-0 p-8 sm:p-12 flex flex-col justify-between transition-colors ${theme.bgClass}`}>
          
          {/* Accent Line/Banner Top */}
          <div 
            className="absolute top-0 left-0 right-0 h-2 transition-colors"
            style={{ backgroundColor: `#${theme.accentHex}` }}
          />

          {isCover ? (
            /* ================= COVER SLIDE DESIGN ================= */
            <div className={`absolute inset-0 flex flex-col justify-between p-8 sm:p-12 transition-all ${slide.imageUrl ? "text-white select-none" : ""}`}>
              {slide.imageUrl && (
                <>
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.35]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0 pointer-events-none" />
                </>
              )}
              
              <div className="z-10 flex flex-col justify-center flex-1 relative gap-4">
                <span 
                  className="text-[10px] sm:text-xs font-bold leading-none tracking-widest uppercase px-2.5 py-1 rounded-md self-start"
                  style={{ 
                    backgroundColor: slide.imageUrl ? "rgba(255,255,255,0.15)" : `#${theme.accentHex}20`, 
                    color: slide.imageUrl ? "#ffffff" : `#${theme.titleHex}`,
                    border: slide.imageUrl ? "1px solid rgba(255,255,255,0.2)" : "none"
                  }}
                >
                  Expert Diapos Presenter
                </span>
                
                <h1 className={`text-2xl sm:text-4xl lg:text-5xl leading-tight font-black tracking-tight ${slide.imageUrl ? "text-white" : theme.titleClass}`}>
                  {slide.title || "Titre de la Présentation"}
                </h1>
                
                {slide.content[0] ? (
                  <p className={`text-xs sm:text-sm md:text-base leading-relaxed italic ${slide.imageUrl ? "text-slate-200" : theme.subtitleClass} opacity-90 max-w-[85%]`}>
                    {slide.content[0]}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed italic max-w-[85%]">
                    Générateur de diaporamas éditables par l'IA...
                  </p>
                )}

                {slide.imageUrl && (
                  <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity z-30">
                    <button
                      onClick={handleTriggerImageGeneration}
                      disabled={imgGenerating}
                      className="bg-white/95 hover:bg-white text-slate-800 text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-md flex items-center gap-1 transition-all cursor-pointer font-sans"
                    >
                      {imgGenerating ? "Régénération..." : "Régénérer"}
                    </button>
                    <button
                      onClick={() => onUpdateSlide({ ...slide, imageUrl: undefined })}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-md transition-all cursor-pointer font-sans"
                    >
                      Retirer
                    </button>
                  </div>
                )}
              </div>

              {!slide.imageUrl && (
                <div className="absolute right-8 bottom-12 w-1/3 aspect-[16/10] shrink-0 z-10 self-end select-none">
                  <div className="w-full h-full rounded-2xl bg-slate-100/80 border-2 border-dashed border-orange-200 p-4 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">Couverture IA</span>
                    <button
                      onClick={handleTriggerImageGeneration}
                      disabled={imgGenerating}
                      className="mt-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-xl transition-all cursor-pointer"
                    >
                      {imgGenerating ? "Création..." : "Ajouter Image"}
                    </button>
                  </div>
                </div>
              )}

              <div className={`absolute bottom-4 left-8 right-8 flex items-center justify-between text-[9px] sm:text-xs font-sans z-10 ${slide.imageUrl ? "text-slate-300" : "text-slate-400"}`}>
                <span>Créé via expert-diapos.com</span>
                <span>{new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}</span>
              </div>
            </div>
          ) : (slide.number === 2 || (slide.title && slide.title.toLowerCase().match(/sommaire|table des matières|agenda|summary|overview/i) !== null)) ? (
            /* ================= SUMMARY LAYOUT (INFOGRAPHIC) ================= */
            <div className="flex-1 flex flex-col justify-between p-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                  <h2 className={`text-lg sm:text-2xl ${theme.titleClass} line-clamp-1`}>
                    {slide.title || "Table des Matières"}
                  </h2>
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-medium text-slate-400">
                  SOMMAIRE • SLIDE 2
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 my-3 sm:my-4 items-center">
                {slide.content.map((point, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 sm:p-4 rounded-xl border flex items-start gap-3 shadow-xs hover:shadow-sm transition-all"
                    style={{ 
                      backgroundColor: `#${theme.cardBgHex}30`, 
                      borderColor: `#${theme.accentHex}25` 
                    }}
                  >
                    <div 
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs"
                      style={{ 
                        backgroundColor: `#${theme.accentHex}`, 
                        color: "#ffffff"
                      }}
                    >
                      0{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold leading-snug ${theme.titleClass}`}>
                        Section {idx + 1}
                      </p>
                      <p className={`text-[10px] sm:text-xs leading-normal font-medium mt-0.5 ${theme.textClass} line-clamp-2`}>
                        {point}
                      </p>
                    </div>
                  </div>
                ))}
                
                {slide.content.length === 0 && (
                  <div className="col-span-2 text-center text-xs text-slate-400 italic py-6 font-sans">
                    Aucun point inscrit dans le sommaire. Cliquez sur les boutons d'édition pour en ajouter.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9px] text-slate-400 shrink-0 font-sans">
                <span>Structure de narration dynamique</span>
                <span className="font-mono bg-orange-100 text-orange-950 px-2 py-0.5 rounded border border-orange-200 font-bold uppercase tracking-wider text-[8px]">
                  Infographie Sommaire
                </span>
              </div>
            </div>
          ) : (slide.number === totalSlides || (slide.title && slide.title.toLowerCase().match(/conclusion|synthèse|remerciements|merci|contact|fin|thank you/i) !== null)) ? (
            /* ================= CONCLUSION LAYOUT (HERO IMAGE) ================= */
            <div className="flex-1 flex flex-col justify-between p-2">
              <div className="flex items-start justify-between">
                <h2 className={`text-lg sm:text-2xl ${theme.titleClass} line-clamp-1`}>
                  {slide.title || "Conclusion"}
                </h2>
                <span className="text-[10px] sm:text-xs font-mono font-medium text-slate-400">
                  CONCLUSION • FINAL
                </span>
              </div>

              <div className="grid grid-cols-12 gap-5 sm:gap-7 items-center flex-1 my-3 sm:my-4">
                <div className={slide.imageUrl ? "col-span-6 space-y-2 sm:space-y-3" : "col-span-12 space-y-2 sm:space-y-3"}>
                  <ul className="space-y-2.5">
                    {slide.content.slice(0, 3).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-medium">
                        <span 
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" 
                          style={{ backgroundColor: `#${theme.accentHex}` }}
                        />
                        <p className={`${theme.textClass} font-semibold leading-normal`}>{point}</p>
                      </li>
                    ))}
                    {slide.content.length === 0 && (
                      <p className="text-xs text-slate-400 italic font-sans animate-fade">Merci pour votre attention.</p>
                    )}
                  </ul>
                </div>

                {/* Right side: prominent full size Hero Image */}
                {slide.imageUrl ? (
                  <div className="col-span-6 h-full flex flex-col justify-center">
                    <div className="w-full h-full min-h-[140px] relative rounded-xl overflow-hidden shadow-lg border border-slate-200/50 bg-white group">
                      <img 
                        src={slide.imageUrl} 
                        alt="Conclusion Hero" 
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <button
                          onClick={handleTriggerImageGeneration}
                          disabled={imgGenerating}
                          className="bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-extrabold py-1.5 px-3 rounded-lg shadow-md flex items-center gap-1 transition-all cursor-pointer font-sans"
                        >
                          <Sparkles className="w-3 h-3 text-orange-500" /> Régénérer
                        </button>
                        <button
                          onClick={() => onUpdateSlide({ ...slide, imageUrl: undefined })}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-extrabold py-1 px-3 rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-6 h-full flex flex-col justify-center">
                    <div 
                      className="w-full rounded-xl p-4 border-2 border-dashed flex flex-col justify-center items-center text-center h-full min-h-[140px]"
                      style={{ 
                        backgroundColor: `#${theme.cardBgHex}20`, 
                        borderColor: `#${theme.accentHex}40` 
                      }}
                    >
                      <span className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: `#${theme.accentHex}` }}>
                        Image de Fin d'Impact
                      </span>
                      <p className="text-[10px] text-slate-400 max-w-[80%] leading-relaxed font-sans">
                        Ajoutez un visuel final de haute qualité pour marquer l'audience.
                      </p>
                      <button
                        onClick={handleTriggerImageGeneration}
                        disabled={imgGenerating}
                        className="mt-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                        <span>{imgGenerating ? "Génération..." : "Générer Hero Image"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9px] text-slate-400 shrink-0 font-sans">
                <span>Tous droits réservés • Expert Diapos</span>
                <span className="font-mono bg-orange-100 text-orange-950 px-2 py-0.5 rounded border border-orange-200 font-bold uppercase tracking-wider text-[8px]">
                  Hero Layout Conclusion
                </span>
              </div>
            </div>
          ) : (
            /* ================= CONTENT SLIDE DESIGN (60% Text, 40% Image) ================= */
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Slide Header */}
              <div className="flex items-start justify-between">
                <h2 className={`text-lg sm:text-2xl ${theme.titleClass} line-clamp-2 pr-6`}>
                  {slide.title || "Titre de Diapositive"}
                </h2>
                
                <span className="text-[10px] sm:text-xs font-mono font-medium text-slate-400">
                  SLIDE {slide.number || currentIndex + 1}
                </span>
              </div>

              {/* Grid with 60% text (col-span-7) and 40% image (col-span-5) */}
              <div className="grid grid-cols-12 gap-5 sm:gap-7 items-stretch flex-1 my-3 sm:my-5 content-center">
                
                {/* Left side: 60% Text */}
                <div className="col-span-12 md:col-span-7 flex flex-col justify-start">
                  <ul className="space-y-2 sm:space-y-3">
                    {slide.content.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                        <span 
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 shrink-0" 
                          style={{ backgroundColor: `#${theme.accentHex}` }}
                        />
                        <p className={`${theme.textClass} font-medium leading-normal`}>{point}</p>
                      </li>
                    ))}
                    {slide.content.length === 0 && (
                      <p className="text-xs text-slate-400 italic font-sans">Aucun point clé rédigé. Cliquez ci-dessous pour en ajouter un.</p>
                    )}
                  </ul>
                </div>

                {/* Right side: 40% Image */}
                <div className="col-span-12 md:col-span-5 flex flex-col relative overflow-hidden">
                  {slide.imageUrl ? (
                    <div className="w-full h-full relative group rounded-xl overflow-hidden shadow-md border border-slate-200/50 bg-white">
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.title} 
                        className="w-full h-full object-cover rounded-xl font-sans"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <button
                          onClick={handleTriggerImageGeneration}
                          disabled={imgGenerating}
                          className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold py-2 px-4 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                          {imgGenerating ? "Génération..." : "Régénérer"}
                        </button>
                        <button
                          onClick={() => onUpdateSlide({ ...slide, imageUrl: undefined })}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-extrabold py-1 px-3 rounded-lg shadow-sm transition-all cursor-pointer font-sans"
                        >
                          Retirer l'image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full rounded-xl p-3 sm:p-4 border flex flex-col justify-between text-left h-full"
                      style={{ 
                        backgroundColor: `#${theme.cardBgHex}`, 
                        borderColor: `#${theme.accentHex}40` 
                      }}
                    >
                      <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                        <div className="flex items-center gap-1.5">
                          <Image className="w-3.5 h-3.5" style={{ color: `#${theme.accentHex}` }} />
                          <span className="text-[10px] font-bold tracking-wider" style={{ color: `#${theme.accentHex}` }}>
                            SUGGESTION VISUELLE
                          </span>
                        </div>
                        <p className={`text-[11px] sm:text-xs leading-relaxed ${theme.textClass} pr-2 opacity-90 flex-1`}>
                          {slide.visualElements || "Insérer un graphique, cliché de couverture ou diagramme d'explication ici."}
                        </p>
                      </div>

                      {/* Instant slide image generation button */}
                      <div className="my-2 select-none shrink-0 text-left">
                        <button
                          onClick={handleTriggerImageGeneration}
                          disabled={imgGenerating}
                          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black text-[10px] sm:text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-orange-500/10"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                          <span>{imgGenerating ? "Génération de l'image..." : "Générer cette illustration IA"}</span>
                        </button>
                        {imgError && (
                          <p className="text-[9px] text-rose-500 font-bold mt-1 inline-flex items-center gap-0.5 leading-snug">
                            <AlertCircle className="w-2.5 h-2.5 shrink-0" /> {imgError}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 text-[9px] text-slate-400 shrink-0 font-sans">
                        <span>Transition recommandée</span>
                        <span className="font-mono bg-white/65 px-1.5 py-0.5 rounded border border-slate-200/20 text-slate-500 font-bold">
                          {slide.animation || "fade"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Content Slide Footer */}
              <div className="flex items-center justify-between border-t border-slate-200/20 pt-1.5 text-[9px] text-slate-400 shrink-0 font-sans">
                <span>Expert Diapos | expert-diapos.com</span>
                <span>Diapositive {slide.number || currentIndex + 1} / {totalSlides}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Customizer / Workstation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Toggle between Slide Text and speaker notes */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === "text"
                ? "bg-white text-orange-600 border-b-2 border-orange-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Edit3 className="w-4 h-4" /> Texte & Visuels Diapositive
          </button>
          
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === "notes"
                ? "bg-white text-orange-600 border-b-2 border-orange-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Notes de l'orateur (Speaker Notes)
          </button>
        </div>

        {/* WORKSTATION CONTENT PANELS */}
        <div className="p-5 font-sans">
          {activeTab === "text" ? (
            <div className="space-y-4">
              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Titre de la Diapositive
                </label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Introduisez le titre abrégé de la slide"
                  className="w-full px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-5/50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl focus:outline-none transition-colors"
                />
              </div>

              {/* Bullet points collection editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isCover ? "Sous-titre / Texte de couverture" : "Points Clés de Contenu (3 à 5 recommandés)"}
                  </label>
                  {!isCover && slide.content.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddBullet}
                      className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter un point
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {slide.content.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-500 font-mono">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleBulletChange(index, e.target.value)}
                        placeholder="Insérez votre argument clé ci-desus"
                        className="flex-1 px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg focus:outline-none focus:border-orange-400"
                      />
                      {!isCover && slide.content.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBullet(index)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer ce point clé"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide specific decoration elements advice and slide animation selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                
                {/* Visual suggestion description input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Image className="w-3.5 h-3.5 text-slate-400" /> Suggestion Élément Visuel
                    </span>
                    {slide.imageUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateSlide({ ...slide, imageUrl: undefined })}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                      >
                        Retirer l'image générée
                      </button>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={slide.visualElements}
                      onChange={(e) => handleVisualChange(e.target.value)}
                      placeholder="Saisissez la description de l'illustration parfaite..."
                      className="flex-1 px-3 py-2 text-xs text-slate-700 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 leading-relaxed resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleTriggerImageGeneration}
                      disabled={imgGenerating}
                      className="shrink-0 px-3 bg-orange-50 hover:bg-orange-100 disabled:bg-slate-55 border border-orange-200 disabled:border-slate-300 text-orange-700 disabled:text-slate-400 rounded-xl font-extrabold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1 min-w-[75px] transition-all cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-orange-600 ${imgGenerating ? 'animate-spin' : ''}`} />
                      <span>{imgGenerating ? "IA..." : "Générer"}</span>
                    </button>
                  </div>
                </div>

                {/* Transition Choice selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-slate-400" /> Effet d'animation / Transition
                  </label>
                  <select
                    value={slide.animation}
                    onChange={(e) => handleAnimationChange(e.target.value)}
                    className="w-full text-xs font-medium text-slate-700 bg-slate-50 py-2.5 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400"
                  >
                    <option value="fade">Fondu Standard (fade)</option>
                    <option value="slide-in-right">Balayage de la droite (slide-in-right)</option>
                    <option value="slide-up-staggered">Entrée étagée par le bas (slide-up-staggered)</option>
                    <option value="zoom-on-heading">Zoom progressif sur le titre</option>
                    <option value="zoom-on-chart">Mise en relief du graphique</option>
                    <option value="fade-slide">Glissement doux et fondu</option>
                  </select>
                  <p className="text-[10px] text-slate-400 font-medium">L'effet s'applique lors du passage à cette diapositive.</p>
                </div>

              </div>
            </div>
          ) : (
            /* presenter speaker notes editor */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-orange-950 uppercase tracking-wider">
                    Notes complémentaires de l'Orateur
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Rédigez ici ce que vous direz précisément de vive voix à vos interlocuteurs.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-orange-600 bg-orange-50 font-bold px-2 py-0.5 rounded-md">
                  Généré par IA
                </span>
              </div>

              <textarea
                rows={5}
                value={slide.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Rédigez vos notes de discours guidées pour guider votre présentation..."
                className="w-full px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed font-sans"
              />
              <p className="text-[11px] text-slate-400 tracking-wide font-medium">
                Conseil de Pro : Évitez de lire votre diapositive mot à mot. Utilisez ces notes pour garder un débit naturel et capter le contact visuel.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
