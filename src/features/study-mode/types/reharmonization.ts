/**
 * Tipos para Sistema de Rearmonização
 * Define estruturas de dados para progressões, acordes e diagramas
 */

export type MusicalKey = "C" | "C#" | "Db" | "D" | "D#" | "Eb" | "E" | "F" | "F#" | "Gb" | "G" | "G#" | "Ab" | "A" | "A#" | "Bb" | "B";

export type ReharmonizationType =
  | "secondary_dominant"
  | "tritone_substitution"
  | "modal_interchange";

export interface ReharmonizationExample {
  key: MusicalKey;
  type: ReharmonizationType;
  original: string[];
  reharmonized: string[];
  explanation: string;
  changedChords: number[]; // Índices dos acordes modificados
}

export interface GuitarShape {
  system: "CAGED";
  position: "C" | "A" | "G" | "E" | "D";
  baseFret: number;
  frets: number[];
  fingers: number[];
  barres?: number[];
}

export interface KeyboardShape {
  octaveStart: number;
  keys: {
    note: string;
    active: boolean;
    isRoot?: boolean;
  }[];
  inversion: "root" | "first" | "second";
}

export interface ChordWithDiagrams {
  name: string;
  guitarShapes: GuitarShape[];
  keyboardShapes: KeyboardShape[];
}
