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

const TAG_OPTIONS = ["Cifras", "Vocal", "Instrumental"];

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
  const [tag, setTag] = useState("");
  const [cifraUrl, setCifraUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  const isEditing = Boolean(trackId);

  const resetForm = useCallback(() => {
    setTitulo("");
    setVersao("");
    setTom("");
    setTag("");
    setCifraUrl("");
  }, []);

  const isFormDisabled = isSaving || (isEditing && isLoadingTrack);

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
      try {
        const { data, error } = await supabase
          .from("tracks")
          .select("titulo, versao, tom, tag, cifra_url")
          .eq("id", trackId)
          .single();

        if (error) throw error;
        if (!isMounted) return;

        setTitulo(data?.titulo ?? "");
        setVersao(data?.versao ?? "");
        setTom(data?.tom ?? "");
        setTag(data?.tag ?? "");
        setCifraUrl(data?.cifra_url ?? "");
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

    if (tag === "Cifras" && !cifraUrl.trim()) {
      toast.error("Para tag Cifras, o link da cifra é obrigatório");
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
        tag: tag || null,
        cifra_url: cifraUrl.trim() || null,
      };

      if (isEditing && trackId) {
        const { error } = await supabase
          .from("tracks")
          .update(trackData)
          .eq("id", trackId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tracks")
          .insert([trackData]);

        if (error) throw error;
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

            {/* Tag */}
            <div className="space-y-2">
              <Label htmlFor="tag" className="text-white">
                Tag (opcional)
              </Label>
              <Select value={tag} onValueChange={setTag} disabled={isFormDisabled}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecione a tag" />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-white/20">
                  <SelectItem value=" " className="text-white hover:bg-white/10">
                    Nenhuma
                  </SelectItem>
                  {TAG_OPTIONS.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="text-white hover:bg-white/10 focus:bg-white/20"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Link da Cifra */}
            <div className="space-y-2">
              <Label htmlFor="cifraUrl" className="text-white">
                Link da Cifra {tag === "Cifras" && <span className="text-[#1DB954]">*</span>}
              </Label>
              <Input
                id="cifraUrl"
                value={cifraUrl}
                onChange={(e) => setCifraUrl(e.target.value)}
                placeholder="https://www.cifraclub.com/..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={isFormDisabled}
              />
              {tag === "Cifras" && (
                <p className="text-xs text-white/60">
                  Obrigatório para músicas com tag "Cifras"
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
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
