/**
 * COMPONENTE: ChordSheetViewer
 * Visualiza texto cifrado com parsing automático
 */

import React from 'react';
import { useChordParser } from '../hooks/useChordParser';
import { ParsedLine } from '../services/chordParser';

interface ChordSheetViewerProps {
  text: string;
  onChordClick?: (chord: string) => void;
  className?: string;
}

/**
 * Renderiza uma linha de cifras
 */
const ChordLine: React.FC<{
  line: ParsedLine;
  onChordClick?: (chord: string) => void;
}> = ({ line, onChordClick }) => {
  if (!line.chords || line.chords.length === 0) {
    return (
      <div className="text-blue-400 font-mono text-sm py-1">
        {line.content}
      </div>
    );
  }

  // Renderiza com chords clicáveis
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  line.chords.forEach((chord, idx) => {
    // Texto antes do acorde
    if (chord.position > lastIndex) {
      parts.push(
        <span key={`text-${idx}`} className="text-blue-400/50">
          {line.content.substring(lastIndex, chord.position)}
        </span>
      );
    }

    // Acorde clicável
    parts.push(
      <button
        key={`chord-${idx}`}
        onClick={() => onChordClick?.(chord.normalized)}
        className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-colors"
      >
        {chord.original}
      </button>
    );

    lastIndex = chord.position + chord.original.length;
  });

  // Texto final
  if (lastIndex < line.content.length) {
    parts.push(
      <span key="text-final" className="text-blue-400/50">
        {line.content.substring(lastIndex)}
      </span>
    );
  }

  return (
    <div className="font-mono text-sm py-1">
      {parts}
    </div>
  );
};

/**
 * Renderiza uma linha de letra
 */
const LyricLine: React.FC<{
  line: ParsedLine;
  onChordClick?: (chord: string) => void;
}> = ({ line, onChordClick }) => {
  if (!line.chords || line.chords.length === 0) {
    return (
      <div className="text-white/80 py-1">
        {line.content}
      </div>
    );
  }

  // Letra com cifras inline
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  line.chords.forEach((chord, idx) => {
    // Texto antes do acorde
    if (chord.position > lastIndex) {
      parts.push(
        <span key={`text-${idx}`}>
          {line.content.substring(lastIndex, chord.position)}
        </span>
      );
    }

    // Acorde inline
    parts.push(
      <button
        key={`chord-${idx}`}
        onClick={() => onChordClick?.(chord.normalized)}
        className="text-blue-400 font-bold text-sm hover:text-blue-300 hover:underline transition-colors mx-0.5"
      >
        {chord.original}
      </button>
    );

    lastIndex = chord.position + chord.original.length;
  });

  // Texto final
  if (lastIndex < line.content.length) {
    parts.push(
      <span key="text-final">
        {line.content.substring(lastIndex)}
      </span>
    );
  }

  return (
    <div className="text-white/80 py-1">
      {parts}
    </div>
  );
};

/**
 * Componente principal
 */
export const ChordSheetViewer: React.FC<ChordSheetViewerProps> = ({
  text,
  onChordClick,
  className = '',
}) => {
  const { lines, uniqueChords, key, hasChords, stats } = useChordParser(text);

  if (!hasChords) {
    return (
      <div className={`text-center py-8 text-white/40 ${className}`}>
        <p>Nenhuma cifra detectada no texto.</p>
        <p className="text-sm mt-2">
          Digite acordes como: C, Dm, G7, Fmaj7, etc.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Informações da música */}
      <div className="mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4 text-sm text-white/60">
          {key && (
            <div>
              <span className="text-white/40">Tom:</span>{' '}
              <span className="text-blue-400 font-semibold">{key}</span>
            </div>
          )}
          <div>
            <span className="text-white/40">Acordes únicos:</span>{' '}
            <span className="text-white/80">{stats.uniqueChords}</span>
          </div>
          <div>
            <span className="text-white/40">Total de acordes:</span>{' '}
            <span className="text-white/80">{stats.totalChords}</span>
          </div>
        </div>

        {/* Lista de acordes únicos */}
        <div className="mt-3 flex flex-wrap gap-2">
          {uniqueChords.map((chord) => (
            <button
              key={chord}
              onClick={() => onChordClick?.(chord)}
              className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs font-mono transition-colors"
            >
              {chord}
            </button>
          ))}
        </div>
      </div>

      {/* Cifra */}
      <div className="space-y-1">
        {lines.map((line, idx) => {
          if (line.type === 'empty') {
            return <div key={idx} className="h-4" />;
          }

          if (line.type === 'chord') {
            return (
              <ChordLine
                key={idx}
                line={line}
                onChordClick={onChordClick}
              />
            );
          }

          return (
            <LyricLine
              key={idx}
              line={line}
              onChordClick={onChordClick}
            />
          );
        })}
      </div>
    </div>
  );
};
