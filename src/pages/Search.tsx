import React, { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, Music, Loader2, MoreVertical, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getSelectedEventId } from "@/lib/preferences";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrackFormModal } from "@/components/TrackFormModal";

type Track = {
  id: string;
  titulo: string;
  tag?: string;
  versao?: string;
  tom?: string;
};

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("id, titulo, tag, versao, tom")
        .order("titulo", { ascending: true });

      if (error) throw error;

      setTracks(data || []);
    } catch (error) {
      console.error("Erro ao carregar faixas:", error);
      toast.error("Erro ao carregar músicas");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar tracks com base na busca (mínimo 3 caracteres)
  const filteredTracks = useMemo(() => {
    // Se não houver busca ou menos de 3 caracteres, mostra todas as músicas
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      return tracks;
    }

    const query = searchQuery.toLowerCase();
    return tracks.filter(
      (track) =>
        track.titulo.toLowerCase().includes(query) ||
        track.tag?.toLowerCase().includes(query) ||
        track.versao?.toLowerCase().includes(query)
    );
  }, [tracks, searchQuery]);

  const handleTrackClick = (trackId: string) => {
    const eventId = getSelectedEventId();
    const targetEvent = eventId || "repertorio";
    navigate(`/playlist/${targetEvent}/track/${trackId}`);
  };

  const handleAddToCurrentEvent = async (track: Track) => {
    const selectedEventId = getSelectedEventId();
    if (!selectedEventId) {
      toast.info("Selecione um evento na aba Eventos para adicionar músicas.");
      return;
    }

    try {
      toast.info(`Adicionando "${track.titulo}" ao evento atual...`);
      const { count, error } = await supabase
        .from("event_tracks")
        .select("*", { count: "exact", head: true })
        .eq("event_id", selectedEventId);

      if (error) throw error;

      const orderIndex = count ?? 0;

      const { error: linkError } = await supabase.from("event_tracks").insert({
        event_id: selectedEventId,
        track_id: track.id,
        order_index: orderIndex,
      });

      if (linkError) {
        if (linkError.code === "23505") {
          toast.info("Essa música já está na playlist selecionada.");
          return;
        }
        throw linkError;
      }

      toast.success(`"${track.titulo}" adicionada à playlist atual!`);
    } catch (error) {
      console.error("Erro ao adicionar música à playlist:", error);
      toast.error("Não foi possível adicionar essa música à playlist.");
    }
  };


  const handleTrackSaved = async () => {
    setIsModalOpen(false);
    setEditingTrackId(null);
    await loadTracks();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrackId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-16 pb-8 md:pt-0 md:pb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <header className="space-y-2 mb-6 sm:mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1DB954] font-semibold">
            BUSCAR
          </p>
          <h1 className="text-3xl font-bold">Buscar Músicas</h1>
          <p className="text-white/60">
            Encontre rapidamente a música que você procura.
          </p>
        </header>

        {/* Campo de Busca */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            type="text"
            placeholder="Digite o nome da música, tag ou versão..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            autoFocus
          />
        </div>

        {/* Resultados */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
          </div>
        ) : (
          <div>
            {searchQuery && searchQuery.length >= 3 ? (
              <p className="text-white/60 text-sm mb-4">
                {filteredTracks.length}{" "}
                {filteredTracks.length === 1 ? "resultado encontrado" : "resultados encontrados"}
              </p>
            ) : (
              <p className="text-white/60 text-sm mb-4">
                {tracks.length}{" "}
                {tracks.length === 1 ? "música disponível" : "músicas disponíveis"}
              </p>
            )}

            {filteredTracks.length === 0 ? (
              <div className="text-center py-16">
                <Music className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma música encontrada
                </h3>
                <p className="text-white/60 text-sm">
                  Tente buscar por outro nome, tag ou versão
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTracks.map((track) => {
                  const isMenuEvent = (evt: React.SyntheticEvent) => {
                    const target = evt.target as HTMLElement | null;
                    return Boolean(target?.closest('[data-track-menu="true"]'));
                  };

                  const handleCardClick = (evt: React.MouseEvent) => {
                    if (isMenuEvent(evt) || openMenuId === track.id) {
                      setOpenMenuId(null);
                      return;
                    }
                    handleTrackClick(track.id);
                  };

                  const handleCardKeyDown = (evt: React.KeyboardEvent) => {
                    if (isMenuEvent(evt) || openMenuId === track.id) {
                      setOpenMenuId(null);
                      return;
                    }
                    if (evt.key === "Enter" || evt.key === " ") {
                      evt.preventDefault();
                      handleTrackClick(track.id);
                    }
                  };

                  return (
                    <div
                      key={track.id}
                      role="button"
                      tabIndex={0}
                      onClick={handleCardClick}
                      onKeyDown={handleCardKeyDown}
                      className="group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-px hover:border-[#1DB954]/40 hover:bg-[#1f1f1f] cursor-pointer"
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-white/5 to-transparent" />
                      {/* Icon */}
                      <div className="relative z-10 flex-shrink-0 h-12 w-12 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] shadow-inner shadow-black/50">
                        <Music className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex-1 min-w-0 text-left">
                        <h3 className="text-lg font-medium text-white mb-2 truncate">
                          {track.titulo}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {track.tom && (
                            <span className="px-2 py-0.5 bg-[#1DB954]/20 text-[#1DB954] rounded-full text-xs font-semibold">
                              {track.tom}
                            </span>
                          )}
                          {track.versao && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-white/30 border border-white/5">
                              {track.versao}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10" data-track-menu="true">
                        <DropdownMenu
                          open={openMenuId === track.id}
                          onOpenChange={(open) => setOpenMenuId(open ? track.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition"
                              aria-label={`Mais opções para ${track.titulo}`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#1c1c1c] border border-white/10 text-white text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setOpenMenuId(null);
                                handleAddToCurrentEvent(track);
                              }}
                            >
                              Adicionar à playlist
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setOpenMenuId(null);
                                setEditingTrackId(track.id);
                                setIsModalOpen(true);
                              }}
                            >
                              Editar música
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <TrackFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleTrackSaved}
        trackId={editingTrackId}
      />
    </div>
  );
};

export default Search;
