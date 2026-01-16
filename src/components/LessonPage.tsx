import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type LessonPageProps = {
  youtubeUrl: string;
  title?: string;
  tag?: string;
  artist?: string;
  description?: string;
  onDelete?: () => void;
  isCustomLesson?: boolean;
};

type VideoData = {
  title: string;
  description: string;
  thumbnail: string;
};

export const LessonPage: React.FC<LessonPageProps> = ({
  youtubeUrl,
  title: customTitle,
  tag: customTag,
  artist: customArtist,
  description: customDescription,
  onDelete,
  isCustomLesson = false,
}) => {
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authorName, setAuthorName] = useState<string>("");

  // Extrai o ID do vídeo do YouTube da URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(youtubeUrl);

  // Extrai a técnica do título (primeira palavra/técnica principal)
  const extractTechnique = (title: string) => {
    // Remove palavras comuns no início
    let cleanTitle = title.replace(/^(Aula de|Como|Aprenda|Tutorial|Técnica de|Técnica|)\s*/i, '');

    // Procura por separadores comuns
    const separators = /\s+(top\s+)?(pra|para|em|no|na|de|do|da)\s+/i;
    const match = cleanTitle.match(separators);

    if (match && match.index) {
      return cleanTitle.substring(0, match.index).trim();
    }

    // Se não encontrar separador, pega a primeira palavra significativa
    const words = cleanTitle.split(' ');
    // Pega apenas a primeira palavra em maiúscula ou significativa
    return words[0] || cleanTitle;
  };

  // Extrai o contexto do título (parte após "pra", "para", "em", etc)
  const extractContext = (title: string) => {
    const separators = /\s+(top\s+)?(pra|para|em|no|na|de|do|da)\s+/i;
    const match = title.match(separators);

    if (match && match.index !== undefined) {
      const contextPart = title.substring(match.index + match[0].length).trim();
      // Remove aspas, colchetes, parênteses do final
      return contextPart.replace(/[\[\]()""]+$/g, '').trim();
    }

    return null;
  };

  // Gera uma descrição educacional robusta e motivacional baseada no título e tag
  const generateDescription = (title: string, tag: string, authorName: string) => {
    const titleLower = title.toLowerCase();
    const tagLower = tag.toLowerCase();

    // Introdução personalizada baseada na tag
    let intro = "";
    let benefits = "";
    let callToAction = "";

    // Define introdução e benefícios baseado no tipo de conteúdo
    if (tagLower.includes("técnica")) {
      intro = `Domine uma técnica essencial que transformará sua forma de tocar e elevar sua performance musical a um novo patamar.`;
      benefits = `Esta técnica é utilizada por músicos profissionais ao redor do mundo e irá expandir significativamente seu vocabulário musical, permitindo que você execute passagens mais complexas com precisão e musicalidade.`;
      callToAction = `Dedique-se à prática consistente dos exercícios apresentados e observe sua evolução técnica semana após semana.`;
    } else if (tagLower.includes("exercício") || tagLower.includes("treino") || tagLower.includes("prática")) {
      intro = `Desenvolva suas habilidades musicais através de exercícios práticos e eficazes que aceleram seu progresso.`;
      benefits = `Estes exercícios foram cuidadosamente selecionados para fortalecer sua técnica, aprimorar sua coordenação e desenvolver a memória muscular necessária para uma execução impecável. Com prática regular, você notará melhorias significativas em sua precisão, velocidade e controle.`;
      callToAction = `Incorpore estes exercícios em sua rotina diária de estudos e testemunhe sua transformação musical.`;
    } else if (tagLower.includes("lick") || tagLower.includes("frase")) {
      intro = `Expanda seu vocabulário musical com frases e licks que adicionarão personalidade e criatividade às suas performances.`;
      benefits = `Aprender e dominar estes licks irá enriquecer suas improvisações, permitindo que você se expresse musicalmente com mais confiança e originalidade. Estas frases podem ser adaptadas e aplicadas em diversos contextos musicais.`;
      callToAction = `Pratique estes licks em diferentes tonalidades e contextos até que se tornem parte natural do seu vocabulário musical.`;
    } else if (tagLower.includes("teoria") || tagLower.includes("harmonia") || tagLower.includes("escala")) {
      intro = `Aprofunde sua compreensão teórica da música e desvende os segredos por trás das grandes composições.`;
      benefits = `O conhecimento teórico é a base para qualquer músico que deseja alcançar excelência. Esta aula irá clarificar conceitos fundamentais, permitindo que você compreenda a estrutura musical em profundidade e aplique esse conhecimento de forma prática em suas composições e improvisações.`;
      callToAction = `Estude atentamente os conceitos apresentados e pratique aplicá-los em seu instrumento para consolidar o aprendizado.`;
    } else if (tagLower.includes("fundamentos") || tagLower.includes("básico") || tagLower.includes("iniciante")) {
      intro = `Construa uma base sólida em música começando pelos fundamentos essenciais que todo músico precisa dominar.`;
      benefits = `Dominar os fundamentos é crucial para seu desenvolvimento musical. Esta aula estabelece as bases necessárias para que você possa progredir com confiança, evitando vícios técnicos e desenvolvendo hábitos corretos desde o início de sua jornada musical.`;
      callToAction = `Não subestime a importância dos fundamentos - dedique tempo e atenção a cada detalhe apresentado nesta aula.`;
    } else if (tagLower.includes("avançado") || tagLower.includes("profissional")) {
      intro = `Leve suas habilidades musicais ao próximo nível com técnicas avançadas utilizadas por profissionais de elite.`;
      benefits = `Este conteúdo avançado irá desafiá-lo a expandir seus limites técnicos e musicais. Ao dominar estes conceitos, você estará equipado com ferramentas profissionais que diferenciam músicos amadores de verdadeiros mestres do instrumento.`;
      callToAction = `Aceite o desafio e dedique-se intensamente à prática - a maestria requer persistência e disciplina.`;
    } else if (tagLower.includes("improviso") || tagLower.includes("improvisação") || tagLower.includes("solo")) {
      intro = `Desenvolva sua criatividade e liberdade musical através da improvisação consciente e expressiva.`;
      benefits = `A improvisação é a expressão máxima da musicalidade. Esta aula irá equipá-lo com ferramentas e conceitos que permitirão que você crie solos memoráveis e se comunique musicalmente de forma autêntica e original.`;
      callToAction = `Pratique os conceitos apresentados e experimente aplicá-los em diferentes contextos musicais - a improvisação se desenvolve através da experimentação constante.`;
    } else if (tagLower.includes("vocal") || tagLower.includes("canto") || tagLower.includes("voz")) {
      intro = `Desenvolva uma técnica vocal saudável e poderosa que permitirá que você cante com confiança e expressividade.`;
      benefits = `Sua voz é um instrumento único e precioso. Esta aula apresenta técnicas vocais que irão expandir sua extensão, melhorar sua afinação, fortalecer sua projeção e permitir que você cante por longos períodos sem fadiga vocal.`;
      callToAction = `Pratique com regularidade, sempre respeitando os limites do seu instrumento vocal, e observe sua voz se desenvolvendo de forma saudável e consistente.`;
    } else if (tagLower.includes("ritmo") || tagLower.includes("groove") || tagLower.includes("levada")) {
      intro = `Desenvolva um senso rítmico sólido e um groove contagiante que fará toda diferença em suas performances.`;
      benefits = `O domínio rítmico é a espinha dorsal de qualquer performance musical de qualidade. Esta aula irá aprimorar sua precisão rítmica, seu timing e sua capacidade de criar grooves que movem e envolvem a audiência.`;
      callToAction = `Pratique com metrônomo, grave-se tocando e analise criticamente sua execução rítmica para alcançar a excelência.`;
    } else if (tagLower.includes("virada") || tagLower.includes("fill")) {
      intro = `Adicione criatividade e impacto às suas performances com viradas musicais bem executadas e no momento certo.`;
      benefits = `Viradas são elementos que adicionam dinâmica e emoção à música. Dominar uma variedade de viradas permitirá que você conduza transições musicais de forma suave e impactante, enriquecendo a experiência musical.`;
      callToAction = `Pratique cada virada lentamente, aumente gradualmente a velocidade e aprenda a aplicá-las musicalmente no contexto certo.`;
    } else {
      // Descrição genérica motivacional
      intro = `Expanda suas habilidades musicais com este conteúdo cuidadosamente elaborado para seu desenvolvimento.`;
      benefits = `Esta aula apresenta conceitos e práticas que irão enriquecer significativamente sua jornada musical. Cada minuto dedicado ao estudo e prática deste conteúdo representa um passo importante em direção à excelência musical.`;
      callToAction = `Comprometa-se com sua evolução musical - assista, pratique e revise este conteúdo até dominá-lo completamente.`;
    }

    // Monta a descrição completa
    const fullDescription = `${intro}

"${title.toUpperCase()}"

Ministrado por: ${authorName}

${benefits}

COMO APROVEITAR ESTA AULA:

- Assista ao vídeo completo fazendo anotações dos pontos principais
- Pratique lentamente focando em precisão e qualidade de som
- Divida o conteúdo em pequenas seções e domine uma de cada vez
- Grave sua execução e analise criticamente
- Seja consistente - a maestria é resultado de prática deliberada

${callToAction}

LEMBRE-SE: Todo grande músico já foi iniciante. A diferença está na dedicação diária à prática.`;

    return fullDescription;
  };

  // Formata o título para exibição
  const formatTitle = (videoTitle: string) => {
    const technique = extractTechnique(videoTitle);
    const context = extractContext(videoTitle);

    if (context) {
      return `${technique} para ${context}`;
    }

    return technique;
  };

  // Busca apenas o artista do YouTube se não foi fornecido
  useEffect(() => {
    if (!customArtist && videoId) {
      setIsLoading(true);
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then(res => res.json())
        .then(data => {
          const artist = data.author_name || "Instrutor";
          setAuthorName(artist);
        })
        .catch(err => {
          console.error("Erro ao buscar artista:", err);
          setAuthorName("Instrutor");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (customArtist) {
      setAuthorName(customArtist);
    }
  }, [videoId, customArtist]);

  // Se tem título e tag customizados, usa eles
  const title = customTitle || videoData?.title || "Carregando...";
  const tag = customTag || "";
  const artist = customArtist || authorName;

  // Gera descrição usando os dados fornecidos (título, tag e artista)
  const description = customDescription || (title && tag && artist ? generateDescription(title, tag, artist) : videoData?.description || "");

  // Extrai tags (técnica e autor)
  const getTags = () => {
    const tags: string[] = [];

    // Adiciona a tag customizada ou extrai do título
    if (tag) {
      tags.push(tag);
    } else if (videoData) {
      const videoTitle = videoData.title;
      const technique = extractTechnique(videoTitle);
      if (technique) {
        tags.push(technique);
      }
    }

    // Adiciona o artista
    if (artist) {
      tags.push(artist);
    }

    return tags;
  };

  const tags = getTags();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#121212] to-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header com logo e botão voltar */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/5 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <img src="/icon-logo.png" alt="Logo" className="w-8 h-8" />
        </div>

        {/* Grid Layout - Video e Info lado a lado em telas grandes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Video Player - 2/3 da largura */}
          <div className="lg:col-span-2">
            {videoId && (
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Título (mobile/tablet) */}
            <div className="mt-6 lg:hidden">
              <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                {title}
              </h1>
            </div>

            {/* Descrição completa (desktop) */}
            <div className="mt-6 hidden lg:block">
              <div className="bg-gradient-to-br from-[#181818] to-[#0f0f0f] rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-semibold mb-4 text-white/90">Sobre esta aula</h2>
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-white/70 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Sidebar - 1/3 da largura (desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Título */}
              <div>
                <h1 className="text-3xl font-bold mb-4 leading-tight">
                  {title}
                </h1>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#4CB4FF]/20 to-[#60A5FA]/20 text-[#4CB4FF] border border-[#4CB4FF]/30 hover:border-[#4CB4FF]/50 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-[#181818] to-[#0f0f0f] rounded-2xl p-5 border border-white/5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  Detalhes
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Categoria</span>
                    <span className="text-sm font-medium text-white">Técnica</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Nível</span>
                    <span className="text-sm font-medium text-white">Intermediário</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Duração</span>
                    <span className="text-sm font-medium text-white">Ver vídeo</span>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-[#4CB4FF]/10 to-[#60A5FA]/10 rounded-2xl p-5 border border-[#4CB4FF]/20">
                <h3 className="text-sm font-semibold text-[#4CB4FF] mb-2">
                  Pratique esta técnica
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Assista ao vídeo completo e pratique os exercícios apresentados para dominar esta técnica essencial.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição completa (mobile/tablet) */}
        <div className="mt-6 lg:hidden">
          <div className="bg-gradient-to-br from-[#181818] to-[#0f0f0f] rounded-2xl p-5 border border-white/5">
            <h2 className="text-lg font-semibold mb-3 text-white/90">Sobre esta aula</h2>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-[#4CB4FF]/20 to-[#60A5FA]/20 text-[#4CB4FF] border border-[#4CB4FF]/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-white/70 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Botão de excluir no final da página */}
        {isCustomLesson && onDelete && (
          <div className="mt-8 pb-8 flex justify-center">
            <button
              onClick={onDelete}
              className="text-xs text-white/40 hover:text-red-500 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              Excluir Aula
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
