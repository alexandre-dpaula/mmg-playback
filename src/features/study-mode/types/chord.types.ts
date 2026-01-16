/**
 * TIPOS FUNDAMENTAIS DO SISTEMA DE ACORDES
 * Baseado no padrão Cifra Club
 *
 * Sistema completo para:
 * - Biblioteca de acordes
 * - Diagramas de violão (CAGED)
 * - Diagramas de teclado
 * - Cifras de músicas
 * - Transposição
 */

// =============================================
// TIPOS DE ACORDES
// =============================================

export type ChordQuality =
  | "major"           // C, D, E, F, G, A, B
  | "minor"           // Cm, Dm, Em...
  | "dominant7"       // C7, D7, E7...
  | "major7"          // Cmaj7, Dmaj7...
  | "minor7"          // Cm7, Dm7...
  | "diminished"      // Cdim, Ddim...
  | "augmented"       // Caug, Daug...
  | "sus2"            // Csus2, Dsus2...
  | "sus4"            // Csus4, Dsus4...
  | "sixth"           // C6, D6...
  | "minor6"          // Cm6, Dm6...
  | "ninth"           // C9, D9...
  | "add9";           // Cadd9, Dadd9...

export type Difficulty = "easy" | "medium" | "hard";

export type CAGEDPosition = "C" | "A" | "G" | "E" | "D";

// =============================================
// VIOLÃO - SISTEMA CAGED
// =============================================

/**
 * Nota individual no braço do violão
 */
export interface GuitarNote {
  string: number;    // 1-6 (1=mais aguda E, 6=mais grave E)
  fret: number;      // 0=solta, -1=mutada, 1-24=casas
  finger?: number;   // 0-4 (0=solta, 1-4=dedos)
}

/**
 * Pestana (barre chord)
 */
export interface Barre {
  fret: number;
  fromString: number;  // String inicial (1-6)
  toString: number;    // String final (1-6)
}

/**
 * Shape de violão (uma variação CAGED)
 */
export interface GuitarShape {
  id: string;                    // Ex: "C-major-E-form"
  chordId: string;               // Ex: "C-major"
  system: "CAGED";
  position: CAGEDPosition;       // C, A, G, E, D
  name: string;                  // Ex: "C (Forma E)"
  baseFret: number;              // Casa base (1 para abertas)
  notes: GuitarNote[];           // Posição de cada nota
  barre?: Barre;                 // Pestana (se houver)
  difficulty: Difficulty;        // Nível de dificuldade
  isDefault?: boolean;           // Se é a variação padrão
}

// =============================================
// TECLADO - INVERSÕES
// =============================================

export type KeyboardInversion = "root" | "first" | "second" | "third";

/**
 * Tecla individual do teclado
 */
export interface KeyboardKey {
  note: string;      // Ex: "C4", "C#4", "D4"
  octave: number;    // 0-8
  isBlack: boolean;  // Tecla preta?
  isActive: boolean; // Faz parte do acorde?
  isRoot?: boolean;  // É a nota raiz?
}

/**
 * Shape de teclado (uma inversão)
 */
export interface KeyboardShape {
  id: string;                    // Ex: "C-major-root"
  chordId: string;               // Ex: "C-major"
  inversion: KeyboardInversion;
  name: string;                  // Ex: "C Major (Fundamental)"
  octaveStart: number;           // Oitava inicial (ex: 4)
  keys: KeyboardKey[];           // Todas as teclas visíveis
  difficulty: Difficulty;
}

// =============================================
// ACORDE COMPLETO (TODAS AS VARIAÇÕES)
// =============================================

/**
 * Acorde completo com todas as variações para todos os instrumentos
 */
export interface Chord {
  // Identificação
  id: string;                    // Ex: "C-major"
  name: string;                  // Ex: "C"
  fullName: string;              // Ex: "C Major"
  quality: ChordQuality;

  // Teoria musical
  root: string;                  // Ex: "C"
  notes: string[];               // Ex: ["C", "E", "G"]
  intervals: string[];           // Ex: ["1", "3", "5"]

  // Shapes por instrumento
  guitarShapes: GuitarShape[];   // Até 5 formas CAGED
  keyboardShapes: KeyboardShape[]; // Inversões

  // Metadados
  difficulty: Difficulty;        // Dificuldade geral do acorde
  tags: string[];                // Ex: ["beginner", "common", "open"]

  // Reharmonizações
  substitutes?: string[];        // Acordes substitutos
  relatedChords?: string[];      // Acordes relacionados
}

// =============================================
// CIFRA DE MÚSICA
// =============================================

/**
 * Linha da cifra (letra + acorde)
 */
export interface CifraLine {
  type: "chord" | "lyric" | "both";
  chords?: Array<{
    name: string;      // Ex: "C"
    position: number;  // Posição na linha
  }>;
  lyric?: string;      // Letra
}

/**
 * Seção da música (verso, refrão, etc)
 */
export interface CifraSection {
  type: "verse" | "chorus" | "bridge" | "intro" | "outro";
  name?: string;       // Ex: "Refrão 1"
  lines: CifraLine[];
}

/**
 * Cifra completa da música
 */
export interface Cifra {
  id: string;
  songId: string;
  title: string;
  artist: string;

  // Tom original e atual
  originalKey: string;   // Ex: "C"
  currentKey: string;    // Ex: "D" (se transposta)

  // Capotraste
  capo?: number;         // Casa do capo (0 = sem capo)

  // Estrutura
  sections: CifraSection[];

  // Metadados
  tempo?: number;        // BPM
  timeSignature?: string; // Ex: "4/4"
  difficulty: Difficulty;

  // Acordes únicos usados na música
  usedChords: string[];  // Ex: ["C", "G", "Am", "F"]
}

// =============================================
// DATABASE TYPES
// =============================================

/**
 * Acorde salvo no banco de dados (Supabase)
 */
export interface ChordRecord {
  id: string;
  chord_name: string;
  full_name: string;
  quality: ChordQuality;
  root_note: string;
  notes: string[];
  guitar_shapes: Record<string, any>; // JSONB
  keyboard_shapes: Record<string, any>; // JSONB
  difficulty: Difficulty;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Cifra salva no banco de dados
 */
export interface CifraRecord {
  id: string;
  track_id: string;
  original_key: string;
  content: any; // JSONB com CifraSection[]
  used_chords: string[];
  difficulty: Difficulty;
  created_at: string;
  updated_at: string;
}

// =============================================
// TRANSPOSIÇÃO
// =============================================

/**
 * Resultado de transposição
 */
export interface TranspositionResult {
  fromKey: string;
  toKey: string;
  semitones: number;
  chordMap: Record<string, string>; // Ex: { "C": "D", "G": "A" }
  transposedCifra: Cifra;
}

// =============================================
// UTILITÁRIOS
// =============================================

/**
 * Filtros para busca de acordes
 */
export interface ChordFilter {
  quality?: ChordQuality | ChordQuality[];
  difficulty?: Difficulty | Difficulty[];
  root?: string | string[];
  tags?: string[];
  hasGuitarShapes?: boolean;
  hasKeyboardShapes?: boolean;
}

/**
 * Opções de renderização de diagrama
 */
export interface DiagramOptions {
  showFingers?: boolean;
  showNoteNames?: boolean;
  highlightRoot?: boolean;
  theme?: "light" | "dark";
  size?: "small" | "medium" | "large";
}

// =============================================
// RE-EXPORTS (Compatibilidade)
// =============================================

// Para compatibilidade com código existente
export type {
  GuitarNote as GuitarChordNote,
  GuitarShape as GuitarChord,
  KeyboardShape as KeyboardChord,
};
