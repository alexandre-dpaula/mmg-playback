import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Guitar, Piano, ArrowRight } from "lucide-react";
import { reharmonizationExamples, getChordReference } from "../data/reharmonizationData";
import { MusicalKey } from "../types/reharmonization";
import { GuitarDiagram } from "./GuitarDiagram";
import { KeyboardDiagram } from "./KeyboardDiagram";
import { useNewChordData } from "../hooks/useNewChordData";
import { useChordData } from "../hooks/useChordData";

interface ReharmonizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: MusicalKey;
}

export const ReharmonizationModal: React.FC<ReharmonizationModalProps> = ({
  isOpen,
  onClose,
  initialKey = "C",
}) => {
  const [selectedKey, setSelectedKey] = useState<MusicalKey>(initialKey);
  const [showOriginal, setShowOriginal] = useState(true);
  const [selectedInstrument, setSelectedInstrument] = useState<"guitar" | "keyboard">(() => {
    const saved = localStorage.getItem("study-instrument");
    return saved === "keyboard" ? "keyboard" : "guitar";
  });
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);
  const [currentCAGEDIndex, setCurrentCAGEDIndex] = useState(0);
  const [currentInversionIndex, setCurrentInversionIndex] = useState(0);

  // Dados da rearmonização atual
  const currentExample = reharmonizationExamples.find((ex) => ex.key === selectedKey);
  const currentProgression = showOriginal
    ? currentExample?.original || []
    : currentExample?.reharmonized || [];
  const selectedChordName = currentProgression[selectedChordIndex];

  // Busca dados do acorde selecionado
  const newChordResult = useNewChordData(selectedChordName);
  const oldChordResult = useChordData(selectedChordName);
  const { chordData, loading } = newChordResult.chordData ? newChordResult : oldChordResult;

  // Reset índices quando muda o acorde
  useEffect(() => {
    setCurrentCAGEDIndex(0);
    setCurrentInversionIndex(0);
  }, [selectedChordName]);

  // Navegação CAGED
  const goToPrevCAGED = () => {
    if (currentCAGEDIndex > 0) setCurrentCAGEDIndex(currentCAGEDIndex - 1);
  };

  const goToNextCAGED = () => {
    if (chordData) {
      const shapes = Object.entries(chordData.cagedShapes);
      if (currentCAGEDIndex < shapes.length - 1) {
        setCurrentCAGEDIndex(currentCAGEDIndex + 1);
      }
    }
  };

  // Navegação Inversões
  const goToPrevInversion = () => {
    if (currentInversionIndex > 0) setCurrentInversionIndex(currentInversionIndex - 1);
  };

  const goToNextInversion = () => {
    if (chordData) {
      const inversions = Object.entries(chordData.keyboardVoicings);
      if (currentInversionIndex < inversions.length - 1) {
        setCurrentInversionIndex(currentInversionIndex + 1);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0A0A0A] border-b border-white/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Rearmonização</h2>
              <p className="text-sm text-white/60 mt-1">
                Progressão I - vi - IV - V com dominantes secundários
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Seletor de Tom */}
          <div className="flex gap-2 mt-4">
            {(["C", "D", "E"] as MusicalKey[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedKey(key);
                  setSelectedChordIndex(0);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedKey === key
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 text-white/60 hover:bg-blue-500/20"
                }`}
              >
                Tom de {key}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Toggle Original / Rearmonizado */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowOriginal(true)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                showOriginal
                  ? "bg-white/10 text-white border-2 border-white/20"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              Original
            </button>
            <ArrowRight className="w-5 h-5 text-blue-400" />
            <button
              onClick={() => setShowOriginal(false)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                !showOriginal
                  ? "bg-blue-500 text-white border-2 border-blue-400"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              Rearmonizado
            </button>
          </div>

          {/* Progressão Atual */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/80 mb-3">
              {showOriginal ? "Progressão Original" : "Progressão Rearmonizada"}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {currentProgression.map((chord, idx) => {
                const isChanged = !showOriginal && currentExample?.changedChords.includes(idx);
                const isSelected = idx === selectedChordIndex;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedChordIndex(idx)}
                    className={`p-4 rounded-lg font-bold text-xl transition-all ${
                      isSelected
                        ? "bg-blue-500 text-white border-2 border-blue-400 scale-105"
                        : isChanged
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {chord}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explicação */}
          {!showOriginal && currentExample && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-blue-300">{currentExample.explanation}</p>
            </div>
          )}

          {/* Tabs: Violão | Teclado */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedInstrument("guitar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedInstrument === "guitar"
                  ? "bg-white/10 text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <Guitar className="w-4 h-4" />
              Violão
            </button>
            <button
              onClick={() => setSelectedInstrument("keyboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedInstrument === "keyboard"
                  ? "bg-white/10 text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <Piano className="w-4 h-4" />
              Teclado
            </button>
          </div>

          {/* Diagrama do Acorde Selecionado */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-3xl font-bold text-white">{selectedChordName}</h3>
              <p className="text-sm text-white/60 mt-1">
                {getChordReference(selectedChordName).notes.join(" - ")} •{" "}
                {getChordReference(selectedChordName).quality}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[350px]">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : chordData ? (
              <>
                {/* Violão - Carrossel CAGED */}
                {selectedInstrument === "guitar" && (
                  <div className="relative">
                    {(() => {
                      const cagedEntries = Object.entries(chordData.cagedShapes);
                      const [currentShape, currentData] = cagedEntries[currentCAGEDIndex];

                      return (
                        <>
                          {/* Setas */}
                          {cagedEntries.length > 1 && (
                            <>
                              <button
                                onClick={goToPrevCAGED}
                                disabled={currentCAGEDIndex === 0}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <ChevronLeft className="w-5 h-5 text-white" />
                              </button>
                              <button
                                onClick={goToNextCAGED}
                                disabled={currentCAGEDIndex === cagedEntries.length - 1}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <ChevronRight className="w-5 h-5 text-white" />
                              </button>
                            </>
                          )}

                          {/* Diagrama */}
                          <div className="flex justify-center">
                            <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5">
                              <div className="text-center mb-3">
                                <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-3 py-1 rounded">
                                  Forma {currentShape}
                                </span>
                                <p className="text-xs text-white/40 mt-1">
                                  Casa base: {currentData.baseFret}
                                </p>
                              </div>
                              <GuitarDiagram
                                chord={currentData}
                                highlightRoot={true}
                                showFingers={true}
                                showTitle={false}
                              />
                            </div>
                          </div>

                          {/* Indicadores */}
                          {cagedEntries.length > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                              {cagedEntries.map(([shape], idx) => (
                                <button
                                  key={shape}
                                  onClick={() => setCurrentCAGEDIndex(idx)}
                                  className={`h-2 rounded-full transition-all ${
                                    idx === currentCAGEDIndex
                                      ? "w-8 bg-blue-400"
                                      : "w-2 bg-white/20 hover:bg-white/40"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Teclado - Carrossel Inversões */}
                {selectedInstrument === "keyboard" && (
                  <div className="relative">
                    {(() => {
                      const inversionEntries = Object.entries(chordData.keyboardVoicings);
                      const [currentName, currentData] = inversionEntries[currentInversionIndex];

                      return (
                        <>
                          {/* Setas */}
                          {inversionEntries.length > 1 && (
                            <>
                              <button
                                onClick={goToPrevInversion}
                                disabled={currentInversionIndex === 0}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <ChevronLeft className="w-5 h-5 text-white" />
                              </button>
                              <button
                                onClick={goToNextInversion}
                                disabled={currentInversionIndex === inversionEntries.length - 1}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <ChevronRight className="w-5 h-5 text-white" />
                              </button>
                            </>
                          )}

                          {/* Diagrama */}
                          <div className="flex justify-center">
                            <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5">
                              <div className="text-center mb-3">
                                <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-3 py-1 rounded capitalize">
                                  {currentName === "root"
                                    ? "Posição Fundamental"
                                    : currentName === "first"
                                    ? "Primeira Inversão"
                                    : "Segunda Inversão"}
                                </span>
                              </div>
                              <KeyboardDiagram
                                chord={currentData}
                                showLabels={true}
                                highlightRoot={true}
                              />
                            </div>
                          </div>

                          {/* Indicadores */}
                          {inversionEntries.length > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                              {inversionEntries.map(([name], idx) => (
                                <button
                                  key={name}
                                  onClick={() => setCurrentInversionIndex(idx)}
                                  className={`h-2 rounded-full transition-all ${
                                    idx === currentInversionIndex
                                      ? "w-8 bg-blue-400"
                                      : "w-2 bg-white/20 hover:bg-white/40"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-white/60">Diagrama não disponível</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
