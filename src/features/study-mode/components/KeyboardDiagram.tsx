import React from "react";

export interface KeyboardChord {
  notes: string[]; // ["C4", "E4", "G4"] - com oitavas
  inversion?: number;
}

interface KeyboardDiagramProps {
  chord: KeyboardChord;
  showLabels?: boolean;
  highlightRoot?: boolean;
  voicingName?: string; // Ex: "Posição fundamental", "1ª inversão"
  className?: string;
}

/**
 * Componente moderno de diagrama de teclado/piano
 * Aceita KeyboardChord com inversões e voicings
 * Suporta notação com oitavas (C4, E4, G4)
 */
export const KeyboardDiagram: React.FC<KeyboardDiagramProps> = ({
  chord,
  showLabels = true,
  highlightRoot = false,
  voicingName,
  className = "",
}) => {
  const notes = chord.notes;
  // Configuração do teclado (2 oitavas: C4 a B5)
  const OCTAVE_START = 4;
  const OCTAVE_COUNT = 2;
  const WHITE_KEY_WIDTH = 40;
  const WHITE_KEY_HEIGHT = 140;
  const BLACK_KEY_WIDTH = 28;
  const BLACK_KEY_HEIGHT = 90;

  // Padrão de teclas brancas e pretas em uma oitava
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeyPositions = [0.7, 1.7, 3.7, 4.7, 5.7]; // Posições relativas das teclas pretas
  const blackKeyNames = ["C#", "D#", "F#", "G#", "A#"];

  // Normaliza nome da nota (remove oitava se houver)
  const normalizeNote = (note: string): string => {
    return note.replace(/\d+$/, ""); // Remove números no final
  };

  // Verifica se uma nota está na lista de notas a destacar
  const isNoteActive = (noteName: string): boolean => {
    return notes.some((n) => normalizeNote(n) === noteName);
  };

  // Identifica se é a nota raiz (primeira da lista)
  const isRootNote = (noteName: string): boolean => {
    if (!highlightRoot || notes.length === 0) return false;
    return normalizeNote(notes[0]) === noteName;
  };

  // Renderiza teclas brancas
  const renderWhiteKeys = () => {
    const whiteKeysElements = [];

    for (let octave = 0; octave < OCTAVE_COUNT; octave++) {
      whiteKeys.forEach((key, index) => {
        const x = (octave * 7 + index) * WHITE_KEY_WIDTH;
        const isActive = isNoteActive(key);
        const isRoot = isRootNote(key);

        whiteKeysElements.push(
          <g key={`white-${octave}-${key}`}>
            {/* Tecla */}
            <rect
              x={x}
              y={0}
              width={WHITE_KEY_WIDTH}
              height={WHITE_KEY_HEIGHT}
              fill={isActive ? (isRoot ? "#3B82F6" : "#60A5FA") : "white"}
              stroke="#000000"
              strokeWidth="2"
              className="transition-all duration-200"
            />

            {/* Label da nota */}
            {showLabels && isActive && (
              <text
                x={x + WHITE_KEY_WIDTH / 2}
                y={WHITE_KEY_HEIGHT - 15}
                textAnchor="middle"
                fill={isActive ? "white" : "black"}
                fontSize="13"
                fontWeight="600"
              >
                {key}
              </text>
            )}
          </g>
        );
      });
    }

    return whiteKeysElements;
  };

  // Renderiza teclas pretas
  const renderBlackKeys = () => {
    const blackKeysElements = [];

    for (let octave = 0; octave < OCTAVE_COUNT; octave++) {
      blackKeyPositions.forEach((position, index) => {
        const x = (octave * 7 + position) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
        const noteName = blackKeyNames[index];
        const isActive = isNoteActive(noteName);
        const isRoot = isRootNote(noteName);

        blackKeysElements.push(
          <g key={`black-${octave}-${noteName}`}>
            {/* Tecla preta */}
            <rect
              x={x}
              y={0}
              width={BLACK_KEY_WIDTH}
              height={BLACK_KEY_HEIGHT}
              fill={isActive ? (isRoot ? "#3B82F6" : "#60A5FA") : "#1a1a1a"}
              stroke="#000000"
              strokeWidth="2"
              rx="3"
              className="transition-all duration-200"
            />

            {/* Label da nota */}
            {showLabels && isActive && (
              <text
                x={x + BLACK_KEY_WIDTH / 2}
                y={BLACK_KEY_HEIGHT - 10}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="600"
              >
                {noteName.replace("#", "♯")}
              </text>
            )}
          </g>
        );
      });
    }

    return blackKeysElements;
  };

  const totalWidth = whiteKeys.length * OCTAVE_COUNT * WHITE_KEY_WIDTH;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Nome do voicing */}
      {voicingName && (
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-white">{voicingName}</h3>
          <p className="text-sm text-white/60 mt-1">
            {notes.join(", ")}
          </p>
        </div>
      )}

      {/* Diagrama SVG do teclado */}
      <svg
        width={totalWidth + 4}
        height={WHITE_KEY_HEIGHT + 20}
        className="text-white"
      >
        <g transform="translate(2, 10)">
          {/* Renderiza teclas brancas primeiro (fundo) */}
          {renderWhiteKeys()}

          {/* Renderiza teclas pretas por cima */}
          {renderBlackKeys()}
        </g>
      </svg>

      {/* Legenda */}
      {showLabels && notes.length > 0 && (
        <div className="mt-4 text-xs text-white/50 text-center">
          {highlightRoot && (
            <span className="text-blue-500 font-semibold mr-3">● Tônica</span>
          )}
          <span className="text-blue-400 font-semibold mr-3">● Notas do acorde</span>
          <span>{notes.join(", ")}</span>
        </div>
      )}
    </div>
  );
};
