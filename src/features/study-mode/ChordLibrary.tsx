import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Music2, Loader2, Grid3x3, Square, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InstrumentSelector } from "@/components/InstrumentSelector";
import { GuitarDiagram } from "./components/GuitarDiagram";
import { KeyboardDiagram } from "./components/KeyboardDiagram";
import { getChordData, ChordData } from "./data/chordLibrary";
import { useChordData } from "./hooks/useChordData";
import { useNewChordData } from "./hooks/useNewChordData"; // Novo sistema

const MUSICAL_KEYS = [
  "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"
];

const CHORD_TYPES = [
  { suffix: "", label: "Maior", notes: ["1", "3", "5"] },
  { suffix: "m", label: "Menor", notes: ["1", "♭3", "5"] },
  { suffix: "7", label: "Sétima", notes: ["1", "3", "5", "♭7"] },
  { suffix: "maj7", label: "Maior com 7ª", notes: ["1", "3", "5", "7"] },
  { suffix: "m7", label: "Menor com 7ª", notes: ["1", "♭3", "5", "♭7"] },
  { suffix: "dim", label: "Diminuto", notes: ["1", "♭3", "♭5"] },
  { suffix: "aug", label: "Aumentado", notes: ["1", "3", "#5"] },
  { suffix: "sus2", label: "Suspenso 2", notes: ["1", "2", "5"] },
  { suffix: "sus4", label: "Suspenso 4", notes: ["1", "4", "5"] },
  { suffix: "6", label: "Sexta", notes: ["1", "3", "5", "6"] },
  { suffix: "m6", label: "Menor com 6ª", notes: ["1", "♭3", "5", "6"] },
  { suffix: "9", label: "Nona", notes: ["1", "3", "5", "♭7", "9"] },
  { suffix: "add9", label: "Maior com 9ª", notes: ["1", "3", "5", "9"] },
];

/**
 * Componente auxiliar para renderizar diagrama de violão
 */
const GuitarChordDiagram: React.FC<{ chordData: ChordData | null; chordName: string; loading: boolean }> = ({ chordData, chordName, loading }) => {
  // Se está carregando
  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="w-64 h-80 mx-auto bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
        <p className="text-xs text-white/40">Gerando diagrama...</p>
      </div>
    );
  }

  // Se tem dados reais, usa
  if (chordData) {
    const firstShape = Object.values(chordData.cagedShapes).find(shape => shape !== undefined);
    if (firstShape) {
      return (
        <div className="scale-75">
          <GuitarDiagram
            chord={firstShape}
            highlightRoot={true}
            showFingers={true}
            showTitle={false}
          />
        </div>
      );
    }
  }

  // Se não tem dados, mostra placeholder educativo
  return (
    <div className="text-center space-y-4">
      <div className="w-64 h-80 mx-auto bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
        <div className="text-white/40 text-sm">
          <p className="font-semibold mb-2">Diagrama: {chordName}</p>
          <p className="text-xs">Visualização em desenvolvimento</p>
        </div>
      </div>
      <p className="text-xs text-white/40 max-w-xs mx-auto">
        Este acorde será adicionado em breve à biblioteca visual
      </p>
    </div>
  );
};

/**
 * Componente auxiliar para renderizar diagrama de teclado
 */
const KeyboardChordDiagram: React.FC<{ chordData: ChordData | null; chordName: string; loading: boolean }> = ({ chordData, chordName, loading }) => {
  // Se está carregando
  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="w-96 h-64 mx-auto bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
        <p className="text-xs text-white/40">Gerando diagrama...</p>
      </div>
    );
  }

  // Se tem dados reais, usa
  if (chordData?.keyboardVoicings.root) {
    return (
      <div className="scale-75">
        <KeyboardDiagram
          chord={chordData.keyboardVoicings.root}
          showLabels={true}
          highlightRoot={true}
        />
      </div>
    );
  }

  // Se não tem dados, mostra placeholder educativo
  return (
    <div className="text-center space-y-4">
      <div className="w-96 h-64 mx-auto bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
        <div className="text-white/40 text-sm">
          <p className="font-semibold mb-2">Diagrama: {chordName}</p>
          <p className="text-xs">Visualização em desenvolvimento</p>
        </div>
      </div>
      <p className="text-xs text-white/40 max-w-xs mx-auto">
        Este acorde será adicionado em breve à biblioteca visual
      </p>
    </div>
  );
};

/**
 * Biblioteca de Acordes
 * Exploração completa de acordes organizados por tom e qualidade
 */
const ChordLibrary: React.FC = () => {
  const navigate = useNavigate();

  const [selectedInstrument, setSelectedInstrument] = useState<"guitar" | "keyboard">(() => {
    const saved = localStorage.getItem("study-instrument");
    return saved === "keyboard" ? "keyboard" : "guitar";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  // Estado para controlar visualização CAGED
  const [cagedMode, setCagedMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("caged-mode");
    return saved === "true";
  });

  // Estado para controlar o índice do carrossel CAGED
  const [currentCAGEDIndex, setCurrentCAGEDIndex] = useState(0);

  // Busca dados do acorde selecionado
  // Tenta primeiro do novo sistema (JSON local), depois fallback para Supabase
  const newChordResult = useNewChordData(selectedChord);
  const oldChordResult = useChordData(selectedChord);

  // Usa novo sistema se disponível, senão fallback para antigo
  const { chordData, loading, error } = newChordResult.chordData
    ? newChordResult
    : oldChordResult;

  const handleInstrumentChange = (instrument: "guitar" | "keyboard") => {
    setSelectedInstrument(instrument);
    localStorage.setItem("study-instrument", instrument);
  };

  const toggleCagedMode = () => {
    const newMode = !cagedMode;
    setCagedMode(newMode);
    localStorage.setItem("caged-mode", String(newMode));
  };

  // Funções de navegação do carrossel CAGED
  const goToPrevCAGED = () => {
    if (currentCAGEDIndex > 0) {
      setCurrentCAGEDIndex(currentCAGEDIndex - 1);
    }
  };

  const goToNextCAGED = () => {
    if (chordData) {
      const cagedEntries = Object.entries(chordData.cagedShapes);
      if (currentCAGEDIndex < cagedEntries.length - 1) {
        setCurrentCAGEDIndex(currentCAGEDIndex + 1);
      }
    }
  };

  // Reset do índice quando muda o acorde
  const handleChordSelect = (chordName: string) => {
    setSelectedChord(chordName);
    setCurrentCAGEDIndex(0);
  };

  // Gera TODOS os acordes possíveis (12 tons x 13 tipos = 156 acordes)
  const allChords = useMemo(() => {
    const chords: Array<{
      name: string;
      key: string;
      suffix: string;
      label: string;
      notes: string[];
    }> = [];

    MUSICAL_KEYS.forEach((key) => {
      CHORD_TYPES.forEach((type) => {
        chords.push({
          name: `${key}${type.suffix}`,
          key,
          suffix: type.suffix,
          label: `${key} ${type.label}`,
          notes: type.notes,
        });
      });
    });

    return chords;
  }, []);

  // Filtra acordes pela busca (mostra variações do tom selecionado)
  const filteredChords = useMemo(() => {
    if (!searchQuery.trim()) return [];

    // Mostra TODAS as variações do tom (biblioteca completa)
    return allChords.filter((c) => c.key === searchQuery);
  }, [allChords, searchQuery]);

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
              <h1 className="text-3xl font-bold text-white">Biblioteca de Acordes</h1>
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
            Explore {allChords.length} acordes organizados por tom e qualidade
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Busca de Tom */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">Tom</h3>

              {/* Toggle CAGED Mode (apenas para violão) */}
              {selectedInstrument === "guitar" && (
                <button
                  onClick={toggleCagedMode}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    cagedMode
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {cagedMode ? (
                    <>
                      <Grid3x3 className="w-3.5 h-3.5" />
                      <span>Modo CAGED</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Modo Simples</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {MUSICAL_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setSearchQuery(key)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    searchQuery === key
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-white/60 hover:bg-blue-500/20 hover:text-white"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Variações do Tom Selecionado */}
            {searchQuery && filteredChords.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white/80">
                    {filteredChords.length} variações
                  </h4>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedChord(null);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filteredChords.map((chord) => (
                    <button
                      key={chord.name}
                      onClick={() => handleChordSelect(chord.name)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedChord === chord.name
                          ? "bg-blue-500/30 text-white border border-blue-500/50"
                          : "bg-white/5 text-white/60 hover:bg-blue-500/10 hover:text-white border border-white/5"
                      }`}
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-semibold text-sm">{chord.name}</span>
                        <span className="text-xs opacity-60">{chord.label.split(' ').slice(1).join(' ')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Display do Acorde Selecionado */}
          {!selectedChord ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Music2 className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/40">
                Selecione um tom acima
              </p>
            </div>
          ) : (() => {
            const chordInfo = allChords.find(c => c.name === selectedChord);

            if (!chordInfo) return null;

            return (
              <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-8">
                {/* Header do Acorde */}
                <h2 className="text-5xl font-black text-white text-center mb-2">
                  {chordInfo.name}
                </h2>
                <p className="text-lg text-white/60 text-center mb-8">
                  {chordInfo.notes.join(" - ")}
                </p>

                {/* Diagramas - Modo CAGED ou Simples */}
                {selectedInstrument === "guitar" && (
                  <div className="space-y-6">
                    {loading ? (
                      <div className="flex items-center justify-center min-h-[350px]">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      </div>
                    ) : chordData ? (
                      <>
                        {/* Modo CAGED - Carrossel horizontal */}
                        {cagedMode ? (
                          <>
                            <div className="relative">
                              {/* Setas de navegação */}
                              {(() => {
                                const cagedEntries = Object.entries(chordData.cagedShapes);
                                const [currentShape, currentData] = cagedEntries[currentCAGEDIndex];

                                return (
                                  <>
                                    {/* Seta esquerda */}
                                    {cagedEntries.length > 1 && (
                                      <button
                                        onClick={goToPrevCAGED}
                                        disabled={currentCAGEDIndex === 0}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        aria-label="Diagrama anterior"
                                      >
                                        <ChevronLeft className="w-5 h-5 text-white" />
                                      </button>
                                    )}

                                    {/* Diagrama atual */}
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

                                    {/* Seta direita */}
                                    {cagedEntries.length > 1 && (
                                      <button
                                        onClick={goToNextCAGED}
                                        disabled={currentCAGEDIndex === cagedEntries.length - 1}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        aria-label="Próximo diagrama"
                                      >
                                        <ChevronRight className="w-5 h-5 text-white" />
                                      </button>
                                    )}
                                  </>
                                );
                              })()}

                              {/* Indicadores de posição */}
                              {(() => {
                                const cagedEntries = Object.entries(chordData.cagedShapes);
                                return cagedEntries.length > 1 && (
                                  <div className="flex justify-center gap-2 mt-6">
                                    {cagedEntries.map(([shape], idx) => (
                                      <button
                                        key={shape}
                                        onClick={() => setCurrentCAGEDIndex(idx)}
                                        className={`h-2 rounded-full transition-all ${
                                          idx === currentCAGEDIndex
                                            ? 'w-8 bg-blue-400'
                                            : 'w-2 bg-white/20 hover:bg-white/40'
                                        }`}
                                        aria-label={`Ir para diagrama ${idx + 1}`}
                                      />
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </>
                        ) : (
                          /* Modo Simples - Apenas primeira variação */
                          <>
                            <div className="flex justify-center">
                              <div className="bg-zinc-800/50 rounded-lg p-4 border border-white/5">
                                <GuitarDiagram
                                  chord={Object.values(chordData.cagedShapes)[0]}
                                  highlightRoot={true}
                                  showFingers={true}
                                  showTitle={false}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-16">
                        <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">Nenhuma variação disponível</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedInstrument === "keyboard" && (
                  <div className="flex items-center justify-center min-h-[350px]">
                    <KeyboardChordDiagram chordData={chordData} chordName={chordInfo.name} loading={loading} />
                  </div>
                )}

                {/* Mensagem de erro */}
                {error && (
                  <p className="text-center text-red-400 text-sm mt-4">{error}</p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ChordLibrary;
