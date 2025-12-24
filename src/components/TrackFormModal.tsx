import React, { useState, useCallback } from "react";
import { X, Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AVAILABLE_KEYS } from "@/utils/chordTransposer";
import { useRefresh } from "@/context/RefreshContext";
import { isGoogleDocsUrl, extractDocId } from "@/hooks/useGoogleDoc";
import { parseGoogleDocContent } from "@/utils/googleDocParser";
import { fetchCifraPreview } from "@/lib/supabase";
import { processCifraClubVersion } from "@/utils/versionNormalizer";
import { autoGenerateTimestamps } from "@/utils/timestampGenerator";

type TrackFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trackId?: string | null;
};

export const TrackFormModal: React.FC<TrackFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  trackId,
}) => {
  const { triggerRefresh } = useRefresh();
  const [titulo, setTitulo] = useState("");
  const [versao, setVersao] = useState("");
  const [tom, setTom] = useState("");
  const [cifraUrl, setCifraUrl] = useState("");
  const [referencia, setReferencia] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const isEditing = Boolean(trackId);

  const resetForm = useCallback(() => {
    setTitulo("");
    setVersao("");
    setTom("");
    setCifraUrl("");
    setReferencia("");
  }, []);

  const isFormDisabled = isSaving || (isEditing && isLoadingTrack) || isLoadingMetadata;

  // Função para buscar metadados de Google Docs automaticamente
  const fetchGoogleDocsMetadata = useCallback(async (url: string) => {
    if (!isGoogleDocsUrl(url)) return;

    const docId = extractDocId(url);
    if (!docId) return;

    setIsLoadingMetadata(true);
    const loadingToast = toast.loading("Buscando informações do documento...");

    try {
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error(`Erro ao buscar documento: ${response.status}`);
      }

      const content = await response.text();
      const metadata = parseGoogleDocContent(content);

      // Preenche campos vazios com os metadados extraídos
      if (metadata.titulo && !titulo) setTitulo(metadata.titulo);
      if (metadata.versao && !versao) {
        const normalizedVersion = processCifraClubVersion(metadata.versao);
        setVersao(normalizedVersion);
      }
      if (metadata.tom && !tom) setTom(metadata.tom);
      if (metadata.referencia && !referencia) setReferencia(metadata.referencia);

      toast.success("Informações preenchidas automaticamente!", { id: loadingToast });
      console.log('[TrackFormModal] Metadados extraídos:', metadata);
    } catch (error) {
      console.error('[TrackFormModal] Erro ao buscar metadados:', error);
      toast.error("Não foi possível buscar as informações do documento", { id: loadingToast });
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [titulo, versao, tom, referencia]);

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsLoadingTrack(false);
    }
  }, [isOpen, resetForm]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (!trackId) {
      resetForm();
      return;
    }

    let isMounted = true;
    setIsLoadingTrack(true);

    const fetchTrackDetails = async () => {
      let trackData: any = null;

      try {
        const { data, error } = await supabase
          .from("tracks")
          .select("titulo, versao, tom, cifra_url, referencia")
          .eq("id", trackId)
          .single();

        if (error) throw error;
        if (!isMounted) return;

        trackData = data;

        console.log('[TrackFormModal] Dados carregados do banco para edição:', data);
        console.log('[TrackFormModal] Referência carregada do banco:', data?.referencia);

        setTitulo(data?.titulo ?? "");
        setVersao(data?.versao ?? "");
        setTom(data?.tom ?? "");
        setCifraUrl(data?.cifra_url ?? "");

        const referenciaValue = data?.referencia ?? "";
        console.log('[TrackFormModal] Setando referência no estado:', referenciaValue);
        setReferencia(referenciaValue);
      } catch (error) {
        if (!isMounted) return;
        console.error("Erro ao carregar música:", error);
        toast.error("Não foi possível carregar os dados da música");
        onClose();
      } finally {
        if (isMounted) {
          setIsLoadingTrack(false);
        }
      }

      // Se tem cifra_url do CifraClub, buscar automaticamente a URL do YouTube
      // Faz isso APÓS o loading inicial para não bloquear a interface
      if (trackData?.cifra_url && trackData.cifra_url.includes('cifraclub.com') && isMounted) {
        console.log('[TrackFormModal] Buscando referência YouTube automaticamente do CifraClub...');
        setIsLoadingMetadata(true);

        try {
          const preview = await fetchCifraPreview(trackData.cifra_url);
          console.log('[TrackFormModal] Preview recebido:', preview);
          if (preview?.youtubeUrl && isMounted) {
            console.log('[TrackFormModal] Referência YouTube encontrada:', preview.youtubeUrl);
            setReferencia(preview.youtubeUrl);
          } else {
            console.log('[TrackFormModal] Nenhuma referência YouTube encontrada no CifraClub');
          }
        } catch (error) {
          console.error('[TrackFormModal] Erro ao buscar referência YouTube:', error);
        } finally {
          if (isMounted) {
            setIsLoadingMetadata(false);
          }
        }
      }
    };

    fetchTrackDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, trackId, resetForm, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      toast.error("Informe o título da música");
      return;
    }

    setIsSaving(true);
    const savingToast = toast.loading(
      isEditing ? "Atualizando música..." : "Criando música..."
    );

    try {
      const trackData = {
        titulo: titulo.trim(),
        versao: versao.trim() || null,
        tom: tom || null,
        tag: "",
        cifra_url: cifraUrl.trim() || null,
        referencia: referencia.trim() || null,
      };

      console.log('[TrackFormModal] Estado do formulário antes de salvar:');
      console.log('  - titulo:', titulo);
      console.log('  - versao:', versao);
      console.log('  - tom:', tom);
      console.log('  - cifraUrl:', cifraUrl);
      console.log('  - referencia:', referencia);
      console.log('[TrackFormModal] Dados que serão salvos no banco:', trackData);

      // Se há URL da cifra, busca o conteúdo e gera timestamps automaticamente
      let generatedTimestamps: Record<string, number> | null = null;
      if (cifraUrl.trim()) {
        try {
          console.log('[TrackFormModal] Buscando conteúdo da cifra para gerar timestamps...');
          const cifraContent = await fetchCifraPreview(cifraUrl.trim());

          if (cifraContent) {
            generatedTimestamps = autoGenerateTimestamps(cifraContent);
            console.log('[TrackFormModal] Timestamps gerados automaticamente:', generatedTimestamps);

            if (Object.keys(generatedTimestamps).length > 0) {
              toast.success(`${Object.keys(generatedTimestamps).length} seções detectadas automaticamente!`);
            }
          }
        } catch (err) {
          console.warn('[TrackFormModal] Não foi possível gerar timestamps:', err);
          // Não bloqueia o salvamento se falhar a geração de timestamps
        }
      }

      // Adiciona timestamps ao trackData se foram gerados
      const finalTrackData = generatedTimestamps && Object.keys(generatedTimestamps).length > 0
        ? { ...trackData, section_timestamps: generatedTimestamps }
        : trackData;

      if (isEditing && trackId) {
        const { error } = await supabase
          .from("tracks")
          .update(finalTrackData)
          .eq("id", trackId);

        if (error) throw error;
        console.log('[TrackFormModal] Música atualizada com sucesso no banco');
      } else {
        const { error } = await supabase
          .from("tracks")
          .insert([finalTrackData]);

        if (error) throw error;
        console.log('[TrackFormModal] Música criada com sucesso no banco');
      }

      toast.success(
        isEditing ? "Música atualizada com sucesso!" : "Música criada com sucesso!",
        { id: savingToast }
      );

      // Trigger refresh para atualizar as listas
      triggerRefresh();

      onSuccess();

      if (!isEditing) {
        resetForm();
      }

      // Recarrega a página para garantir atualização completa
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar música:", error);
      const message =
        error instanceof Error ? error.message : "Erro ao salvar música";
      toast.error(message, { id: savingToast });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#121212] rounded-2xl flex flex-col shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? "Editar Música" : "Nova Música"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {isEditing && isLoadingTrack && (
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin text-[#1DB954]" />
                Carregando dados da música...
              </div>
            )}

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-white flex items-center gap-2">
                <Music className="w-4 h-4" />
                Título da Música
              </Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Nome da música"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={isFormDisabled}
              />
            </div>

            {/* Versão */}
            <div className="space-y-2">
              <Label htmlFor="versao" className="text-white">
                Versão (opcional)
              </Label>
              <Input
                id="versao"
                value={versao}
                onChange={(e) => setVersao(e.target.value)}
                placeholder="Ex: Acústica, Live, etc."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={isFormDisabled}
              />
            </div>

            {/* Tom */}
            <div className="space-y-2">
              <Label htmlFor="tom" className="text-white">
                Tom (opcional)
              </Label>
              <Select value={tom} onValueChange={setTom} disabled={isFormDisabled}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecione o tom" />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-white/20">
                  <SelectItem value=" " className="text-white hover:bg-white/10">
                    Nenhum
                  </SelectItem>
                  {AVAILABLE_KEYS.map((key) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-white hover:bg-white/10 focus:bg-white/20"
                    >
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Link da Cifra (Pauta) */}
            <div className="space-y-2">
              <Label htmlFor="cifraUrl" className="text-white flex items-center gap-2">
                Cifra (URL)
                {isLoadingMetadata && <Loader2 className="h-3 w-3 animate-spin text-[#1DB954]" />}
              </Label>
              <Input
                id="cifraUrl"
                value={cifraUrl}
                onChange={(e) => setCifraUrl(e.target.value)}
                onBlur={async (e) => {
                  const url = e.target.value.trim();
                  if (!url) return;

                  // Google Docs
                  if (isGoogleDocsUrl(url)) {
                    fetchGoogleDocsMetadata(url);
                    return;
                  }

                  // CifraClub
                  if (url.includes('cifraclub.com')) {
                    setIsLoadingMetadata(true);
                    const loadingToast = toast.loading("Carregando informações da cifra...");
                    try {
                      console.log('[TrackFormModal] Buscando prévia do CifraClub:', url);
                      const preview = await fetchCifraPreview(url);
                      console.log('[TrackFormModal] Prévia recebida:', preview);

                      if (preview) {
                        if (preview.title && !titulo) {
                          console.log('[TrackFormModal] Preenchendo título:', preview.title);
                          setTitulo(preview.title);
                        }
                        if (preview.version && !versao) {
                          const normalizedVersion = processCifraClubVersion(preview.version);
                          console.log('[TrackFormModal] Preenchendo versão:', normalizedVersion);
                          setVersao(normalizedVersion);
                        }
                        if (preview.key && !tom) {
                          console.log('[TrackFormModal] Preenchendo tom:', preview.key);
                          setTom(preview.key);
                        }
                        if (preview.youtubeUrl) {
                          console.log('[TrackFormModal] Preenchendo referência YouTube:', preview.youtubeUrl);
                          setReferencia(preview.youtubeUrl);
                        } else {
                          console.log('[TrackFormModal] YouTube URL não encontrada no CifraClub');
                        }
                        toast.success("Informações carregadas automaticamente!", { id: loadingToast });
                      } else {
                        console.log('[TrackFormModal] Nenhuma prévia retornada');
                        toast.dismiss(loadingToast);
                      }
                    } catch (error) {
                      console.error('[TrackFormModal] Erro ao buscar prévia:', error);
                      toast.error("Não foi possível carregar as informações", { id: loadingToast });
                    } finally {
                      setIsLoadingMetadata(false);
                    }
                  }
                }}
                placeholder="Insira URL do Google Doc ou CifraClub"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={isFormDisabled}
              />
              <p className="text-xs text-white/60">
                💡 URLs do Google Docs e CifraClub preenchem informações automaticamente
              </p>
            </div>

            {/* Referência (YouTube) */}
            <div className="space-y-2">
              <Label htmlFor="referencia" className="text-white flex items-center justify-between">
                <span>Referência (YouTube)</span>
                {cifraUrl && cifraUrl.includes('cifraclub.com') && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoadingMetadata(true);
                      const loadingToast = toast.loading("Buscando URL do YouTube...");
                      try {
                        const preview = await fetchCifraPreview(cifraUrl);
                        if (preview?.youtubeUrl) {
                          setReferencia(preview.youtubeUrl);
                          toast.success("URL do YouTube carregada!", { id: loadingToast });
                        } else {
                          toast.error("Nenhuma URL do YouTube encontrada", { id: loadingToast });
                        }
                      } catch (error) {
                        toast.error("Erro ao buscar URL do YouTube", { id: loadingToast });
                      } finally {
                        setIsLoadingMetadata(false);
                      }
                    }}
                    disabled={isLoadingMetadata}
                    className="text-xs px-2 py-1 bg-[#1DB954] text-black rounded hover:bg-[#1ed760] disabled:opacity-50"
                  >
                    {isLoadingMetadata ? "Buscando..." : "Buscar URL"}
                  </button>
                )}
              </Label>
              <Input
                id="referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="URL do YouTube"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={isFormDisabled}
              />
              <p className="text-xs text-white/60">
                💡 Preenchido automaticamente ao colar URL do CifraClub
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="bg-white/10 text-white hover:bg-white/20 border-0"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isFormDisabled}
              className="bg-[#1DB954] text-black hover:bg-[#1ed760] font-semibold px-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                (isEditing ? "Atualizar Música" : "Salvar Música")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
