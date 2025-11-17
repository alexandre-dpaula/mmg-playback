"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Music,
  GripVertical,
} from "lucide-react";
import { DEFAULT_PLAYLIST, useEventPlaylist } from "@/hooks/useEventPlaylist";
import type { PlaylistTrack } from "@/hooks/useEventPlaylist";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase";

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

type SortableTrackItemProps = {
  track: PlaylistTrack;
  index: number;
  isActive: boolean;
  onSelectTrack: (id: string) => void;
  onOpenCifra: (id: string) => void;
};

const SortableTrackItem: React.FC<SortableTrackItemProps> = ({
  track,
  index,
  isActive,
  onSelectTrack,
  onOpenCifra,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] transition-all duration-200",
        isActive && "border-[#1DB954]/40 bg-[#1DB954]/5",
        !isDragging &&
          "hover:-translate-y-px hover:border-[#1DB954]/40 hover:bg-[#1f1f1f]"
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Número da faixa e Drag handle */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-2xl sm:text-3xl font-bold text-white/30 w-10 sm:w-12 text-center">
            {(index + 1).toString().padStart(2, "0")}
          </span>
          <button
            type="button"
            className="text-white/30 hover:text-white/60 transition cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Informações da faixa */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenCifra(track.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenCifra(track.id);
            }
          }}
          className="relative z-10 flex-1 min-w-0 text-left cursor-pointer"
        >
          <p className="font-medium text-base sm:text-lg md:text-xl text-white mb-1 line-clamp-1 max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
            {track.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {track.tom && (
              <span className="px-2 py-0.5 bg-[#1DB954]/20 text-[#1DB954] rounded-full font-semibold">
                {track.tom}
              </span>
            )}
            {track.versao && (
              <span className="px-2 py-0.5 rounded-full font-semibold bg-white/5 text-white/30 border border-white/5">
                {track.versao}
              </span>
            )}
          </div>
        </div>

        {/* Botão de play */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectTrack(track.id);
          }}
          className={cn(
            "relative z-10 flex-shrink-0 h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] shadow-inner shadow-black/50 hover:bg-[#1DB954]/20 transition",
            isActive && "bg-[#1DB954]/20"
          )}
          aria-label={`Tocar ${track.title}`}
        >
          <Music className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-white/5 to-transparent" />
    </div>
  );
};

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

  const [localTracks, setLocalTracks] = React.useState<PlaylistTrack[]>([]);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);

  const tracks: PlaylistTrack[] = React.useMemo(() => {
    const filtered = (() => {
      if (filter === "vocal") {
        return allTracks.filter((track) =>
          filterByTag(track, "vocal", "voz", "vozes")
        );
      }

      if (filter === "instrumental") {
        return allTracks.filter((track) => filterByTag(track, "instrumental"));
      }

      return allTracks;
    })();

    // Usa localTracks se disponível, senão usa filtered
    if (localTracks.length > 0) {
      // Filtra localTracks de acordo com o filtro atual
      if (filter === "vocal") {
        return localTracks.filter((track) =>
          filterByTag(track, "vocal", "voz", "vozes")
        );
      }
      if (filter === "instrumental") {
        return localTracks.filter((track) =>
          filterByTag(track, "instrumental")
        );
      }
      return localTracks;
    }

    return filtered;
  }, [allTracks, filter, localTracks]);

  // Sincroniza localTracks com allTracks quando allTracks muda
  React.useEffect(() => {
    if (allTracks.length > 0 && localTracks.length === 0) {
      setLocalTracks(allTracks);
    }
  }, [allTracks, localTracks.length]);

  // Configuração dos sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Precisa mover 8px antes de começar a arrastar
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const trackCountLabel = React.useMemo(() => {
    const count = tracks.length;
    const padded = count.toString().padStart(2, "0");
    return `${padded} ${count === 1 ? "Faixa" : "Faixas"}`;
  }, [tracks.length]);

  const [currentTrackId, setCurrentTrackId] = React.useState<string | null>(
    null
  );
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tracks.findIndex((track) => track.id === active.id);
    const newIndex = tracks.findIndex((track) => track.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Atualiza ordem localmente
    const newTracks = arrayMove(tracks, oldIndex, newIndex);
    setLocalTracks(newTracks);

    // Salva ordem no banco de dados
    setIsSavingOrder(true);
    try {
      // Atualiza order_index para cada faixa na tabela event_tracks
      const updates = newTracks.map((track, index) => ({
        trackId: track.id,
        order_index: index,
      }));

      // Executa updates em paralelo
      await Promise.all(
        updates.map((update) =>
          supabase
            .from("event_tracks")
            .update({ order_index: update.order_index })
            .eq("event_id", eventId)
            .eq("track_id", update.trackId)
        )
      );

      console.log("Ordem salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      // Reverte para a ordem original em caso de erro
      await refetch();
      setLocalTracks([]);
    } finally {
      setIsSavingOrder(false);
    }
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
    <section className="w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-3 sm:p-4 md:p-6 lg:p-8 pb-3 sm:pb-4 md:pb-6 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:flex-row lg:gap-8">
        <div className="mb-2 sm:mb-4 w-full lg:w-auto">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <p className="font-medium text-white/30 text-2xl sm:text-3xl md:text-4xl">
              Playlist
            </p>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <span className="rounded-full bg-[#1DB954]/10 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold text-[#1DB954] whitespace-nowrap">
                {trackCountLabel}
              </span>
              {isSavingOrder && (
                <span className="text-xs text-white/50 animate-pulse">
                  Salvando ordem...
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Dica: arraste as faixas para organizar a ordem desejada.
          </p>
        </div>
        <ScrollArea
          className="w-full pr-2 sm:pr-3 md:pr-4"
          style={{
            maxHeight: Math.min(Math.max(tracks.length * 110, 320), 760),
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tracks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-3">
                {tracks.map((track, index) => {
                  const isActive = currentTrackId === track.id;
                  return (
                    <li key={track.id}>
                      <SortableTrackItem
                        track={track}
                        index={index}
                        isActive={isActive}
                        onSelectTrack={handleSelectTrack}
                        onOpenCifra={openCifraPage}
                      />
                    </li>
                  );
                })}
                {!tracks.length && (
                  <li className="rounded-xl bg-white/5 px-3 py-6 sm:px-4 sm:py-8 text-center text-sm text-white/50">
                    Nenhuma faixa encontrada na planilha. Verifique se os links
                    do Google Drive estão publicados.
                  </li>
                )}
              </ul>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </div>
      {hasAudioFile && (
        <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-5 md:mt-6">
          {currentTrack && (
            <div className="audio-player w-full max-w-2xl px-2 sm:px-3 md:px-4">
              <div
                className="progress-bar w-full h-1.5 sm:h-2 md:h-2.5 bg-white/10 rounded-full cursor-pointer hover:bg-white/15 transition-colors group"
                onClick={handleProgressClick}
              >
                <div
                  className="progress-thumb h-full bg-[#1DB954] rounded-full transition-all group-hover:bg-[#1ed760] relative"
                  style={{
                    width: duration
                      ? `${(currentTime / duration) * 100}%`
                      : "0%",
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 md:w-4 sm:h-3 md:h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-white/70 mt-1.5 sm:mt-2 font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center">
            <Button
              onClick={handlePrevious}
              disabled={!tracks.length}
              className="flex items-center justify-center rounded-full bg-white/10 p-2.5 sm:p-3 md:p-3.5 lg:p-4 text-white hover:bg-white/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </Button>
            <Button
              onClick={handlePlayPause}
              disabled={
                !tracks.length ||
                (currentTrack?.url && isGoogleDocsUrl(currentTrack.url)) ||
                !currentTrack?.url
              }
              className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-[#1DB954] px-4 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-xs sm:text-sm md:text-base lg:text-lg font-bold text-black shadow-xl shadow-[#1DB954]/50 transition-all duration-200 hover:bg-[#1ed760] hover:scale-105 hover:shadow-2xl hover:shadow-[#1DB954]/60 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none disabled:hover:scale-100"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <span className="hidden sm:inline">Pausar</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <span className="hidden sm:inline">Reproduzir</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!tracks.length}
              className="flex items-center justify-center rounded-full bg-white/10 p-2.5 sm:p-3 md:p-3.5 lg:p-4 text-white hover:bg-white/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
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
