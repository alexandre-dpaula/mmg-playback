"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Pause, Play, SkipBack, SkipForward, Music } from "lucide-react";
import { DEFAULT_PLAYLIST, useEventPlaylist } from "@/hooks/useEventPlaylist";
import type { PlaylistTrack } from "@/hooks/useEventPlaylist";
import { useNavigate } from "react-router-dom";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Função para detectar se a URL é do Google Docs (cifra) ou áudio
const isGoogleDocsUrl = (url?: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes("docs.google.com/document") ||
    lowerUrl.includes("docs.google.com/d/") ||
    (lowerUrl.includes("drive.google.com/file/d/") &&
      lowerUrl.includes("/view"))
  );
};

const normalizeFilterValue = (value?: string) =>
  value ? value.toLowerCase().trim() : "";


type SpotifyPlayerProps = {
  filter: "all" | "vocal" | "instrumental";
  eventId: string;
};

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ filter, eventId }) => {
  const navigate = useNavigate();
  const {
    data: playlistData,
    isLoading,
    isError,
    error,
    refetch,
  } = useEventPlaylist(eventId);

  const allTracks: PlaylistTrack[] = React.useMemo(
    () => playlistData?.tracks ?? [],
    [playlistData]
  );

  const filterByTag = (
    track: PlaylistTrack,
    ...tagValues: string[]
  ): boolean => {
    if (!track.tag) return false;
    const normalizedTag = normalizeFilterValue(track.tag);
    return tagValues.some(
      (tagValue) => normalizedTag === normalizeFilterValue(tagValue)
    );
  };

  const tracks: PlaylistTrack[] = React.useMemo(() => {
    if (filter === "vocal") {
      return allTracks.filter((track) =>
        filterByTag(track, "vocal", "voz", "vozes")
      );
    }

    if (filter === "instrumental") {
      return allTracks.filter((track) => filterByTag(track, "instrumental"));
    }

    return allTracks;
  }, [allTracks, filter]);

  const trackCountLabel = React.useMemo(() => {
    const count = tracks.length;
    const padded = count.toString().padStart(2, "0");
    return `${padded} ${count === 1 ? "Faixa" : "Faixas"}`;
  }, [tracks.length]);

  const [currentTrackId, setCurrentTrackId] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentTrack = React.useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [tracks, currentTrackId]
  );

  // Verifica se a faixa atual tem arquivo de áudio válido
  const hasAudioFile = React.useMemo(() => {
    if (!currentTrack?.url) return false;
    return !isGoogleDocsUrl(currentTrack.url);
  }, [currentTrack]);

  const trackStorageKey = React.useMemo(
    () => `mmg-current-track-${eventId}`,
    [eventId]
  );

  const persistCurrentTrack = React.useCallback(
    (trackId: string | null) => {
      if (typeof window === "undefined") return;
      try {
        if (trackId) {
          localStorage.setItem(trackStorageKey, trackId);
        } else {
          localStorage.removeItem(trackStorageKey);
        }
      } catch (err) {
        console.error("Failed to persist track", err);
      }
    },
    [trackStorageKey]
  );

  React.useEffect(() => {
    if (!tracks.length) {
      setCurrentTrackId(null);
      return;
    }

    if (currentTrackId && tracks.some((track) => track.id === currentTrackId)) {
      return;
    }

    const storedId =
      typeof window !== "undefined"
        ? localStorage.getItem(trackStorageKey)
        : null;

    const trackIdToUse =
      storedId && tracks.some((track) => track.id === storedId)
        ? storedId
        : tracks[0].id;

    setCurrentTrackId(trackIdToUse);
    persistCurrentTrack(trackIdToUse);
  }, [tracks, currentTrackId, trackStorageKey, persistCurrentTrack]);

  // Atualiza o título da página quando a música muda (para PWA no iPhone)
  React.useEffect(() => {
    if (currentTrack) {
      document.title = `${currentTrack.title} - MMG Playback`;
    } else {
      document.title = "MMG Playback";
    }
  }, [currentTrack]);

  React.useEffect(() => {
    if (!audioRef.current || !currentTrack || !currentTrack.url) {
      return;
    }
    // Não carrega áudio se for URL do Google Docs (cifra)
    if (isGoogleDocsUrl(currentTrack.url)) {
      return;
    }
    console.log("Setting audio src to:", currentTrack.url);
    audioRef.current.src = currentTrack.url;
    audioRef.current.load();
  }, [currentTrack]);

  React.useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    if (!currentTrack) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      return;
    }
    // Não tenta tocar se for URL do Google Docs
    if (currentTrack.url && isGoogleDocsUrl(currentTrack.url)) {
      setIsPlaying(false);
      return;
    }
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Erro ao reproduzir:", error);
        setIsPlaying(false);
        alert(
          `Erro ao reproduzir a faixa "${currentTrack.title}": ${error.message}`
        );
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    if (!tracks.length) {
      return;
    }
    if (!currentTrack) {
      setCurrentTrackId(tracks[0].id);
      persistCurrentTrack(tracks[0].id);
      setIsPlaying(true);
      return;
    }
    // Não permite play/pause se for Google Docs
    if (currentTrack.url && isGoogleDocsUrl(currentTrack.url)) {
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePrevious = () => {
    if (!tracks.length) return;
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrackId
    );
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    const prevTrack = tracks[prevIndex];
    setCurrentTrackId(prevTrack.id);
    persistCurrentTrack(prevTrack.id);
    const hasAudioUrl = prevTrack.url && !isGoogleDocsUrl(prevTrack.url);
    if (hasAudioUrl) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (!tracks.length) return;
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrackId
    );
    const nextIndex = currentIndex < tracks.length - 1 ? currentIndex + 1 : 0;
    const nextTrack = tracks[nextIndex];
    setCurrentTrackId(nextTrack.id);
    persistCurrentTrack(nextTrack.id);
    const hasAudioUrl = nextTrack.url && !isGoogleDocsUrl(nextTrack.url);
    if (hasAudioUrl) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    if (currentTrack) {
      alert(
        `Erro ao carregar a faixa "${currentTrack.title}". Verifique se o link do Google Drive está publicado.`
      );
    }
  };

  const handleSelectTrack = (id: string) => {
    setCurrentTrackId(id);
    persistCurrentTrack(id);
    const track = tracks.find((t) => t.id === id);
    const hasAudioUrl = track?.url && !isGoogleDocsUrl(track.url);
    if (hasAudioUrl) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const playNextTrack = () => {
    handleNext();
  };

  const openCifraPage = (trackId: string) => {
    navigate(`/playlist/${eventId}/track/${trackId}`);
  };

  if (isError) {
    return (
      <section className="overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-3 sm:p-6 md:p-8 pb-4 sm:pb-6 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
        <div className="flex flex-col items-center justify-center gap-4 h-64">
          <p className="text-red-400">
            Erro ao carregar playlist: {error?.message}
          </p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-3 sm:p-6 md:p-8 pb-4 sm:pb-6 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
        <div className="flex items-center justify-center h-64">
          <p>Carregando faixas...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-3 sm:p-6 md:p-8 pb-4 sm:pb-6 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:gap-8">
        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-white/70">Playlist</p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-white/60">
              <span className="font-semibold text-white">Tocando</span>{" "}
              <span className="text-white">
                {currentTrack
                  ? currentTrack.title
                  : "Nenhuma faixa selecionada"}
              </span>
            </p>
            <span className="rounded-full bg-[#1DB954]/10 px-3 py-1 text-xs sm:text-sm font-semibold text-[#1DB954] whitespace-nowrap">
              {trackCountLabel}
            </span>
          </div>
        </div>
        <ScrollArea className="h-96 sm:h-[500px] md:h-[600px] lg:h-[700px] pr-2 sm:pr-4">
          <ul className="space-y-3">
            {tracks.map((track, index) => {
              const isActive = currentTrackId === track.id;
              return (
                <li key={track.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openCifraPage(track.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openCifraPage(track.id);
                      }
                    }}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-3 sm:p-4 flex items-center gap-4 transition-all duration-200 hover:-translate-y-px hover:border-[#1DB954]/40 hover:bg-[#1f1f1f]",
                      isActive && "border-[#1DB954]/40 bg-[#1DB954]/5"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-white/5 to-transparent" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTrack(track.id);
                      }}
                      className={cn(
                        "relative z-10 flex-shrink-0 h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] shadow-inner shadow-black/50 hover:bg-[#1DB954]/20 transition",
                        isActive && "bg-[#1DB954]/20"
                      )}
                      aria-label={`Tocar ${track.title}`}
                    >
                      <Music className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="relative z-10 flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm sm:text-base truncate text-white">
                        {track.title}
                      </p>
                      <span className="text-xs sm:text-sm text-white/60">
                        Faixa {index + 1}
                      </span>
                    </div>
                    {isActive && (
                      <span className="relative z-10 rounded-full bg-[#1DB954] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-black whitespace-nowrap">
                        Tocando
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
            {!tracks.length && (
              <li className="rounded-xl bg-white/5 px-3 py-6 sm:px-4 sm:py-8 text-center text-sm text-white/50">
                Nenhuma faixa encontrada na planilha. Verifique se os links do
                Google Drive estão publicados.
              </li>
            )}
          </ul>
        </ScrollArea>
      </div>
      {hasAudioFile && (
        <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 mt-5 sm:mt-6 md:mt-8">
          {currentTrack && (
            <div className="audio-player w-full max-w-lg px-3 sm:px-4">
              <div
                className="progress-bar w-full h-2 sm:h-2.5 bg-white/10 rounded-full cursor-pointer hover:bg-white/15 transition-colors group"
                onClick={handleProgressClick}
              >
                <div
                  className="progress-thumb h-full bg-[#1DB954] rounded-full transition-all group-hover:bg-[#1ed760] relative"
                  style={{
                    width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-white/70 mt-2 font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <Button
              onClick={handlePrevious}
              disabled={!tracks.length}
              className="flex items-center justify-center rounded-full bg-white/10 p-3 sm:p-3.5 md:p-4 text-white hover:bg-white/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
              onClick={handlePlayPause}
              disabled={
                !tracks.length ||
                (currentTrack?.url && isGoogleDocsUrl(currentTrack.url)) ||
                !currentTrack?.url
              }
              className="flex items-center justify-center gap-2 sm:gap-2.5 rounded-full bg-[#1DB954] px-6 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4 text-sm sm:text-base md:text-lg font-bold text-black shadow-xl shadow-[#1DB954]/50 transition-all duration-200 hover:bg-[#1ed760] hover:scale-105 hover:shadow-2xl hover:shadow-[#1DB954]/60 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none disabled:hover:scale-100"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline">Pausar</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline">Reproduzir</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!tracks.length}
              className="flex items-center justify-center rounded-full bg-white/10 p-3 sm:p-3.5 md:p-4 text-white hover:bg-white/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        hidden
        onEnded={playNextTrack}
        onError={handleAudioError}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
      />
    </section>
  );
};

export default SpotifyPlayer;
