import React from "react";

interface GuitarFretboardDiagramProps {
  abertura: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  className?: string;
}

/**
 * Componente de Diagrama do Braço da Guitarra
 * Baseado no PDF "Domine o Braço" da JV Academy
 * Mostra as 8 aberturas principais para memorização das notas
 */
export const GuitarFretboardDiagram: React.FC<GuitarFretboardDiagramProps> = ({
  abertura,
  className = "",
}) => {
  // Configuração das notas destacadas para cada abertura (baseado no PDF)
  const aberturas = {
    1: [
      { string: 1, fret: 1 }, { string: 1, fret: 8 }, { string: 1, fret: 13 },
      { string: 2, fret: 3 }, { string: 2, fret: 15 },
      { string: 3, fret: 0 }, { string: 3, fret: 5 }, { string: 3, fret: 12 },
      { string: 4, fret: 2 }, { string: 4, fret: 7 }, { string: 4, fret: 14 },
      { string: 5, fret: 0 }, { string: 5, fret: 10 },
      { string: 6, fret: 1 }, { string: 6, fret: 8 }, { string: 6, fret: 13 },
    ],
    2: [
      { string: 1, fret: 1 }, { string: 1, fret: 8 }, { string: 1, fret: 13 },
      { string: 2, fret: 3 }, { string: 2, fret: 10 }, { string: 2, fret: 15 },
      { string: 3, fret: 0 }, { string: 3, fret: 5 }, { string: 3, fret: 12 },
      { string: 4, fret: 2 }, { string: 4, fret: 14 },
      { string: 5, fret: 4 }, { string: 5, fret: 9 },
      { string: 6, fret: 1 }, { string: 6, fret: 8 }, { string: 6, fret: 13 },
    ],
    3: [
      { string: 1, fret: 1 }, { string: 1, fret: 8 }, { string: 1, fret: 13 },
      { string: 2, fret: 3 }, { string: 2, fret: 10 }, { string: 2, fret: 15 },
      { string: 3, fret: 5 }, { string: 3, fret: 12 },
      { string: 4, fret: 2 }, { string: 4, fret: 7 }, { string: 4, fret: 14 },
      { string: 5, fret: 4 }, { string: 5, fret: 9 },
      { string: 6, fret: 1 }, { string: 6, fret: 8 }, { string: 6, fret: 13 },
    ],
    4: [
      { string: 1, fret: 1 }, { string: 1, fret: 8 }, { string: 1, fret: 13 },
      { string: 2, fret: 3 }, { string: 2, fret: 10 }, { string: 2, fret: 15 },
      { string: 3, fret: 5 }, { string: 3, fret: 12 },
      { string: 4, fret: 7 }, { string: 4, fret: 14 },
      { string: 5, fret: 4 }, { string: 5, fret: 9 },
      { string: 6, fret: 6 }, { string: 6, fret: 13 },
    ],
    5: [
      { string: 1, fret: 1 }, { string: 1, fret: 8 }, { string: 1, fret: 15 },
      { string: 2, fret: 3 }, { string: 2, fret: 10 },
      { string: 3, fret: 5 }, { string: 3, fret: 12 },
      { string: 4, fret: 7 }, { string: 4, fret: 14 },
      { string: 5, fret: 9 },
      { string: 6, fret: 6 }, { string: 6, fret: 11 },
    ],
    6: [
      { string: 1, fret: 1 }, { string: 1, fret: 8 }, { string: 1, fret: 13 },
      { string: 2, fret: 3 }, { string: 2, fret: 10 }, { string: 2, fret: 15 },
      { string: 3, fret: 5 }, { string: 3, fret: 12 },
      { string: 4, fret: 7 }, { string: 4, fret: 14 },
      { string: 5, fret: 9 },
      { string: 6, fret: 6 }, { string: 6, fret: 11 },
    ],
    7: [
      { string: 1, fret: 1 }, { string: 1, fret: 8 }, { string: 1, fret: 13 },
      { string: 2, fret: 3 }, { string: 2, fret: 10 }, { string: 2, fret: 15 },
      { string: 3, fret: 5 }, { string: 3, fret: 12 },
      { string: 4, fret: 7 }, { string: 4, fret: 14 },
      { string: 5, fret: 9 },
      { string: 6, fret: 11 },
    ],
    8: [
      { string: 1, fret: 1 }, { string: 1, fret: 8 }, { string: 1, fret: 13 },
      { string: 2, fret: 10 }, { string: 2, fret: 15 },
      { string: 3, fret: 12 },
      { string: 4, fret: 14 },
      { string: 5, fret: 9 }, { string: 5, fret: 11 },
      { string: 6, fret: 11 },
    ],
  };

  const highlightedNotes = aberturas[abertura];
  const strings = 6;
  const frets = 15;

  // Verifica se uma nota deve ser destacada
  const isHighlighted = (string: number, fret: number) => {
    return highlightedNotes.some(
      (note) => note.string === string && note.fret === fret
    );
  };

  return (
    <div className={`inline-block ${className}`}>
      {/* Título */}
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <span className="text-sm font-semibold text-blue-400">
            Abertura {abertura}
          </span>
        </div>
      </div>

      {/* Braço da Guitarra */}
      <div className="bg-zinc-800/50 rounded-lg p-6 border border-white/10">
        <svg
          width="800"
          height="200"
          viewBox="0 0 800 200"
          className="w-full h-auto"
        >
          {/* Cordas (horizontais) */}
          {Array.from({ length: strings }).map((_, stringIndex) => {
            const y = 30 + stringIndex * 28;
            return (
              <line
                key={`string-${stringIndex}`}
                x1="40"
                y1={y}
                x2="760"
                y2={y}
                stroke="#666"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Trastes (verticais) */}
          {Array.from({ length: frets + 1 }).map((_, fretIndex) => {
            const x = 40 + fretIndex * 48;
            const isThickFret = fretIndex === 0;
            return (
              <line
                key={`fret-${fretIndex}`}
                x1={x}
                y1="30"
                x2={x}
                y2={30 + (strings - 1) * 28}
                stroke={isThickFret ? "#888" : "#555"}
                strokeWidth={isThickFret ? "3" : "1"}
              />
            );
          })}

          {/* Marcadores de casa (3, 5, 7, 9, 12, 15) */}
          {[3, 5, 7, 9, 12, 15].map((fretNum) => {
            const x = 40 + (fretNum - 0.5) * 48;
            const y = 30 + ((strings - 1) * 28) / 2;
            return (
              <circle
                key={`marker-${fretNum}`}
                cx={x}
                cy={y}
                r="4"
                fill="#444"
              />
            );
          })}

          {/* Números das casas */}
          {Array.from({ length: frets }).map((_, fretIndex) => {
            const x = 40 + (fretIndex + 0.5) * 48;
            return (
              <text
                key={`fret-num-${fretIndex}`}
                x={x}
                y="20"
                textAnchor="middle"
                fontSize="12"
                fill="#888"
                fontFamily="monospace"
              >
                {fretIndex + 1}
              </text>
            );
          })}

          {/* Notas destacadas (círculos azuis) */}
          {highlightedNotes.map((note, index) => {
            const x = note.fret === 0 ? 40 : 40 + (note.fret - 0.5) * 48;
            const y = 30 + (note.string - 1) * 28;
            const isOpenString = note.fret === 0;

            return (
              <g key={`note-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isOpenString ? "8" : "10"}
                  fill={isOpenString ? "none" : "#3b82f6"}
                  stroke="#3b82f6"
                  strokeWidth={isOpenString ? "2" : "0"}
                  opacity="0.9"
                />
                {/* Brilho */}
                {!isOpenString && (
                  <circle
                    cx={x - 2}
                    cy={y - 2}
                    r="3"
                    fill="#60a5fa"
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Legenda */}
        <div className="mt-4 text-center text-xs text-white/40">
          <p>Casa 0 = Corda solta | Círculos azuis = Notas da abertura</p>
        </div>
      </div>

      {/* Observação */}
      <div className="mt-4 text-center text-sm text-white/60">
        <p>
          Toque as notas destacadas para memorizar a abertura {abertura}
        </p>
      </div>
    </div>
  );
};
