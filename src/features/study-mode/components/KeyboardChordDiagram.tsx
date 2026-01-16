import React from "react";
import { KeyboardShapeData } from "../types";

interface KeyboardChordDiagramProps {
  chordName: string;
  shapeData: KeyboardShapeData;
  className?: string;
}

/**
 * Componente de diagrama de acorde de teclado (piano)
 * Renderiza um SVG com teclas brancas e pretas
 */
export const KeyboardChordDiagram: React.FC<KeyboardChordDiagramProps> = ({
  chordName,
  shapeData,
  className = "",
}) => {
  const { notes, octaves, voicing_type, inversion } = shapeData;

  // Configurações do diagrama
  const numOctaves = 2; // Mostrar 2 oitavas
  const whiteKeyWidth = 40;
  const whiteKeyHeight = 140;
  const blackKeyWidth = 28;
  const blackKeyHeight = 90;

  const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const blackNotes = ["C#", "D#", "F#", "G#", "A#"];

  const width = whiteNotes.length * numOctaves * whiteKeyWidth + 40;
  const height = whiteKeyHeight + 60;

  /**
   * Verifica se uma nota está ativa no acorde
   */
  const isNoteActive = (noteName: string, octave: number): boolean => {
    return notes.some((note, idx) => {
      const normalizedNote = note.replace(/\d+/, ""); // Remove octave number
      const noteOctave = octaves[idx];
      return normalizedNote === noteName && noteOctave === octave;
    });
  };

  /**
   * Renderiza as teclas brancas
   */
  const renderWhiteKeys = () => {
    const keys = [];
    let xOffset = 20;

    for (let octave = 4; octave < 4 + numOctaves; octave++) {
      whiteNotes.forEach((note, idx) => {
        const isActive = isNoteActive(note, octave);

        keys.push(
          <g key={`white-${octave}-${note}`}>
            <rect
              x={xOffset}
              y={20}
              width={whiteKeyWidth}
              height={whiteKeyHeight}
              fill={isActive ? "#3b82f6" : "#fff"}
              stroke="#333"
              strokeWidth={2}
              rx={4}
            />
            {isActive && (
              <circle
                cx={xOffset + whiteKeyWidth / 2}
                cy={20 + whiteKeyHeight - 20}
                r={8}
                fill="#fff"
              />
            )}
            <text
              x={xOffset + whiteKeyWidth / 2}
              y={20 + whiteKeyHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#999"
            >
              {note}{octave}
            </text>
          </g>
        );

        xOffset += whiteKeyWidth;
      });
    }

    return keys;
  };

  /**
   * Renderiza as teclas pretas
   */
  const renderBlackKeys = () => {
    const keys = [];
    let xOffset = 20;

    // Padrão de teclas pretas: C#, D#, _, F#, G#, A#, _
    const blackKeyPattern = [true, true, false, true, true, true, false];

    for (let octave = 4; octave < 4 + numOctaves; octave++) {
      whiteNotes.forEach((note, idx) => {
        if (blackKeyPattern[idx]) {
          const blackNote = note + "#";
          const isActive = isNoteActive(blackNote, octave);
          const blackKeyX = xOffset + whiteKeyWidth - blackKeyWidth / 2;

          keys.push(
            <g key={`black-${octave}-${blackNote}`}>
              <rect
                x={blackKeyX}
                y={20}
                width={blackKeyWidth}
                height={blackKeyHeight}
                fill={isActive ? "#3b82f6" : "#1a1a1a"}
                stroke="#000"
                strokeWidth={2}
                rx={4}
              />
              {isActive && (
                <circle
                  cx={blackKeyX + blackKeyWidth / 2}
                  cy={20 + blackKeyHeight - 15}
                  r={6}
                  fill="#fff"
                />
              )}
            </g>
          );
        }

        xOffset += whiteKeyWidth;
      });
    }

    return keys;
  };

  /**
   * Texto descritivo do voicing
   */
  const getVoicingLabel = (): string => {
    const labels: Record<string, string> = {
      open: "Voicing Aberto",
      closed: "Voicing Fechado",
      drop2: "Drop 2",
      drop3: "Drop 3",
    };
    return labels[voicing_type] || voicing_type;
  };

  /**
   * Texto da inversão
   */
  const getInversionLabel = (): string => {
    const labels = [
      "Fundamental",
      "1ª Inversão",
      "2ª Inversão",
      "3ª Inversão",
    ];
    return labels[inversion] || `Inversão ${inversion}`;
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold text-white">{chordName}</h3>
        <div className="text-sm text-white/60 mt-1">
          {getVoicingLabel()} • {getInversionLabel()}
        </div>
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto"
      >
        {/* Fundo */}
        <rect width={width} height={height} fill="#0a0a0a" rx="8" />

        {/* Teclas brancas */}
        {renderWhiteKeys()}

        {/* Teclas pretas (renderizadas por cima) */}
        {renderBlackKeys()}
      </svg>
    </div>
  );
};
