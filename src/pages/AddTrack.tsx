import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase, addTrackToSupabase, processCifraClub, fetchCifraPreview } from "@/lib/supabase";
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
import { processCifraClubVersion } from "@/utils/versionNormalizer";

const formSchema = z.object({
  title: z.string().min(2, "Informe o título da música"),
  versao: z.string().optional(),
  tom: z.string().optional(),
  url: z.string().url("Informe uma URL válida").optional().or(z.literal("")),
  referencia: z.string().url("Informe uma URL válida").optional().or(z.literal("")),
  pauta: z
    .string()
    .url("Informe uma URL válida")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  title: "",
  versao: "",
  tom: "",
  url: "",
  referencia: "",
  pauta: "",
};

const AddTrackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFetchingCifraMetadata, setIsFetchingCifraMetadata] = useState(false);
  const [lastAutoFilledUrl, setLastAutoFilledUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Pega a origem da navegação (de onde o usuário veio)
  const from = (location.state as { from?: string })?.from;

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
          const currentReferencia = form.getValues("referencia")?.trim();

          if (metadata.title && !currentTitle) {
            form.setValue("title", metadata.title, { shouldDirty: true });
            updated = true;
          }
          if (metadata.version && !currentVersion) {
            const normalizedVersion = processCifraClubVersion(metadata.version);
            form.setValue("versao", normalizedVersion, { shouldDirty: true });
            updated = true;
          }
          if (metadata.key && !currentKey) {
            const normalizedKey = normalizeKeyForForm(metadata.key);
            if (normalizedKey) {
              form.setValue("tom", normalizedKey, { shouldDirty: true });
              updated = true;
            }
          }
          if (metadata.youtubeUrl && !currentReferencia) {
            form.setValue("referencia", metadata.youtubeUrl, { shouldDirty: true });
            updated = true;
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


  const maybeAddTrackToCurrentEvent = async (trackId: string, trackTitle: string) => {
    const selectedEventId = getSelectedEventId();
    if (!selectedEventId) {
      // Sem evento selecionado, apenas informa
      console.log("Nenhum evento selecionado, música criada apenas no banco geral");
      return;
    }

    try {
      // Adiciona automaticamente à playlist atual sem perguntar
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

      toast.success(`"${trackTitle}" adicionada à playlist atual!`);
    } catch (error) {
      console.error("Erro ao vincular faixa ao evento:", error);
      toast.error("Não foi possível adicionar a faixa na playlist atual.");
    }
  };

  const handleSubmit = async (values: FormValues) => {
    const trackData = {
      evento: "",
      titulo: values.title.trim(),
      versao: values.versao?.trim() || "",
      tom: values.tom || "",
      tag: "",
      cifra_url: values.pauta?.trim() || "",
      audio_url: "",
      referencia: values.referencia?.trim() || "",
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
          url: "",
          tag: "",
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

      toast.success("Faixa adicionada com sucesso!", { id: submissionToast });

      // Adiciona à playlist atual se houver evento selecionado
      const selectedEventId = getSelectedEventId();
      await maybeAddTrackToCurrentEvent(trackId, trackData.titulo);

      // Limpar completamente todos os campos
      form.reset(DEFAULT_VALUES);

      // Redireciona para a playlist atual ou para a página inicial
      setTimeout(() => {
        if (selectedEventId) {
          // Redireciona para a playlist atual para ver a música adicionada
          navigate(`/playlist/${selectedEventId}`);
        } else {
          // Se não tem playlist, vai para a página inicial
          navigate(`/`);
        }
      }, 500);
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
            </div>

            {/* Campo Referência (YouTube) */}
            <FormField
              control={form.control}
              name="referencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-white/90">Referência (YouTube)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="URL do YouTube será preenchida automaticamente"
                      className="!text-black placeholder:text-gray-400 h-9"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-white/50 mt-1">
                    💡 Preenchido automaticamente ao colar URL do CifraClub
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed760] mt-6"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Adicionar Faixa
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddTrackPage;
