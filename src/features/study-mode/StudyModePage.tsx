import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Music } from "lucide-react";
import { useSongData } from "./hooks/useSongData";
import { IntegratedChordStudy } from "./components/IntegratedChordStudy";
import { YouTubePlayer } from "@/components/YouTubePlayer";

/**
 * Página principal do Modo Ensaio / Estudos
 * Agora com sistema completo de cifras + transposição + diagramas CAGED
 */
const StudyModePage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();

  // Busca dados completos da música (incluindo cifra)
  const { data: songData, isLoading } = useSongData(songId || null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto animate-pulse">
            <Music className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-white/60">Carregando música...</p>
        </div>
      </div>
    );
  }

  if (!songData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
        <button
          onClick={() => navigate("/cifraclub-search")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Busca</span>
        </button>
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-white/40" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Música não encontrada
          </h2>
          <p className="text-white/60 max-w-md">
            Esta música não existe ou foi removida.
          </p>
          <button
            onClick={() => navigate("/cifraclub-search")}
            className="mt-6 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all"
          >
            Buscar outra música
          </button>
        </div>
      </div>
    );
  }

  // Se não houver cifra cadastrada
  if (!songData.cifra_content || songData.cifra_content.trim() === '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
        <button
          onClick={() => navigate("/cifraclub-search")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Busca</span>
        </button>
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-white/40" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {songData.titulo}
          </h2>
          <p className="text-white/60 max-w-md mb-2">
            Esta música ainda não possui cifra cadastrada.
          </p>
          <p className="text-sm text-white/40 max-w-md">
            Adicione a cifra através do CifraClub ou manualmente na edição da música para usar o modo ensaio.
          </p>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate("/cifraclub-search")}
              className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all"
            >
              Buscar outra música
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6" style={{ paddingBottom: '110px' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/cifraclub-search")}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Busca</span>
          </button>
        </div>

        {/* Sistema Integrado de Cifras */}
        <IntegratedChordStudy
          text={songData.cifra_content}
          className="animate-in fade-in duration-300"
        />

        {/* Info Footer */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-lg p-6 text-center space-y-2">
          <p className="text-sm text-white/60">
            💡 <strong>Dica:</strong> Clique em qualquer acorde da cifra para ver o diagrama CAGED
          </p>
          <p className="text-xs text-white/40">
            Use os controles de transposição para mudar o tom da música
          </p>
        </div>
      </div>

      {/* YouTube Player fixo no footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <YouTubePlayer
          youtubeUrl={songData.referencia || undefined}
          trackTitle={songData.titulo}
          trackVersion={songData.versao || undefined}
        />
      </div>
    </div>
  );
};

export default StudyModePage;
