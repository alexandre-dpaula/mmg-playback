import React, { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface MetronomeControlsProps {
  isMetronomePlaying: boolean;
  onMetronomeToggle: () => void;
  metronomeBpm: number;
  onBpmChange: (bpm: number) => void;
}

export const MetronomeControls: React.FC<MetronomeControlsProps> = ({
  isMetronomePlaying,
  onMetronomeToggle,
  metronomeBpm,
  onBpmChange,
}) => {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função TAP Tempo - calcula BPM baseado nos cliques
  const handleTap = () => {
    const now = Date.now();

    // Adiciona o timestamp do clique
    const newTapTimes = [...tapTimes, now];
    setTapTimes(newTapTimes);

    // Limpa o timeout anterior
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Se ficou mais de 2 segundos sem clicar, reseta
    tapTimeoutRef.current = setTimeout(() => {
      setTapTimes([]);
    }, 2000);

    // Precisa de pelo menos 2 cliques para calcular BPM
    if (newTapTimes.length >= 2) {
      // Calcula a média dos intervalos entre cliques
      const intervals: number[] = [];
      for (let i = 1; i < newTapTimes.length; i++) {
        intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
      }

      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / averageInterval);

      // Limita BPM entre 40 e 240
      const validBpm = Math.max(40, Math.min(240, calculatedBpm));

      // Atualiza o BPM
      onBpmChange(validBpm);
    }
  };

  // Incrementa/Decrementa BPM manualmente
  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(40, Math.min(240, metronomeBpm + delta));
    onBpmChange(newBpm);
  };

  return (
    <div className="space-y-8">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-1">Metrônomo</h3>
        <p className="text-xs text-white/50">Clique no TAP para ajustar o ritmo</p>
      </div>

      {/* TAP Tempo - Botão Grande */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleTap}
          className="
            w-full h-56 rounded-3xl bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-black
            border-2 border-white/20
            flex flex-col items-center justify-center gap-3
            hover:border-white/30 hover:scale-[1.02]
            active:scale-95
            transition-all duration-300
            relative overflow-hidden
          "
        >

          {/* Indicador de tap - mais visível */}
          {tapTimes.length > 0 && (
            <>
              <div className="absolute top-4 right-4 w-4 h-4 bg-orange-500 rounded-full animate-ping" />
              <div className="absolute top-4 right-4 w-4 h-4 bg-orange-400 rounded-full" />
            </>
          )}

          {/* BPM Display - GIGANTE */}
          <div className="relative h-44 overflow-hidden flex items-center justify-center">
            {/* Valor atual (GIGANTE) */}
            <div className="text-[120px] leading-none font-black text-white">
              {metronomeBpm}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 relative z-10 -mt-2">
            <span className="text-xs text-white/70 font-bold uppercase tracking-[0.25em]">
              TAP
            </span>
            <span className="text-2xl text-white font-black">BPM</span>
          </div>
        </button>

        {/* Controles minimalistas: − | + | Iniciar */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => adjustBpm(-1)}
            className="
              w-12 h-12 rounded-lg bg-white/10 text-white/60 border border-white/10
              hover:bg-white/20 hover:text-white hover:border-white/20
              font-black text-2xl
              transition-all duration-200
              active:scale-95
            "
          >
            −
          </button>
          <button
            onClick={() => adjustBpm(1)}
            className="
              w-12 h-12 rounded-lg bg-white/10 text-white/60 border border-white/10
              hover:bg-white/20 hover:text-white hover:border-white/20
              font-black text-2xl
              transition-all duration-200
              active:scale-95
            "
          >
            +
          </button>
          <button
            onClick={onMetronomeToggle}
            className={`
              flex-1 h-12 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
              ${
                isMetronomePlaying
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#1DB954] text-black hover:bg-[#1ed760]"
              }
            `}
          >
            {isMetronomePlaying ? (
              <>
                <Pause className="w-4 h-4" fill="currentColor" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" fill="currentColor" />
                <span>Iniciar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informação sobre TAP */}
      <div className="bg-white/5 rounded-xl p-3 text-center">
        <p className="text-xs text-white/50">
          {tapTimes.length === 0
            ? "Clique no TAP no ritmo da música para detectar o BPM automaticamente"
            : tapTimes.length === 1
            ? "Continue clicando no ritmo..."
            : `BPM detectado! (${tapTimes.length} batidas)`}
        </p>
      </div>
    </div>
  );
};
