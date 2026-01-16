import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Plus } from "lucide-react";
import { AddLessonModal } from "@/components/AddLessonModal";

type Technique = {
  id: string;
  youtubeUrl: string;
  path: string;
  title: string;
  tag: string;
  artist: string;
  thumbnail: string;
};

type Instrument = {
  id: string;
  name: string;
  description: string;
  techniques: Technique[];
};

/**
 * Card de Técnica que busca dados do YouTube dinamicamente
 */
const TechniqueCard: React.FC<{
  technique: Technique;
  onClick: () => void;
  isCustom?: boolean;
}> = ({ technique, onClick, isCustom = false }) => {
  return (
    <div className="relative w-full">
      {/* Badge da técnica - fora do card */}
      <div className="absolute -top-2 right-2 z-20 flex gap-2">
        {isCustom && (
          <span className="px-2 py-1 text-xs md:text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 text-black rounded shadow-lg">
            ADD
          </span>
        )}
        {technique.tag && (
          <span className="px-2 py-1 text-xs md:text-sm font-bold bg-[#4CB4FF] text-black rounded shadow-lg">
            {technique.tag.toUpperCase()}
          </span>
        )}
      </div>

      <button
        onClick={onClick}
        className="group relative w-full rounded-lg bg-[#181818] hover:bg-[#282828] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/60"
      >
        {/* Thumbnail estilo poster (horizontal) */}
        <div className="relative w-full aspect-[2/1] overflow-hidden rounded-t-lg bg-black/40">
          <img
            src={technique.thumbnail}
            alt={technique.title}
            className="w-full h-full object-cover"
          />

          {/* Play button overlay - aparece no hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <svg className="w-16 h-16 text-white transform group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Info abaixo do poster */}
        <div className="p-3 md:p-4 min-h-[60px] md:min-h-[70px] flex flex-col">
          <h3 className="text-sm md:text-base font-semibold text-white mb-1 line-clamp-2 leading-tight min-h-[32px] md:min-h-[40px]">
            {technique.title.toUpperCase()}
          </h3>

          {technique.artist && (
            <p className="text-xs md:text-sm text-white/60 line-clamp-1 mt-auto">
              {technique.artist}
            </p>
          )}
        </div>
      </button>
    </div>
  );
};

// Função para normalizar texto (remover acentos e converter para minúsculas)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const InstrumentTechniquesPage: React.FC = () => {
  const navigate = useNavigate();
  const { instrumentId } = useParams<{ instrumentId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customLessons, setCustomLessons] = useState<Technique[]>([]);

  // Dados dos instrumentos (mesmo array do ProModePage)
  const instruments: Instrument[] = [
    {
      id: "guitar",
      name: "GUITAR",
      description: "Técnicas de guitarra para louvor e adoração",
      techniques: [
        {
          id: "vocabulario-guitarra",
          youtubeUrl: "https://www.youtube.com/watch?v=IbRsOEPx0Bg",
          path: "/study/pro/guitar/vocabulario-guitarra",
          title: "VOCABULÁRIO NA GUITARRA",
          tag: "VOCABULÁRIO",
          artist: "Matheus Duarte",
          thumbnail: "https://i.ytimg.com/vi/IbRsOEPx0Bg/hqdefault.jpg",
        },
        {
          id: "tecnica-mateus-asato",
          youtubeUrl: "https://www.youtube.com/watch?v=hElAnUt-DX8",
          path: "/study/pro/guitar/tecnica-mateus-asato",
          title: "TÉCNICA MATEUS ASATO",
          tag: "MATEUS ASATO",
          artist: "Matheus Duarte",
          thumbnail: "https://i.ytimg.com/vi/hElAnUt-DX8/hqdefault.jpg",
        },
        {
          id: "lick-mateus-asato",
          youtubeUrl: "https://www.youtube.com/watch?v=UzATMjDAaD8",
          path: "/study/pro/guitar/lick-mateus-asato",
          title: "LICK DE MATEUS ASATO",
          tag: "MATEUS ASATO",
          artist: "Matheus Duarte",
          thumbnail: "https://i.ytimg.com/vi/UzATMjDAaD8/hqdefault.jpg",
        },
        {
          id: "entenda-modos-gregos",
          youtubeUrl: "https://www.youtube.com/watch?v=G6Nz8FHx5v8",
          path: "/study/pro/guitar/entenda-modos-gregos",
          title: "ENTENDA MODOS GREGOS",
          tag: "MODOS GREGOS",
          artist: "Matheus Duarte",
          thumbnail: "https://i.ytimg.com/vi/G6Nz8FHx5v8/hqdefault.jpg",
        },
      ],
    },
    {
      id: "keyboard",
      name: "TECLADO",
      description: "Piano e teclado gospel",
      techniques: [
        {
          id: "emprestimo-modal",
          youtubeUrl: "https://www.youtube.com/watch?v=o8sfD9OZrYw",
          path: "/study/pro/keyboard/emprestimo-modal",
          title: "EMPRÉSTIMO MODAL",
          tag: "EMPRÉSTIMO MODAL",
          artist: "Samuel Murad",
          thumbnail: "https://i.ytimg.com/vi/o8sfD9OZrYw/hqdefault.jpg",
        },
        {
          id: "acordes-passagem",
          youtubeUrl: "https://www.youtube.com/watch?v=ygMdDQEZVwg",
          path: "/study/pro/keyboard/acordes-passagem",
          title: "ACORDES de PASSAGEM para o CAMPO HARMÔNICO",
          tag: "ACORDES de PASSAGEM",
          artist: "Samuel Murad",
          thumbnail: "https://i.ytimg.com/vi/ygMdDQEZVwg/hqdefault.jpg",
        },
        {
          id: "rearmonizacao-251-sub5",
          youtubeUrl: "https://www.youtube.com/watch?v=Bv412PwywAw",
          path: "/study/pro/keyboard/rearmonizacao-251-sub5",
          title: "REARMONIZAÇÃO para OUTRO NÍVEL USANDO 251 + SUB5",
          tag: "251 + SUB5",
          artist: "Samuel Murad",
          thumbnail: "https://i.ytimg.com/vi/Bv412PwywAw/hqdefault.jpg",
        },
        {
          id: "acordes-relativos",
          youtubeUrl: "https://www.youtube.com/watch?v=PXD5Q8jILp0",
          path: "/study/pro/keyboard/acordes-relativos",
          title: "ACORDES RELATIVOS e ANTI-RELATIVOS",
          tag: "ACORDES RELATIVOS",
          artist: "Samuel Murad",
          thumbnail: "https://i.ytimg.com/vi/PXD5Q8jILp0/hqdefault.jpg",
        },
      ],
    },
    {
      id: "drums",
      name: "BATERIA",
      description: "",
      techniques: [
        {
          id: "tribal",
          youtubeUrl: "https://www.youtube.com/watch?v=8KMcPXQ1kOg",
          path: "/study/pro/drums/tribal",
          title: "TRIBAL TOP PRA TOCAR EM VEM ME BUSCAR",
          tag: "TRIBAL",
          artist: "Josivaldo Santos",
          thumbnail: "https://i.ytimg.com/vi/8KMcPXQ1kOg/hqdefault.jpg",
        },
        {
          id: "viradas",
          youtubeUrl: "https://www.youtube.com/watch?v=kwosv7gVLfg",
          path: "/study/pro/drums/viradas",
          title: "DUAS VIRADAS TOP DE LINHA PARA O TRIBAL",
          tag: "VIRADAS",
          artist: "Josivaldo Santos",
          thumbnail: "https://i.ytimg.com/vi/kwosv7gVLfg/hqdefault.jpg",
        },
        {
          id: "flam",
          youtubeUrl: "https://www.youtube.com/watch?v=fi8yAnsbsJE",
          path: "/study/pro/drums/flam",
          title: "O PODER DO FLAM - AULA DE RUDIMENTOS",
          tag: "FLAM",
          artist: "Josivaldo Santos",
          thumbnail: "https://i.ytimg.com/vi/fi8yAnsbsJE/hqdefault.jpg",
        },
        {
          id: "bondade-de-deus",
          youtubeUrl: "https://www.youtube.com/watch?v=TsglcntrMfA",
          path: "/study/pro/drums/bondade-de-deus",
          title: "BONDADE DE DEUS",
          tag: "MÚSICA",
          artist: "Josivaldo Santos",
          thumbnail: "https://i.ytimg.com/vi/TsglcntrMfA/hqdefault.jpg",
        },
        {
          id: "domina-paradiddle-inward",
          youtubeUrl: "https://www.youtube.com/watch?v=T_JEE2jsxB4",
          path: "/study/pro/drums/domina-paradiddle-inward",
          title: "DOMINA O PARADIDDLE INWARD",
          tag: "PARADIDDLE INWARD",
          artist: "Marlon Marquis",
          thumbnail: "https://i.ytimg.com/vi/T_JEE2jsxB4/hqdefault.jpg",
        },
        {
          id: "tecnica-chimbal-groove",
          youtubeUrl: "https://www.youtube.com/watch?v=IZAEFd1h5HY",
          path: "/study/pro/drums/tecnica-chimbal-groove",
          title: "TÉCNICA DE CHIMBAL NO GROOVE!",
          tag: "CHIMBAL",
          artist: "Marlon Marquis",
          thumbnail: "https://i.ytimg.com/vi/IZAEFd1h5HY/hqdefault.jpg",
        },
      ],
    },
    {
      id: "bass",
      name: "BAIXO",
      description: "Linhas de baixo e harmonia gospel",
      techniques: [
        {
          id: "frases-efesios-6",
          youtubeUrl: "https://www.youtube.com/watch?v=eqUpnxhlKiU",
          path: "/study/pro/bass/frases-efesios-6",
          title: "Frases Efesios 6",
          tag: "FRASES",
          artist: "Doni Franchetti",
          thumbnail: "https://i.ytimg.com/vi/eqUpnxhlKiU/hqdefault.jpg",
        },
        {
          id: "slap-groove",
          youtubeUrl: "https://www.youtube.com/watch?v=nYAh8OOasbk",
          path: "/study/pro/bass/slap-groove",
          title: "Comece no Slap com este groove",
          tag: "SLAP",
          artist: "Doni Franchetti",
          thumbnail: "https://i.ytimg.com/vi/nYAh8OOasbk/hqdefault.jpg",
        },
        {
          id: "dominando-braco-baixo",
          youtubeUrl: "https://www.youtube.com/watch?v=Bc6i7iKqWts",
          path: "/study/pro/bass/dominando-braco-baixo",
          title: "Domindo o Braço do Baixo",
          tag: "EXERCÍCIO",
          artist: "Doni Franchetti",
          thumbnail: "https://i.ytimg.com/vi/Bc6i7iKqWts/hqdefault.jpg",
        },
      ],
    },
    {
      id: "vocal",
      name: "VOCAL",
      description: "Técnica vocal, harmonias e adoração",
      techniques: [
        {
          id: "treino-vocal-diario",
          youtubeUrl: "https://www.youtube.com/watch?v=CHjsg8ZJ9C0",
          path: "/study/pro/vocal/treino-vocal-diario",
          title: "TREINO VOCAL DIÁRIO",
          tag: "EXERCÍCIO",
          artist: "Icaro Melo",
          thumbnail: "https://i.ytimg.com/vi/CHjsg8ZJ9C0/hqdefault.jpg",
        },
        {
          id: "aquecimento-vocal",
          youtubeUrl: "https://www.youtube.com/watch?v=ccYEjUPNQ7w",
          path: "/study/pro/vocal/aquecimento-vocal",
          title: "AQUECIMENTO VOCAL",
          tag: "AQUECIMENTO",
          artist: "Icaro Melo",
          thumbnail: "https://i.ytimg.com/vi/ccYEjUPNQ7w/hqdefault.jpg",
        },
        {
          id: "tratando-a-voz",
          youtubeUrl: "https://www.youtube.com/watch?v=gsMq3eBaFi4",
          path: "/study/pro/vocal/tratando-a-voz",
          title: "TRATANDO A VOZ",
          tag: "TÉCNICA",
          artist: "Icaro Melo",
          thumbnail: "https://i.ytimg.com/vi/gsMq3eBaFi4/hqdefault.jpg",
        },
        {
          id: "cantar-emocao-ou-tecnica",
          youtubeUrl: "https://www.youtube.com/watch?v=5B_kqdeVLrY",
          path: "/study/pro/vocal/cantar-emocao-ou-tecnica",
          title: "CANTAR COM EMOÇÃO OU COM TÉCNICA? QUAL É MELHOR?",
          tag: "TÉCNICA",
          artist: "Icaro Melo",
          thumbnail: "https://i.ytimg.com/vi/5B_kqdeVLrY/hqdefault.jpg",
        },
        {
          id: "como-comecar-a-cantar",
          youtubeUrl: "https://www.youtube.com/watch?v=mF1CRS6VN74",
          path: "/study/pro/vocal/como-comecar-a-cantar",
          title: "COMO COMEÇAR A CANTAR",
          tag: "PRIMEIROS PASSOS",
          artist: "Icaro Melo",
          thumbnail: "https://i.ytimg.com/vi/mF1CRS6VN74/hqdefault.jpg",
        },
        {
          id: "exercicios-respiracao",
          youtubeUrl: "https://www.youtube.com/watch?v=ik5E2_Rrltc",
          path: "/study/pro/vocal/exercicios-respiracao",
          title: "EXERCÍCIOS DE RESPIRAÇÃO",
          tag: "RESPIRAÇÃO",
          artist: "Icaro Melo",
          thumbnail: "https://i.ytimg.com/vi/ik5E2_Rrltc/hqdefault.jpg",
        },
        {
          id: "registros-vocais",
          youtubeUrl: "https://www.youtube.com/watch?v=neE195zXcas",
          path: "/study/pro/vocal/registros-vocais",
          title: "REGISTROS VOCAIS: VOCÊ PRECISA ENTENDER ISSO",
          tag: "REGISTROS VOCAIS",
          artist: "Icaro Melo",
          thumbnail: "https://i.ytimg.com/vi/neE195zXcas/hqdefault.jpg",
        },
      ],
    },
  ];

  const currentInstrument = instruments.find((i) => i.id === instrumentId);

  // Carrega aulas personalizadas do localStorage ao montar o componente
  useEffect(() => {
    if (!instrumentId) return;

    const storageKey = `custom_lessons_${instrumentId}`;
    const storedLessons = localStorage.getItem(storageKey);

    if (storedLessons) {
      try {
        const parsed = JSON.parse(storedLessons);
        setCustomLessons(parsed);
      } catch (error) {
        console.error("Erro ao carregar aulas personalizadas:", error);
      }
    }
  }, [instrumentId]);

  // Função para salvar nova aula
  const handleSaveLesson = async (lesson: {
    youtubeUrl: string;
    title: string;
    tag: string;
  }) => {
    if (!instrumentId) return;

    // Extrai o ID do vídeo do YouTube
    const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYouTubeId(lesson.youtubeUrl);
    if (!videoId) {
      alert("URL do YouTube inválida");
      return;
    }

    // Busca o nome do canal do YouTube
    let artistName = "Você";
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      artistName = data.author_name || "Você";
    } catch (error) {
      console.error("Erro ao buscar nome do canal:", error);
    }

    const newLesson: Technique = {
      id: `custom-${Date.now()}`,
      youtubeUrl: lesson.youtubeUrl,
      path: `/study/pro/${instrumentId}/custom-${Date.now()}`,
      title: lesson.title,
      tag: lesson.tag,
      artist: artistName,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };

    const updatedLessons = [...customLessons, newLesson];
    setCustomLessons(updatedLessons);

    // Salva no localStorage
    const storageKey = `custom_lessons_${instrumentId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedLessons));
  };

  // Filtra técnicas baseado na busca usando dados estáticos + aulas personalizadas
  const filteredTechniques = useMemo(() => {
    if (!currentInstrument) return [];

    // Combina técnicas padrão com aulas personalizadas (personalizadas primeiro, em ordem reversa)
    const allTechniques = [...customLessons.reverse(), ...currentInstrument.techniques];

    if (!searchQuery.trim()) return allTechniques;

    const query = normalizeText(searchQuery);
    return allTechniques.filter((technique) => {
      return (
        normalizeText(technique.title).includes(query) ||
        normalizeText(technique.tag).includes(query) ||
        normalizeText(technique.artist).includes(query)
      );
    });
  }, [currentInstrument, searchQuery, customLessons]);

  if (!currentInstrument) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <p>Instrumento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/study/pro")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Modo PRO</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">
            {currentInstrument.name}
          </h1>
          {currentInstrument.description && (
            <p className="text-white/60 mb-4">{currentInstrument.description}</p>
          )}

          {/* Campo de Busca e Botão Adicionar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por técnica, título ou artista..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181818] text-white placeholder-white/40 rounded-lg pl-12 pr-4 py-3 border border-white/10 focus:border-[#4CB4FF]/50 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-black font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">ADICIONAR</span>
            </button>
          </div>
        </div>

        {/* Grid de Técnicas - Estilo Netflix */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
          {filteredTechniques.length === 0 ? (
            <div className="col-span-2 md:col-span-3 text-center py-16 text-white/60">
              <p>
                {searchQuery.trim()
                  ? "Nenhuma técnica encontrada para sua busca."
                  : "Nenhuma técnica disponível ainda."}
              </p>
            </div>
          ) : (
            filteredTechniques.map((technique) => (
              <TechniqueCard
                key={technique.id}
                technique={technique}
                isCustom={technique.id.startsWith('custom-')}
                onClick={() => {
                  if (technique.path) {
                    navigate(technique.path);
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal para adicionar aula personalizada */}
      <AddLessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLesson}
      />
    </div>
  );
};

export default InstrumentTechniquesPage;
