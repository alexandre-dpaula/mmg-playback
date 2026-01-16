import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Guitar, Piano, Music2, Loader2 } from "lucide-react";
import { InstrumentSelector } from "@/components/InstrumentSelector";
import { reharmonizationExamples, getChordReference } from "@/features/study-mode/data/reharmonizationData";
import { MusicalKey } from "@/features/study-mode/types/reharmonization";
import { GuitarDiagram } from "@/features/study-mode/components/GuitarDiagram";
import { KeyboardDiagram } from "@/features/study-mode/components/KeyboardDiagram";
import { useNewChordData } from "@/features/study-mode/hooks/useNewChordData";
import { useChordData } from "@/features/study-mode/hooks/useChordData";

/**
 * Página de Rearmonização
 * Explore progressões rearmonizadas com dominantes secundários
 */
const ReharmonizationPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedInstrument, setSelectedInstrument] = useState<"guitar" | "keyboard">(() => {
    const saved = localStorage.getItem("study-instrument");
    return saved === "keyboard" ? "keyboard" : "guitar";
  });

  const [selectedKey, setSelectedKey] = useState<MusicalKey | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);
  const [currentCAGEDIndex, setCurrentCAGEDIndex] = useState(0);
  const [currentInversionIndex, setCurrentInversionIndex] = useState(0);

  const handleInstrumentChange = (instrument: "guitar" | "keyboard") => {
    setSelectedInstrument(instrument);
    localStorage.setItem("study-instrument", instrument);
  };

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

  // Reset ao mudar de tom
  const handleKeySelect = (key: MusicalKey) => {
    setSelectedKey(key);
    setSelectedChordIndex(0);
    setShowOriginal(true);
  };

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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/60 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/studies")}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Estudos</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Rearmonização</h1>
            </div>

            <div className="flex items-start gap-3">
              {/* Seletor de Instrumento */}
              <InstrumentSelector
                value={selectedInstrument}
                onChange={handleInstrumentChange}
              />
            </div>
          </div>

          <p className="text-white/60 mt-4">
            Progressão I - vi - IV - V com dominantes secundários
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Seleção de Tom */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/80 mb-3">Tom</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {(["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"] as MusicalKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeySelect(key)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    selectedKey === key
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-white/60 hover:bg-blue-500/20 hover:text-white"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo quando um tom está selecionado */}
          {!selectedKey ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Music2 className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/40">Selecione um tom acima</p>
            </div>
          ) : (
            <>
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
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : chordData ? (
                  <>
                    {/* Violão - Carrossel CAGED */}
                    {selectedInstrument === "guitar" && (
                      <div className="relative">
                        {(() => {
                          const cagedEntries = Object.entries(chordData.cagedShapes);
                          if (cagedEntries.length === 0) return null;
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
                                    <ArrowLeft className="w-5 h-5 text-white" />
                                  </button>
                                  <button
                                    onClick={goToNextCAGED}
                                    disabled={currentCAGEDIndex === cagedEntries.length - 1}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  >
                                    <ArrowRight className="w-5 h-5 text-white" />
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
                          if (inversionEntries.length === 0) return null;
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
                                    <ArrowLeft className="w-5 h-5 text-white" />
                                  </button>
                                  <button
                                    onClick={goToNextInversion}
                                    disabled={currentInversionIndex === inversionEntries.length - 1}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  >
                                    <ArrowRight className="w-5 h-5 text-white" />
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
                    <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Diagrama não disponível</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReharmonizationPage;
