import React, { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, Music, Loader2, MoreVertical, Edit, ExternalLink, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
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
import { searchCifraClub, type CifraClubTrack, fetchCifraFromUrl } from "@/services/cifraClubService";

type Track = {
  id: string;
  titulo: string;
  tag?: string;
  versao?: string;
  tom?: string;
};

// Função para normalizar texto (remover acentos e converter para minúsculas)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const Search: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

  // Estado para busca no Cifra Club
  const [cifraClubTracks, setCifraClubTracks] = useState<CifraClubTrack[]>([]);
  const [isSearchingCifraClub, setIsSearchingCifraClub] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 7;

  // Pega a origem da navegação (de onde o usuário veio)
  const from = (location.state as { from?: string })?.from;

  useEffect(() => {
    loadTracks();
  }, []);

  // Busca no Cifra Club quando o usuário digita
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        searchCifraClubTracks(searchQuery);
      } else {
        setCifraClubTracks([]);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchCifraClubTracks = async (query: string) => {
    setIsSearchingCifraClub(true);
    setCurrentPage(1); // Reset para página 1 ao fazer nova busca
    try {
      const results = await searchCifraClub(query);
      setCifraClubTracks(results);
    } catch (error) {
      console.error("Erro ao buscar no Cifra Club:", error);
    } finally {
      setIsSearchingCifraClub(false);
    }
  };

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

    const query = normalizeText(searchQuery);
    return tracks.filter(
      (track) =>
        normalizeText(track.titulo).includes(query) ||
        normalizeText(track.tag || '').includes(query) ||
        normalizeText(track.versao || '').includes(query)
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

      // Sempre redireciona para a playlist atual
      setTimeout(() => {
        navigate(`/playlist/${selectedEventId}`);
      }, 300);
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

  // Importa música do Cifra Club ou abre URL externa
  const handleImportFromCifraClub = async (cifraTrack: CifraClubTrack) => {
    try {
      // Usa a URL completa
      const url = cifraTrack.url.startsWith('http') ? cifraTrack.url : `https://www.cifraclub.com.br${cifraTrack.url}`;

      // Verifica se é URL do Cifra Club
      const isCifraClub = url.includes('cifraclub.com.br');

      if (!isCifraClub) {
        // Se não for Cifra Club, apenas abre em nova aba
        window.open(url, '_blank');
        toast.info("Abrindo cifra em nova aba...");
        return;
      }

      // Se for Cifra Club, importa a cifra
      toast.loading("Importando cifra do Cifra Club...");

      // Busca a cifra completa
      const cifraData = await fetchCifraFromUrl(url);

      if (!cifraData) {
        toast.dismiss();
        toast.error("Não foi possível importar a cifra");
        return;
      }

      // Cria a nova música no banco
      const { data: newTrack, error } = await supabase
        .from("tracks")
        .insert({
          titulo: cifraData.title,
          tag: cifraData.artist,
          tom: cifraData.key || null,
          cifra_content: cifraData.cifra || null,
          versao: null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.dismiss();
      toast.success(`"${cifraData.title}" importada com sucesso!`);

      // Recarrega a lista de músicas
      await loadTracks();

      // Navega para a música importada
      setTimeout(() => {
        const eventId = getSelectedEventId();
        const targetEvent = eventId || "repertorio";
        navigate(`/playlist/${targetEvent}/track/${newTrack.id}`);
      }, 300);
    } catch (error) {
      toast.dismiss();
      console.error("Erro ao processar resultado:", error);
      toast.error("Erro ao processar música");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-20 md:pt-0 pb-8 md:pb-0">
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

            {/* Resultados da Web (Cifra Club) */}
            {searchQuery && searchQuery.length >= 3 && (
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Buscar SetlistGO Web</h2>
                  {isSearchingCifraClub && (
                    <Loader2 className="w-4 h-4 animate-spin text-[#1DB954]" />
                  )}
                </div>

                {cifraClubTracks.length === 0 && !isSearchingCifraClub ? (
                  <div className="text-center py-8 border border-white/10 rounded-2xl bg-white/5">
                    <Globe className="w-10 h-10 mx-auto mb-3 text-white/40" />
                    <p className="text-white/60 text-sm">
                      Nenhum resultado encontrado na web
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Card branco com resultados */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <div className="space-y-6">
                        {cifraClubTracks
                          .slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)
                          .map((cifraTrack, index) => (
                            <div
                              key={`cifra-${index}`}
                              className="group pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                            >
                              {/* Título como link (estilo Google) */}
                              <button
                                onClick={() => handleImportFromCifraClub(cifraTrack)}
                                className="text-left w-full"
                              >
                                <h3 className="text-lg text-[#1a0dab] hover:underline font-normal mb-1">
                                  {cifraTrack.name}
                                </h3>
                              </button>

                              {/* URL */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[#006621] text-sm">
                                  {cifraTrack.url}
                                </span>
                              </div>

                              {/* Descrição */}
                              <p className="text-[#545454] text-sm leading-relaxed">
                                {cifraTrack.description}
                              </p>
                            </div>
                          ))}
                      </div>

                      {/* Paginação estilo Google */}
                      {cifraClubTracks.length > resultsPerPage && (
                        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-md text-sm font-medium text-[#1a0dab] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Anterior
                          </button>

                          {Array.from({ length: Math.ceil(cifraClubTracks.length / resultsPerPage) }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                currentPage === page
                                  ? 'bg-[#1a0dab] text-white'
                                  : 'text-[#1a0dab] hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(cifraClubTracks.length / resultsPerPage), p + 1))}
                            disabled={currentPage === Math.ceil(cifraClubTracks.length / resultsPerPage)}
                            className="px-4 py-2 rounded-md text-sm font-medium text-[#1a0dab] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Próxima
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-white/60 text-xs mt-4 text-center">
                      Clique no título para importar cifras do Cifra Club ou abrir outros sites
                    </p>
                  </>
                )}
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
