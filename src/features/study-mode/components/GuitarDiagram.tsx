import React from "react";
import { GuitarChord, GuitarNote } from "../types";

interface GuitarDiagramProps {
  chord: GuitarChord;
  highlightRoot?: boolean;
  showFingers?: boolean;
  showTitle?: boolean;
  className?: string;
}

/**
 * Componente moderno de diagrama de violão
 * Aceita o formato GuitarChord com array de notes
 * Suporta Sistema CAGED completo
 */
export const GuitarDiagram: React.FC<GuitarDiagramProps> = ({
  chord,
  highlightRoot = false,
  showFingers = true,
  showTitle = true,
  className = "",
}) => {
  const STRINGS = 6;
  const FRETS = 5;
  const STRING_SPACING = 32; // Reduzido de 45 para 32
  const FRET_SPACING = 40;   // Reduzido de 55 para 40

  // Padding ajustado para evitar overflow
  const PADDING_LEFT = 25;   // Espaço para números das casas
  const PADDING_RIGHT = 20;  // Espaço para indicador de casa base
  const PADDING_TOP = 25;    // Espaço para marcadores (X e O)
  const PADDING_BOTTOM = 20; // Espaço inferior

  const WIDTH = (STRINGS - 1) * STRING_SPACING + PADDING_LEFT + PADDING_RIGHT;
  const HEIGHT = FRETS * FRET_SPACING + PADDING_TOP + PADDING_BOTTOM;

  // Organiza notas por string (1-6)
  const notesByString = new Map<number, GuitarNote>();
  chord.notes.forEach((note) => {
    notesByString.set(note.string, note);
  });

  // Renderiza marcação acima do braço (corda solta ou mutada)
  const renderStringMarker = (stringNum: number) => {
    // CORREÇÃO: Inverte ordem das cordas (6ª corda = E grave em cima)
    const visualPosition = STRINGS - stringNum; // String 6 → pos 0, String 1 → pos 5
    const x = PADDING_LEFT + visualPosition * STRING_SPACING;
    const note = notesByString.get(stringNum);

    if (!note || note.fret === -1) {
      // Corda mutada (X)
      return (
        <text
          key={`marker-${stringNum}`}
          x={x}
          y={15}
          textAnchor="middle"
          fill="currentColor"
          fontSize="14"
          fontWeight="bold"
          opacity="0.7"
        >
          ×
        </text>
      );
    }

    if (note.fret === 0) {
      // Corda solta (O)
      return (
        <circle
          key={`marker-${stringNum}`}
          cx={x}
          cy={12}
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.8"
        />
      );
    }

    return null;
  };

  // Renderiza nota pressionada no braço
  const renderFrettedNote = (stringNum: number) => {
    const note = notesByString.get(stringNum);
    if (!note || note.fret <= 0) return null;

    // CORREÇÃO: Inverte ordem das cordas (mesmo que renderStringMarker)
    const visualPosition = STRINGS - stringNum;
    const x = PADDING_LEFT + visualPosition * STRING_SPACING;

    // CORREÇÃO CRÍTICA: Converte fret absoluto para relativo ao baseFret
    // Se baseFret = 7 e note.fret = 9, então relativeFret = 9 - 7 + 1 = 3
    const relativeFret = note.fret - chord.baseFret + 1;
    const y = PADDING_TOP + (relativeFret - 0.5) * FRET_SPACING;

    const isRoot = highlightRoot && stringNum === 1; // Simplificado: assume primeira corda tocada como raiz

    return (
      <g key={`note-${stringNum}`}>
        {/* Círculo da nota */}
        <circle
          cx={x}
          cy={y}
          r="10"
          fill={isRoot ? "#3B82F6" : "currentColor"}
          opacity={isRoot ? "1" : "0.9"}
          className="transition-all duration-200"
        />

        {/* Número do dedo */}
        {showFingers && note.finger && (
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            fill={isRoot ? "black" : "black"}
            fontSize="11"
            fontWeight="bold"
          >
            {note.finger}
          </text>
        )}
      </g>
    );
  };

  // Renderiza pestana (barre)
  const renderBarre = () => {
    if (!chord.barre) return null;

    const { fret, fromString, toString } = chord.barre;
    // CORREÇÃO: Inverte ordem das cordas para pestana
    const visualFrom = STRINGS - fromString;
    const visualTo = STRINGS - toString;
    const x1 = PADDING_LEFT + visualFrom * STRING_SPACING;
    const x2 = PADDING_LEFT + visualTo * STRING_SPACING;

    // CORREÇÃO CRÍTICA: Converte fret absoluto para relativo ao baseFret
    const relativeFret = fret - chord.baseFret + 1;
    const y = PADDING_TOP + (relativeFret - 0.5) * FRET_SPACING;

    return (
      <g key="barre">
        {/* Linha da pestana */}
        <line
          x1={x1}
          y1={y}
          x2={x2}
          y2={y}
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Texto "Barre" */}
        <text
          x={(x1 + x2) / 2}
          y={y + 4}
          textAnchor="middle"
          fill="black"
          fontSize="10"
          fontWeight="bold"
        >
          B
        </text>
      </g>
    );
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Título do acorde */}
      {showTitle && (
        <h3 className="text-lg font-bold text-white mb-1">{chord.name}</h3>
      )}

      {/* Diagrama SVG */}
      <svg width={WIDTH} height={HEIGHT} className="text-white">
        {/* Cordas (verticais) */}
        {Array.from({ length: STRINGS }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={PADDING_LEFT + i * STRING_SPACING}
            y1={PADDING_TOP}
            x2={PADDING_LEFT + i * STRING_SPACING}
            y2={PADDING_TOP + FRETS * FRET_SPACING}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />
        ))}

        {/* Trastes (horizontais) */}
        {Array.from({ length: FRETS + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={PADDING_LEFT}
            y1={PADDING_TOP + i * FRET_SPACING}
            x2={PADDING_LEFT + (STRINGS - 1) * STRING_SPACING}
            y2={PADDING_TOP + i * FRET_SPACING}
            stroke="currentColor"
            strokeWidth={i === 0 ? "5" : "2"}
            opacity={i === 0 ? "0.9" : "0.3"}
          />
        ))}

        {/* Marcadores de cordas soltas/mutadas */}
        {Array.from({ length: STRINGS }).map((_, i) => renderStringMarker(i + 1))}

        {/* Pestana (se houver) */}
        {renderBarre()}

        {/* Notas pressionadas */}
        {Array.from({ length: STRINGS }).map((_, i) => renderFrettedNote(i + 1))}

        {/* Números das casas (lateral esquerda) */}
        {Array.from({ length: FRETS }).map((_, i) => (
          <text
            key={`fret-num-${i}`}
            x={12}
            y={PADDING_TOP + (i + 0.5) * FRET_SPACING + 3}
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            opacity="0.5"
            fontWeight="600"
          >
            {i + chord.baseFret}
          </text>
        ))}

        {/* Indicador de casa base (se não for 1) */}
        {chord.baseFret > 1 && (
          <text
            x={WIDTH - 10}
            y={PADDING_TOP + 10}
            textAnchor="middle"
            fill="currentColor"
            fontSize="11"
            opacity="0.6"
            fontWeight="bold"
          >
            {chord.baseFret}ª
          </text>
        )}
      </svg>

      {/* Legenda */}
      {showFingers && (
        <div className="mt-1 text-[10px] text-white/50 text-center space-y-0.5">
          <div>
            {highlightRoot && (
              <span className="text-blue-500 font-semibold mr-2">● Tônica</span>
            )}
            <span>Números = dedos (1-4)</span>
          </div>
        </div>
      )}
    </div>
  );
};
