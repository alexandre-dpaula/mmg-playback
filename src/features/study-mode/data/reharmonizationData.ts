/**
 * Dados de Rearmonização
 * Progressões I-vi-IV-V em todos os 12 tons com dominantes secundários
 */

import { ReharmonizationExample } from "../types/reharmonization";

export const reharmonizationExamples: ReharmonizationExample[] = [
  // Tom de C
  {
    key: "C",
    type: "secondary_dominant",
    original: ["C", "Am", "F", "G"],
    reharmonized: ["C", "A7", "Dm", "G7"],
    explanation: "Substituímos Am por A7 (dominante de Dm) e adicionamos G7 ao final, criando tensão que resolve no acorde I.",
    changedChords: [1, 3],
  },

  // Tom de Db
  {
    key: "Db",
    type: "secondary_dominant",
    original: ["Db", "Bbm", "Gb", "Ab"],
    reharmonized: ["Db", "Bb7", "Ebm", "Ab7"],
    explanation: "Bb7 é o dominante secundário de Ebm (V/vi), e Ab7 adiciona tensão resolvendo em Db na repetição.",
    changedChords: [1, 3],
  },

  // Tom de D
  {
    key: "D",
    type: "secondary_dominant",
    original: ["D", "Bm", "G", "A"],
    reharmonized: ["D", "B7", "Em", "A7"],
    explanation: "B7 é o dominante secundário de Em (V/vi), e A7 adiciona tensão resolvendo em D na repetição.",
    changedChords: [1, 3],
  },

  // Tom de Eb
  {
    key: "Eb",
    type: "secondary_dominant",
    original: ["Eb", "Cm", "Ab", "Bb"],
    reharmonized: ["Eb", "C7", "Fm", "Bb7"],
    explanation: "C7 funciona como dominante de Fm (V/vi), enquanto Bb7 prepara o retorno para Eb com mais força.",
    changedChords: [1, 3],
  },

  // Tom de E
  {
    key: "E",
    type: "secondary_dominant",
    original: ["E", "C#m", "A", "B"],
    reharmonized: ["E", "C#7", "F#m", "B7"],
    explanation: "C#7 funciona como dominante de F#m (V/vi), enquanto B7 prepara o retorno para E com mais força.",
    changedChords: [1, 3],
  },

  // Tom de F
  {
    key: "F",
    type: "secondary_dominant",
    original: ["F", "Dm", "Bb", "C"],
    reharmonized: ["F", "D7", "Gm", "C7"],
    explanation: "D7 é o dominante secundário de Gm (V/vi), e C7 adiciona tensão resolvendo em F na repetição.",
    changedChords: [1, 3],
  },

  // Tom de F#
  {
    key: "F#",
    type: "secondary_dominant",
    original: ["F#", "D#m", "B", "C#"],
    reharmonized: ["F#", "D#7", "G#m", "C#7"],
    explanation: "D#7 funciona como dominante de G#m (V/vi), enquanto C#7 prepara o retorno para F# com mais força.",
    changedChords: [1, 3],
  },

  // Tom de G
  {
    key: "G",
    type: "secondary_dominant",
    original: ["G", "Em", "C", "D"],
    reharmonized: ["G", "E7", "Am", "D7"],
    explanation: "E7 é o dominante secundário de Am (V/vi), e D7 adiciona tensão resolvendo em G na repetição.",
    changedChords: [1, 3],
  },

  // Tom de Ab
  {
    key: "Ab",
    type: "secondary_dominant",
    original: ["Ab", "Fm", "Db", "Eb"],
    reharmonized: ["Ab", "F7", "Bbm", "Eb7"],
    explanation: "F7 funciona como dominante de Bbm (V/vi), enquanto Eb7 prepara o retorno para Ab com mais força.",
    changedChords: [1, 3],
  },

  // Tom de A
  {
    key: "A",
    type: "secondary_dominant",
    original: ["A", "F#m", "D", "E"],
    reharmonized: ["A", "F#7", "Bm", "E7"],
    explanation: "F#7 é o dominante secundário de Bm (V/vi), e E7 adiciona tensão resolvendo em A na repetição.",
    changedChords: [1, 3],
  },

  // Tom de Bb
  {
    key: "Bb",
    type: "secondary_dominant",
    original: ["Bb", "Gm", "Eb", "F"],
    reharmonized: ["Bb", "G7", "Cm", "F7"],
    explanation: "G7 funciona como dominante de Cm (V/vi), enquanto F7 prepara o retorno para Bb com mais força.",
    changedChords: [1, 3],
  },

  // Tom de B
  {
    key: "B",
    type: "secondary_dominant",
    original: ["B", "G#m", "E", "F#"],
    reharmonized: ["B", "G#7", "C#m", "F#7"],
    explanation: "G#7 é o dominante secundário de C#m (V/vi), e F#7 adiciona tensão resolvendo em B na repetição.",
    changedChords: [1, 3],
  },
];

/**
 * Mapeia acorde para dados básicos do diagrama
 * Esta função será substituída pela integração com o sistema existente
 */
export const getChordReference = (chordName: string) => {
  // Referência rápida para os acordes usados nas rearmonizações (sem duplicatas)
  const references: Record<string, {
    notes: string[];
    quality: string;
  }> = {
    // Acordes Maiores
    "C": { notes: ["C", "E", "G"], quality: "Maior" },
    "Db": { notes: ["Db", "F", "Ab"], quality: "Maior" },
    "D": { notes: ["D", "F#", "A"], quality: "Maior" },
    "Eb": { notes: ["Eb", "G", "Bb"], quality: "Maior" },
    "E": { notes: ["E", "G#", "B"], quality: "Maior" },
    "F": { notes: ["F", "A", "C"], quality: "Maior" },
    "F#": { notes: ["F#", "A#", "C#"], quality: "Maior" },
    "G": { notes: ["G", "B", "D"], quality: "Maior" },
    "Ab": { notes: ["Ab", "C", "Eb"], quality: "Maior" },
    "A": { notes: ["A", "C#", "E"], quality: "Maior" },
    "Bb": { notes: ["Bb", "D", "F"], quality: "Maior" },
    "B": { notes: ["B", "D#", "F#"], quality: "Maior" },
    "Gb": { notes: ["Gb", "Bb", "Db"], quality: "Maior" },
    "C#": { notes: ["C#", "E#", "G#"], quality: "Maior" },

    // Acordes Menores
    "Am": { notes: ["A", "C", "E"], quality: "Menor" },
    "Bbm": { notes: ["Bb", "Db", "F"], quality: "Menor" },
    "Bm": { notes: ["B", "D", "F#"], quality: "Menor" },
    "Cm": { notes: ["C", "Eb", "G"], quality: "Menor" },
    "C#m": { notes: ["C#", "E", "G#"], quality: "Menor" },
    "Dm": { notes: ["D", "F", "A"], quality: "Menor" },
    "D#m": { notes: ["D#", "F#", "A#"], quality: "Menor" },
    "Em": { notes: ["E", "G", "B"], quality: "Menor" },
    "Ebm": { notes: ["Eb", "Gb", "Bb"], quality: "Menor" },
    "Fm": { notes: ["F", "Ab", "C"], quality: "Menor" },
    "F#m": { notes: ["F#", "A", "C#"], quality: "Menor" },
    "Gm": { notes: ["G", "Bb", "D"], quality: "Menor" },
    "G#m": { notes: ["G#", "B", "D#"], quality: "Menor" },

    // Acordes Dominantes (7)
    "A7": { notes: ["A", "C#", "E", "G"], quality: "Dominante" },
    "Ab7": { notes: ["Ab", "C", "Eb", "Gb"], quality: "Dominante" },
    "B7": { notes: ["B", "D#", "F#", "A"], quality: "Dominante" },
    "Bb7": { notes: ["Bb", "D", "F", "Ab"], quality: "Dominante" },
    "C7": { notes: ["C", "E", "G", "Bb"], quality: "Dominante" },
    "C#7": { notes: ["C#", "E#", "G#", "B"], quality: "Dominante" },
    "D7": { notes: ["D", "F#", "A", "C"], quality: "Dominante" },
    "D#7": { notes: ["D#", "F##", "A#", "C#"], quality: "Dominante" },
    "E7": { notes: ["E", "G#", "B", "D"], quality: "Dominante" },
    "Eb7": { notes: ["Eb", "G", "Bb", "Db"], quality: "Dominante" },
    "F7": { notes: ["F", "A", "C", "Eb"], quality: "Dominante" },
    "F#7": { notes: ["F#", "A#", "C#", "E"], quality: "Dominante" },
    "G7": { notes: ["G", "B", "D", "F"], quality: "Dominante" },
    "G#7": { notes: ["G#", "B#", "D#", "F#"], quality: "Dominante" },
  };

  return references[chordName] || { notes: [], quality: "Desconhecido" };
};
