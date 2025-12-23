import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2 } from "lucide-react";

interface YouTubePlayerProps {
  youtubeUrl?: string;
  trackTitle?: string;
  trackVersion?: string;
  className?: string;
}

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  youtubeUrl,
  trackTitle = "Música Original",
  trackVersion,
  className = "",
}) => {
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
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isSeeking]);

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
            {/* Skip Back */}
            <button
              onClick={skipBackward}
              disabled={!isReady}
              className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>

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

            {/* Skip Forward */}
            <button
              onClick={skipForward}
              disabled={!isReady}
              className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </button>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{trackTitle}</p>
            {trackVersion && (
              <p className="text-white/60 text-xs truncate">{trackVersion}</p>
            )}
          </div>

          {/* Loop button */}
          <button
            onClick={toggleLoop}
            className={`p-2 rounded-full transition-colors ${
              isLooping
                ? 'text-blue-500'
                : 'text-white/40 hover:text-white/80'
            }`}
            title="Repetir"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div
            className="h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
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
};
