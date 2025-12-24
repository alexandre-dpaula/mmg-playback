import React from "react";
import { X, Music2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_KEYS } from "@/utils/chordTransposer";

interface ControlsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: string;
  onKeyChange: (key: string) => void;
  capo: number;
  onCapoChange: (capo: number) => void;
  isPadPlaying: boolean;
  onPadToggle: () => void;
  onEditClick: () => void;
  onEditTrackClick?: () => void;
  showSongMap: boolean;
  onToggleSongMap: (value: boolean) => void;
  showSectionOutlines: boolean;
  onToggleSectionOutlines: (value: boolean) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  columnLayout: boolean;
  onToggleColumnLayout: () => void;
  lyricsOnly: boolean;
  onToggleLyricsOnly: (value: boolean) => void;
}

export const ControlsSidebar: React.FC<ControlsSidebarProps> = ({
  isOpen,
  onClose,
  selectedKey,
  onKeyChange,
  capo,
  onCapoChange,
  isPadPlaying,
  onPadToggle,
  onEditClick,
  onEditTrackClick,
  showSongMap,
  onToggleSongMap,
  showSectionOutlines,
  onToggleSectionOutlines,
  fontSize,
  onFontSizeChange,
  columnLayout,
  onToggleColumnLayout,
  lyricsOnly,
  onToggleLyricsOnly,
}) => {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#1a1a1a] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Cifras Player
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-6">
          {/* Tom (Chord Type) */}
          <div>
            <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
              Tom
            </label>
            <Select value={selectedKey} onValueChange={onKeyChange}>
              <SelectTrigger className="w-full h-12 bg-white/10 border-white/20 text-white font-semibold text-base hover:bg-white/15 transition">
                <SelectValue placeholder={selectedKey} />
              </SelectTrigger>
              <SelectContent className="bg-[#282828] border-white/20 max-h-64">
                {AVAILABLE_KEYS.map((key) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="text-white hover:bg-white/10 focus:bg-white/20 text-base"
                  >
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Capotraste */}
          <div>
              <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
                Capotraste
              </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-white/70 text-sm">
                <span>Casa</span>
                <span className="font-bold text-white text-lg">{capo === 0 ? "Sem capo" : capo}</span>
                <span>12ª</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={capo}
                onChange={(e) => onCapoChange(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1DB954] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1DB954] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onCapoChange(0)}
                  className="flex-1 px-3 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20 hover:bg-white/15 transition"
                >
                  Sem capo
                </button>
                <button
                  onClick={() => onCapoChange(2)}
                  className="flex-1 px-3 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20 hover:bg-white/15 transition"
                >
                  Casa 2
                </button>
                <button
                  onClick={() => onCapoChange(4)}
                  className="flex-1 px-3 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20 hover:bg-white/15 transition"
                >
                  Casa 4
                </button>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div>
            <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
              Ações
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onEditClick}
                className="w-full h-12 px-4 bg-white/10 text-white text-sm font-semibold rounded-lg border border-white/20 uppercase hover:bg-white/15 transition-all duration-200"
              >
                Editar Cifra
              </button>
              {onEditTrackClick && (
                <button
                  type="button"
                  onClick={onEditTrackClick}
                  className="w-full h-12 px-4 bg-white/10 text-white text-sm font-semibold rounded-lg border border-white/20 uppercase hover:bg-white/15 transition-all duration-200"
                >
                  Editar Música
                </button>
              )}
              <button
                type="button"
                onClick={() => onToggleLyricsOnly(!lyricsOnly)}
                className={`w-full h-12 px-4 text-sm font-semibold rounded-lg border uppercase transition-all duration-200 ${
                  lyricsOnly
                    ? "bg-[#1DB954] text-black border-[#1DB954]"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                }`}
              >
                {lyricsOnly ? "Letras Ativo" : "Mostrar Letras"}
              </button>
            </div>
          </div>

          {/* Seções da Música */}
          <div>
            <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
              Song Sections
            </label>

            {/* Song Map Toggle */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2">
              <span className="text-white text-sm font-medium">Song Map</span>
              <button
                onClick={() => onToggleSongMap(!showSongMap)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  showSongMap ? "bg-[#1DB954]" : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    showSongMap ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Section Outlines Toggle */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white text-sm font-medium">
                Section Outlines
              </span>
              <button
                onClick={() => onToggleSectionOutlines(!showSectionOutlines)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  showSectionOutlines ? "bg-[#1DB954]" : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    showSectionOutlines ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Tamanho da Fonte */}
          <div>
            <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
              Tamanho da Fonte
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-white/70 text-sm">
                <span>Menor</span>
                <span className="font-semibold text-white">{fontSize}%</span>
                <span>Maior</span>
              </div>
              <input
                type="range"
                min="80"
                max="200"
                step="10"
                value={fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1DB954] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1DB954] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onFontSizeChange(80)}
                  className="flex-1 px-3 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20 hover:bg-white/15 transition"
                >
                  Pequeno
                </button>
                <button
                  onClick={() => onFontSizeChange(100)}
                  className="flex-1 px-3 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20 hover:bg-white/15 transition"
                >
                  Normal
                </button>
                <button
                  onClick={() => onFontSizeChange(150)}
                  className="flex-1 px-3 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/20 hover:bg-white/15 transition"
                >
                  Grande
                </button>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
              Layout
            </label>
            <button
              type="button"
              onClick={onToggleColumnLayout}
              className={`w-full h-12 px-4 text-sm font-semibold rounded-lg border uppercase transition-all duration-200 ${
                columnLayout
                  ? "bg-[#1DB954] text-black border-[#1DB954]"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/15"
              }`}
            >
              {columnLayout ? "Layout em Colunas Ativo" : "Layout de página de cifras"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
