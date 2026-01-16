import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Music2, Loader2, Lightbulb } from "lucide-react";

type VideoData = {
  title: string;
  description: string;
  thumbnail: string;
};

/**
 * Card de Técnica que busca dados do YouTube dinamicamente
 */
const TechniqueCard: React.FC<{
  youtubeUrl: string;
  path: string;
  onClick: () => void;
}> = ({ youtubeUrl, path, onClick }) => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYouTubeId(youtubeUrl);

    if (videoId) {
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then(res => res.json())
        .then(data => {
          setVideoData({
            title: data.title || "Aula",
            description: data.author_name ? `Por ${data.author_name}` : "",
            thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          });
        })
        .catch(() => {
          setVideoData({
            title: "Aula",
            description: "",
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [youtubeUrl]);

  if (isLoading) {
    return (
      <div className="group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-3 flex items-center justify-center gap-3 h-24">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-3 flex items-center gap-3 transition-all duration-200 hover:-translate-y-px hover:border-[#4CB4FF]/40 hover:bg-[#1f1f1f] cursor-pointer"
    >
      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-white/5 to-transparent" />

      {/* Thumbnail */}
      <div className="relative z-10 flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden bg-[#4CB4FF]/10">
        <img
          src={videoData?.thumbnail || "/estudos.jpg"}
          alt={videoData?.title || "Aula"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 min-w-0 text-left">
        <h3 className="text-lg font-medium text-white mb-1 line-clamp-2">
          {videoData?.title}
        </h3>
        <p className="text-xs text-white/50">
          {videoData?.description}
        </p>
      </div>
    </button>
  );
};

/**
 * Modo PRO - Lista de Instrumentos
 */
const ProModePage: React.FC = () => {
  const navigate = useNavigate();

  const instruments = [
    {
      id: "guitar",
      name: "GUITAR",
      description: "Técnicas de guitarra para louvor e adoração",
      image: "/guitar.jpg",
      techniques: [
        {
          id: "domine-o-braco",
          title: "Domine o Braço",
          artist: "Mateus Asato",
          description: "Memorização do braço da guitarra",
          thumbnail: "/guitar.jpg",
          path: "/study/pro/mateus-asato/domine-o-braco",
        },
      ],
    },
    {
      id: "keyboard",
      name: "TECLADO",
      description: "Piano e teclado gospel",
      image: "/biblioteca-de-acordes.jpg",
      techniques: [],
    },
    {
      id: "drums",
      name: "BATERIA",
      description: "Grooves, fills e dinâmica gospel",
      image: "/bateria.jpg",
      techniques: [
        {
          id: "fundamentos",
          youtubeUrl: "https://www.youtube.com/watch?v=8KMcPXQ1kOg",
          path: "/study/pro/bateria/fundamentos",
        },
      ],
    },
    {
      id: "bass",
      name: "BAIXO",
      description: "Linhas de baixo e harmonia gospel",
      image: "/baixo.jpg",
      techniques: [],
    },
    {
      id: "vocal",
      name: "VOCAL",
      description: "Técnica vocal, harmonias e adoração",
      image: "/vocal.jpg",
      techniques: [],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/studies")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Estudos</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">Modo PRO</h1>

          {/* Indicação */}
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#4CB4FF] flex-shrink-0" />
            <span className="text-sm font-semibold text-[#4CB4FF]">INDICAÇÃO</span>
            <span className="text-sm text-white/60">Estude técnicas de grandes artistas da música Gospel</span>
          </div>
        </div>

        {/* Grid de Instrumentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {instruments.map((instrument) => (
            <button
              key={instrument.id}
              onClick={() => navigate(`/study/pro/${instrument.id}`)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 h-32"
            >
              {/* Imagem de Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${instrument.image})` }}
              />

              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Linha inferior neon azul */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#60A5FA] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />

              {/* Conteúdo do Card */}
              <div className="relative h-full flex flex-col justify-end items-end p-5">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#60A5FA] transition-colors text-right">
                  {instrument.name}
                </h3>
                <p className="text-xs text-white/60 line-clamp-2 text-right">
                  {instrument.description}
                </p>
              </div>

              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProModePage;
