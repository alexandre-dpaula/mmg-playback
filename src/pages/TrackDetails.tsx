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
import { AVAILABLE_KEYS, convertMinorToRelativeMajor, transposeContent } from "@/utils/chordTransposer";

const PAD_FILE_MAP: Record<string, string> = {
  C: getPadUrl("C Guitar Pads.m4a"),
  Db: getPadUrl("Db Guitar Pads.m4a"),
  D: getPadUrl("D Guitar Pads.m4a"),
  Eb: getPadUrl("Eb Guitar Pads.m4a"),
  E: getPadUrl("E Guitar Pads.m4a"),
  F: getPadUrl("F Guitar Pads.m4a"),
  Gb: getPadUrl("Gb Guitar Pads.m4a"),
  G: getPadUrl("G Guitar Pads.m4a"),
  Ab: getPadUrl("Ab Guitar Pads.m4a"),
  A: getPadUrl("A Guitar Pads.m4a"),
  Bb: getPadUrl("Bb Guitar Pads.m4a"),
  B: getPadUrl("B Guitar Pads.m4a"),
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
  if (!value) return "";
  const sanitized = value.replace(/♯/g, "#").replace(/♭/g, "b");
  const token = extractKeyToken(sanitized);
  if (!token) return "";
  const upperToken = token.toUpperCase();
  return AVAILABLE_KEYS.includes(upperToken) ? upperToken : "";
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
  cifra_url?: string | null;
  cifra_content?: string | null;
};

type EventRecord = {
  name: string;
  date: string;
};

const TrackDetails: React.FC = () => {
  const { eventId, trackId } = useParams<{ eventId: string; trackId: string }>();
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
            "id, titulo, tag, versao, tom, cifra_url, cifra_content"
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
        let shouldPersistGuess = false;

        if (!resolvedKey && trackData.cifra_content) {
          const guess = guessKeyFromContent(trackData.cifra_content);
          if (guess) {
            resolvedKey = guess;
            shouldPersistGuess = true;
          }
        }

        const normalizedKey = normalizeKeyForSelect(resolvedKey) || "C";

        if (shouldPersistGuess && trackId) {
          await supabase
            .from("tracks")
            .update({ tom: normalizedKey })
            .eq("id", trackId);
        }

        setTrack({ ...trackData, tom: normalizedKey });
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

  // Função para alterar o tom (salva no banco e atualiza UI)
  const handleKeyChange = async (newKey: string) => {
    if (!trackId || !track) return;

    const previousKeyLabel = track.tom && track.tom.trim() ? track.tom : selectedKey;
    const previousKey = normalizeKeyForSelect(previousKeyLabel) || selectedKey;

    setSelectedKey(newKey);

    const transposedContent =
      track.cifra_content && previousKey
        ? transposeContent(track.cifra_content, previousKey, newKey)
        : track.cifra_content || "";

    try {
      const { error } = await supabase
        .from("tracks")
        .update({ tom: newKey, cifra_content: transposedContent })
        .eq("id", trackId);

      if (error) {
        console.error("Erro ao salvar tom:", error);
      } else {
        setTrack((prev) =>
          prev ? { ...prev, tom: newKey, cifra_content: transposedContent } : prev,
        );
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
      const src = getPadSourceForKey(keyValue) ?? getPadSourceForKey(currentPadKey);
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
      .from('tracks')
      .update({ cifra_content: newContent })
      .eq('id', trackId);

    if (error) {
      console.error('Erro ao salvar cifra:', error);
      throw new Error('Não foi possível salvar a cifra.');
    }

    setTrack(prev => (prev ? { ...prev, cifra_content: newContent } : prev));
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
          <p className="text-lg font-semibold">{errorMessage || "Faixa não encontrada"}</p>
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

      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para playlist
          </button>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-lg shadow-black/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="space-y-1">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Cifras
                </span>
                <div className="flex flex-wrap items-baseline gap-1 text-balance">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                    {track.titulo}
                  </h2>
                  {track.versao?.trim() && (
                    <span className="text-xs sm:text-sm text-white/70 font-semibold">
                      • {track.versao.trim()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditingCifra(true)}
              className="px-3 py-1.5 bg-[#1DB954] text-black text-xs font-semibold rounded-full hover:bg-[#1ed760] transition-colors flex-shrink-0 ml-4"
            >
              Editar Cifra
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-[#1DB954] text-xs sm:text-sm font-semibold uppercase tracking-wide">
                  Tom
                </span>
                <Select value={selectedKey} onValueChange={handleKeyChange}>
                  <SelectTrigger className="w-20 sm:w-24 h-9 sm:h-10 bg-white/10 border-white/15 text-white text-xs sm:text-sm font-semibold">
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
              <button
                type="button"
                onClick={handlePadToggle}
                className={`h-9 sm:h-10 w-24 sm:w-28 rounded-lg border text-xs sm:text-sm font-semibold uppercase tracking-wide transition-colors duration-200 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  isPadPlaying
                    ? "bg-[#1DB954] text-black border-[#1DB954]"
                    : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                }`}
              >
                Pad
              </button>
            </div>
          </div>

          <div className="mt-6">
            <CifraDisplay
              cifra={track.cifra_url || undefined}
              cifraContent={track.cifra_content || undefined}
              originalKey={selectedKey}
              selectedKey={selectedKey}
            />
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
