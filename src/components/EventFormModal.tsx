import React, { useState, useMemo, useCallback } from "react";
import { X, Calendar, Music, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useRefresh } from "@/context/RefreshContext";
import { useAuth } from "@/context/AuthContext";

type Track = {
  id: string;
  titulo: string;
  tag?: string;
  versao?: string;
};

type EventFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (eventId: string) => void;
  eventId?: string | null;
};

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  eventId,
}) => {
  const { triggerRefresh } = useRefresh();
  const { user, profile } = useAuth();
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);

  const isEditing = Boolean(eventId);

  const resetForm = useCallback(() => {
    setEventName("");
    setEventDate("");
    setSelectedTracks([]);
    setSearchQuery("");
  }, []);

  const isFormDisabled = isSaving || (isEditing && isLoadingEvent);

  React.useEffect(() => {
    if (isOpen && availableTracks.length === 0) {
      loadTracks();
    }
  }, [isOpen, availableTracks.length]);

  const loadTracks = async () => {
    setIsLoadingTracks(true);
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("id, titulo, tag, versao")
        .order("titulo", { ascending: true });

      if (error) throw error;

      setAvailableTracks(data || []);
    } catch (error) {
      console.error("Erro ao carregar faixas:", error);
      toast.error("Erro ao carregar faixas disponíveis");
    } finally {
      setIsLoadingTracks(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsLoadingEvent(false);
    }
  }, [isOpen, resetForm]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (!eventId) {
      resetForm();
      return;
    }

    let isMounted = true;
    setIsLoadingEvent(true);

    const fetchEventDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select(
            `
              id,
              name,
              date,
              event_tracks (
                track_id,
                order_index
              )
            `
          )
          .eq("id", eventId)
          .single();

        if (error) throw error;
        if (!isMounted) return;

        setEventName(data?.name ?? "");
        setEventDate(data?.date ?? "");
        const trackIds =
          data?.event_tracks
            ?.sort(
              (a, b) =>
                (a.order_index ?? 0) - (b.order_index ?? 0)
            )
            .map((item) => item.track_id)
            .filter((id): id is string => Boolean(id)) ?? [];
        setSelectedTracks(trackIds);
      } catch (error) {
        if (!isMounted) return;
        console.error("Erro ao carregar evento:", error);
        toast.error("Não foi possível carregar os dados do evento");
        onClose();
      } finally {
        if (isMounted) {
          setIsLoadingEvent(false);
        }
      }
    };

    fetchEventDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, eventId, resetForm, onClose]);

  const handleTrackToggle = (trackId: string) => {
    if (isFormDisabled) return;
    setSelectedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const hasSearchQuery = searchQuery.trim().length >= 3;

  const displayedTracks = useMemo(() => {
    if (!isEditing) return availableTracks;
    if (hasSearchQuery) return availableTracks;
    return availableTracks.filter((track) => selectedTracks.includes(track.id));
  }, [availableTracks, isEditing, selectedTracks, hasSearchQuery]);

  // Filtrar tracks com base na busca
  const filteredTracks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return displayedTracks;
    return displayedTracks.filter(
      (track) =>
        track.titulo.toLowerCase().includes(query) ||
        track.tag?.toLowerCase().includes(query) ||
        track.versao?.toLowerCase().includes(query)
    );
  }, [displayedTracks, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName.trim()) {
      toast.error("Informe o nome do evento");
      return;
    }

    if (!eventDate) {
      toast.error("Informe a data do evento");
      return;
    }

    if (selectedTracks.length === 0) {
      toast.error("Selecione pelo menos uma música");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado. Faça login novamente.");
      return;
    }

    const editorName = profile.name || user.email || "Usuário";
    const nowIso = new Date().toISOString();
    const churchId = profile.churchId ?? null;

    setIsSaving(true);
    const savingToast = toast.loading(
      isEditing ? "Atualizando evento..." : "Criando evento..."
    );

    try {
      let currentEventId = eventId ?? null;

      if (isEditing && currentEventId) {
        const { error: eventError } = await supabase
          .from("events")
          .update({
            name: eventName.trim(),
            date: eventDate,
            updated_by: user.id,
            updated_by_name: editorName,
            updated_at: nowIso,
          })
          .eq("id", currentEventId);

        if (eventError) throw eventError;

        const { error: deleteError } = await supabase
          .from("event_tracks")
          .delete()
          .eq("event_id", currentEventId);

        if (deleteError) throw deleteError;

        const eventTracks = selectedTracks.map((trackId, index) => ({
          event_id: currentEventId!,
          track_id: trackId,
          order_index: index,
        }));

        if (eventTracks.length > 0) {
          const { error: tracksError } = await supabase
            .from("event_tracks")
            .insert(eventTracks);

          if (tracksError) throw tracksError;
        }
      } else {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .insert({
            name: eventName.trim(),
            date: eventDate,
            church_id: churchId,
            created_by: user.id,
            updated_by: user.id,
            updated_by_name: editorName,
            updated_at: nowIso,
          })
          .select()
          .single();

        if (eventError) throw eventError;

        currentEventId = eventData.id;

        const eventTracks = selectedTracks.map((trackId, index) => ({
          event_id: eventData.id,
          track_id: trackId,
          order_index: index,
        }));

        if (eventTracks.length > 0) {
          const { error: tracksError } = await supabase
            .from("event_tracks")
            .insert(eventTracks);

          if (tracksError) throw tracksError;
        }
      }

      toast.success(
        isEditing ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!",
        { id: savingToast }
      );

      // Trigger refresh para atualizar as listas
      triggerRefresh();

      if (currentEventId) {
        onSuccess(currentEventId);
      }

      if (!isEditing) {
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      const message =
        error instanceof Error ? error.message : "Erro ao salvar evento";
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
            {isEditing ? "Editar Evento" : "Novo Evento"}
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
            {isEditing && isLoadingEvent && (
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin text-[#1DB954]" />
                Carregando dados do evento...
              </div>
            )}
            {/* Nome do Evento */}
            <div className="space-y-2">
              <Label htmlFor="eventName" className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Nome do Evento
              </Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Culto de Domingo"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={isFormDisabled}
              />
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="text-white">
                Data
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                disabled={isFormDisabled}
              />
            </div>

            {/* Buscar Músicas */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <Music className="w-4 h-4" />
                Músicas ({selectedTracks.length} selecionadas)
              </Label>

              {/* Campo de Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]"
                  disabled={isFormDisabled}
                />
              </div>

              {/* Lista de Músicas */}
              <div className="bg-white/5 rounded-lg border border-white/10 max-h-64 overflow-y-auto">
                {isLoadingTracks ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1DB954]" />
                  </div>
                ) : filteredTracks.length === 0 ? (
                  <div className="text-center py-8 text-white/60 text-sm">
                    {(() => {
                      const trimmed = searchQuery.trim();
                      if (trimmed.length > 0 && trimmed.length < 3) {
                        return "Digite pelo menos 3 letras para buscar em todas as músicas.";
                      }
                      if (trimmed.length >= 3) {
                        return "Nenhuma música encontrada para sua busca.";
                      }
                      return isEditing
                        ? "Nenhuma música selecionada para este evento."
                        : "Nenhuma música cadastrada.";
                    })()}
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredTracks.map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => handleTrackToggle(track.id)}
                        disabled={isFormDisabled}
                        className={`w-full rounded-xl p-4 flex items-start gap-4 transition-all border text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedTracks.includes(track.id)
                            ? "bg-[#1DB954]/20 border-[#1DB954] hover:bg-[#1DB954]/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <Music className={`w-6 h-6 ${selectedTracks.includes(track.id) ? "text-[#1DB954]" : "text-[#1DB954]"}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white mb-1 truncate">
                            {track.titulo}
                          </h3>
                          <p className="text-sm text-white/60 truncate">
                            {track.versao && track.tag
                              ? `${track.versao} • ${track.tag}`
                              : track.versao || track.tag || ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTracks.length > 0 && (
                <div className="text-sm text-white/60">
                  {selectedTracks.length}{" "}
                  {selectedTracks.length === 1 ? "música selecionada" : "músicas selecionadas"}
                </div>
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
                (isEditing ? "Atualizar Evento" : "Salvar Evento")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
