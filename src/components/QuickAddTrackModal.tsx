import React, { useState, useEffect } from "react";
import { X, Search, Plus, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { searchCifraClub, fetchCifraFromUrl, type CifraClubTrack } from "@/services/cifraClubService";
import { useAddTrack } from "@/hooks/useAddTrack";
import { DuplicateTrackDialog } from "@/components/DuplicateTrackDialog";

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

  // Estado para busca web
  const [cifraClubTracks, setCifraClubTracks] = useState<CifraClubTrack[]>([]);
  const [isSearchingCifraClub, setIsSearchingCifraClub] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 7;

  // Hook unificado de adicionar músicas com detecção de duplicatas
  const {
    addTrack,
    confirmUseExisting,
    confirmCreateNew,
    cancelDuplicate,
    loading: addTrackLoading,
    duplicateFound,
    pendingTrack,
  } = useAddTrack({
    onSuccess: (trackId) => {
      onSuccess();
      // Se tem trackId, navega para a página de detalhes (modal de cifras)
      // Isso acontece quando adiciona da busca web
      if (trackId) {
        // Força reload completo da página para garantir que os dados estão atualizados
        window.location.href = `/playlist/${eventId}/track/${trackId}`;
      } else {
        // Caso contrário, apenas volta para a playlist
        navigate(`/playlist/${eventId}`);
      }
    },
  });

  // Busca músicas disponíveis quando o modal abre ou a busca muda
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setAvailableTracks([]);
      setCifraClubTracks([]);
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

  // Busca web (debounced)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setCifraClubTracks([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCifraClub(true);
      setCurrentPage(1);
      try {
        const results = await searchCifraClub(searchQuery);
        setCifraClubTracks(results);
      } catch (error) {
        console.error("Erro ao buscar na web:", error);
      } finally {
        setIsSearchingCifraClub(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      // Busca dados da música
      const track = availableTracks.find(t => t.id === trackId);
      if (!track) {
        toast.error("Música não encontrada");
        return;
      }

      // Busca o maior order_index para calcular a próxima posição
      const { data: maxOrderData } = await supabase
        .from("event_tracks")
        .select("order_index")
        .eq("event_id", eventId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = maxOrderData?.[0]?.order_index ?? -1;

      // Usa o hook unificado que já adiciona diretamente ao evento
      // (não precisa detecção de duplicata aqui pois a música JÁ existe na biblioteca)
      const { error } = await supabase.from("event_tracks").insert({
        event_id: eventId,
        track_id: trackId,
        order_index: nextOrderIndex + 1,
      });

      if (error) throw error;

      // Remove a música da lista de disponíveis
      setAvailableTracks((prev) => prev.filter((t) => t.id !== trackId));

      toast.success("Música adicionada à playlist!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar música:", error);
      toast.error("Não foi possível adicionar a música");
    } finally {
      setAddingTrackId(null);
    }
  };

  // Importa música do Cifra Club ou abre URL externa
  const handleImportFromCifraClub = async (cifraTrack: CifraClubTrack) => {
    try {
      const url = cifraTrack.url.startsWith('http') ? cifraTrack.url : `https://www.cifraclub.com.br${cifraTrack.url}`;
      const isCifraClub = url.includes('cifraclub.com.br');

      if (!isCifraClub) {
        window.open(url, '_blank');
        toast.info("Abrindo cifra em nova aba...");
        return;
      }

      toast.loading("Importando cifra do Cifra Club...");
      const cifraData = await fetchCifraFromUrl(url);

      if (!cifraData) {
        toast.dismiss();
        toast.error("Não foi possível importar a cifra");
        return;
      }

      toast.dismiss();

      // Busca o maior order_index para calcular a próxima posição
      const { data: maxOrderData } = await supabase
        .from("event_tracks")
        .select("order_index")
        .eq("event_id", eventId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = maxOrderData?.[0]?.order_index ?? -1;

      // USA O HOOK UNIFICADO - detecta duplicatas automaticamente!
      await addTrack({
        title: cifraData.title,
        artist: cifraData.artist,
        cifraUrl: url,
        context: 'event',
        contextId: eventId,
        order: nextOrderIndex + 1,
      });

      // Se duplicata for encontrada, o modal aparecerá automaticamente
      // onSuccess() será chamado quando a música for adicionada

    } catch (error) {
      toast.dismiss();
      console.error("Erro ao processar resultado:", error);
      toast.error("Erro ao processar música");
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
          ) : (
            <>
              {/* Resultados locais */}
              {filteredTracks.length === 0 && !searchQuery ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Search className="h-12 w-12 text-white/20 mb-3" />
                  <p className="text-white/60">
                    {availableTracks.length === 0
                      ? "Todas as músicas já estão nesta playlist"
                      : "Digite para buscar músicas"}
                  </p>
                </div>
              ) : filteredTracks.length > 0 ? (
                <>
                  <h3 className="text-sm font-semibold text-white/60 mb-3">
                    Músicas Salvas
                  </h3>
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
                </>
              ) : null}

              {/* Resultados web (SetlistGO) */}
              {searchQuery && searchQuery.length >= 3 && (
                <div className={filteredTracks.length > 0 ? "mt-6" : ""}>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-semibold text-white/60">
                      Buscar SetlistGO Web
                    </h3>
                    {isSearchingCifraClub && (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1DB954]" />
                    )}
                  </div>

                  {cifraClubTracks.length === 0 && !isSearchingCifraClub ? (
                    <div className="text-center py-6 border border-white/10 rounded-xl bg-white/5">
                      <Globe className="w-8 h-8 mx-auto mb-2 text-white/40" />
                      <p className="text-white/60 text-sm">
                        Nenhum resultado encontrado na web
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white rounded-xl p-4 shadow-lg">
                        <div className="space-y-4">
                          {cifraClubTracks
                            .slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)
                            .map((cifraTrack, index) => (
                              <div
                                key={`cifra-${index}`}
                                className="group pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                              >
                                <button
                                  onClick={() => handleImportFromCifraClub(cifraTrack)}
                                  className="text-left w-full"
                                >
                                  <h3 className="text-base text-[#1a0dab] hover:underline font-normal mb-1">
                                    {cifraTrack.name}
                                  </h3>
                                </button>

                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[#006621] text-xs">
                                    {cifraTrack.url}
                                  </span>
                                </div>

                                <p className="text-[#545454] text-xs leading-relaxed">
                                  {cifraTrack.description}
                                </p>
                              </div>
                            ))}
                        </div>

                        {/* Paginação */}
                        {cifraClubTracks.length > resultsPerPage && (
                          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#1a0dab] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              Anterior
                            </button>

                            {Array.from({ length: Math.ceil(cifraClubTracks.length / resultsPerPage) }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
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
                              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#1a0dab] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              Próxima
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-white/60 text-xs mt-3 text-center">
                        Clique no título para importar cifras do Cifra Club ou abrir outros sites
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
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

      {/* Modal de Duplicata - aparece automaticamente quando necessário */}
      {duplicateFound && (
        <DuplicateTrackDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) cancelDuplicate();
          }}
          searchResult={duplicateFound}
          newTrackTitle={pendingTrack?.title || ''}
          onConfirmUseExisting={confirmUseExisting}
          onConfirmCreateNew={confirmCreateNew}
        />
      )}
    </div>
  );
};
