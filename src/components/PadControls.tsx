import React from "react";
import { Play, Pause } from "lucide-react";

interface PadControlsProps {
  isPadPlaying: boolean;
  onPadToggle: () => void;
  currentPadKey: string | null;
  onPadKeyChange: (key: string) => void;
}

const PAD_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Cores vibrantes para cada tom (inspiradas em drum pads coloridos)
const PAD_COLORS: Record<string, { active: string; shadow: string; hover: string }> = {
  "C": { active: "bg-gradient-to-br from-pink-500 to-pink-600", shadow: "shadow-pink-500/60", hover: "hover:from-pink-600 hover:to-pink-700" },
  "C#": { active: "bg-gradient-to-br from-purple-500 to-purple-600", shadow: "shadow-purple-500/60", hover: "hover:from-purple-600 hover:to-purple-700" },
  "D": { active: "bg-gradient-to-br from-blue-500 to-blue-600", shadow: "shadow-blue-500/60", hover: "hover:from-blue-600 hover:to-blue-700" },
  "D#": { active: "bg-gradient-to-br from-cyan-500 to-cyan-600", shadow: "shadow-cyan-500/60", hover: "hover:from-cyan-600 hover:to-cyan-700" },
  "E": { active: "bg-gradient-to-br from-teal-500 to-teal-600", shadow: "shadow-teal-500/60", hover: "hover:from-teal-600 hover:to-teal-700" },
  "F": { active: "bg-gradient-to-br from-green-500 to-green-600", shadow: "shadow-green-500/60", hover: "hover:from-green-600 hover:to-green-700" },
  "F#": { active: "bg-gradient-to-br from-lime-500 to-lime-600", shadow: "shadow-lime-500/60", hover: "hover:from-lime-600 hover:to-lime-700" },
  "G": { active: "bg-gradient-to-br from-yellow-500 to-yellow-600", shadow: "shadow-yellow-500/60", hover: "hover:from-yellow-600 hover:to-yellow-700" },
  "G#": { active: "bg-gradient-to-br from-orange-500 to-orange-600", shadow: "shadow-orange-500/60", hover: "hover:from-orange-600 hover:to-orange-700" },
  "A": { active: "bg-gradient-to-br from-red-500 to-red-600", shadow: "shadow-red-500/60", hover: "hover:from-red-600 hover:to-red-700" },
  "A#": { active: "bg-gradient-to-br from-rose-500 to-rose-600", shadow: "shadow-rose-500/60", hover: "hover:from-rose-600 hover:to-rose-700" },
  "B": { active: "bg-gradient-to-br from-indigo-500 to-indigo-600", shadow: "shadow-indigo-500/60", hover: "hover:from-indigo-600 hover:to-indigo-700" },
};

export const PadControls: React.FC<PadControlsProps> = ({
  isPadPlaying,
  onPadToggle,
  currentPadKey,
  onPadKeyChange,
}) => {
  // Função para tocar/parar o PAD ao clicar no próprio botão de tom
  const handlePadClick = (key: string) => {
    // Se clicar no pad que já está tocando, para
    if (currentPadKey === key && isPadPlaying) {
      onPadToggle();
    }
    // Se clicar em um novo pad, troca o tom
    else if (currentPadKey !== key) {
      onPadKeyChange(key);
      // Se não estava tocando, inicia automaticamente
      if (!isPadPlaying) {
        onPadToggle();
      }
    }
    // Se clicar no mesmo pad que não está tocando, inicia
    else if (currentPadKey === key && !isPadPlaying) {
      onPadToggle();
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-1">Pads</h3>
        <p className="text-xs text-white/50">Toque em um PAD para tocar/parar</p>
      </div>

      {/* Grid de Tons - Acionamento direto */}
      <div className="grid grid-cols-3 gap-3">
        {PAD_KEYS.map((key) => {
          const isActive = currentPadKey === key && isPadPlaying;
          const isSelected = currentPadKey === key;
          const colors = PAD_COLORS[key];
          return (
            <button
              key={key}
              onClick={() => handlePadClick(key)}
              style={{
                boxShadow: isActive || isSelected
                  ? 'inset 0 -1px 1px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.3)'
                  : 'inset 0 -1px 1px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.4)'
              }}
              className={`
                h-32 rounded-lg font-black text-2xl transition-all duration-300 relative overflow-hidden
                ${
                  isActive
                    ? `${colors.active} text-white scale-[1.02]`
                    : isSelected
                    ? `${colors.active} text-white opacity-70`
                    : "bg-gradient-to-b from-[#2d2d2d] via-[#252525] to-[#1a1a1a] text-white/40 hover:text-white/70 hover:from-[#353535] hover:via-[#2d2d2d] hover:to-[#222] hover:scale-[1.02]"
                }
              `}
            >
              {/* Brilho interno quando ativo */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
              )}

              {/* Indicador de "playing" */}
              {isActive && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-150" />
                </div>
              )}

              <span className="relative z-10">{key}</span>
            </button>
          );
        })}
      </div>

      {/* Informação sobre o uso */}
      <div className="bg-white/5 rounded-xl p-3 text-center">
        <p className="text-xs text-white/50">
          {isPadPlaying
            ? `PAD ${currentPadKey} tocando - Toque novamente para parar`
            : currentPadKey
            ? `Tom ${currentPadKey} selecionado - Toque para tocar`
            : "Selecione um tom acima para começar"}
        </p>
      </div>
    </div>
  );
};
