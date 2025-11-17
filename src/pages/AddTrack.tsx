import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, File } from "lucide-react";
import { supabase, uploadAudioToSupabase, addTrackToSupabase, processCifraClub, fetchCifraPreview } from "@/lib/supabase";
import { getSelectedEventId } from "@/lib/preferences";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AVAILABLE_KEYS, convertMinorToRelativeMajor, formatNoteForDisplay } from "@/utils/chordTransposer";
import { isCifraClubUrl } from "@/utils/cifraClubParser";

const TAG_OPTIONS = ["Cifras", "Vocal", "Instrumental"];

const formSchema = z
  .object({
    title: z.string().min(2, "Informe o título da música"),
    versao: z.string().optional(),
    tom: z.string().optional(),
    url: z.string().url("Informe uma URL válida").optional().or(z.literal("")),
    tag: z.string().optional(),
    pauta: z
      .string()
      .url("Informe uma URL válida")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Se a tag for "Cifras", a pauta é obrigatória
      if (data.tag === "Cifras") {
        return Boolean(data.pauta?.trim());
      }
      return true;
    },
    {
      message: "Para tag Cifras, o link da cifra/pauta é obrigatório",
      path: ["pauta"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  title: "",
  versao: "",
  tom: "",
  url: "",
  tag: "",
  pauta: "",
};

const AddTrackPage: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingCifraMetadata, setIsFetchingCifraMetadata] = useState(false);
  const [lastAutoFilledUrl, setLastAutoFilledUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const cifraUrlValue = form.watch("pauta");

  const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as
    | string
    | undefined;

  useEffect(() => {
    if (!cifraUrlValue?.trim()) {
      setLastAutoFilledUrl(null);
    }
  }, [cifraUrlValue]);

  useEffect(() => {
    const trimmedUrl = cifraUrlValue?.trim();

    if (!trimmedUrl || !isCifraClubUrl(trimmedUrl) || trimmedUrl === lastAutoFilledUrl) {
      return;
    }

    let isActive = true;
    const handler = setTimeout(() => {
      setIsFetchingCifraMetadata(true);
      fetchCifraPreview(trimmedUrl)
        .then((metadata) => {
          if (!isActive || !metadata) return;

          let updated = false;
          const currentTitle = form.getValues("title")?.trim();
          const currentVersion = form.getValues("versao")?.trim();
          const currentKey = form.getValues("tom")?.trim();

          if (metadata.title && !currentTitle) {
            form.setValue("title", metadata.title, { shouldDirty: true });
            updated = true;
          }
          if (metadata.version && !currentVersion) {
            form.setValue("versao", metadata.version, { shouldDirty: true });
            updated = true;
          }
          if (metadata.key && !currentKey) {
            const normalizedKey = normalizeKeyForForm(metadata.key);
            if (normalizedKey) {
              form.setValue("tom", normalizedKey, { shouldDirty: true });
              updated = true;
            }
          }

          if (updated) {
            toast.success("Informações preenchidas automaticamente a partir da URL.");
          }

          setLastAutoFilledUrl(trimmedUrl);
        })
        .catch((error) => {
          if (!isActive) return;
          console.error("Erro ao buscar infos da cifra:", error);
          toast.error("Não foi possível obter os dados da cifra automaticamente.");
        })
        .finally(() => {
          if (isActive) {
            setIsFetchingCifraMetadata(false);
          }
        });
    }, 700);

    return () => {
      isActive = false;
      clearTimeout(handler);
      setIsFetchingCifraMetadata(false);
    };
  }, [cifraUrlValue, form, lastAutoFilledUrl]);

  const trimmedCifraUrl = cifraUrlValue?.trim() || "";
  const hasAutoFilledForCurrentUrl =
    Boolean(trimmedCifraUrl) && trimmedCifraUrl === lastAutoFilledUrl;

  const normalizeKeyForForm = (key?: string | null) => {
    if (!key) return "";
    const converted = convertMinorToRelativeMajor(key);
    const sanitized = converted.replace(/♯/g, "#").replace(/♭/g, "b");
    const formatted = formatNoteForDisplay(sanitized);
    const finalKey = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return AVAILABLE_KEYS.includes(finalKey) ? finalKey : "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo (apenas áudio)
      const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
        toast.error("Formato de áudio inválido. Use MP3, WAV, OGG ou M4A.");
        return;
      }

      // Validar tamanho (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 50MB.");
        return;
      }

      setAudioFile(file);
      toast.success(`Arquivo selecionado: ${file.name}`);
    }
  };

  const handleAudioUpload = async (file: File): Promise<string> => {
    setIsUploading(true);

    try {
      // Upload direto para Supabase Storage
      const publicUrl = await uploadAudioToSupabase(file, 'audios');
      return publicUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer upload do áudio";
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const maybeAddTrackToCurrentEvent = async (trackId: string, trackTitle: string) => {
    const selectedEventId = getSelectedEventId();
    if (!selectedEventId) {
      toast.info("Selecione um evento na aba Eventos para vincular novas faixas.");
      return;
    }

    const confirmAdd = window.confirm(
      `Deseja adicionar "${trackTitle}" na playlist selecionada agora?`
    );

    if (!confirmAdd) {
      return;
    }

    try {
      toast.info("Adicionando música à playlist atual...");
      const { count, error } = await supabase
        .from("event_tracks")
        .select("*", { count: "exact", head: true })
        .eq("event_id", selectedEventId);

      if (error) throw error;

      const orderIndex = count ?? 0;

      const { error: linkError } = await supabase.from("event_tracks").insert({
        event_id: selectedEventId,
        track_id: trackId,
        order_index: orderIndex,
      });

      if (linkError) throw linkError;

      toast.success("Música adicionada à playlist atual!");
    } catch (error) {
      console.error("Erro ao vincular faixa ao evento:", error);
      toast.error("Não foi possível adicionar a faixa na playlist atual.");
    }
  };

  const handleSubmit = async (values: FormValues) => {
    let audioUrl = values.url?.trim() || "";

    // 1. Upload do áudio se necessário
    if (audioFile && !audioUrl) {
      try {
        audioUrl = await handleAudioUpload(audioFile);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao fazer upload do áudio";
        toast.error(message);
        return;
      }
    }

    const trackData = {
      evento: "",
      titulo: values.title.trim(),
      versao: values.versao?.trim() || "",
      tom: values.tom || "",
      tag: values.tag?.trim() || "",
      cifra_url: values.pauta?.trim() || "",
      audio_url: audioUrl,
    };

    const submissionToast = toast.loading("Adicionando faixa...");

    try {
      // 2. Salvar no Supabase (principal)
      const trackId = await addTrackToSupabase(trackData);

      // 3. Processar cifra do CifraClub se necessário
      if (trackData.cifra_url && trackData.cifra_url.includes('cifraclub.com')) {
        await processCifraClub(trackId, trackData.cifra_url);
      }

      // 4. Backup no Google Sheets (em segundo plano)
      if (scriptUrl) {
        const payload = {
          playlistTitle: trackData.evento,
          title: trackData.titulo,
          url: trackData.audio_url,
          tag: trackData.tag,
          pauta: trackData.cifra_url,
        };

        fetch(scriptUrl, {
          method: "POST",
          redirect: "follow",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify(payload),
        }).catch((err) => {
          console.warn("Backup no Google Sheets falhou (não crítico):", err);
        });
      }

      await maybeAddTrackToCurrentEvent(trackId, trackData.titulo);
      toast.success("Faixa adicionada com sucesso!", { id: submissionToast });

      // Limpar completamente todos os campos
      form.reset(DEFAULT_VALUES);
      setAudioFile(null);
    } catch (error) {
      console.error("Erro ao enviar faixa:", error);
      const message =
        error instanceof Error ? error.message : "Erro ao enviar faixa.";
      toast.error(message, { id: submissionToast });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-20 md:pt-0 pb-8 md:pb-0">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Link>

        <header className="space-y-1 mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#1DB954] font-semibold">
            ADICIONAR FAIXA
          </p>
          <h1 className="text-2xl font-bold">Nova Música</h1>
          <p className="text-sm text-white/60">
            Preencha os campos para adicionar uma música
          </p>
        </header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 rounded-2xl bg-gradient-to-br from-[#181818] to-[#101010] p-5 border border-white/5"
          >
            {/* Cifra / Pauta - PRIMEIRO campo */}
            <FormField
              control={form.control}
              name="pauta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-white/90">Cifra (URL)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira URL ou Google Doc"
                      className="!text-black placeholder:text-gray-400 h-9"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-white/50 mt-1">
                    💡 Algumas URLs preenchem informações automaticamente
                  </p>
                  {isFetchingCifraMetadata && (
                    <p className="text-xs text-[#1DB954] mt-1 animate-pulse">
                      Buscando informações...
                    </p>
                  )}
                  {!isFetchingCifraMetadata && hasAutoFilledForCurrentUrl && (
                    <p className="text-xs text-[#1DB954] mt-1">
                      ✓ Preenchido automaticamente
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grid 2 colunas: Título + Versão */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-white/90">Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome da música"
                        className="!text-black placeholder:text-gray-400 h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="versao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-white/90">Versão</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Live, Studio..."
                        className="!text-black placeholder:text-gray-400 h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Grid 2 colunas: Tom + Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-white/90">Tom</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full h-9 bg-white/10 border-white/20 text-white text-sm rounded-lg">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                        {AVAILABLE_KEYS.map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-white/90">Tag</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-9 bg-white/10 border-white/20 text-white text-sm rounded-lg">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                        {TAG_OPTIONS.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className="text-sm py-2"
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Enviar Áudio */}
            <div className="space-y-2">
              <FormLabel className="text-sm text-white/90">Áudio (Opcional)</FormLabel>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="audio-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-sm rounded-lg cursor-pointer hover:bg-white/20 transition"
                >
                  {audioFile ? "Trocar arquivo" : "Escolher arquivo"}
                </label>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {audioFile && (
                  <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 px-3 py-2 rounded-lg">
                    <File className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{audioFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setAudioFile(null)}
                      className="text-red-400 hover:text-red-300 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="h-10 w-full bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed760] mt-6"
            >
              {(isSubmitting || isUploading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUploading ? "Enviando..." : "Adicionar Faixa"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddTrackPage;
