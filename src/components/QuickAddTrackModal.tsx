import React, { useState, useEffect } from "react";
import { X, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QuickAddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
}

interface Track {
  id: string;
  titulo: string;
  versao?: string | null;
  tom?: string | null;
}

export const QuickAddTrackModal: React.FC<QuickAddTrackModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);

  // Busca músicas disponíveis quando o modal abre ou a busca muda
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setAvailableTracks([]);
      return;
    }

    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        // Busca todas as músicas
        const { data: allTracks, error: allTracksError } = await supabase
          .from("tracks")
          .select("id, titulo, versao, tom")
          .order("titulo");

        if (allTracksError) throw allTracksError;

        // Busca músicas já adicionadas ao evento
        const { data: eventTracks, error: eventTracksError } = await supabase
          .from("event_tracks")
          .select("track_id")
          .eq("event_id", eventId);

        if (eventTracksError) throw eventTracksError;

        // Filtra músicas que ainda não estão no evento
        const addedTrackIds = new Set(eventTracks?.map((et) => et.track_id) || []);
        const available = (allTracks || []).filter(
          (track) => !addedTrackIds.has(track.id)
        );

        setAvailableTracks(available);
      } catch (error) {
        console.error("Erro ao buscar músicas:", error);
        toast.error("Erro ao carregar músicas disponíveis");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [isOpen, eventId]);

  const filteredTracks = React.useMemo(() => {
    if (!searchQuery.trim()) return availableTracks;

    const query = searchQuery.toLowerCase();
    return availableTracks.filter(
      (track) =>
        track.titulo.toLowerCase().includes(query) ||
        track.versao?.toLowerCase().includes(query) ||
        track.tom?.toLowerCase().includes(query)
    );
  }, [availableTracks, searchQuery]);

  const handleAddTrack = async (trackId: string) => {
    setAddingTrackId(trackId);
    try {
      // Busca o maior order_index atual do evento
      const { data: maxOrderData } = await supabase
        .from("event_tracks")
        .select("order_index")
        .eq("event_id", eventId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = maxOrderData?.[0]?.order_index ?? -1;

      // Adiciona a música ao evento
      const { error } = await supabase.from("event_tracks").insert({
        event_id: eventId,
        track_id: trackId,
        order_index: nextOrderIndex + 1,
      });

      if (error) throw error;

      // Remove a música da lista de disponíveis
      setAvailableTracks((prev) => prev.filter((t) => t.id !== trackId));

      toast.success("Música adicionada à playlist!");

      // Redireciona para a playlist atual
      setTimeout(() => {
        navigate(`/playlist/${eventId}`);
      }, 300);
    } catch (error) {
      console.error("Erro ao adicionar música:", error);
      toast.error("Não foi possível adicionar a música");
    } finally {
      setAddingTrackId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#121212] rounded-2xl flex flex-col shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Adicionar Música</h2>
            <p className="text-sm text-white/60 mt-1">
              Busque e adicione músicas à playlist
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-5 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, versão ou tom..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-[#1DB954]" />
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Search className="h-12 w-12 text-white/20 mb-3" />
              <p className="text-white/60">
                {searchQuery
                  ? "Nenhuma música encontrada"
                  : availableTracks.length === 0
                  ? "Todas as músicas já estão nesta playlist"
                  : "Digite para buscar músicas"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-white font-medium truncate">
                      {track.titulo}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {track.versao && (
                        <span className="text-xs text-white/60">
                          {track.versao}
                        </span>
                      )}
                      {track.tom && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#1DB954]/20 text-[#1DB954]">
                          {track.tom}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddTrack(track.id)}
                    disabled={addingTrackId === track.id}
                    size="sm"
                    className="bg-[#1DB954] text-black hover:bg-[#1ed760] flex-shrink-0"
                  >
                    {addingTrackId === track.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-white/10 text-white hover:bg-white/20 border-0"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
