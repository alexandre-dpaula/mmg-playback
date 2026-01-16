/**
 * COMPONENTE: IntegratedChordStudy
 * Modo de estudo integrado: Cifra + Transposição + Diagramas
 */

import React, { useState } from 'react';
import { ChordSheetViewer } from './ChordSheetViewer';
import { TranspositionControls } from './TranspositionControls';
import { GuitarDiagram } from './GuitarDiagram';
import { useTransposition } from '../hooks/useTransposition';
import { useChordParser } from '../hooks/useChordParser';
import chordDatabase from '../services/chordDatabase';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface IntegratedChordStudyProps {
  text: string;
  onTextChange?: (text: string) => void;
  className?: string;
}

/**
 * Componente principal integrado
 */
export const IntegratedChordStudy: React.FC<IntegratedChordStudyProps> = ({
  text,
  onTextChange,
  className = '',
}) => {
  // Hook de transposição
  const transposition = useTransposition(text, {
    autoDetectKey: true,
  });

  // Parser para o texto transposto
  const { uniqueChords, hasChords } = useChordParser(transposition.transposedText);

  // Acorde selecionado para visualização
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  // Índice do diagrama CAGED atual no carrossel
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);

  // Busca dados do acorde selecionado
  const selectedChordData = selectedChord
    ? chordDatabase.get(selectedChord)
    : null;

  const selectedGuitarShape = selectedChordData?.guitarShapes?.[currentShapeIndex];

  // Funções para navegar no carrossel
  const goToPrevShape = () => {
    if (selectedChordData && currentShapeIndex > 0) {
      setCurrentShapeIndex(currentShapeIndex - 1);
    }
  };

  const goToNextShape = () => {
    if (selectedChordData && currentShapeIndex < selectedChordData.guitarShapes.length - 1) {
      setCurrentShapeIndex(currentShapeIndex + 1);
    }
  };

  // Reset do índice quando muda o acorde
  const handleChordClick = (chord: string) => {
    setSelectedChord(chord);
    setCurrentShapeIndex(0);
  };

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        {/* Controles de Transposição */}
        {hasChords && (
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wide">
              Transposição
            </h3>
            <TranspositionControls transposition={transposition} />
          </div>
        )}

        {/* Visualizador de Cifras com Scroll */}
        <div className="bg-zinc-900/50 rounded-lg border border-white/10 overflow-hidden flex flex-col max-h-[70vh]">
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              Cifra
            </h3>
          </div>
          <div className="overflow-y-auto p-6 flex-1">
            <ChordSheetViewer
              text={transposition.transposedText}
              onChordClick={handleChordClick}
            />
          </div>
        </div>
      </div>

      {/* Popup do Diagrama */}
      {selectedChord && selectedGuitarShape && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setSelectedChord(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-zinc-900 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-bold text-blue-400">
                    {selectedChordData?.fullName || selectedChord}
                  </h3>
                  <p className="text-sm text-white/40 mt-1">
                    {selectedGuitarShape.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedChord(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-6">
                {/* Carrossel de Diagramas CAGED */}
                <div className="relative">
                  {/* Setas de navegação */}
                  {selectedChordData && selectedChordData.guitarShapes.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevShape}
                        disabled={currentShapeIndex === 0}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Diagrama anterior"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={goToNextShape}
                        disabled={currentShapeIndex === selectedChordData.guitarShapes.length - 1}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Próximo diagrama"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}

                  {/* Diagrama */}
                  <div className="flex justify-center">
                    <GuitarDiagram
                      chord={selectedGuitarShape}
                      highlightRoot={true}
                      showFingers={true}
                      showTitle={false}
                    />
                  </div>

                  {/* Indicadores de posição */}
                  {selectedChordData && selectedChordData.guitarShapes.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {selectedChordData.guitarShapes.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentShapeIndex(idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentShapeIndex
                              ? 'w-8 bg-blue-400'
                              : 'w-2 bg-white/20 hover:bg-white/40'
                          }`}
                          aria-label={`Ir para diagrama ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Informações do acorde */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-white/60">Notas:</span>
                    <span className="text-white font-mono font-semibold">
                      {selectedChordData?.notes.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-white/60">Intervalos:</span>
                    <span className="text-white font-mono">
                      {selectedChordData?.intervals.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-white/60">Dificuldade:</span>
                    <span className={`font-semibold ${
                      selectedGuitarShape.difficulty === 'easy' ? 'text-green-400' :
                      selectedGuitarShape.difficulty === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {selectedGuitarShape.difficulty === 'easy' ? 'Fácil' :
                       selectedGuitarShape.difficulty === 'medium' ? 'Médio' :
                       'Difícil'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
