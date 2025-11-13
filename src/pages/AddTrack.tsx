import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, File } from "lucide-react";
import { AVAILABLE_KEYS } from "@/utils/chordTransposer";
import { uploadAudioToSupabase } from "@/lib/supabase";
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

const TAG_OPTIONS = ["Cifras", "Vocal", "Instrumental"];

const formSchema = z
  .object({
    playlistTitle: z.string().min(3, "Informe o evento"),
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
  playlistTitle: "",
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as
    | string
    | undefined;

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

  const handleSubmit = async (values: FormValues) => {
    if (!scriptUrl) {
      toast.error("URL do Apps Script não configurada (.env).");
      return;
    }

    let audioUrl = values.url?.trim() || "";

    // Se tem arquivo de áudio, fazer upload primeiro
    if (audioFile && !audioUrl) {
      try {
        toast.info("Fazendo upload do áudio...");
        audioUrl = await handleAudioUpload(audioFile);
        toast.success("Áudio enviado com sucesso!");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao fazer upload do áudio";
        toast.error(message);
        return;
      }
    }

    const payload = {
      playlistTitle: values.playlistTitle.trim(),
      title: values.title.trim(),
      versao: values.versao?.trim() || "",
      tom: values.tom?.trim() || "",
      url: audioUrl,
      tag: values.tag?.trim() || "",
      pauta: values.pauta?.trim() || "",
    };

    try {
      // Tenta enviar com redirect: 'follow' para seguir redirecionamentos do Google
      const response = await fetch(scriptUrl, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(payload),
      });

      // Tenta ler a resposta
      let data;
      try {
        data = await response.json();
      } catch {
        // Se não conseguir ler JSON, assume sucesso baseado no status
        if (response.ok || response.type === "opaque") {
          data = { success: true };
        } else {
          throw new Error("Resposta inválida do servidor");
        }
      }

      if (!data?.success && response.ok === false) {
        throw new Error(data?.message || "Não foi possível salvar a faixa.");
      }

      toast.success("Faixa adicionada com sucesso!");

      // Limpar completamente todos os campos
      form.reset(DEFAULT_VALUES);
      setAudioFile(null);
    } catch (error) {
      console.error("Erro ao enviar faixa:", error);
      const message =
        error instanceof Error ? error.message : "Erro ao enviar faixa.";
      toast.error(message);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:py-14">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para playlist
          </Link>
        </div>

        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1DB954]">
            Adicionar faixa
          </p>
          <h1 className="text-3xl font-semibold">Adicionar Faixa</h1>
          <p className="text-white/70">
            Use o formulário para registrar novas músicas rapidamente.
          </p>
        </header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 rounded-3xl bg-gradient-to-b from-[#1f1f1f] via-[#181818] to-[#121212] p-6 shadow-2xl shadow-black/40 ring-1 ring-white/10"
          >
            {/* Evento (playlistTitle) - 1 coluna */}
            <FormField
              control={form.control}
              name="playlistTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Evento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Culto Poder da Palavra"
                      className="!text-black placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título da música - 1 coluna */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Título da música</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Me amas"
                      className="!text-black placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tag e Tom - 2 colunas */}
            <div className="grid gap-6 min-[360px]:grid-cols-2">
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tag</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-white/10 border-white/20 text-white text-sm font-medium rounded-lg">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                        {TAG_OPTIONS.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className="text-sm py-3"
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
              <FormField
                control={form.control}
                name="tom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tom</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-white/10 border-white/20 text-white text-sm font-medium rounded-lg">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                        {AVAILABLE_KEYS.map((key) => (
                          <SelectItem
                            key={key}
                            value={key}
                            className="text-sm py-3"
                          >
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

            {/* Versão e Enviar Áudio - 2 colunas */}
            <div className="grid gap-6 min-[360px]:grid-cols-2">
              {/* Versão */}
              <FormField
                control={form.control}
                name="versao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Versão</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Diante do Trono"
                        className="!text-black placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enviar Áudio */}
              <div className="space-y-3">
                <FormLabel className="text-white">Enviar Áudio</FormLabel>

                {/* Botão de upload de arquivo */}
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="audio-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-white/20 transition"
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
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <File className="h-4 w-4" />
                      <span className="flex-1 truncate">{audioFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setAudioFile(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cifra / Pauta - 1 coluna */}
            <FormField
              control={form.control}
              name="pauta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Cifra</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira a Url do Google Doc"
                      className="!text-black placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="h-12 w-full bg-[#1DB954] text-black text-base font-semibold hover:bg-[#1ed760]"
            >
              {(isSubmitting || isUploading) && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              {isUploading ? "Enviando áudio..." : "Adicionar Faixa"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddTrackPage;
