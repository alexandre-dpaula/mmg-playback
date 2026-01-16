import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { InstrumentSelector } from "@/components/InstrumentSelector";

/**
 * Hub Principal do Modo Estudo
 * Tela de entrada que guia o usuário através das opções de estudo
 */
const StudiesHub: React.FC = () => {
  const navigate = useNavigate();
  const [selectedInstrument, setSelectedInstrument] = useState<"guitar" | "keyboard">("guitar");

  // Carrega preferência do instrumento do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("study-instrument");
    if (saved === "guitar" || saved === "keyboard") {
      setSelectedInstrument(saved);
    }
  }, []);

  // Salva preferência quando muda
  const handleInstrumentChange = (instrument: "guitar" | "keyboard") => {
    setSelectedInstrument(instrument);
    localStorage.setItem("study-instrument", instrument);
  };

  const studyCards = [
    {
      id: "caged",
      title: "CAGED",
      description: "Navegue pelas formas C-A-G-E-D ao longo do braço",
      image: "/caged.jpg",
      path: "/study/caged",
      instrumentOnly: "guitar" as const,
    },
    {
      id: "library",
      title: "Biblioteca de Acordes",
      description: "Explore acordes por tipo, campo harmônico e relações",
      image: "/biblioteca-de-acordes.jpg",
      path: "/study/library",
    },
    {
      id: "reharmonization",
      title: "Reharmonização",
      description: "Substituições, baixo alternativo e notas em comum",
      image: "/reharmonizacao.jpg",
      path: "/study/reharmonization",
    },
    {
      id: "library-search",
      title: "Estudar Músicas",
      description: "Pesquise na sua biblioteca e estude com transposição + diagramas",
      image: "/buscar-musica.jpg",
      path: "/cifraclub-search",
    },
    {
      id: "modo-pro",
      title: "Modo PRO",
      description: "Ferramentas avançadas para músicos profissionais",
      image: "/modo-pro.jpg",
      path: "/study/pro",
    },
  ];

  // Filtra cards baseado no instrumento selecionado
  const filteredCards = studyCards.filter((card) => {
    if (card.instrumentOnly) {
      return card.instrumentOnly === selectedInstrument;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Início</span>
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400 font-semibold mb-1">
            MODO ESTUDO
          </p>
          <h1 className="text-3xl font-bold text-white">O que você quer estudar?</h1>
          <p className="text-white/60 mt-2">
            Escolha uma área de estudo
          </p>
        </div>
      </div>

      {/* Grid de Cards Horizontais - 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        {filteredCards.map((card) => {
          return (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 h-32"
            >
              {/* Imagem de Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${card.image})` }}
              />

              {/* Overlay gradiente - mais forte na parte inferior */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Linha inferior neon azul */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#60A5FA] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />

              {/* Conteúdo do Card - Posicionado na parte inferior direita */}
              <div className="relative h-full flex flex-col justify-end items-end p-5">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#60A5FA] transition-colors text-right">
                  {card.title}
                </h3>
                <p className="text-xs text-white/60 line-clamp-2 text-right">
                  {card.description}
                </p>
              </div>

              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudiesHub;
