"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { DEFAULT_PLAYLIST, useGooglePlaylist } from "@/hooks/useGooglePlaylist";
import type { PlaylistTrack } from "@/hooks/useGooglePlaylist";
import { CifraDisplay } from "@/components/CifraDisplay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_KEYS } from "@/utils/chordTransposer";

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
    (lowerUrl.includes("drive.google.com/file/d/") && lowerUrl.includes("/view"))
  );
};

const normalizeFilterValue = (value?: string) => (value ? value.toLowerCase().trim() : "");

const FLAT_TO_SHARP_MAP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

const NOTE_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  "C#": 277.18,
  D: 293.66,
  "D#": 311.13,
  E: 329.63,
  F: 349.23,
  "F#": 369.99,
  G: 392.0,
  "G#": 415.3,
  A: 440.0,
  "A#": 466.16,
  B: 493.88,
};

const extractKeyToken = (value?: string) => {
  if (!value) return "";
  const cleaned = value.replace(/♯/g, "#").replace(/♭/g, "b");
  const match = cleaned.match(/([A-Ga-g][#b]?)/);
  if (!match) return "";
  const [note] = match;
  return note.charAt(0).toUpperCase() + (note.charAt(1) ? note.charAt(1).toLowerCase() : "");
};

const normalizeKeyForSelect = (value?: string) => {
  const token = extractKeyToken(value);
  if (!token) return "";
  const normalized = FLAT_TO_SHARP_MAP[token] || token.toUpperCase();
  return AVAILABLE_KEYS.includes(normalized) ? normalized : "";
};

const getFrequencyForKey = (value?: string) => {
  const key = normalizeKeyForSelect(value);
  if (!key) return undefined;
  return NOTE_FREQUENCIES[key];
};

type SpotifyPlayerProps = {
  filter: "all" | "vocal" | "instrumental";
};

type PadNodes = {
  oscillators: OscillatorNode[];
  filter: BiquadFilterNode;
  gain: GainNode;
};

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ filter }) => {
  const {
    data: playlistData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGooglePlaylist();

  const allTracks: PlaylistTrack[] = React.useMemo(
    () => playlistData?.tracks ?? [],
    [playlistData?.tracks]
  );

  const tracks: PlaylistTrack[] = React.useMemo(() => {
    const filterByTag = (track: PlaylistTrack, ...tags: string[]) => {
      const normalizedTag = normalizeFilterValue(track.tag);
      const normalizedArtist = normalizeFilterValue(track.artist);
      return tags.some((tag) => normalizedTag === tag || normalizedArtist.includes(tag));
    };

    if (filter === "all") {
      // Filtro "Cifras": usa a coluna Tag e mantém os fallbacks antigos
      return allTracks.filter((track) => {
        const normalizedTag = normalizeFilterValue(track.tag);
        const normalizedArtist = normalizeFilterValue(track.artist);
        const hasPauta = track.pauta && track.pauta.trim().length > 0;
        const hasCifra = track.cifra && track.cifra.trim().length > 0;
        const isDocsUrl = track.url && isGoogleDocsUrl(track.url);
        const matchesTag = normalizedTag === "cifra" || normalizedTag === "cifras";
        const matchesArtist =
          normalizedArtist === "cifras" || normalizedArtist.includes("cifra");
        return matchesTag || matchesArtist || hasPauta || hasCifra || isDocsUrl;
      });
    }

    if (filter === "vocal") {
      return allTracks.filter((track) => filterByTag(track, "vocal", "voz", "vozes"));
    }

    if (filter === "instrumental") {
      return allTracks.filter((track) => filterByTag(track, "instrumental"));
    }

    return allTracks;
  }, [allTracks, filter]);

  const [currentTrackId, setCurrentTrackId] = React.useState<string | null>(
    null
  );
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [selectedKey, setSelectedKey] = React.useState<string>("");
  const [isPadPlaying, setIsPadPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const padNodesRef = React.useRef<PadNodes | null>(null);

  const currentTrack = React.useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [tracks, currentTrackId]
  );

  const currentPadKey = React.useMemo(
    () =>
      normalizeKeyForSelect(selectedKey) ||
      normalizeKeyForSelect(currentTrack?.tom) ||
      AVAILABLE_KEYS[0],
    [selectedKey, currentTrack?.tom]
  );

  // Determina a imagem de capa baseada no filtro ativo
  const coverImage = React.useMemo(() => {
    // Se há uma faixa atual com coverUrl própria, usa ela
    if (currentTrack?.coverUrl) {
      return currentTrack.coverUrl;
    }

    // Usa a imagem do filtro ativo
    if (filter === "all" && playlistData?.thumbs?.Cifras) {
      return playlistData.thumbs.Cifras;
    }
    if (filter === "vocal" && playlistData?.thumbs?.Vocal) {
      return playlistData.thumbs.Vocal;
    }
    if (filter === "instrumental" && playlistData?.thumbs?.Instrumental) {
      return playlistData.thumbs.Instrumental;
    }

    // Fallback para coverUrl da playlist
    return playlistData?.coverUrl || "";
  }, [currentTrack, filter, playlistData]);

  React.useEffect(() => {
    if (!tracks.length) {
      setCurrentTrackId(null);
      setIsPlaying(false);
    } else if (
      !currentTrackId ||
      !tracks.some((track) => track.id === currentTrackId)
    ) {
      setCurrentTrackId(tracks[0].id);
    }
  }, [tracks, currentTrackId]);

  const stopPadNodes = React.useCallback(() => {
    if (padNodesRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const previousNodes = padNodesRef.current;
      const { oscillators, gain, filter } = previousNodes;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      oscillators.forEach((oscillator) => {
        try {
          oscillator.stop(ctx.currentTime + 0.5);
        } catch {
          // ignore stop errors if already stopped
        }
        oscillator.disconnect();
      });
      filter.disconnect();
      setTimeout(() => {
        gain.disconnect();
        if (padNodesRef.current === previousNodes) {
          padNodesRef.current = null;
        }
      }, 600);
    }
  }, []);

  const stopPad = React.useCallback(() => {
    stopPadNodes();
    setIsPadPlaying(false);
  }, [stopPadNodes]);

  const startPad = React.useCallback(
    (keyValue?: string) => {
      if (typeof window === "undefined") return;

      const normalizedSelection =
        normalizeKeyForSelect(keyValue) || currentPadKey;

      const frequency = getFrequencyForKey(normalizedSelection);

      if (!frequency) {
        console.warn("Não foi possível determinar o tom para o Pad.");
        return;
      }

      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        console.warn("Web Audio API não suportada neste navegador.");
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      if (audioContextRef.current.state === "suspended") {
        void audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const outputGain = ctx.createGain();
      outputGain.gain.value = 0;
      outputGain.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 0.8;
      filter.frequency.value = 900;
      filter.connect(outputGain);

      const createOscillator = (
        type: OscillatorType,
        gainValue: number,
        freqMultiplier = 1,
        detune = 0
      ) => {
        const oscillator = ctx.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency * freqMultiplier;
        oscillator.detune.value = detune;
        const gainNode = ctx.createGain();
        gainNode.gain.value = gainValue;
        oscillator.connect(gainNode).connect(filter);
        oscillator.start();
        return oscillator;
      };

      const oscillators = [
        createOscillator("sawtooth", 0.18),
        createOscillator("triangle", 0.08, 0.5),
        createOscillator("sine", 0.05, 1.5, 700),
      ];

      outputGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.2);
      padNodesRef.current = { oscillators, filter, gain: outputGain };
    },
    [currentPadKey]
  );

  // Atualiza o tom selecionado quando a faixa muda
  React.useEffect(() => {
    const normalizedKey = normalizeKeyForSelect(currentTrack?.tom);
    setSelectedKey(normalizedKey || "");
    stopPad();
  }, [currentTrack?.tom, stopPad]);

  React.useEffect(() => {
    if (!isPadPlaying) {
      stopPadNodes();
      return;
    }

    startPad(currentPadKey);

    return () => {
      stopPadNodes();
    };
  }, [isPadPlaying, currentPadKey, startPad, stopPadNodes]);

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

  React.useEffect(() => {
    return () => {
      stopPad();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, [stopPad]);

  const handlePlayPause = () => {
    if (!tracks.length) {
      return;
    }
    if (!currentTrack) {
      setCurrentTrackId(tracks[0].id);
      setIsPlaying(true);
      return;
    }
    // Não permite play/pause se for Google Docs
    if (currentTrack.url && isGoogleDocsUrl(currentTrack.url)) {
      return;
    }
    setIsPlaying((state) => !state);
  };

  const handlePrevious = () => {
    if (!tracks.length || !currentTrack) return;
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    const prevTrack = tracks[prevIndex];
    setCurrentTrackId(prevTrack.id);
    // Só toca automaticamente se tiver URL de áudio válida
    const hasAudioUrl = prevTrack.url && !isGoogleDocsUrl(prevTrack.url);
    setIsPlaying(hasAudioUrl);
  };

  const handleNext = () => {
    if (!tracks.length || !currentTrack) return;
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    setCurrentTrackId(nextTrack.id);
    // Só toca automaticamente se tiver URL de áudio válida
    const hasAudioUrl = nextTrack.url && !isGoogleDocsUrl(nextTrack.url);
    setIsPlaying(hasAudioUrl);
  };

  const handleSelectTrack = (id: string) => {
    const track = tracks.find((t) => t.id === id);
    // Não permite tocar se for Google Docs ou não tiver URL de áudio
    const hasAudioUrl = track?.url && !isGoogleDocsUrl(track.url);

    if (id === currentTrackId) {
      if (hasAudioUrl) {
        setIsPlaying(true);
      }
      return;
    }
    setCurrentTrackId(id);
    if (hasAudioUrl) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleTogglePad = () => {
    setIsPadPlaying((prev) => {
      if (prev) {
        stopPadNodes();
        return false;
      }
      return true;
    });
  };

  const playNextTrack = () => {
    handleNext();
  };

  const handleAudioError = () => {
    console.error("Audio error for URL:", currentTrack?.url);
    alert(
      `Erro ao carregar a faixa "${currentTrack?.title}". Verifique se o link do Google Drive está compartilhado publicamente e se o arquivo é um áudio suportado (ex: MP3).`
    );
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
    <section className="overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-3 sm:p-6 md:p-8 pb-4 sm:pb-6 text-white shadow-xl shadow-black/40 ring-1 ring-white/10">
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:gap-8">
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 md:gap-6 min-w-0">
          <div className="flex flex-row items-start gap-3 sm:gap-4 md:gap-6">
            {coverImage && (
              <img
                src={coverImage}
                alt="Capa do álbum"
                className="w-24 aspect-[3/4] sm:w-32 sm:aspect-square md:w-44 rounded-xl sm:rounded-2xl object-cover shadow-[0_20px_45px_-20px_rgba(0,0,0,0.8)] flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="space-y-1">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {currentTrack?.artist ??
                    (isLoading ? "Carregando..." : "Selecione uma faixa")}
                </span>
                <div className="flex flex-wrap items-baseline gap-1 text-balance">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                    {currentTrack?.title ??
                      (isLoading ? "Carregando..." : "Selecione uma faixa")}
                  </h2>
                  {currentTrack?.versao && (
                    <span className="text-xs sm:text-sm text-white/70 font-semibold">
                      • {currentTrack.versao}
                    </span>
                  )}
                </div>
              </div>
              {(currentTrack?.tom || selectedKey) && (
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#1DB954] text-xs sm:text-sm font-semibold uppercase tracking-wide">
                      Tom
                    </span>
                    <Select value={selectedKey} onValueChange={setSelectedKey}>
                      <SelectTrigger className="w-20 sm:w-24 h-9 sm:h-10 bg-white/10 border-white/15 text-white text-xs sm:text-sm font-semibold">
                        <SelectValue placeholder={currentTrack?.tom || "—"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#282828] border-white/20">
                        {AVAILABLE_KEYS.map((key) => (
                          <SelectItem
                            key={key}
                            value={key}
                            className="text-white hover:bg-white/10 focus:bg-white/20 text-sm"
                          >
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleTogglePad}
                    className={cn(
                      "h-9 sm:h-10 w-20 sm:w-24 rounded-lg bg-white/10 border border-white/15 text-white text-xs sm:text-sm font-semibold transition hover:bg-white/15",
                      isPadPlaying && "bg-[#1DB954] text-black border-[#1DB954]"
                    )}
                  >
                    {isPadPlaying ? "Parar Pad" : "Pad"}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <CifraDisplay
            cifra={
              currentTrack?.pauta ||
              currentTrack?.cifra ||
              (currentTrack?.url && isGoogleDocsUrl(currentTrack.url) ? currentTrack.url : undefined)
            }
            originalKey={currentTrack?.tom}
            selectedKey={selectedKey}
          />
          {isError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              <p className="font-semibold">
                Erro ao sincronizar com a planilha.
              </p>
              <p>
                {error?.message ??
                  "Verifique a URL do App Script e tente novamente."}
              </p>
              <Button
                onClick={() => refetch()}
                className="mt-2 bg-white/10 text-white hover:bg-white/20"
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
        <div className="w-full lg:max-w-sm rounded-xl sm:rounded-2xl bg-white/5 p-3 sm:p-4 md:p-6 backdrop-blur">
          <div className="mb-3 sm:mb-4 flex flex-col gap-1.5 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] sm:text-sm uppercase text-white/50 tracking-[1px]">
                Tocando:{" "}
                {currentTrack ? (
                  <strong className="truncate">{currentTrack.title}</strong>
                ) : (
                  "Nenhuma faixa selecionada"
                )}
              </p>
            </div>
            <span className="rounded-full bg-[#1DB954]/10 px-2 py-0.5 sm:px-3 sm:py-1 text-[12px] sm:text-sm font-semibold text-[#1DB954] self-start sm:self-auto whitespace-nowrap">
              {tracks.length} {tracks.length === 1 ? "faixa" : "faixas"}
            </span>
          </div>
          <ScrollArea className="h-40 sm:h-48 md:h-56 pr-2 sm:pr-4">
            <ul className="space-y-2">
              {tracks.map((track, index) => (
                <li
                  key={track.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 text-[13px] sm:text-base transition",
                    currentTrackId === track.id
                      ? "bg-[#1DB954]/20 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => handleSelectTrack(track.id)}
                  >
                    <p className="font-semibold truncate">{track.title}</p>
                    <span className="text-[13px] sm:text-base text-white/50">
                      Faixa {index + 1}
                    </span>
                  </div>
                  {currentTrackId === track.id && (
                    <span className="rounded-full bg-[#1DB954] px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1 text-[10px] sm:text-xs font-bold text-black whitespace-nowrap ml-2">
                      Tocando
                    </span>
                  )}
                </li>
              ))}
              {!tracks.length && (
                <li className="rounded-xl bg-white/5 px-3 py-6 sm:px-4 sm:py-8 text-center text-sm text-white/50">
                  Nenhuma faixa encontrada na planilha. Verifique se os links do
                  Google Drive estão publicados.
                </li>
              )}
            </ul>
          </ScrollArea>
        </div>
      </div>
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
