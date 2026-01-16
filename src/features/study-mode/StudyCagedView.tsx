import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Music2, Loader2, Lightbulb } from "lucide-react";
import { InstrumentSelector } from "@/components/InstrumentSelector";
import { GuitarDiagram } from "./components/GuitarDiagram";
import { useNewChordData } from "./hooks/useNewChordData";
import { useChordData } from "./hooks/useChordData";

const MUSICAL_KEYS = [
  "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"
];

const CHORD_QUALITIES = [
  { id: "major", label: "Maior", suffix: "" },
  { id: "minor", label: "Menor", suffix: "m" },
  { id: "7", label: "7ª Dominante", suffix: "7" },
  { id: "maj7", label: "7ª Maior", suffix: "maj7" },
  { id: "m7", label: "Menor 7ª", suffix: "m7" },
];

/**
 * Página CAGED Visual Renovada
 * Explore o sistema CAGED com interface moderna e carrossel integrado
 */
const StudyCagedView: React.FC = () => {
  const navigate = useNavigate();

  const [selectedInstrument, setSelectedInstrument] = useState<"guitar" | "keyboard">(() => {
    const saved = localStorage.getItem("study-instrument");
    return saved === "keyboard" ? "keyboard" : "guitar";
  });

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState(CHORD_QUALITIES[0]);
  const [currentCAGEDIndex, setCurrentCAGEDIndex] = useState(0);

  const handleInstrumentChange = (instrument: "guitar" | "keyboard") => {
    setSelectedInstrument(instrument);
    localStorage.setItem("study-instrument", instrument);
  };

  // Constrói o nome do acorde (ex: "C", "Am", "G7")
  const chordName = selectedKey ? `${selectedKey}${selectedQuality.suffix}` : null;

  // Busca dados do acorde selecionado
  const newChordResult = useNewChordData(chordName);
  const oldChordResult = useChordData(chordName);
  const { chordData, loading } = newChordResult.chordData ? newChordResult : oldChordResult;

  // Reset índice quando muda o acorde
  useEffect(() => {
    setCurrentCAGEDIndex(0);
  }, [chordName]);

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

  // Seleção de tom
  const handleKeySelect = (key: string) => {
    setSelectedKey(key);
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
              <h1 className="text-3xl font-bold text-white">CAGED Visual</h1>
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
            Explore as 5 formas do sistema CAGED ao longo do braço
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
              {MUSICAL_KEYS.map((key) => (
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

          {/* Seleção de Qualidade */}
          {selectedKey && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white/80 mb-3">Qualidade do Acorde</h3>
              <div className="flex flex-wrap gap-2">
                {CHORD_QUALITIES.map((quality) => (
                  <button
                    key={quality.id}
                    onClick={() => setSelectedQuality(quality)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      selectedQuality.id === quality.id
                        ? "bg-blue-500 text-white"
                        : "bg-white/5 text-white/60 hover:bg-blue-500/20 hover:text-white"
                    }`}
                  >
                    {quality.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conteúdo quando um tom está selecionado */}
          {!selectedKey ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Music2 className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/40">Selecione um tom acima</p>
            </div>
          ) : (
            <>
              {/* Diagrama do Acorde - Sistema CAGED */}
              <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-3xl font-bold text-white">{chordName}</h3>
                  <p className="text-sm text-white/60 mt-1">{selectedQuality.label}</p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center min-h-[350px]">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : chordData && selectedInstrument === "guitar" ? (
                  <div className="relative">
                    {(() => {
                      const cagedEntries = Object.entries(chordData.cagedShapes);
                      if (cagedEntries.length === 0) {
                        return (
                          <div className="text-center py-16">
                            <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">Nenhuma forma CAGED disponível</p>
                          </div>
                        );
                      }

                      const [currentShape, currentData] = cagedEntries[currentCAGEDIndex];

                      return (
                        <>
                          {/* Setas de navegação */}
                          {cagedEntries.length > 1 && (
                            <>
                              <button
                                onClick={goToPrevCAGED}
                                disabled={currentCAGEDIndex === 0}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Forma anterior"
                              >
                                <ChevronLeft className="w-5 h-5 text-white" />
                              </button>
                              <button
                                onClick={goToNextCAGED}
                                disabled={currentCAGEDIndex === cagedEntries.length - 1}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Próxima forma"
                              >
                                <ChevronRight className="w-5 h-5 text-white" />
                              </button>
                            </>
                          )}

                          {/* Diagrama CAGED */}
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

                          {/* Indicadores de posição */}
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
                                  aria-label={`Ir para forma ${shape}`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Lista de todas as formas CAGED */}
                          <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-sm font-medium text-white/80 mb-3">
                              Todas as formas CAGED disponíveis:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {cagedEntries.map(([shape], idx) => (
                                <button
                                  key={shape}
                                  onClick={() => setCurrentCAGEDIndex(idx)}
                                  className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
                                    idx === currentCAGEDIndex
                                      ? "bg-blue-500 text-white"
                                      : "bg-white/5 text-white/60 hover:bg-blue-500/20 hover:text-white"
                                  }`}
                                >
                                  {shape}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : selectedInstrument === "keyboard" ? (
                  <div className="text-center py-16">
                    <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">
                      O sistema CAGED é específico para violão
                    </p>
                    <p className="text-sm text-white/40 mt-2">
                      Selecione "Violão" no seletor acima
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Diagrama não disponível</p>
                  </div>
                )}
              </div>

              {/* Info Educacional */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-white">
                    <p>
                      <strong className="text-white">Sistema CAGED:</strong> Organiza o braço
                      do violão em 5 formas (C-A-G-E-D) que se repetem. Cada forma permite tocar o mesmo
                      acorde em diferentes posições do braço.
                    </p>
                    <p className="text-white/80">
                      <strong>Próximo passo:</strong> Experimente tocar cada forma e observe
                      como elas se conectam. Isso expande seu vocabulário harmônico!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyCagedView;
