import React from "react";
import { GuitarShapeData } from "../types";

interface GuitarChordDiagramProps {
  chordName: string;
  shapeData: GuitarShapeData;
  className?: string;
}

/**
 * Componente de diagrama de acorde de violão
 * Renderiza um SVG com 6 cordas e casas do braço
 */
export const GuitarChordDiagram: React.FC<GuitarChordDiagramProps> = ({
  chordName,
  shapeData,
  className = "",
}) => {
  const { frets, base_fret, fingers, barres } = shapeData;

  // Configurações do diagrama
  const numStrings = 6;
  const numFrets = 5;
  const stringSpacing = 30;
  const fretSpacing = 40;
  const dotRadius = 12;
  const width = (numStrings - 1) * stringSpacing + 60;
  const height = numFrets * fretSpacing + 80;
  const startX = 30;
  const startY = 40;

  /**
   * Renderiza as cordas verticais
   */
  const renderStrings = () => {
    return Array.from({ length: numStrings }).map((_, i) => {
      const x = startX + i * stringSpacing;
      return (
        <line
          key={`string-${i}`}
          x1={x}
          y1={startY}
          x2={x}
          y2={startY + numFrets * fretSpacing}
          stroke="#666"
          strokeWidth={i === 0 || i === 5 ? 2 : 1.5}
        />
      );
    });
  };

  /**
   * Renderiza as trastes horizontais
   */
  const renderFrets = () => {
    const fretLines = [];

    for (let i = 0; i <= numFrets; i++) {
      const y = startY + i * fretSpacing;
      const isNut = i === 0 && base_fret === 1;

      fretLines.push(
        <line
          key={`fret-${i}`}
          x1={startX}
          y1={y}
          x2={startX + (numStrings - 1) * stringSpacing}
          y2={y}
          stroke={isNut ? "#fff" : "#666"}
          strokeWidth={isNut ? 4 : 2}
        />
      );
    }

    return fretLines;
  };

  /**
   * Renderiza pestanas (barres)
   */
  const renderBarres = () => {
    if (!barres || barres.length === 0) return null;

    return barres.map((barre, idx) => {
      const fretY = startY + (barre.fret - base_fret + 0.5) * fretSpacing;
      const fromX = startX + barre.fromString * stringSpacing;
      const toX = startX + barre.toString * stringSpacing;

      return (
        <line
          key={`barre-${idx}`}
          x1={fromX}
          y1={fretY}
          x2={toX}
          y2={fretY}
          stroke="#fff"
          strokeWidth={dotRadius * 2}
          strokeLinecap="round"
          opacity={0.9}
        />
      );
    });
  };

  /**
   * Renderiza os pontos dos dedos
   */
  const renderFingerDots = () => {
    return frets.map((fret, stringIndex) => {
      if (fret === "x" || fret === "o" || fret === 0) return null;

      const x = startX + stringIndex * stringSpacing;
      const y = startY + (fret - base_fret + 0.5) * fretSpacing;
      const fingerNumber = fingers?.[stringIndex];

      return (
        <g key={`dot-${stringIndex}`}>
          <circle cx={x} cy={y} r={dotRadius} fill="#fff" />
          {fingerNumber && (
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="bold"
              fill="#121212"
            >
              {fingerNumber}
            </text>
          )}
        </g>
      );
    });
  };

  /**
   * Renderiza os símbolos acima do braço (x = mute, o = open)
   */
  const renderTopSymbols = () => {
    return frets.map((fret, stringIndex) => {
      const x = startX + stringIndex * stringSpacing;
      const y = startY - 15;

      if (fret === "x") {
        return (
          <text
            key={`symbol-${stringIndex}`}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#ff6b6b"
          >
            ✕
          </text>
        );
      }

      if (fret === "o" || fret === 0) {
        return (
          <circle
            key={`symbol-${stringIndex}`}
            cx={x}
            cy={y}
            r={6}
            fill="none"
            stroke="#4ade80"
            strokeWidth={2}
          />
        );
      }

      return null;
    });
  };

  /**
   * Renderiza o número da casa base (quando não é posição aberta)
   */
  const renderBaseFretNumber = () => {
    if (base_fret === 1) return null;

    return (
      <text
        x={startX - 15}
        y={startY + fretSpacing * 0.5}
        textAnchor="end"
        fontSize="14"
        fontWeight="bold"
        fill="#fff"
      >
        {base_fret}
      </text>
    );
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold text-white">{chordName}</h3>
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto"
      >
        {/* Fundo */}
        <rect width={width} height={height} fill="#1a1a1a" rx="8" />

        {/* Cordas */}
        {renderStrings()}

        {/* Trastes */}
        {renderFrets()}

        {/* Pestanas */}
        {renderBarres()}

        {/* Pontos dos dedos */}
        {renderFingerDots()}

        {/* Símbolos (x, o) */}
        {renderTopSymbols()}

        {/* Número da casa base */}
        {renderBaseFretNumber()}
      </svg>
    </div>
  );
};
