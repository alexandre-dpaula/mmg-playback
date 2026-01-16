import React, { useState } from "react";
import { ChordShape, GuitarShapeData, KeyboardShapeData } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { KeyboardDiagram } from "./KeyboardDiagram";

interface ChordVariationCarouselProps {
  variations: ChordShape[];
  selectedInstrument: "guitar" | "keyboard";
}

export const ChordVariationCarousel: React.FC<ChordVariationCarouselProps> = ({
  variations,
  selectedInstrument,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredVariations = variations.filter(
    (v) => v.instrument === selectedInstrument
  );

  if (filteredVariations.length === 0) {
    return (
      <div className="text-center text-white/60 py-8">
        Nenhuma variação disponível para {selectedInstrument === "guitar" ? "violão" : "teclado"}
      </div>
    );
  }

  const currentVariation = filteredVariations[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? filteredVariations.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === filteredVariations.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-4">
      {/* Título da variação */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white">{currentVariation.chord_name}</h3>
        <p className="text-sm text-white/60">{currentVariation.variation_name}</p>
      </div>

      {/* Diagrama */}
      <div className="relative">
        {selectedInstrument === "guitar" ? (
          <GuitarChordDiagram shape={currentVariation.shape_data as GuitarShapeData} />
        ) : (
          <div className="text-center text-white/60 py-12">
            Diagrama de teclado - use o novo sistema de KeyboardVoicings
          </div>
        )}
      </div>

      {/* Navegação */}
      {filteredVariations.length > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm text-white/60">
            {currentIndex + 1} / {filteredVariations.length}
          </div>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// Componente SVG simples para diagrama de violão
const GuitarChordDiagram: React.FC<{ shape: GuitarShapeData }> = ({ shape }) => {
  const strings = 6;
  const frets = 5;
  const stringSpacing = 40;
  const fretSpacing = 50;
  const width = (strings - 1) * stringSpacing + 80;
  const height = frets * fretSpacing + 60;

  return (
    <div className="flex justify-center py-4">
      <svg width={width} height={height} className="text-white">
        {/* Cordas verticais */}
        {Array.from({ length: strings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={40 + i * stringSpacing}
            y1={30}
            x2={40 + i * stringSpacing}
            y2={30 + frets * fretSpacing}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />
        ))}

        {/* Trastes horizontais */}
        {Array.from({ length: frets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={40}
            y1={30 + i * fretSpacing}
            x2={40 + (strings - 1) * stringSpacing}
            y2={30 + i * fretSpacing}
            stroke="currentColor"
            strokeWidth={i === 0 ? "4" : "2"}
            opacity={i === 0 ? "0.8" : "0.3"}
          />
        ))}

        {/* Posições dos dedos */}
        {shape.frets.map((fret, stringIndex) => {
          const x = 40 + stringIndex * stringSpacing;

          if (fret === "x") {
            // Corda não tocada (X)
            return (
              <text
                key={`pos-${stringIndex}`}
                x={x}
                y={20}
                textAnchor="middle"
                fill="currentColor"
                fontSize="16"
                fontWeight="bold"
              >
                ×
              </text>
            );
          }

          if (fret === "o" || fret === 0) {
            // Corda solta (O)
            return (
              <circle
                key={`pos-${stringIndex}`}
                cx={x}
                cy={15}
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            );
          }

          // Dedo na casa
          const fretNumber = typeof fret === "number" ? fret : 0;
          const y = 30 + (fretNumber - 0.5) * fretSpacing;

          return (
            <circle
              key={`pos-${stringIndex}`}
              cx={x}
              cy={y}
              r="12"
              fill="currentColor"
              opacity="0.9"
            />
          );
        })}

        {/* Números das casas */}
        {Array.from({ length: frets }).map((_, i) => (
          <text
            key={`fret-num-${i}`}
            x={20}
            y={30 + (i + 0.5) * fretSpacing + 5}
            textAnchor="middle"
            fill="currentColor"
            fontSize="14"
            opacity="0.5"
          >
            {i + 1 + (shape.base_fret || 0)}
          </text>
        ))}
      </svg>
    </div>
  );
};
