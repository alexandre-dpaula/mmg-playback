import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase, getPadUrl } from "@/lib/supabase";
import { CifraDisplay } from "@/components/CifraDisplay";
import { CifraEditor } from "@/components/CifraEditor";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AVAILABLE_KEYS,
  convertMinorToRelativeMajor,
  transposeContent,
} from "@/utils/chordTransposer";

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
  const padAudioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!trackId) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const trackPromise = supabase
          .from("tracks")
          .select(
            "id, titulo, tag, versao, tom, original_tom, cifra_url, cifra_content"
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

        const [{ data: trackData, error: trackError }, { data: eventData }] =
          await Promise.all([trackPromise, eventPromise]);

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

        setTrack({
          ...trackData,
          tom: normalizedKey,
          original_tom: normalizedOriginalKey,
        });
        setSelectedKey(normalizedKey);
        if (eventData) {
          setEventInfo(eventData);
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

    fetchData();
  }, [eventId, trackId]);

  useEffect(() => {
    if (track?.tom) {
      const normalized = normalizeKeyForSelect(track.tom) || "C";
      setSelectedKey(normalized);
    }
  }, [track?.tom]);

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
    (keyValue?: string) => {
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
      audio.play().catch((error) => {
        console.error("Erro ao reproduzir pad:", error);
        setIsPadPlaying(false);
      });
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

  const handlePadToggle = () => {
    setIsPadPlaying((prev) => !prev);
  };

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
      ┌─────────────────────────────────┐ │ CONTROLES │
      ├──────────────┬──────────────────┤ │ Tom │ Categoria │ │ [Selector] │
      [Badge: Vocal] │ ├─────────────────────────────────┤ │ Áudio: [Tocar Pad]
      (Full) │ ├─────────────────────────────────┤ │ [Editar Cifra] (Full) │
      └─────────────────────────────────┘{" "}
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-20 md:pt-0 pb-24 md:pb-8 px-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition text-xs sm:text-sm font-semibold mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span>Voltar para playlist</span>
          </button>

          {/* Layout responsivo: controles no topo (mobile) ou lateral (desktop/tablet) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* Painel de controle - No topo em mobile, lateral em desktop */}
            <div className="lg:col-span-4 xl:col-span-3 min-w-0 lg:order-2">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-5 shadow-lg shadow-black/30">
                <h3 className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wide mb-3 sm:mb-4">
                  Controles
                </h3>

                {/* Primeira linha: Tom | Pad */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {/* Tom */}
                  <div>
                    <label className="text-[#1DB954] text-xs font-semibold uppercase tracking-wide mb-1 block">
                      Tom
                    </label>
                    <Select value={selectedKey} onValueChange={handleKeyChange}>
                      <SelectTrigger className="w-full h-10 bg-white/10 border-white/15 text-white font-semibold text-xs">
                        <SelectValue placeholder={track.tom || "C"} />
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

                  {/* Pad */}
                  <div>
                    <label className="text-[#1DB954] text-xs font-semibold uppercase tracking-wide mb-1 block">
                      Pad
                    </label>
                    <button
                      type="button"
                      onClick={handlePadToggle}
                      className={`w-full h-10 rounded-lg border font-semibold uppercase tracking-wide transition-all duration-200 text-xs ${
                        isPadPlaying
                          ? "bg-[#1DB954] text-black border-[#1DB954] shadow-lg shadow-[#1DB954]/30"
                          : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                      }`}
                    >
                      {isPadPlaying ? "Tocando" : "Ativar"}
                    </button>
                  </div>
                </div>

                {/* Segunda linha: Editar Cifra | Categoria */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* Editar Cifra */}
                  <div>
                    <button
                      onClick={() => setIsEditingCifra(true)}
                      className="w-full h-10 px-3 sm:px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors border border-white/15 uppercase tracking-wide"
                    >
                      Editar
                    </button>
                  </div>

                  {/* Categoria */}
                  {track.tag && (
                    <div>
                      <div className="h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#1DB954] uppercase">
                          {track.tag}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Área principal da cifra */}
            <div className="lg:col-span-8 xl:col-span-9 min-w-0 lg:order-1">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg shadow-black/30">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                        Cifras
                      </span>
                      <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold break-words">
                          {track.titulo}
                        </h2>
                        {track.versao?.trim() && (
                          <span className="text-xs sm:text-sm text-white/70 font-semibold flex-shrink-0">
                            • {track.versao.trim()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  <CifraDisplay
                    cifra={track.cifra_url || undefined}
                    cifraContent={track.cifra_content || undefined}
                    originalKey={track.original_tom || track.tom || "D"}
                    selectedKey={selectedKey}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isEditingCifra && (
        <CifraEditor
          initialContent={track.cifra_content || ""}
          onClose={() => setIsEditingCifra(false)}
          onSaveContent={handleSaveCifra}
        />
      )}
    </>
  );
};

export default TrackDetails;
