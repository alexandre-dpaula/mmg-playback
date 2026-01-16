import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, TrendingUp, ArrowRightLeft, Music2, Sparkles } from "lucide-react";
import { getReharmonizations } from "./data/chordLibrary";

const MUSICAL_KEYS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

const CHORD_QUALITIES = [
  { id: "major", label: "Maior", suffix: "" },
  { id: "minor", label: "Menor", suffix: "m" },
  { id: "7", label: "7ª Dominante", suffix: "7" },
  { id: "maj7", label: "7ª Maior", suffix: "maj7" },
  { id: "m7", label: "Menor 7ª", suffix: "m7" },
];

/**
 * Laboratório de Reharmonização
 * Ferramenta interativa para explorar substituições harmônicas
 */
const ReharmonizationLab: React.FC = () => {
  const navigate = useNavigate();

  const [selectedKey, setSelectedKey] = useState("C");
  const [selectedQuality, setSelectedQuality] = useState(CHORD_QUALITIES[0]);

  // Constrói o nome do acorde
  const currentChord = `${selectedKey}${selectedQuality.suffix}`;

  // Busca reharmonizações disponíveis
  const reharmonizations = useMemo(() => {
    return getReharmonizations(currentChord);
  }, [currentChord]);

  const hasReharmonizations = reharmonizations &&
    (reharmonizations.slashChords.length > 0 ||
      reharmonizations.substitutes.length > 0 ||
      reharmonizations.parallel.length > 0 ||
      reharmonizations.relatedDominants.length > 0);

  const sections = [
    {
      id: "slashChords",
      title: "Acordes com Baixo Alternativo",
      description: "Mesmo acorde, nota diferente no baixo",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      chords: reharmonizations?.slashChords || [],
      explanation: "Mantém a estrutura do acorde mas muda a nota mais grave. Cria um movimento de baixo interessante sem alterar a harmonia principal.",
    },
    {
      id: "substitutes",
      title: "Substituições Harmônicas",
      description: "Acordes com notas em comum que criam cor diferente",
      icon: ArrowRightLeft,
      color: "from-blue-600 to-blue-500",
      chords: reharmonizations?.substitutes || [],
      explanation: "Acordes que compartilham notas importantes e podem substituir o original. Mantêm a função harmônica mas adicionam textura e cor.",
    },
    {
      id: "parallel",
      title: "Empréstimo Modal (Paralelo)",
      description: "Versão maior/menor do mesmo acorde",
      icon: Music2,
      color: "from-purple-500 to-pink-500",
      chords: reharmonizations?.parallel || [],
      explanation: "Empresta acordes do tom paralelo (ex: de Dó maior para Dó menor). Técnica comum na música gospel para criar contraste emocional.",
    },
    {
      id: "relatedDominants",
      title: "Dominantes e Preparações",
      description: "Acordes que preparam ou resolvem o acorde atual",
      icon: Sparkles,
      color: "from-orange-500 to-red-500",
      chords: reharmonizations?.relatedDominants || [],
      explanation: "Acordes dominantes (V7) que preparam a chegada do acorde original. Criam tensão e expectativa antes da resolução.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/60 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/studies")}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Estudos</span>
          </button>

          <div>
            <h1 className="text-3xl font-bold text-white">Laboratório de Reharmonização</h1>
            <p className="text-white/60 mt-1">
              Explore substituições harmônicas e enriqueça seus arranjos
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Seletor de Acorde */}
          <div className="lg:col-span-1 space-y-6">
            {/* Acorde Atual */}
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-white/60 mb-2">Acorde Original</h3>
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg mb-4">
                <span className="text-6xl font-black text-white">{currentChord}</span>
              </div>
              <p className="text-xs text-white/50 text-center">
                Selecione tom e qualidade para ver reharmonizações
              </p>
            </div>

            {/* Seletor de Tom */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Tom</h3>
              <div className="grid grid-cols-3 gap-2">
                {MUSICAL_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedKey === key
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de Qualidade */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Qualidade</h3>
              <div className="space-y-2">
                {CHORD_QUALITIES.map((quality) => (
                  <button
                    key={quality.id}
                    onClick={() => setSelectedQuality(quality)}
                    className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all text-left ${
                      selectedQuality.id === quality.id
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {quality.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main: Reharmonizações */}
          <div className="lg:col-span-3 space-y-6">
            {/* Info Box */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">O que é Reharmonização?</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Reharmonização é a arte de <strong className="text-white/90">substituir acordes</strong> por
                    outros que mantêm a função harmônica mas adicionam <strong className="text-white/90">cor, movimento e riqueza</strong> à música.
                    É uma técnica poderosa para criar arranjos mais interessantes e expressivos.
                  </p>
                </div>
              </div>
            </div>

            {/* Seções de Reharmonização */}
            {!hasReharmonizations ? (
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-12 shadow-2xl text-center">
                <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Nenhuma reharmonização disponível ainda
                </h3>
                <p className="text-white/60 max-w-md mx-auto">
                  Estamos expandindo a biblioteca de reharmonizações. Enquanto isso, experimente
                  outros acordes ou explore a biblioteca completa!
                </p>
                <button
                  onClick={() => navigate("/study/library")}
                  className="mt-6 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all"
                >
                  Ir para Biblioteca de Acordes
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const hasChords = section.chords.length > 0;

                  if (!hasChords) return null;

                  return (
                    <div
                      key={section.id}
                      className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">{section.title}</h3>
                          <p className="text-sm text-white/60">{section.description}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium">
                          {section.chords.length} {section.chords.length === 1 ? "opção" : "opções"}
                        </div>
                      </div>

                      {/* Explicação */}
                      <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-sm text-white/70 leading-relaxed">
                          {section.explanation}
                        </p>
                      </div>

                      {/* Grid de Acordes */}
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {section.chords.map((chord) => (
                          <button
                            key={chord}
                            onClick={() => navigate(`/chord-study/${chord}`)}
                            className={`group px-4 py-6 rounded-xl font-black text-2xl transition-all bg-gradient-to-br ${section.color} text-white hover:scale-105 shadow-lg hover:shadow-xl`}
                          >
                            {chord}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dica Educacional */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Dica de Uso
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                <strong className="text-white/90">💡 Como usar:</strong> Experimente tocar a progressão original
                da sua música e depois substitua um acorde por uma das opções sugeridas. Nem toda reharmonização
                funciona em todo contexto - <strong className="text-white/90">use seu ouvido musical como guia!</strong>
              </p>
              <p className="text-sm text-white/70 leading-relaxed mt-3">
                <strong className="text-white/90">🎵 Dica avançada:</strong> Você pode combinar múltiplas técnicas.
                Por exemplo, use um acorde substituto E DEPOIS adicione um baixo alternativo. As possibilidades são infinitas!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReharmonizationLab;
