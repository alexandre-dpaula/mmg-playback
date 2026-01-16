/**
 * ACORDES CORRIGIDOS - Baseados no Padrão Universal
 *
 * Estes acordes foram definidos manualmente com formas CAGED corretas,
 * baseadas em padrões universais de música (Hal Leonard, Berklee, Cifra Club).
 *
 * IMPORTANTE: Substitui os acordes gerados por transposição automática.
 */

import { ChordData } from "./chordLibrary";

// =============================================
// D MAIOR - PADRÃO UNIVERSAL CORRETO
// =============================================

export const D_MAJOR_CORRECTED: ChordData = {
  name: "D",
  fullName: "D Major",
  quality: "major",
  notes: ["D", "F#", "A"],
  root: "D",

  cagedShapes: {
    // ======================================
    // FORMA D (POSIÇÃO ABERTA - PADRÃO)
    // Esta é a forma mais básica e reconhecida do acorde D
    // ======================================
    D: {
      name: "D (Forma D)",
      baseFret: 1,
      notes: [
        { string: 6, fret: -1 },           // Mutada (não toca)
        { string: 5, fret: -1 },           // Mutada (não toca)
        { string: 4, fret: 0 },            // D (raiz) - SOLTA!
        { string: 3, fret: 2, finger: 1 }, // A (quinta)
        { string: 2, fret: 3, finger: 3 }, // D (oitava)
        { string: 1, fret: 2, finger: 2 }, // F# (terça)
      ],
    },

    // ======================================
    // FORMA C (3ª CASA)
    // Baseada no shape de C transposto
    // ======================================
    C: {
      name: "D (Forma C)",
      baseFret: 2,
      notes: [
        { string: 6, fret: -1 },           // Mutada
        { string: 5, fret: 5, finger: 4 }, // D
        { string: 4, fret: 4, finger: 3 }, // A
        { string: 3, fret: 2, finger: 1 }, // F#
        { string: 2, fret: 3, finger: 2 }, // D
        { string: 1, fret: 2, finger: 1 }, // A
      ],
    },

    // ======================================
    // FORMA A (5ª CASA COM PESTANA)
    // Esta é a FORMA A correta! (não confundir com Forma B)
    // Baseada no shape de A transposto com pestana na 5ª casa
    // ======================================
    A: {
      name: "D (Forma A)",
      baseFret: 5,
      notes: [
        { string: 6, fret: -1 },           // Mutada
        { string: 5, fret: 5, finger: 1 }, // D (raiz) - PESTANA
        { string: 4, fret: 7, finger: 3 }, // A (quinta)
        { string: 3, fret: 7, finger: 4 }, // D (oitava)
        { string: 2, fret: 7, finger: 2 }, // F# (terça)
        { string: 1, fret: 5, finger: 1 }, // A (quinta) - PESTANA
      ],
      barre: {
        fret: 5,
        fromString: 1,
        toString: 5,
      },
    },

    // ======================================
    // FORMA G (7ª CASA)
    // Baseada no shape de G
    // ======================================
    G: {
      name: "D (Forma G)",
      baseFret: 7,
      notes: [
        { string: 6, fret: 10, finger: 4 }, // D
        { string: 5, fret: 9, finger: 3 },  // A
        { string: 4, fret: 7, finger: 1 },  // F#
        { string: 3, fret: 7, finger: 1 },  // D
        { string: 2, fret: 7, finger: 1 },  // A
        { string: 1, fret: 10, finger: 4 }, // D
      ],
      barre: {
        fret: 7,
        fromString: 2,
        toString: 4,
      },
    },

    // ======================================
    // FORMA E (10ª CASA COM PESTANA COMPLETA)
    // Baseada no shape de E com pestana completa
    // ======================================
    E: {
      name: "D (Forma E)",
      baseFret: 10,
      notes: [
        { string: 6, fret: 10, finger: 1 }, // D (raiz) - PESTANA
        { string: 5, fret: 12, finger: 3 }, // A (quinta)
        { string: 4, fret: 12, finger: 4 }, // D (oitava)
        { string: 3, fret: 11, finger: 2 }, // F# (terça)
        { string: 2, fret: 10, finger: 1 }, // D (oitava) - PESTANA
        { string: 1, fret: 10, finger: 1 }, // A (quinta) - PESTANA
      ],
      barre: {
        fret: 10,
        fromString: 1,
        toString: 6,
      },
    },
  },

  // Voicings para teclado
  keyboardVoicings: {
    root: {
      notes: ["D4", "F#4", "A4"],
      inversion: 0,
    },
    firstInversion: {
      notes: ["F#4", "A4", "D5"],
      inversion: 1,
    },
    secondInversion: {
      notes: ["A4", "D5", "F#5"],
      inversion: 2,
    },
  },

  // Reharmonizações sugeridas
  reharmonizations: {
    slashChords: ["D/F#", "D/A"],
    substitutes: ["Dmaj7", "D6", "Dsus2"],
    parallel: ["Dm"],
    relatedDominants: ["A7", "E7"],
  },
};

// =============================================
// E MAIOR - PADRÃO UNIVERSAL CORRETO
// =============================================

export const E_MAJOR_CORRECTED: ChordData = {
  name: "E",
  fullName: "E Major",
  quality: "major",
  notes: ["E", "G#", "B"],
  root: "E",

  cagedShapes: {
    // FORMA E (POSIÇÃO ABERTA)
    E: {
      name: "E (Forma E)",
      baseFret: 1,
      notes: [
        { string: 6, fret: 0 },            // E (raiz) - SOLTA
        { string: 5, fret: 2, finger: 2 }, // B (quinta)
        { string: 4, fret: 2, finger: 3 }, // E (oitava)
        { string: 3, fret: 1, finger: 1 }, // G# (terça)
        { string: 2, fret: 0 },            // B (quinta) - SOLTA
        { string: 1, fret: 0 },            // E (oitava) - SOLTA
      ],
    },

    // FORMA D (2ª CASA)
    D: {
      name: "E (Forma D)",
      baseFret: 2,
      notes: [
        { string: 6, fret: -1 },
        { string: 5, fret: -1 },
        { string: 4, fret: 2, finger: 1 },
        { string: 3, fret: 4, finger: 2 },
        { string: 2, fret: 5, finger: 4 },
        { string: 1, fret: 4, finger: 3 },
      ],
    },

    // FORMA C (4ª CASA)
    C: {
      name: "E (Forma C)",
      baseFret: 4,
      notes: [
        { string: 6, fret: -1 },
        { string: 5, fret: 7, finger: 4 },
        { string: 4, fret: 6, finger: 3 },
        { string: 3, fret: 4, finger: 1 },
        { string: 2, fret: 5, finger: 2 },
        { string: 1, fret: 4, finger: 1 },
      ],
    },

    // FORMA A (7ª CASA)
    A: {
      name: "E (Forma A)",
      baseFret: 7,
      notes: [
        { string: 6, fret: -1 },
        { string: 5, fret: 7, finger: 1 },
        { string: 4, fret: 9, finger: 3 },
        { string: 3, fret: 9, finger: 4 },
        { string: 2, fret: 9, finger: 2 },
        { string: 1, fret: 7, finger: 1 },
      ],
      barre: {
        fret: 7,
        fromString: 1,
        toString: 5,
      },
    },

    // FORMA G (9ª CASA)
    G: {
      name: "E (Forma G)",
      baseFret: 9,
      notes: [
        { string: 6, fret: 12, finger: 4 },
        { string: 5, fret: 11, finger: 3 },
        { string: 4, fret: 9, finger: 1 },
        { string: 3, fret: 9, finger: 1 },
        { string: 2, fret: 9, finger: 1 },
        { string: 1, fret: 12, finger: 4 },
      ],
      barre: {
        fret: 9,
        fromString: 2,
        toString: 4,
      },
    },
  },

  keyboardVoicings: {
    root: {
      notes: ["E4", "G#4", "B4"],
      inversion: 0,
    },
    firstInversion: {
      notes: ["G#4", "B4", "E5"],
      inversion: 1,
    },
    secondInversion: {
      notes: ["B4", "E5", "G#5"],
      inversion: 2,
    },
  },

  reharmonizations: {
    slashChords: ["E/G#", "E/B"],
    substitutes: ["Emaj7", "E6", "Esus4"],
    parallel: ["Em"],
    relatedDominants: ["B7", "F#7"],
  },
};

// Exporta todos os acordes corrigidos
export const CORRECTED_CHORDS: Record<string, ChordData> = {
  "D": D_MAJOR_CORRECTED,
  "E": E_MAJOR_CORRECTED,
};
