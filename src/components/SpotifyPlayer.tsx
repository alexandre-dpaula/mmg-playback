"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { DEFAULT_PLAYLIST, useGooglePlaylist } from "@/hooks/useGooglePlaylist";
import type { PlaylistTrack } from "@/hooks/useGooglePlaylist";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SpotifyPlayer: React.FC = () => {
  const { data: playlistData, isLoading, isError, error, refetch } = useGooglePlaylist();
  const [filter, setFilter] = React.useState<"all" | "vocal" | "instrumental">("all");

  const allTracks: PlaylistTrack[] = React.useMemo(
    () => playlistData?.tracks ?? [],
    [playlistData?.tracks],
  );

  const tracks: PlaylistTrack[] = React.useMemo(() => {
    if (filter === "all") return allTracks;
    if (filter === "vocal") {
      return allTracks.filter(track =>
        track.artist?.toLowerCase().includes("vocal")
      );
    }
    if (filter === "instrumental") {
      return allTracks.filter(track =>
        track.artist?.toLowerCase().includes("instrumental")
      );
    }
    return allTracks;
  }, [allTracks, filter]);

  const coverImage = playlistData?.coverUrl;
  const [currentTrackId, setCurrentTrackId] = React.useState<string | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentTrack = React.useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [tracks, currentTrackId],
  );

  React.useEffect(() => {
    if (!tracks.length) {
      setCurrentTrackId(null);
      setIsPlaying(false);
    } else if (!currentTrackId || !tracks.some(track => track.id === currentTrackId)) {
      setCurrentTrackId(tracks[0].id);
    }
  }, [tracks, currentTrackId]);

  React.useEffect(() => {
    if (!audioRef.current || !currentTrack) {
      return;
    }
    console.log('Setting audio src to:', currentTrack.url);
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
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Erro ao reproduzir:', error);
        setIsPlaying(false);
        alert(`Erro ao reproduzir a faixa "${currentTrack.title}": ${error.message}`);
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
      setIsPlaying(true);
      return;
    }
    setIsPlaying((state) => !state);
  };

  const handlePrevious = () => {
    if (!tracks.length || !currentTrack) return;
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentTrackId(tracks[prevIndex].id);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (!tracks.length || !currentTrack) return;
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrackId(tracks[nextIndex].id);
    setIsPlaying(true);
  };

  const handleSelectTrack = (id: string) => {
    if (id === currentTrackId) {
      setIsPlaying(true);
      return;
    }
    setCurrentTrackId(id);
    setIsPlaying(true);
  };

  const playNextTrack = () => {
    handleNext();
  };

  const handleAudioError = () => {
    console.error('Audio error for URL:', currentTrack?.url);
    alert(`Erro ao carregar a faixa "${currentTrack?.title}". Verifique se o link do Google Drive está compartilhado publicamente e se o arquivo é um áudio suportado (ex: MP3).`);
    setIsPlaying(false);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  if (isLoading && !tracks.length) {
    return (
      <section className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-4 sm:p-6 md:p-8 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
        <div className="flex items-center justify-center h-64">
          <p>Carregando faixas...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-4 sm:p-6 md:p-8 pb-6 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-row items-center gap-6">
            {coverImage && (
              <img
                src={coverImage}
                alt="Capa do álbum"
                className="h-32 w-32 sm:h-44 sm:w-44 rounded-2xl object-cover shadow-[0_20px_45px_-20px_rgba(0,0,0,0.8)]"
              />
            )}
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                {currentTrack?.artist ?? (isLoading ? "Carregando..." : "Selecione uma faixa")}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {currentTrack?.title ?? (isLoading ? "Carregando..." : "Selecione uma faixa")}
              </h2>
              <p className="text-sm text-white/60">
                {playlistData?.description ?? "Playlist de vozes para ensaio das Músicas de Tabernáculos."}
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition",
                    filter === "all"
                      ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  Todas
                </Button>
                <Button
                  onClick={() => setFilter("vocal")}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition",
                    filter === "vocal"
                      ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  Vocal
                </Button>
                <Button
                  onClick={() => setFilter("instrumental")}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition",
                    filter === "instrumental"
                      ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  Instrumental
                </Button>
              </div>
            </div>
          </div>
          {isError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              <p className="font-semibold">Erro ao sincronizar com a planilha.</p>
              <p>{error?.message ?? "Verifique a URL do App Script e tente novamente."}</p>
              <Button onClick={() => refetch()} className="mt-2 bg-white/10 text-white hover:bg-white/20">
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
        <div className="w-full max-w-sm rounded-2xl bg-white/5 p-4 sm:p-6 backdrop-blur">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase text-white/50">
                Agora tocando: {currentTrack ? <strong>{currentTrack.title}</strong> : "Nenhuma faixa selecionada"}
              </p>
            </div>
            <span className="rounded-full bg-[#1DB954]/10 px-2 py-1 sm:px-3 sm:py-1 text-xs font-semibold text-[#1DB954] self-start sm:self-auto">
              {tracks.length} {tracks.length === 1 ? "faixa" : "faixas"}
            </span>
          </div>
          <ScrollArea className="h-48 sm:h-56 pr-4">
            <ul className="space-y-2">
              {tracks.map((track, index) => (
                <li
                  key={track.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm transition",
                    currentTrackId === track.id
                      ? "bg-[#1DB954]/20 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <div className="flex-1" onClick={() => handleSelectTrack(track.id)}>
                    <p className="font-semibold">{track.title}</p>
                    <span className="text-xs text-white/50">
                      Faixa {index + 1}
                    </span>
                  </div>
                  {currentTrackId === track.id && (
                    <span className="rounded-full bg-[#1DB954] px-2 py-1 sm:px-3 sm:py-1 text-xs font-bold text-black">
                      Tocando
                    </span>
                  )}
                </li>
              ))}
              {!tracks.length && (
                <li className="rounded-xl bg-white/5 px-3 py-6 sm:px-4 sm:py-8 text-center text-sm text-white/50">
                  Nenhuma faixa encontrada na planilha. Verifique se os links do Google Drive estão publicados.
                </li>
              )}
            </ul>
          </ScrollArea>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 mt-6">
        {currentTrack && (
          <div className="audio-player w-full max-w-md">
            <div
              className="progress-bar w-full h-2 bg-white/20 rounded cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="progress-thumb h-full bg-[#1DB954] rounded"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevious}
            disabled={!tracks.length}
            className="flex items-center justify-center rounded-full bg-white/10 px-3 py-3 text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            onClick={handlePlayPause}
            disabled={!tracks.length}
            className="flex items-center justify-center gap-2 rounded-full bg-[#1DB954] px-4 py-3 sm:px-6 sm:py-5 text-sm sm:text-base font-semibold text-black shadow-lg shadow-[#1DB954]/40 transition hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                Reproduzir
              </>
            )}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!tracks.length}
            className="flex items-center justify-center rounded-full bg-white/10 px-3 py-3 text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </div>
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
