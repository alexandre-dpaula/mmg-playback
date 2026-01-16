/**
 * COMPONENTE: TranspositionControls
 * Controles para transposição de cifras
 */

import React from 'react';
import { ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { UseTranspositionResult } from '../hooks/useTransposition';

interface TranspositionControlsProps {
  transposition: UseTranspositionResult;
  className?: string;
}

export const TranspositionControls: React.FC<TranspositionControlsProps> = ({
  transposition,
  className = '',
}) => {
  const {
    semitones,
    originalKey,
    currentKey,
    transposeUp,
    transposeDown,
    reset,
    setKey,
    availableKeys,
    canTransposeUp,
    canTransposeDown,
    result,
  } = transposition;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tonalidade e Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Tom Original */}
          {originalKey && (
            <div className="text-sm">
              <span className="text-white/40">Tom original:</span>{' '}
              <span className="text-blue-400 font-semibold">{originalKey}</span>
            </div>
          )}

          {/* Tom Atual */}
          {currentKey && semitones !== 0 && (
            <div className="text-sm">
              <span className="text-white/40">Tom atual:</span>{' '}
              <span className="text-green-400 font-semibold">{currentKey}</span>
            </div>
          )}
        </div>

        {/* Label da transposição */}
        {semitones !== 0 && (
          <div className="text-xs text-white/60">
            {result.label}
          </div>
        )}
      </div>

      {/* Controles de transposição */}
      <div className="flex items-center gap-3">
        {/* Botão para baixo */}
        <button
          onClick={transposeDown}
          disabled={!canTransposeDown}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-white/10 transition-colors"
          title="Transpor meio tom abaixo"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Display de semitons */}
        <div className="flex-1 bg-zinc-800/50 rounded-lg border border-white/10 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Transposição:</span>
            <span className={`font-mono font-bold ${
              semitones === 0 ? 'text-white/40' :
              semitones > 0 ? 'text-green-400' :
              'text-orange-400'
            }`}>
              {semitones === 0 ? 'Original' : `${semitones > 0 ? '+' : ''}${semitones}`}
            </span>
          </div>
        </div>

        {/* Botão para cima */}
        <button
          onClick={transposeUp}
          disabled={!canTransposeUp}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-white/10 transition-colors"
          title="Transpor meio tom acima"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        {/* Botão de reset */}
        {semitones !== 0 && (
          <button
            onClick={reset}
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition-colors"
            title="Voltar ao tom original"
          >
            <RotateCcw className="w-5 h-5 text-blue-400" />
          </button>
        )}
      </div>

      {/* Seletor de tonalidade rápido */}
      {originalKey && (
        <div className="space-y-2">
          <div className="text-xs text-white/40 font-semibold uppercase tracking-wide">
            Transpor para:
          </div>
          <div className="flex flex-wrap gap-2">
            {availableKeys.map((key) => {
              const isOriginal = key === originalKey.replace('m', '');
              const isCurrent = key === currentKey?.replace('m', '');

              return (
                <button
                  key={key}
                  onClick={() => setKey(key)}
                  className={`px-3 py-1 rounded-lg text-sm font-mono transition-colors ${
                    isCurrent
                      ? 'bg-green-500/20 border-green-500/40 text-green-400 border'
                      : isOriginal
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 border'
                      : 'bg-zinc-800 border-white/10 text-white/60 hover:bg-zinc-700 border'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
