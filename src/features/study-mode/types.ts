/**
 * Types para o Modo Ensaio / Estudos
 */

export interface ChordShape {
  id: string;
  chord_name: string; // Ex: "C", "Am7", "G/B"
  instrument: "guitar" | "keyboard";
  variation_name: string; // Ex: "Aberta", "Barre 3ª casa", "Jazz voicing"
  church_id: string;
  created_at: string;
  // Dados específicos do shape
  shape_data: GuitarShapeData | KeyboardShapeData;
}

// Estrutura de nota individual no violão
export type GuitarNote = {
  string: number; // 1 a 6 (1 = mais aguda/mi, 6 = mais grave/Mi)
  fret: number;  // 0 = solta, -1 = mutada
  finger?: number; // Dedo sugerido (1-4)
};

// Estrutura completa de um acorde de violão
export type GuitarChord = {
  name: string;
  baseFret: number; // Casa base (1 para posições abertas)
  notes: GuitarNote[];
  barre?: {
    fret: number;
    fromString: number;
    toString: number;
  };
};

// Estrutura de acorde de teclado/piano
export type KeyboardChord = {
  notes: string[]; // ["C", "E", "G"]
  inversion?: number; // 0 = fundamental, 1 = primeira inversão, etc
};

// Formato legado (mantido para compatibilidade)
export interface GuitarShapeData {
  frets: (number | "x" | "o")[]; // 6 strings: [x, 3, 2, 0, 1, 0]
  base_fret: number; // Casa base (1 para posições abertas)
  fingers?: (number | null)[]; // Dedilhado sugerido
  barres?: { fret: number; fromString: number; toString: number }[]; // Pestanas
}

export interface KeyboardShapeData {
  notes: string[]; // ["C", "E", "G"]
  octaves: number[]; // [4, 4, 4]
  voicing_type: "open" | "closed" | "drop2" | "drop3";
  inversion: number; // 0 = fundamental, 1 = primeira inversão, etc
}

export interface ChordRelation {
  id: string;
  chord_from: string; // Acorde de origem
  chord_to: string; // Acorde relacionado
  relation_type: "substitute" | "parallel" | "relative" | "dominant" | "altered_bass";
  church_id: string;
}

export interface SongChord {
  id: string;
  song_id: string;
  chord_name: string;
  position: number; // Ordem no repertório
  church_id: string;
}

// =============================================
// TIPOS ADICIONAIS PARA O SISTEMA COMPLETO
// =============================================

export type ChordQuality =
  | "major"
  | "minor"
  | "dominant7"
  | "major7"
  | "minor7"
  | "diminished"
  | "augmented"
  | "sus2"
  | "sus4";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface ChordInfo {
  name: string; // Nome simplificado: "C", "Am", "G7"
  fullName: string; // Nome completo: "C Major", "A minor 7"
  quality: ChordQuality;
  notes: string[]; // Notas que compõem o acorde
}

export interface StudyModeState {
  selectedChord: string | null;
  selectedInstrument: "guitar" | "keyboard";
  selectedVariationIndex: number;
  showHarmonicSuggestions: boolean;
}

// =============================================
// PARSER E UTILIDADES DE ACORDES
// =============================================

/**
 * Extrai acordes de uma string ou array JSON
 * Suporta formatos:
 * - "C, G, Am, F" (string com vírgulas)
 * - "C G Am F" (string com espaços)
 * - ["C", "G", "Am", "F"] (array JSON)
 */
export function parseChords(input: string | string[] | null | undefined): string[] {
  if (!input) return [];

  // Se já é array
  if (Array.isArray(input)) {
    return input.filter(Boolean).map(chord => chord.trim());
  }

  // Se é string
  if (typeof input === "string") {
    // Tenta parsear como JSON primeiro
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).map(chord => chord.trim());
      }
    } catch {
      // Não é JSON, continua
    }

    // Separa por vírgula ou espaço
    const separator = input.includes(",") ? "," : " ";
    return input
      .split(separator)
      .map(chord => chord.trim())
      .filter(Boolean);
  }

  return [];
}

/**
 * Normaliza nome do acorde (remove espaços, padroniza formato)
 */
export function normalizeChordName(chord: string): string {
  return chord
    .replace(/\s+/g, "")
    .replace(/major/i, "")
    .replace(/minor/i, "m")
    .replace(/dim/i, "°")
    .replace(/aug/i, "+");
}

/**
 * Identifica a qualidade do acorde pelo nome
 */
export function identifyChordQuality(chordName: string): ChordQuality {
  const normalized = normalizeChordName(chordName).toLowerCase();

  if (normalized.includes("dim") || normalized.includes("°")) return "diminished";
  if (normalized.includes("aug") || normalized.includes("+")) return "augmented";
  if (normalized.includes("sus2")) return "sus2";
  if (normalized.includes("sus4") || normalized.includes("sus")) return "sus4";
  if (normalized.includes("maj7")) return "major7";
  if (normalized.includes("m7") && !normalized.includes("maj")) return "minor7";
  if (normalized.match(/7(?!M)/)) return "dominant7";
  if (normalized.includes("m") && !normalized.includes("maj")) return "minor";

  return "major";
}

/**
 * Cria objeto ChordInfo completo a partir do nome
 */
export function createChordInfo(chordName: string): ChordInfo {
  const quality = identifyChordQuality(chordName);

  const qualityNames: Record<ChordQuality, string> = {
    major: "Major",
    minor: "minor",
    dominant7: "Dominant 7th",
    major7: "Major 7th",
    minor7: "minor 7th",
    diminished: "Diminished",
    augmented: "Augmented",
    sus2: "Suspended 2nd",
    sus4: "Suspended 4th",
  };

  return {
    name: chordName,
    fullName: `${chordName} ${qualityNames[quality]}`,
    quality,
    notes: [], // TODO: Implementar extração de notas
  };
}

// =============================================
// CONVERSORES DE FORMATO
// =============================================

/**
 * Converte formato legado (array de frets) para novo formato (array de notes)
 */
export function convertLegacyToGuitarChord(
  name: string,
  shapeData: GuitarShapeData
): GuitarChord {
  const notes: GuitarNote[] = shapeData.frets
    .map((fret, index) => {
      const stringNumber = index + 1;

      if (fret === "x") {
        return { string: stringNumber, fret: -1 }; // Mutada
      }

      if (fret === "o" || fret === 0) {
        return { string: stringNumber, fret: 0 }; // Solta
      }

      const fretNumber = typeof fret === "number" ? fret : 0;
      const finger = shapeData.fingers?.[index] || undefined;

      return {
        string: stringNumber,
        fret: fretNumber,
        finger: finger !== null ? finger : undefined,
      };
    })
    .filter((note) => note.fret !== -1); // Remove cordas mutadas da lista de notas

  return {
    name,
    baseFret: shapeData.base_fret || 1,
    notes,
    barre: shapeData.barres?.[0] // Pega a primeira pestana se houver
      ? {
          fret: shapeData.barres[0].fret,
          fromString: shapeData.barres[0].fromString,
          toString: shapeData.barres[0].toString,
        }
      : undefined,
  };
}

/**
 * Converte novo formato para legado (para compatibilidade)
 */
export function convertGuitarChordToLegacy(chord: GuitarChord): GuitarShapeData {
  const frets: (number | "x" | "o")[] = Array(6).fill("x");
  const fingers: (number | null)[] = Array(6).fill(null);

  chord.notes.forEach((note) => {
    const index = note.string - 1;
    if (note.fret === 0) {
      frets[index] = "o";
    } else {
      frets[index] = note.fret;
    }
    fingers[index] = note.finger || null;
  });

  return {
    frets,
    base_fret: chord.baseFret,
    fingers,
    barres: chord.barre ? [chord.barre] : undefined,
  };
}
