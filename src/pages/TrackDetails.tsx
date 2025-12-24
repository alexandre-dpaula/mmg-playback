import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Settings } from "lucide-react";
import { supabase, getPadUrl, fetchCifraPreview } from "@/lib/supabase";
import { CifraDisplay } from "@/components/CifraDisplay";
import { CifraEditor } from "@/components/CifraEditor";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { SongMap } from "@/components/SongMap";
import { YouTubePlayer, YouTubePlayerRef } from "@/components/YouTubePlayer";
import { TrackFormModal } from "@/components/TrackFormModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AVAILABLE_KEYS,
  convertMinorToRelativeMajor,
  transposeContent,
} from "@/utils/chordTransposer";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefresh";

const PAD_FILE_MAP: Record<string, string> = {
  C: getPadUrl("C Guitar Pads.m4a"),
  "C#": getPadUrl("Db Guitar Pads.m4a"),
  D: getPadUrl("D Guitar Pads.m4a"),
  "D#": getPadUrl("Eb Guitar Pads.m4a"),
  E: getPadUrl("E Guitar Pads.m4a"),
  F: getPadUrl("F Guitar Pads.m4a"),
  "F#": getPadUrl("Gb Guitar Pads.m4a"),
  G: getPadUrl("G Guitar Pads.m4a"),
  "G#": getPadUrl("Ab Guitar Pads.m4a"),
  A: getPadUrl("A Guitar Pads.m4a"),
  "A#": getPadUrl("Bb Guitar Pads.m4a"),
  B: getPadUrl("B Guitar Pads.m4a"),
};

const extractKeyToken = (value?: string) => {
  if (!value) return "";
  const cleaned = value.replace(/♯/g, "#").replace(/♭/g, "b");
  const match = cleaned.match(/([A-Ga-g][#b]?)/);
  if (!match) return "";
  const [note] = match;
  // Retorna primeira letra maiúscula + resto minúsculo (C, Db, D#, etc)
  return (
    note.charAt(0).toUpperCase() +
    (note.charAt(1) ? note.charAt(1).toLowerCase() : "")
  );
};

const normalizeKeyForSelect = (value?: string) => {
  if (!value) return "";
  const sanitized = value.replace(/♯/g, "#").replace(/♭/g, "b");
  const token = extractKeyToken(sanitized);
  if (!token) return "";
  // Não faz toUpperCase() - mantém o formato correto: C, Db, D#, etc
  return AVAILABLE_KEYS.includes(token) ? token : "";
};

const getPadSourceForKey = (value?: string) => {
  const key = normalizeKeyForSelect(value);
  if (!key) return null;
  return PAD_FILE_MAP[key] ?? null;
};

const guessKeyFromContent = (content?: string): string | null => {
  if (!content) return null;
  const match = content.match(/\b([A-G][#b]?m?)\b/);
  if (!match) return null;
  return normalizeKeyForSelect(match[1]);
};

type TrackRecord = {
  id: string;
  titulo: string;
  tag?: string | null;
  versao?: string | null;
  tom?: string | null;
  original_tom?: string | null; // Tom original da cifra (quando foi importada)
  cifra_url?: string | null;
  cifra_content?: string | null;
  referencia?: string | null; // URL do YouTube
  section_timestamps?: Record<string, number> | null; // Timestamps das seções { "I": 0, "V1": 15, "C": 45 }
  bpm?: number | null; // BPM da música para o metrônomo
};

type EventRecord = {
  name: string;
  date: string;
};

const TrackDetails: React.FC = () => {
  const { eventId, trackId } = useParams<{
    eventId: string;
    trackId: string;
  }>();
  const navigate = useNavigate();
  const [track, setTrack] = useState<TrackRecord | null>(null);
  const [eventInfo, setEventInfo] = useState<EventRecord | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPadPlaying, setIsPadPlaying] = useState(false);
  const [isEditingCifra, setIsEditingCifra] = useState(false);
  const [isEditingTrack, setIsEditingTrack] = useState(false);
  const [resolvedCifraContent, setResolvedCifraContent] = useState("");
  const [editorInitialContent, setEditorInitialContent] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSongMap, setShowSongMap] = useState(true);
  const [showSectionOutlines, setShowSectionOutlines] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(100);
  const [capo, setCapo] = useState(0);
  const [playlistTracks, setPlaylistTracks] = useState<TrackRecord[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [columnLayout, setColumnLayout] = useState(false); // Layout em colunas
  const [lyricsOnly, setLyricsOnly] = useState(false); // Somente letras (sem acordes)
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false); // Estado do metrônomo
  const [metronomeBpm, setMetronomeBpm] = useState(120); // BPM do metrônomo
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioContextUnlockedRef = useRef<boolean>(false); // Track se o AudioContext foi desbloqueado
  const padAudioRef = useRef<HTMLAudioElement | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayerRef | null>(null); // Ref para acessar o tempo atual do YouTube
  const queryClient = useQueryClient();

  const fetchData = async () => {
    if (!trackId) return;
    setIsLoading(true);
    setErrorMessage(null);
      try {
        const trackPromise = supabase
          .from("tracks")
          .select(
            "id, titulo, tag, versao, tom, original_tom, cifra_url, cifra_content, referencia, section_timestamps, bpm"
          )
          .eq("id", trackId)
          .single<TrackRecord>();

        const shouldFetchEvent = Boolean(eventId && eventId !== "repertorio");
        const eventPromise = shouldFetchEvent
          ? supabase
              .from("events")
              .select("name, date")
              .eq("id", eventId)
              .single<EventRecord>()
          : Promise.resolve({ data: null, error: null } as any);

        // Busca todas as músicas do evento/playlist para navegação
        const playlistPromise = eventId && eventId !== "repertorio"
          ? supabase
              .from("event_tracks")
              .select("track_id, order_index, tracks(id, titulo, tag, versao, cifra_url)")
              .eq("event_id", eventId)
              .order("order_index")
          : Promise.resolve({ data: null, error: null } as any);

        const [{ data: trackData, error: trackError }, { data: eventData }, { data: playlistData }] =
          await Promise.all([trackPromise, eventPromise, playlistPromise]);

        if (trackError || !trackData) {
          throw trackError || new Error("Faixa não encontrada");
        }

        let resolvedKey = trackData.tom || "";
        let originalKey = trackData.original_tom || "";
        let shouldPersistKeys = false;

        // Se não tem tom definido, tenta adivinhar do conteúdo
        if (!resolvedKey && trackData.cifra_content) {
          const guess = guessKeyFromContent(trackData.cifra_content);
          if (guess) {
            resolvedKey = guess;
            shouldPersistKeys = true;
          }
        }

        // Se não tem original_tom, usa o tom atual como original
        if (!originalKey) {
          originalKey = resolvedKey || "D"; // D é comum no CifraClub
          shouldPersistKeys = true;
        }

        const normalizedKey =
          normalizeKeyForSelect(resolvedKey) ||
          normalizeKeyForSelect(originalKey) ||
          "C";
        const normalizedOriginalKey =
          normalizeKeyForSelect(originalKey) || normalizedKey;

        // Salva tom e original_tom se necessário
        if (shouldPersistKeys && trackId) {
          await supabase
            .from("tracks")
            .update({
              tom: normalizedKey,
              original_tom: normalizedOriginalKey,
            })
            .eq("id", trackId);
        }

        console.log('[TrackDetails] Dados da música carregados:', trackData);
        console.log('[TrackDetails] Referência YouTube:', trackData.referencia);

        // Se não tem referência mas tem cifra_url do CifraClub, buscar automaticamente
        if (!trackData.referencia && trackData.cifra_url && trackData.cifra_url.includes('cifraclub.com')) {
          console.log('[TrackDetails] Buscando referência YouTube automaticamente...');
          try {
            const preview = await fetchCifraPreview(trackData.cifra_url);
            if (preview?.youtubeUrl) {
              console.log('[TrackDetails] Referência YouTube encontrada:', preview.youtubeUrl);
              // Atualiza no banco de dados
              await supabase
                .from("tracks")
                .update({ referencia: preview.youtubeUrl })
                .eq("id", trackId);
              // Atualiza o trackData local
              trackData.referencia = preview.youtubeUrl;
            }
          } catch (error) {
            console.error('[TrackDetails] Erro ao buscar referência YouTube:', error);
          }
        }

        setTrack({
          ...trackData,
          tom: normalizedKey,
          original_tom: normalizedOriginalKey,
        });
        setSelectedKey(normalizedKey);

        // Atualiza BPM do metrônomo
        if (trackData.bpm) {
          setMetronomeBpm(trackData.bpm);
        }
        if (eventData) {
          setEventInfo(eventData);
        }

        // Configura lista de músicas para navegação
        if (playlistData && playlistData.length > 0) {
          const tracks = playlistData
            .map((et: any) => et.tracks)
            .filter(Boolean);
          setPlaylistTracks(tracks);
          const currentIndex = tracks.findIndex((t: any) => t.id === trackId);
          setCurrentTrackIndex(currentIndex);
        } else {
          setPlaylistTracks([]);
          setCurrentTrackIndex(-1);
        }
      } catch (error) {
        console.error("Erro ao carregar faixa:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar essa faixa."
        );
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, [eventId, trackId]);

  const { containerRef, isPulling, isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await fetchData();
      toast.success("Cifra atualizada");
    },
    enabled: true,
  });

  useEffect(() => {
    if (track?.tom) {
      const normalized = normalizeKeyForSelect(track.tom) || "C";
      setSelectedKey(normalized);
    }
  }, [track?.tom]);

  useEffect(() => {
    if (track?.cifra_content) {
      setResolvedCifraContent(track.cifra_content);
      setEditorInitialContent(track.cifra_content);
    } else {
      setResolvedCifraContent("");
      setEditorInitialContent("");
    }
  }, [track?.cifra_content]);


  // Função para alterar o tom (salva apenas o tom, não a cifra transposta)
  const handleKeyChange = async (newKey: string) => {
    if (!trackId || !track) return;

    setSelectedKey(newKey);

    try {
      // Salva apenas o tom selecionado, NÃO a cifra transposta
      const { error } = await supabase
        .from("tracks")
        .update({ tom: newKey })
        .eq("id", trackId);

      if (error) {
        console.error("Erro ao salvar tom:", error);
      } else {
        setTrack((prev) => (prev ? { ...prev, tom: newKey } : prev));
        if (eventId) {
          queryClient.invalidateQueries({ queryKey: ["playlist", eventId] });
        }
      }
    } catch (error) {
      console.error("Erro ao salvar tom:", error);
    }
  };

  const formattedDate = React.useMemo(() => {
    if (!eventInfo?.date) return null;
    const date = new Date(eventInfo.date + "T00:00:00");
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }, [eventInfo?.date]);

  const metadataText = React.useMemo(() => {
    const items: string[] = [];
    if (track?.tag?.trim()) {
      items.push(track.tag.trim());
    } else {
      items.push("Cifras");
    }
    if (formattedDate) items.push(formattedDate);
    return items.join(" • ");
  }, [track?.tag, formattedDate]);

  const currentPadKey = React.useMemo(() => {
    // Aplica regra dos relativos para o PAD: Em -> G, Bm -> D, etc.
    const relativeMajor = convertMinorToRelativeMajor(selectedKey);
    return normalizeKeyForSelect(relativeMajor) || AVAILABLE_KEYS[0];
  }, [selectedKey]);

  const ensurePadAudio = React.useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!padAudioRef.current) {
      padAudioRef.current = new Audio();
      padAudioRef.current.loop = true;
      padAudioRef.current.preload = "auto";
      padAudioRef.current.crossOrigin = "anonymous";
      padAudioRef.current.volume = 0.45;

      // iOS Safari fix: cria um buffer silencioso para "desbloquear" o audio
      const unlockAudio = () => {
        if (padAudioRef.current) {
          padAudioRef.current.play().then(() => {
            padAudioRef.current?.pause();
            padAudioRef.current!.currentTime = 0;
          }).catch(() => {
            // Ignora erro - tentativa de unlock
          });
        }
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
      };
      document.addEventListener('touchstart', unlockAudio, { once: true });
      document.addEventListener('click', unlockAudio, { once: true });
    }
    return padAudioRef.current;
  }, []);

  const stopPadAudio = React.useCallback(() => {
    if (padAudioRef.current) {
      padAudioRef.current.pause();
      padAudioRef.current.currentTime = 0;
    }
  }, []);

  const startPad = React.useCallback(
    async (keyValue?: string) => {
      const src =
        getPadSourceForKey(keyValue) ?? getPadSourceForKey(currentPadKey);
      if (!src) {
        console.warn("Nenhum pad disponível para esse tom.");
        setIsPadPlaying(false);
        return;
      }
      const audio = ensurePadAudio();
      if (!audio) return;
      const absoluteSrc = new URL(src, window.location.origin).toString();
      if (audio.src !== absoluteSrc) {
        audio.src = src;
        audio.load();
      }
      audio.currentTime = 0;

      try {
        // Tenta reproduzir o áudio
        await audio.play();
      } catch (error) {
        console.error("Erro ao reproduzir pad:", error);
        // Se falhar por política de autoplay, tenta novamente após user gesture
        if (error instanceof Error && error.name === 'NotAllowedError') {
          console.warn("Autoplay bloqueado. Aguardando interação do usuário.");
          // Mantém o estado como "playing" para tentar novamente
          // quando houver uma interação
        } else {
          setIsPadPlaying(false);
        }
      }
    },
    [currentPadKey, ensurePadAudio]
  );

  useEffect(() => {
    if (!isPadPlaying) {
      stopPadAudio();
      return;
    }
    startPad(currentPadKey);
    return () => {
      stopPadAudio();
    };
  }, [isPadPlaying, currentPadKey, startPad, stopPadAudio]);

  useEffect(() => {
    return () => {
      stopPadAudio();
    };
  }, [stopPadAudio]);

  useEffect(() => {
    setIsPadPlaying(false);
    stopPadAudio();
  }, [track?.id, stopPadAudio]);

  // Função para desbloquear o AudioContext no Safari
  const unlockAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!audioContextUnlockedRef.current) {
      // Safari precisa de um som real para desbloquear
      // Cria um buffer vazio e toca
      const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);

      // Resume o contexto
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      audioContextUnlockedRef.current = true;
    }
  };

  const handlePadToggle = async () => {
    // Desbloquear AudioContext quando liga o PAD (ajuda o metrônomo também)
    if (!isPadPlaying) {
      await unlockAudioContext();
    }
    setIsPadPlaying((prev) => !prev);
  };

  const handleMetronomeToggle = async () => {
    if (isMetronomePlaying) {
      // Parar metrônomo
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      setIsMetronomePlaying(false);
    } else {
      // Desbloquear AudioContext (especialmente importante no Safari)
      await unlockAudioContext();

      const playClick = () => {
        if (!audioContextRef.current) return;

        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.frequency.value = 800; // Hz
        gainNode.gain.value = 0.3; // 30% volume

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.1); // 100ms
      };

      playClick(); // Primeiro click imediato

      const interval = 60000 / metronomeBpm; // Intervalo em ms
      metronomeIntervalRef.current = setInterval(playClick, interval);
      setIsMetronomePlaying(true);
    }
  };

  // Cleanup do metrônomo ao desmontar
  useEffect(() => {
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, []);

  // Atualiza o intervalo do metrônomo quando BPM mudar (se estiver tocando)
  useEffect(() => {
    if (isMetronomePlaying && metronomeIntervalRef.current && audioContextRef.current) {
      // Para o metrônomo atual
      clearInterval(metronomeIntervalRef.current);

      const playClick = () => {
        if (!audioContextRef.current) return;
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
      };

      const interval = 60000 / metronomeBpm;
      metronomeIntervalRef.current = setInterval(playClick, interval);
    }
  }, [metronomeBpm, isMetronomePlaying]);

  const handleEditCifraClick = () => {
    const contentToEdit =
      (track?.cifra_content && track.cifra_content.trim().length > 0
        ? track.cifra_content
        : resolvedCifraContent) || "";

    if (!contentToEdit.trim()) {
      toast.error("Nenhuma cifra disponível para editar.");
      return;
    }

    setEditorInitialContent(contentToEdit);
    setIsEditingCifra(true);
  };

  // Funções de navegação entre músicas
  const handlePreviousTrack = () => {
    if (currentTrackIndex > 0 && playlistTracks.length > 0) {
      const previousTrack = playlistTracks[currentTrackIndex - 1];
      navigate(`/playlist/${eventId}/track/${previousTrack.id}`);
    }
  };

  const handleNextTrack = () => {
    if (currentTrackIndex < playlistTracks.length - 1 && playlistTracks.length > 0) {
      const nextTrack = playlistTracks[currentTrackIndex + 1];
      navigate(`/playlist/${eventId}/track/${nextTrack.id}`);
    }
  };

  // Converte código da seção para nome legível
  const getSectionDisplayName = (sectionCode: string): string => {
    const upperCode = sectionCode.toUpperCase();

    const sectionNames: Record<string, string> = {
      'I': 'Intro',
      'V1': 'Verso 1',
      'V2': 'Verso 2',
      'V3': 'Verso 3',
      'V4': 'Verso 4',
      'PR': 'Pré-Refrão',
      'PC': 'Pré-Refrão',
      'R': 'Refrão',
      'R1': 'Refrão 1',
      'R2': 'Refrão 2',
      'R3': 'Refrão 3',
      'C': 'Refrão',
      'C1': 'Refrão 1',
      'C2': 'Refrão 2',
      'C3': 'Refrão 3',
      'S': 'Solo',
      'S1': 'Solo 1',
      'S2': 'Solo 2',
      'PO': 'Ponte',
      'B': 'Bridge',
      'B1': 'Bridge 1',
      'B2': 'Bridge 2',
      'IS': 'Instrumental',
      'IN': 'Instrumental',
      'O': 'Final',
      'TA': 'Turnaround',
      'T': 'Turnaround',
      'TG': 'Tag',
      'IT': 'Interlúdio',
      'RF': 'Refrão Final',
    };

    return sectionNames[upperCode] || upperCode;
  };

  // Auto-scroll: Atualiza a seção ativa baseado no tempo atual do YouTube
  const handleYouTubeTimeUpdate = React.useCallback((currentTime: number) => {
    if (!track?.section_timestamps) return;

    const timestamps = track.section_timestamps;
    const sections = Object.entries(timestamps).sort((a, b) => a[1] - b[1]); // Ordena por timestamp

    // Encontra a seção atual baseado no tempo
    let currentSection: string | null = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      const [sectionId, timestamp] = sections[i];
      if (currentTime >= timestamp) {
        currentSection = sectionId;
        break;
      }
    }

    // Atualiza a seção ativa (isso vai fazer o scroll automático no CifraDisplay)
    if (currentSection && currentSection !== activeSection) {
      setActiveSection(currentSection);
    }
  }, [track?.section_timestamps, activeSection]);

  const handleSaveCifra = async (newContent: string) => {
    if (!trackId) {
      throw new Error("Faixa inválida");
    }

    const { error } = await supabase
      .from("tracks")
      .update({ cifra_content: newContent })
      .eq("id", trackId);

    if (error) {
      console.error("Erro ao salvar cifra:", error);
      throw new Error("Não foi possível salvar a cifra.");
    }

    setTrack((prev) => (prev ? { ...prev, cifra_content: newContent } : prev));
    setResolvedCifraContent(newContent);
    setEditorInitialContent(newContent);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
      </div>
    );
  }

  if (errorMessage || !track) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center space-y-4 p-6 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-lg font-semibold">
            {errorMessage || "Faixa não encontrada"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] px-4 py-2 text-black font-semibold hover:bg-[#1ed760] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
      />
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white overflow-x-hidden">
        {/* Barra superior fixa - Mobile */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-sm border-b border-white/10 px-3 py-2 flex items-center justify-between">
          {/* Botão voltar */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Nome da música - Centro */}
          <div className="flex-1 mx-3 text-center truncate">
            <h1 className="text-sm font-semibold text-white truncate">
              {track.titulo}
            </h1>
          </div>

          {/* PAD e Settings - Direita */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePadToggle}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase transition-all duration-200 ${
                isPadPlaying
                  ? "bg-[#1DB954] text-black border-[#1DB954]"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/15"
              }`}
            >
              {isPadPlaying ? "PAD Tocando" : "Iniciar PAD"}
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
              aria-label="Abrir controles"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Song Map fixo no topo - abaixo da barra de navegação */}
        {showSongMap && resolvedCifraContent && (
          <div className="fixed top-14 left-0 right-0 z-30 bg-[#121212]/95 backdrop-blur-sm border-b border-white/10 py-2 px-4">
            <SongMap
              cifraContent={resolvedCifraContent}
              onSectionClick={(sectionId) => {
                console.log('[TrackDetails] Clicou na seção:', sectionId);
                console.log('[TrackDetails] Timestamps disponíveis:', track?.section_timestamps);
                setActiveSection(sectionId);

                // Extrai o label da seção do sectionId (remove "section-" e converte para maiúsculo)
                // Exemplo: "section-v1" -> "V1", "section-r1" -> "R1"
                const sectionLabel = sectionId.replace('section-', '').toUpperCase();
                console.log('[TrackDetails] Label extraído:', sectionLabel);

                // Se tem timestamps, pula o áudio do YouTube para a seção clicada
                if (track?.section_timestamps && track.section_timestamps[sectionLabel] !== undefined) {
                  const timestamp = track.section_timestamps[sectionLabel];
                  console.log('[TrackDetails] Pulando para timestamp:', timestamp);
                  youtubePlayerRef.current?.seekTo(timestamp);
                  const sectionName = getSectionDisplayName(sectionLabel);
                  toast.success(`Pulou para ${sectionName} (${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')})`);
                } else {
                  console.warn('[TrackDetails] Nenhum timestamp encontrado para:', sectionLabel);
                }
              }}
            />
          </div>
        )}

        {/* Conteúdo principal da cifra - com scroll interno e altura fixa */}
        <div
          ref={containerRef}
          className={`fixed left-0 right-0 overflow-y-auto ${
            showSongMap && resolvedCifraContent
              ? 'top-[7.5rem]' // top-14 (56px) + SongMap (~64px)
              : 'top-14'
          }`}
          style={{
            bottom: track?.cifra_url ? '110px' : '0', // Altura do YouTubePlayer quando presente
          }}
        >
          <div className="px-4 w-full">
            <CifraDisplay
              cifra={track.cifra_url || undefined}
              cifraContent={track.cifra_content || undefined}
              originalKey={track.original_tom || track.tom || "D"}
              selectedKey={selectedKey}
              capo={capo}
              activeSection={activeSection}
              fontSize={fontSize}
              columnLayout={columnLayout}
              lyricsOnly={lyricsOnly}
              onContentResolved={(content) => {
                setResolvedCifraContent(content);
                setEditorInitialContent(content);
              }}
              onMetadataExtracted={async (metadata) => {
                // Salva metadados extraídos do Google Docs no banco
                if (!trackId) return;

                const updates: any = {};
                if (metadata.titulo && !track.titulo) updates.titulo = metadata.titulo;
                if (metadata.versao && !track.versao) updates.versao = metadata.versao;
                if (metadata.tom && !track.tom) updates.tom = metadata.tom;
                if (metadata.referencia && !track.referencia) updates.referencia = metadata.referencia;

                if (Object.keys(updates).length > 0) {
                  console.log('[TrackDetails] Salvando metadados extraídos:', updates);
                  const { error } = await supabase
                    .from("tracks")
                    .update(updates)
                    .eq("id", trackId);

                  if (error) {
                    console.error('[TrackDetails] Erro ao salvar metadados:', error);
                  } else {
                    // Atualiza estado local
                    setTrack((prev) => (prev ? { ...prev, ...updates } : prev));
                    if (updates.tom) {
                      setSelectedKey(updates.tom);
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* YouTube Player fixo no footer */}
        {track?.cifra_url && (
          <div className="fixed bottom-0 left-0 right-0 z-30">
            <YouTubePlayer
              ref={youtubePlayerRef}
              youtubeUrl={track.referencia || undefined}
              trackTitle={track.titulo}
              trackVersion={track.versao || undefined}
              onTimeUpdate={handleYouTubeTimeUpdate}
              sectionTimestamps={track.section_timestamps}
              bpm={metronomeBpm}
              onMetronomeToggle={handleMetronomeToggle}
              isMetronomePlaying={isMetronomePlaying}
              onBpmChange={setMetronomeBpm}
            />
          </div>
        )}
      </div>
      {isEditingCifra && (
        <CifraEditor
          initialContent={editorInitialContent}
          onClose={() => setIsEditingCifra(false)}
          onSaveContent={handleSaveCifra}
        />
      )}

      <ControlsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedKey={selectedKey}
        onKeyChange={handleKeyChange}
        capo={capo}
        onCapoChange={setCapo}
        isPadPlaying={isPadPlaying}
        onPadToggle={handlePadToggle}
        onEditClick={handleEditCifraClick}
        onEditTrackClick={() => setIsEditingTrack(true)}
        showSongMap={showSongMap}
        onToggleSongMap={setShowSongMap}
        showSectionOutlines={showSectionOutlines}
        onToggleSectionOutlines={setShowSectionOutlines}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        columnLayout={columnLayout}
        onToggleColumnLayout={() => setColumnLayout(!columnLayout)}
        lyricsOnly={lyricsOnly}
        onToggleLyricsOnly={setLyricsOnly}
      />

      <TrackFormModal
        isOpen={isEditingTrack}
        onClose={() => setIsEditingTrack(false)}
        onSuccess={() => {
          setIsEditingTrack(false);
          // Recarregar dados da música
          window.location.reload();
        }}
        trackId={trackId}
      />
    </>
  );
};

export default TrackDetails;
