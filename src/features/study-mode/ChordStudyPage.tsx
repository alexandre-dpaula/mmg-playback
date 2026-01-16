import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Guitar, Piano, Lightbulb } from "lucide-react";
import { getChordData, getCagedShapes, getReharmonizations } from "./data/chordLibrary";
import { CagedShapes } from "./components/CagedShapes";
import { KeyboardVoicings } from "./components/KeyboardVoicings";
import { ReharmonizationPanel } from "./components/ReharmonizationPanel";
import { InstrumentSelector } from "@/components/InstrumentSelector";

/**
 * Página de estudo individual de um acorde
 * Mostra Sistema CAGED, inversões de teclado e reharmonizações
 */
const ChordStudyPage: React.FC = () => {
  const { chordName } = useParams<{ chordName: string }>();
  const navigate = useNavigate();

  const [selectedInstrument, setSelectedInstrument] = useState<"guitar" | "keyboard">("guitar");

  // Busca dados do acorde
  const chordData = chordName ? getChordData(chordName) : null;
  const cagedShapes = chordName ? getCagedShapes(chordName) : [];
  const reharmonizations = chordName ? getReharmonizations(chordName) : null;

  if (!chordData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
        <button
          onClick={() => navigate("/studies")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Estudos</span>
        </button>
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Guitar className="w-8 h-8 text-white/40" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Acorde não encontrado
          </h2>
          <p className="text-white/60 max-w-md">
            O acorde "{chordName}" ainda não está disponível na biblioteca.
          </p>
          <button
            onClick={() => navigate("/studies")}
            className="mt-6 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all"
          >
            Voltar para Estudos
          </button>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{chordData.fullName}</h1>
              <p className="text-white/60 mt-1">
                Notas: {chordData.notes.join(", ")} • Qualidade: {chordData.quality}
              </p>
            </div>

            {/* Seletor de Instrumento */}
            <InstrumentSelector
              value={selectedInstrument}
              onChange={setSelectedInstrument}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal: Diagramas */}
          <div className="lg:col-span-2 space-y-6">
            {selectedInstrument === "guitar" ? (
              <>
                {/* Sistema CAGED */}
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">Sistema CAGED</h2>
                    <p className="text-sm text-white/60">5 formas ao longo do braço</p>
                  </div>

                  <CagedShapes shapes={cagedShapes} chordName={chordData.name} />
                </div>
              </>
            ) : (
              <>
                {/* Inversões de Teclado */}
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">Inversões e Voicings</h2>
                    <p className="text-sm text-white/60">Explore diferentes posições no teclado</p>
                  </div>

                  <KeyboardVoicings
                    voicings={chordData.keyboardVoicings}
                    chordName={chordData.name}
                  />
                </div>
              </>
            )}

            {/* Teoria Musical */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                Teoria Musical
              </h3>
              <div className="space-y-3 text-sm text-white/70">
                <div>
                  <strong className="text-white/90">Notas do acorde:</strong> {chordData.notes.join(", ")}
                </div>
                <div>
                  <strong className="text-white/90">Raiz:</strong> {chordData.root}
                </div>
                <div>
                  <strong className="text-white/90">Qualidade:</strong> {chordData.quality}
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/50 leading-relaxed">
                    {selectedInstrument === "guitar" ? (
                      <>
                        O Sistema CAGED organiza o braço do violão em 5 formas que se repetem.
                        Cada forma permite tocar o mesmo acorde em regiões diferentes do instrumento.
                      </>
                    ) : (
                      <>
                        As inversões reorganizam as notas do acorde, mudando qual está no baixo.
                        Voicings abertos espaçam as notas além de uma oitava para maior riqueza harmônica.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Lateral: Reharmonização */}
          <div className="lg:col-span-1">
            {reharmonizations && (
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-24">
                <ReharmonizationPanel
                  currentChord={chordData.name}
                  reharmonizations={reharmonizations}
                  onChordSelect={(chord) => {
                    navigate(`/chord-study/${chord}`);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordStudyPage;
