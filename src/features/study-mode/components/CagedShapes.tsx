import React, { useState } from "react";
import { GuitarChord } from "../types";
import { GuitarDiagram } from "./GuitarDiagram";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

interface CagedShapesProps {
  shapes: Array<{ shape: string; data: GuitarChord }>;
  chordName: string;
  className?: string;
}

/**
 * Componente para navegar entre as formas CAGED de um acorde
 * Permite scroll horizontal entre C, A, G, E, D
 */
export const CagedShapes: React.FC<CagedShapesProps> = ({
  shapes,
  chordName,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  if (shapes.length === 0) {
    return (
      <div className="text-center text-white/60 py-12">
        <p>Nenhuma forma CAGED disponível para este acorde</p>
      </div>
    );
  }

  const currentShape = shapes[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? shapes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === shapes.length - 1 ? 0 : prev + 1));
  };

  // Cores para cada forma CAGED
  const CAGED_COLORS: Record<string, string> = {
    C: "from-red-500 to-orange-500",
    A: "from-blue-500 to-cyan-500",
    G: "from-green-500 to-emerald-500",
    E: "from-purple-500 to-pink-500",
    D: "from-yellow-500 to-amber-500",
  };

  const currentColor = CAGED_COLORS[currentShape.shape] || "from-gray-500 to-gray-600";

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com indicador de forma */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{currentShape.data.name}</h3>
          <p className="text-sm text-white/60">Forma {currentShape.shape} do Sistema CAGED</p>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
        >
          <Info className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Info sobre o Sistema CAGED */}
      {showInfo && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-white/80">
          <p className="font-semibold mb-2">Sistema CAGED</p>
          <p>
            O sistema CAGED divide o braço do violão em 5 formas (C-A-G-E-D) que se repetem ao longo do instrumento.
            Cada forma representa uma posição diferente do mesmo acorde, permitindo tocar em qualquer região do braço.
          </p>
        </div>
      )}

      {/* Diagrama do acorde */}
      <div className="bg-black/20 rounded-xl p-6 border border-white/10">
        <GuitarDiagram chord={currentShape.data} highlightRoot showFingers />
      </div>

      {/* Navegação entre formas */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Forma anterior"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Indicadores de todas as formas */}
        <div className="flex items-center gap-2">
          {shapes.map((shape, index) => (
            <button
              key={shape.shape}
              onClick={() => setCurrentIndex(index)}
              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                index === currentIndex
                  ? `bg-gradient-to-br ${CAGED_COLORS[shape.shape]} text-white shadow-lg scale-110`
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {shape.shape}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Próxima forma"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Informação da posição */}
      <div className="text-center text-sm text-white/50">
        <span>Forma {currentIndex + 1} de {shapes.length}</span>
        {currentShape.data.baseFret > 1 && (
          <span className="ml-3">• Casa base: {currentShape.data.baseFret}ª</span>
        )}
      </div>
    </div>
  );
};
