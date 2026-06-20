import React, { useState, useRef, useEffect } from "react";
import { Upload, Sparkles, BookOpen, AlertCircle, FileText, Settings, Play } from "lucide-react";
import { PRESETS, DemoPreset } from "../data";

import { Language, Translation } from "../translations";

interface SidebarInputProps {
  onGenerate: (text: string, slideCount: number, tone: string, additionalInstructions: string) => Promise<void>;
  loading: boolean;
  onLoadDemo: (preset: DemoPreset) => void;
  t: (key: keyof Translation) => string;
  language: Language;
}

export default function SidebarInput({ onGenerate, loading, onLoadDemo, t, language }: SidebarInputProps) {
  const [inputText, setInputText] = useState("");
  const [slideCount, setSlideCount] = useState<number>(15);
  const [tone, setTone] = useState<string>("professionnel");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const isRTL = language === "AR";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REASSURANCE_MESSAGES = [
    t("loading_semantic"),
    t("loading_logic"),
    t("loading_narration"),
    t("loading_visuals"),
    t("loading_layout"),
    t("loading_polishing"),
  ];

  // Rotate reassuring loaders when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingMessageIndex(0);
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % REASSURANCE_MESSAGES.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputText.trim()) {
      setError(t("error_empty_input"));
      return;
    }

    try {
      await onGenerate(inputText, slideCount, tone, additionalInstructions);
    } catch (err: any) {
      setError(err?.message || t("error_server"));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setInputText(text);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError(t("error_file_read"));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseFile(e.target.files[0]);
    }
  };

  const selectPreset = (preset: DemoPreset) => {
    setInputText(preset.content);
    setSlideCount(preset.slideCount);
    setTone(preset.tone);
    onLoadDemo(preset);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Configuration Header Panel */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t("sidebar_config")}</label>
        <p className="text-xs text-slate-500 font-medium mt-1">{t("sidebar_slide_gen")}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Presets Slider */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-orange-600" /> {t("sidebar_examples")}
          </label>
          <div className="grid grid-cols-1 gap-1.5 font-sans">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset)}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 transition-all group flex items-start gap-2.5"
                disabled={loading}
              >
                <div className="text-lg leading-none mt-0.5">{preset.name.split(" ")[0]}</div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-orange-600">
                    {preset.name.substring(preset.name.indexOf(" ") + 1)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{preset.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Text Area with drag/drop area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-600" /> {t("sidebar_source")}
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 cursor-pointer"
                disabled={loading}
              >
                <Upload className="w-3 h-3" /> {t("sidebar_import")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.csv,.js,.html"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl transition-all ${
                dragActive
                  ? "border-orange-500 bg-orange-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-55"
              }`}
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("sidebar_input_placeholder")}
                rows={7}
                disabled={loading}
                className="w-full p-4 text-xs leading-relaxed text-slate-600 bg-transparent border-none rounded-xl focus:outline-none focus:ring-0 resize-y min-h-[160px]"
              />
              {inputText.length === 0 && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 text-center select-none opacity-40">
                  <Upload className="w-7 h-7 text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500">
                    {t("sidebar_input_hint")}
                  </p>
                </div>
              )}
            </div>
            {inputText.length > 0 && (
              <p className="text-[11px] text-slate-400 text-right font-mono">
                {inputText.length} {t("label_characters")} • {inputText.split(/\s+/).filter(Boolean).length} {t("label_words")}
              </p>
            )}
          </div>

          {/* Budget Slide count Selector & Tone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Settings className="w-3 h-3 text-orange-600" /> {t("input_slides_count")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="15"
                  max="20"
                  step="1"
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  disabled={loading}
                  className="w-full accent-orange-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-700 font-mono text-center min-w-[20px]">
                  {slideCount}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{t("sidebar_slides_range")}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("sidebar_tone")}
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={loading}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="commercial">📢 {t("tone_commercial")}</option>
                <option value="professionnel">💼 {t("tone_professional")}</option>
                <option value="académique">🎓 {t("tone_academic")}</option>
                <option value="créatif">🎨 {t("tone_creative")}</option>
                <option value="technologique/start-up">🚀 {t("tone_startup")}</option>
              </select>
            </div>
          </div>

          {/* Additional instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("sidebar_instructions")}
            </label>
            <input
              type="text"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              disabled={loading}
              placeholder={t("sidebar_instructions_placeholder")}
              className="w-full p-2.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Trigger button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("sidebar_generating")}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>{t("sidebar_generate")}</span>
              </>
            )}
          </button>
        </form>

        {/* Error alerting */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">{t("error_generation_title")}</span>
              <p className="leading-relaxed opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Dynamic loading process info */}
        {loading && (
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-2.5 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" />
              <span className="text-xs font-bold text-orange-900">{t("ai_engine_name")}</span>
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              &ldquo; {REASSURANCE_MESSAGES[loadingMessageIndex]} &rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Tip helper box aligned with design */}
      <div className="p-4 bg-orange-50 border-t border-orange-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-100 rounded-lg shrink-0">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-[11px] text-orange-850 leading-tight">
            <strong>{t("tip_title")}</strong> {t("tip_description")}
          </p>
        </div>
      </div>
    </div>
  );
}
