import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Play, Pause } from "lucide-react";

interface YouTubePlayerProps {
  youtubeUrl?: string;
  trackTitle?: string;
  trackVersion?: string;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void; // Callback para atualizar scroll da cifra
  sectionTimestamps?: Record<string, number> | null; // Timestamps das seções para cores
  bpm?: number; // BPM para o metrônomo
  onMetronomeToggle?: () => void; // Callback para toggle do metrônomo
  isMetronomePlaying?: boolean; // Estado do metrônomo
  onBpmChange?: (bpm: number) => void; // Callback para alterar BPM via TAP
}

export interface YouTubePlayerRef {
  getCurrentTime: () => number;
  seekTo: (time: number) => void; // Pula para um tempo específico
}

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(({
  youtubeUrl,
  trackTitle = "Música Original",
  trackVersion,
  className = "",
  onTimeUpdate,
  sectionTimestamps,
  bpm = 120,
  onMetronomeToggle,
  isMetronomePlaying = false,
  onBpmChange,
}, ref) => {
  useEffect(() => {
    console.log('[YouTubePlayer] Props recebidas:', { youtubeUrl, trackTitle, trackVersion });
    if (!youtubeUrl) {
      console.warn('[YouTubePlayer] Nenhuma URL do YouTube fornecida');
    }
  }, [youtubeUrl, trackTitle, trackVersion]);

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // TAP Tempo - refs para calcular BPM
  const tapTimesRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expõe métodos para o componente pai controlar o player
  useImperativeHandle(ref, () => ({
    getCurrentTime: () => currentTime,
    seekTo: (time: number) => {
      if (playerRef.current && isReady) {
        playerRef.current.seekTo(time);
        setCurrentTime(time);
      }
    },
  }));

  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string | null => {
    try {
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) {
          return match[1];
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const videoId = youtubeUrl ? getVideoId(youtubeUrl) : null;

  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setApiLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setApiLoaded(true);
          clearInterval(checkAPI);
        }
      }, 100);
      return () => clearInterval(checkAPI);
    }

    // Load the API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setApiLoaded(true);
    };
  }, [videoId]);

  // Update current time periodically
  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    const interval = setInterval(() => {
      if (playerRef.current && !isSeeking) {
        const current = playerRef.current.getCurrentTime();
        setCurrentTime(current);

        // Notifica o componente pai sobre a atualização do tempo (para auto-scroll)
        if (onTimeUpdate) {
          onTimeUpdate(current);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isSeeking, onTimeUpdate]);

  // Initialize player when API is loaded
  useEffect(() => {
    if (!apiLoaded || !videoId || !playerContainerRef.current) return;

    // Validate video ID format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return;

    // Destroy existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error('Erro ao destruir player:', e);
      }
    }

    // Create new player
    try {
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: videoId,
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            const dur = event.target.getDuration();
            setDuration(dur);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              if (isLooping && playerRef.current) {
                playerRef.current.seekTo(0);
                playerRef.current.playVideo();
              }
            }
          },
        },
      });
    } catch (error) {
      console.error('Erro ao criar player:', error);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
        playerRef.current = null;
      }
    };
  }, [apiLoaded, videoId]);

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !isReady || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    setIsSeeking(true);
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);

    setTimeout(() => setIsSeeking(false), 100);
  };

  const skipBackward = () => {
    if (!playerRef.current || !isReady) return;
    const newTime = Math.max(0, currentTime - 10);
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    if (!playerRef.current || !isReady) return;
    const newTime = Math.min(duration, currentTime + 10);
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Função TAP Tempo - calcula BPM baseado nos cliques E liga/desliga metrônomo
  const handleMetronomeClick = () => {
    const now = Date.now();

    // Adiciona o timestamp do clique
    tapTimesRef.current.push(now);

    // Limpa o timeout anterior
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Se ficou mais de 2 segundos sem clicar, reseta
    tapTimeoutRef.current = setTimeout(() => {
      tapTimesRef.current = [];
    }, 2000);

    // Precisa de pelo menos 2 cliques para calcular BPM
    if (tapTimesRef.current.length >= 2) {
      // Calcula a média dos intervalos entre cliques
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }

      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / averageInterval);

      // Limita BPM entre 40 e 240
      const validBpm = Math.max(40, Math.min(240, calculatedBpm));

      // Atualiza o BPM
      if (onBpmChange) {
        onBpmChange(validBpm);
      }

      // Se não estiver tocando, liga o metrônomo após calcular o BPM
      if (!isMetronomePlaying && onMetronomeToggle) {
        onMetronomeToggle();
      }
    } else {
      // Primeiro clique - apenas toggle do metrônomo
      if (onMetronomeToggle) {
        onMetronomeToggle();
      }
    }
  };

  // Função para obter a cor da seção baseado no tipo (mesmas cores do SongMap)
  const getSectionColor = (sectionId: string): string => {
    // Remove "section-" prefix se existir
    const cleanId = sectionId.replace('section-', '').toUpperCase();

    // Extrai o tipo base (primeira letra ou primeiras letras)
    let baseType = cleanId;

    // Para seções com números (V1, V2, R1, R2), pega apenas a letra
    const match = cleanId.match(/^([A-Z]+)/);
    if (match) {
      baseType = match[1];
    }

    // Cores do SongMap (mesma paleta)
    const colorMap: Record<string, string> = {
      'I': '#F1C500',      // Intro - Amarelo
      'V': '#4CB4FF',      // Verse - Azul claro
      'S': '#FF4848',      // Solo - Vermelho
      'C': '#F59D00',      // Chorus - Laranja
      'R': '#F59D00',      // Refrão - Laranja
      'PR': '#34CD62',     // Pré-Refrão - Verde
      'PC': '#34CD62',     // Pré-Chorus - Verde
      'P': '#34CD62',      // Ponte - Verde
      'B': '#9A58BB',      // Bridge - Roxo
      'PO': '#34CD62',     // Ponte - Verde
      'T': '#F1C500',      // Turnaround - Amarelo
      'TA': '#F1C500',     // Turnaround - Amarelo
      'TG': '#FF4848',     // Tag - Vermelho
      'IS': '#9A58BB',     // Instrumental - Roxo
      'IN': '#9A58BB',     // Instrumental - Roxo
      'RF': '#FF4848',     // Riff - Vermelho
      'O': '#45A2FF',      // Outro - Azul
      'IT': '#9A58BB',     // Interlúdio - Roxo
    };

    return colorMap[baseType] || '#1DB954'; // Verde padrão se não encontrar
  };

  // Calcula a cor atual baseado na seção ativa
  const getCurrentSectionColor = (): string => {
    if (!sectionTimestamps || !duration) {
      return '#1DB954'; // Verde padrão
    }

    const sections = Object.entries(sectionTimestamps).sort((a, b) => a[1] - b[1]);

    let currentSection: string | null = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      const [sectionId, timestamp] = sections[i];
      if (currentTime >= timestamp) {
        currentSection = sectionId;
        break;
      }
    }

    const color = currentSection ? getSectionColor(currentSection) : '#1DB954';

    // Debug: Log para ver qual seção está ativa
    if (currentSection) {
      console.log('[YouTubePlayer] Seção atual:', currentSection, 'Cor:', color, 'Tempo:', currentTime);
    }

    return color;
  };

  // Validar se tem URL válida e video ID válido
  const hasValidVideo = youtubeUrl && videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);

  if (!hasValidVideo) {
    return (
      <div className={`bg-gradient-to-b from-[#1a1a1a] to-black ${className}`}>
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Thumbnail placeholder */}
          <div className="w-16 h-16 rounded bg-gray-800 flex items-center justify-center flex-shrink-0">
            <Play className="w-6 h-6 text-gray-600" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-sm font-medium">Nenhuma referência disponível</p>
            <p className="text-white/30 text-xs mt-0.5">
              Edite a música para adicionar a URL do YouTube
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-b from-[#1a1a1a] to-black ${className}`}>
      {/* Hidden YouTube Player */}
      <div className="hidden">
        <div ref={playerContainerRef} />
      </div>

      <div className="px-4 pb-3 space-y-2">
        {/* Top row: Thumbnail + Controls + Info + Loop */}
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-900">
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={trackTitle}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={!isReady}
              className="p-2 bg-white rounded-full hover:scale-105 disabled:opacity-40 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 text-black" fill="currentColor" />
              )}
            </button>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{trackTitle}</p>
            {trackVersion && (
              <p className="text-white/60 text-xs truncate">{trackVersion}</p>
            )}
          </div>

          {/* Metronome button */}
          {onMetronomeToggle && (
            <button
              onClick={handleMetronomeClick}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                isMetronomePlaying
                  ? 'bg-[#1DB954] text-black border-[#1DB954]'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
              }`}
              title="TAP Tempo - Clique no ritmo para ajustar o BPM"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] opacity-70 font-semibold uppercase tracking-wide">TAP</span>
                <span className="text-sm font-extrabold">{bpm}</span>
                <span className="text-[9px] opacity-70 font-semibold uppercase tracking-wide">BPM</span>
              </div>
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div
            className="h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                backgroundColor: getCurrentSectionColor()
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
