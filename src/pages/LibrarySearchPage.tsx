/**
 * PÁGINA: LibrarySearchPage
 * Busca músicas na biblioteca da igreja e estuda com transposição + cifra + diagramas
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IntegratedChordStudy } from '@/features/study-mode/components/IntegratedChordStudy';
import { Search, ArrowLeft, Music, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { YouTubePlayer } from '@/components/YouTubePlayer';

interface Track {
  id: string;
  titulo: string;
  cifra_content?: string;
  tom?: string;
  tag?: string;
  versao?: string;
  referencia?: string;
}

// Função para normalizar texto (remover acentos e converter para minúsculas)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const LibrarySearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  // Carrega todas as músicas (global)
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('id, titulo, cifra_content, tom, tag, versao, referencia')
        .order('titulo', { ascending: true });

      if (error) throw error;

      setTracks(data || []);
    } catch (err) {
      console.error('Erro ao carregar músicas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra músicas com base na busca
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      return tracks;
    }

    const query = normalizeText(searchQuery);
    console.log('🔍 LibrarySearch Debug:', {
      searchQuery,
      normalizedQuery: query,
      tracksCount: tracks.length,
      exampleTitle: tracks[0]?.titulo,
      normalizedTitle: normalizeText(tracks[0]?.titulo || ''),
    });

    const filtered = tracks.filter((track) =>
      normalizeText(track.titulo).includes(query) ||
      normalizeText(track.tag || '').includes(query) ||
      normalizeText(track.versao || '').includes(query)
    );

    console.log('📊 Filtered results:', filtered.length);
    return filtered;
  }, [tracks, searchQuery]);

  // Filtra apenas músicas com cifra cadastrada
  const tracksWithCifra = useMemo(() => {
    return filteredTracks.filter(track => track.cifra_content && track.cifra_content.trim() !== '');
  }, [filteredTracks]);

  const getYouTubeThumbnail = (url?: string) => {
    if (!url) return "/placeholder-music.jpg";
    try {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
      if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    } catch (e) {
      console.error(e);
    }
    return "/placeholder-music.jpg";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-green-400" />
          <p className="text-white/60">Carregando biblioteca de músicas...</p>
        </div>
      </div>
    );
  }

  // Se uma música foi selecionada, mostra a tela de estudo
  if (selectedTrack && selectedTrack.cifra_content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6" style={{ paddingBottom: '110px' }}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <button
              onClick={() => setSelectedTrack(null)}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Busca</span>
            </button>
          </div>

          {/* Sistema Integrado de Cifras */}
          <IntegratedChordStudy
            text={selectedTrack.cifra_content}
            className="animate-in fade-in duration-300"
          />
        </div>

        {/* YouTube Player fixo no footer */}
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <YouTubePlayer
            youtubeUrl={selectedTrack.referencia || undefined}
            trackTitle={selectedTrack.titulo}
            trackVersion={selectedTrack.versao || undefined}
          />
        </div>
      </div>
    );
  }

  // Tela de busca (estilo Search.tsx)
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/studies")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Estudos</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Buscar Músicas</h1>
          <p className="text-white/60">
            Encontre rapidamente a música que você procura.
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            type="text"
            placeholder="Digite o nome da música, tag ou versão..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 placeholder:text-[12px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4 text-white/60 hover:text-white" />
            </button>
          )}
        </div>

        {/* Resultados */}
        <div>
          {/* Contador de resultados */}
          {searchQuery.trim().length >= 3 ? (
            <p className="text-white/60 text-sm mb-4">
              {tracksWithCifra.length} {tracksWithCifra.length === 1 ? 'música disponível' : 'músicas disponíveis'}
            </p>
          ) : (
            <p className="text-white/60 text-sm mb-4">
              {tracks.length} {tracks.length === 1 ? 'música disponível' : 'músicas disponíveis'}
            </p>
          )}

          {/* Lista de músicas */}
          {searchQuery.trim().length >= 3 ? (
            tracksWithCifra.length === 0 ? (
              <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-12 text-center">
                <Music className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhuma música encontrada
                </h3>
                <p className="text-white/60 max-w-md mx-auto">
                  Nenhuma música encontrada para "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tracksWithCifra.map((track) => (
                  <div
                    key={track.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedTrack(track)}
                    className="group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-px hover:border-[#4CB4FF]/40 hover:bg-[#1f1f1f] cursor-pointer"
                  >
                    {/* Hover Overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-white/5 to-transparent" />

                    {/* Ícone de Música */}
                    <div className="relative z-10 flex-shrink-0 h-12 w-12 rounded-2xl bg-[#4CB4FF]/10 flex items-center justify-center text-[#4CB4FF] shadow-inner shadow-black/50">
                      <Music className="w-6 h-6" />
                    </div>

                    {/* Track Info */}
                    <div className="relative z-10 flex-1 min-w-0 text-left">
                      <h3 className="text-lg font-medium text-white mb-2 truncate">
                        {track.titulo}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {track.tom && (
                          <span className="px-2 py-0.5 bg-[#4CB4FF]/20 text-[#4CB4FF] rounded-full text-xs font-semibold">
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
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-white/40 text-sm text-center py-12">
              Digite ao menos 3 caracteres para buscar músicas
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarySearchPage;
