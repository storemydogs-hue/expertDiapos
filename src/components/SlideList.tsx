import React from "react";
import { Slide, SlideTheme } from "../types";
import { ArrowUp, ArrowDown, Plus, Trash2, FileOutput, ListOrdered, Layers } from "lucide-react";

interface SlideListProps {
  slides: Slide[];
  theme: SlideTheme;
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlideUp: (index: number) => void;
  onMoveSlideDown: (index: number) => void;
  onExport: () => void;
}

export default function SlideList({
  slides,
  theme,
  currentIndex,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  onExport,
}: SlideListProps) {
  return (
    <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      
      {/* Header Info */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Séquence ({slides.length})
        </span>
        
        {/* Rapid Add slide btn matching design '+'' */}
        <button
          onClick={onAddSlide}
          className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
          title="Ajouter une diapositive vide"
        >
          +
        </button>
      </div>

      {/* Main interactive thumbnails scroller list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-100/50">
        {slides.map((sl, index) => {
          const isSelected = index === currentIndex;
          const isCover = sl.number === 1;

          return (
            <div
              key={index}
              onClick={() => onSelectSlide(index)}
              className={`group relative p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 text-left ${
                isSelected
                  ? "border-orange-600 bg-white shadow-md ring-1 ring-orange-100"
                  : "border-slate-200 hover:border-slate-300 bg-white opacity-70 hover:opacity-100"
              }`}
            >
              {/* Thumbnail header and indices */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  #{index + 1}
                </span>

                {isCover && (
                  <span className="text-[8px] bg-orange-100 text-orange-850 font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                    Couverture
                  </span>
                )}

                {/* Micro Thumbnail action panel hovered */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlideUp(index);
                    }}
                    disabled={index === 0}
                    className="p-0.5 bg-slate-100 text-slate-600 rounded disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-200"
                    title="Monter la diapo"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlideDown(index);
                    }}
                    disabled={index === slides.length - 1}
                    className="p-0.5 bg-slate-100 text-slate-600 rounded disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-200"
                    title="Descendre la diapo"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  {slides.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(index);
                      }}
                      className="p-0.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100"
                      title="Supprimer la diapo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Miniature visual rendering */}
              <div 
                className={`w-full h-12 border rounded-md my-0.5 p-1.5 flex flex-col justify-between overflow-hidden transition-colors`}
                style={{ 
                  backgroundColor: isSelected ? "#FAF9F5" : "#FFF",
                  borderLeft: `4px solid #${theme.accentHex}` 
                }}
              >
                <div className="text-[9px] font-bold text-slate-700 truncate leading-tight">
                  {sl.title || "(Sans titre)"}
                </div>
                <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono">
                  <span>{sl.content.length} points</span>
                  <span className="uppercase">{sl.animation || "fade"}</span>
                </div>
              </div>

              {/* Tiny notes summary */}
              <div className="text-[9px] text-slate-400 truncate opacity-85 font-medium">
                {sl.notes || "Pas de notes."}
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Export Actions Block */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2">
        <button
          onClick={onExport}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:shadow-orange-100 uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileOutput className="w-4 h-4 text-white" />
          <span>Télécharger .PPTX</span>
        </button>

        <p className="text-[9px] text-slate-400 font-semibold text-center leading-normal">
          Format éditable PowerPoint, Keynote et Google Slides.
        </p>
      </div>

    </div>
  );
}
