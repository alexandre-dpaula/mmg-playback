import React, { useState } from "react";
import { Lightbulb, TrendingUp, ArrowRightLeft, Music2 } from "lucide-react";

interface ReharmonizationPanelProps {
  currentChord: string;
  reharmonizations: {
    slashChords: string[];
    substitutes: string[];
    parallel: string[];
    relatedDominants: string[];
  };
  onChordSelect: (chord: string) => void;
  className?: string;
}

/**
 * Painel de sugestões de reharmonização
 * Mostra acordes alternativos com base em teoria musical
 */
export const ReharmonizationPanel: React.FC<ReharmonizationPanelProps> = ({
  currentChord,
  reharmonizations,
  onChordSelect,
  className = "",
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("slashChords");

  const sections = [
    {
      id: "slashChords",
      title: "Acordes com Baixo Alternativo",
      description: "Mesmo acorde, nota diferente no baixo",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      chords: reharmonizations.slashChords,
    },
    {
      id: "substitutes",
      title: "Substituições Harmônicas",
      description: "Acordes com notas em comum que criam cor diferente",
      icon: ArrowRightLeft,
      color: "from-blue-600 to-blue-500",
      chords: reharmonizations.substitutes,
    },
    {
      id: "parallel",
      title: "Empréstimo Modal (Paralelo)",
      description: "Versão maior/menor do mesmo acorde",
      icon: Music2,
      color: "from-purple-500 to-pink-500",
      chords: reharmonizations.parallel,
    },
    {
      id: "relatedDominants",
      title: "Dominantes e Preparações",
      description: "Acordes que preparam ou resolvem o acorde atual",
      icon: Lightbulb,
      color: "from-orange-500 to-red-500",
      chords: reharmonizations.relatedDominants,
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Reharmonização</h3>
          <p className="text-sm text-white/60">Alternativas para {currentChord}</p>
        </div>
      </div>

      {/* Descrição */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-white/80">
        <p>
          <strong>Reharmonização</strong> é a arte de substituir acordes por outros que mantêm
          a função harmônica mas adicionam cor e movimento à música.
        </p>
      </div>

      {/* Seções de reharmonização */}
      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          const hasChords = section.chords.length > 0;

          return (
            <div
              key={section.id}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all"
            >
              {/* Header da seção */}
              <button
                onClick={() => hasChords && toggleSection(section.id)}
                className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all ${
                  !hasChords && "opacity-50 cursor-not-allowed"
                }`}
                disabled={!hasChords}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white text-sm">{section.title}</h4>
                    <p className="text-xs text-white/50">{section.description}</p>
                  </div>
                </div>

                {hasChords && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">{section.chords.length}</span>
                    <svg
                      className={`w-5 h-5 text-white/60 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}

                {!hasChords && (
                  <span className="text-xs text-white/30">Nenhuma opção</span>
                )}
              </button>

              {/* Lista de acordes */}
              {isExpanded && hasChords && (
                <div className="p-4 pt-0 border-t border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {section.chords.map((chord) => (
                      <button
                        key={chord}
                        onClick={() => onChordSelect(chord)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-gradient-to-br ${section.color} text-white hover:scale-105 shadow-lg`}
                      >
                        {chord}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dica educacional */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-xs text-white/60 leading-relaxed">
          <strong className="text-white/80">💡 Dica:</strong> Experimente tocar a progressão original
          e depois teste as substituições. Nem toda reharmonização funciona em todo contexto -
          use seu ouvido musical como guia!
        </p>
      </div>
    </div>
  );
};
