import React, { useState, useEffect, useRef } from "react";

interface MetronomeProps {
  initialBpm?: number;
  className?: string;
}

export const Metronome: React.FC<MetronomeProps> = ({
  initialBpm = 120,
  className = "",
}) => {
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastTapRef = useRef<number>(0);

  // Inicializa AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Toca o som do metrônomo
  const playClick = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  // Controla o metrônomo
  useEffect(() => {
    if (isPlaying) {
      const interval = 60000 / bpm; // Converte BPM para milissegundos
      intervalRef.current = setInterval(() => {
        playClick();
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm]);

  // Atualiza BPM quando o initialBpm mudar
  useEffect(() => {
    setBpm(initialBpm);
  }, [initialBpm]);

  // Função principal de click
  const handleClick = () => {
    const now = Date.now();

    // Se está tocando, verifica se é tap tempo ou toggle
    if (isPlaying) {
      // Se passou mais de 2 segundos, considera como toggle (desliga)
      if (now - lastTapRef.current > 2000) {
        setIsPlaying(false);
        setTapTimes([]);
        return;
      }

      // Adiciona o tap atual
      const newTapTimes = [...tapTimes, now];
      setTapTimes(newTapTimes);
      lastTapRef.current = now;

      // Com 3+ taps, calcula o BPM médio
      if (newTapTimes.length >= 3) {
        const intervals: number[] = [];
        for (let i = 1; i < newTapTimes.length; i++) {
          intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgInterval);

        // Limita o BPM entre 40 e 240
        const newBpm = Math.max(40, Math.min(240, calculatedBpm));
        setBpm(newBpm);

        // Reseta após calcular
        setTapTimes([]);
      }
    } else {
      // Não está tocando: liga o metrônomo
      setIsPlaying(true);
      setTapTimes([now]);
      lastTapRef.current = now;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botão Metrônomo com Tap Tempo */}
      <button
        onClick={handleClick}
        className={`
          relative px-3 py-1.5 backdrop-blur-sm border rounded-full font-bold transition-all duration-200
          ${isPlaying
            ? "bg-[#1DB954] text-black border-[#1DB954]"
            : "bg-white/10 text-white border-white/20 hover:bg-white/15"
          }
        `}
        title={`${isPlaying ? 'Tocando - Clique para Tap Tempo' : 'Parado - Clique para Iniciar'}`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] opacity-70 font-semibold uppercase tracking-wide">TAP</span>
          <span className="text-xl font-extrabold">{bpm}</span>
          <span className="text-[9px] opacity-70 font-semibold uppercase tracking-wide">BPM</span>
        </div>

        {/* Indicador de Tap */}
        {tapTimes.length > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        )}
      </button>
    </div>
  );
};
