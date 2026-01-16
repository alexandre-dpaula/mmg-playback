import React from "react";
import { ChordRelation } from "../types";
import { Lightbulb } from "lucide-react";

interface HarmonicSuggestionsProps {
  currentChord: string;
  relations: ChordRelation[];
  onChordSelect: (chord: string) => void;
}

const RELATION_LABELS: Record<string, string> = {
  substitute: "Substituição",
  parallel: "Paralelo",
  relative: "Relativo",
  dominant: "Dominante",
  altered_bass: "Baixo Alternativo",
};

export const HarmonicSuggestions: React.FC<HarmonicSuggestionsProps> = ({
  currentChord,
  relations,
  onChordSelect,
}) => {
  if (relations.length === 0) {
    return (
      <div className="text-center text-white/60 py-8">
        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma sugestão harmônica disponível</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        Sugestões Harmônicas
      </h2>
      <div className="space-y-3">
        {relations.map((relation) => (
          <button
            key={relation.id}
            onClick={() => onChordSelect(relation.chord_to)}
            className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                  {relation.chord_to}
                </div>
                <div className="text-sm text-white/60">
                  {RELATION_LABELS[relation.relation_type] || relation.relation_type}
                </div>
              </div>
              <div className="text-white/40 group-hover:text-white/60 transition-colors">
                →
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
