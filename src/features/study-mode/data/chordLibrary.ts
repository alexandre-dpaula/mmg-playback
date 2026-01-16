/**
 * Biblioteca de Acordes com Sistema CAGED
 * Dados completos de acordes para violão/guitarra e teclado
 *
 * ESTRATÉGIA: Geração automática de todos os 156 acordes usando transposição
 * CORREÇÕES: Acordes corrigidos manualmente sobrescrevem os gerados (ver correctedChords.ts)
 */

import { GuitarChord, KeyboardChord } from "../types";
import { CORRECTED_CHORDS } from "./correctedChords";

// =============================================
// UTILITÁRIOS DE TRANSPOSIÇÃO
// =============================================

const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Transpõe um acorde de violão para outro tom
 * Mantém posições tocáveis (entre casas 1-7 quando possível)
 */
function transposeGuitarChord(chord: GuitarChord, semitones: number, newName: string): GuitarChord {
  // Normaliza semitons para sempre estar entre 0-11
  let normalizedSemitones = ((semitones % 12) + 12) % 12;

  // Se a transposição resultar em posição muito alta (>7),
  // transpõe uma oitava abaixo (-12 semitons) para manter tocável
  let adjustedSemitones = normalizedSemitones;
  const projectedBaseFret = chord.baseFret + normalizedSemitones;

  if (projectedBaseFret > 7) {
    adjustedSemitones = normalizedSemitones - 12;
  }

  return {
    ...chord,
    name: newName,
    baseFret: Math.max(1, chord.baseFret + adjustedSemitones),
    notes: chord.notes.map(note => ({
      ...note,
      fret: note.fret > 0 ? Math.max(0, note.fret + adjustedSemitones) : note.fret
    })),
    barre: chord.barre ? {
      ...chord.barre,
      fret: Math.max(1, chord.barre.fret + adjustedSemitones)
    } : undefined
  };
}

/**
 * Transpõe notas de teclado para outro tom
 */
function transposeKeyboardNotes(notes: string[], semitones: number): string[] {
  return notes.map(note => {
    const noteName = note.replace(/\d+$/, "");
    const octave = parseInt(note.match(/\d+$/)?.[0] || "4");
    const noteIndex = CHROMATIC_NOTES.indexOf(noteName);
    const newIndex = (noteIndex + semitones + 12) % 12;
    const octaveShift = Math.floor((noteIndex + semitones) / 12);
    return `${CHROMATIC_NOTES[newIndex]}${octave + octaveShift}`;
  });
}

/**
 * Gera todas as variações de um acorde base
 */
function generateAllVariations(baseChord: ChordData, rootNote: string): ChordData {
  const rootIndex = CHROMATIC_NOTES.indexOf(baseChord.root);
  const targetIndex = CHROMATIC_NOTES.indexOf(rootNote);
  const semitones = (targetIndex - rootIndex + 12) % 12;

  const suffix = baseChord.name.replace(baseChord.root, "");
  const newName = `${rootNote}${suffix}`;

  return {
    ...baseChord,
    name: newName,
    fullName: baseChord.fullName.replace(baseChord.root, rootNote),
    root: rootNote,
    notes: baseChord.notes.map(n => {
      const noteIndex = CHROMATIC_NOTES.indexOf(n);
      return CHROMATIC_NOTES[(noteIndex + semitones + 12) % 12];
    }),
    cagedShapes: Object.fromEntries(
      Object.entries(baseChord.cagedShapes)
        .filter(([_, shape]) => shape !== undefined)
        .map(([key, shape]) => [
          key,
          transposeGuitarChord(shape!, semitones, `${newName} (Forma ${key})`)
        ])
    ),
    keyboardVoicings: {
      root: {
        notes: transposeKeyboardNotes(baseChord.keyboardVoicings.root.notes, semitones),
        inversion: baseChord.keyboardVoicings.root.inversion
      },
      firstInversion: baseChord.keyboardVoicings.firstInversion ? {
        notes: transposeKeyboardNotes(baseChord.keyboardVoicings.firstInversion.notes, semitones),
        inversion: 1
      } : undefined,
      secondInversion: baseChord.keyboardVoicings.secondInversion ? {
        notes: transposeKeyboardNotes(baseChord.keyboardVoicings.secondInversion.notes, semitones),
        inversion: 2
      } : undefined,
      thirdInversion: baseChord.keyboardVoicings.thirdInversion ? {
        notes: transposeKeyboardNotes(baseChord.keyboardVoicings.thirdInversion.notes, semitones),
        inversion: 3
      } : undefined,
    },
    reharmonizations: baseChord.reharmonizations
  };
}

// =============================================
// ESTRUTURA DE DADOS DE UM ACORDE COMPLETO
// =============================================

export interface ChordData {
  name: string; // C, Am, G7, etc.
  fullName: string; // C Major, A minor, G Dominant 7th
  quality: "major" | "minor" | "dominant7" | "major7" | "minor7" | "diminished" | "augmented" | "sus2" | "sus4";
  notes: string[]; // Notas que compõem o acorde
  root: string; // Nota raiz

  // Formas CAGED para violão/guitarra
  cagedShapes: {
    C?: GuitarChord;
    A?: GuitarChord;
    G?: GuitarChord;
    E?: GuitarChord;
    D?: GuitarChord;
  };

  // Voicings para teclado
  keyboardVoicings: {
    root: KeyboardChord; // Posição fundamental
    firstInversion?: KeyboardChord;
    secondInversion?: KeyboardChord;
    thirdInversion?: KeyboardChord;
    openVoicing?: KeyboardChord;
  };

  // Reharmonizações sugeridas
  reharmonizations: {
    slashChords: string[]; // Ex: C/E, C/G
    substitutes: string[]; // Ex: Am7, Em7
    parallel: string[]; // Ex: Cm (parallel minor)
    relatedDominants: string[]; // Ex: G7
  };
}

// =============================================
// SISTEMA CAGED - ACORDE DE C (DÓ MAIOR)
// =============================================

export const C_MAJOR: ChordData = {
  name: "C",
  fullName: "C Major",
  quality: "major",
  notes: ["C", "E", "G"],
  root: "C",

  cagedShapes: {
    // Forma C (posição aberta)
    C: {
      name: "C (Forma C)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 }, // E (corda mais aguda)
        { string: 2, fret: 1, finger: 1 }, // C
        { string: 3, fret: 0 }, // G
        { string: 4, fret: 2, finger: 2 }, // E
        { string: 5, fret: 3, finger: 3 }, // C
        // Corda 6 mutada
      ],
    },

    // Forma A (baseada em Lá - 3ª casa)
    A: {
      name: "C (Forma A)",
      baseFret: 3,
      notes: [
        { string: 1, fret: 3, finger: 3 }, // G
        { string: 2, fret: 5, finger: 4 }, // E
        { string: 3, fret: 5, finger: 4 }, // C
        { string: 4, fret: 5, finger: 4 }, // G
        { string: 5, fret: 3, finger: 1 }, // C (raiz)
        // Corda 6 mutada
      ],
      barre: {
        fret: 5,
        fromString: 2,
        toString: 4,
      },
    },

    // Forma G (baseada em Sol - 5ª casa)
    G: {
      name: "C (Forma G)",
      baseFret: 5,
      notes: [
        { string: 1, fret: 8, finger: 4 }, // C
        { string: 2, fret: 8, finger: 3 }, // G
        { string: 3, fret: 9, finger: 5 }, // E (ou usar 4)
        { string: 4, fret: 10, finger: 6 }, // C (ou omitir)
        { string: 5, fret: 10, finger: 6 }, // G
        { string: 6, fret: 8, finger: 1 }, // C (raiz)
      ],
    },

    // Forma E (baseada em Mi - 8ª casa)
    E: {
      name: "C (Forma E)",
      baseFret: 8,
      notes: [
        { string: 1, fret: 8, finger: 1 }, // C
        { string: 2, fret: 8, finger: 1 }, // G
        { string: 3, fret: 9, finger: 2 }, // E
        { string: 4, fret: 10, finger: 4 }, // C
        { string: 5, fret: 10, finger: 3 }, // G
        { string: 6, fret: 8, finger: 1 }, // C (raiz)
      ],
      barre: {
        fret: 8,
        fromString: 1,
        toString: 6,
      },
    },

    // Forma D (baseada em Ré - 10ª casa)
    D: {
      name: "C (Forma D)",
      baseFret: 10,
      notes: [
        { string: 1, fret: 12, finger: 3 }, // E
        { string: 2, fret: 13, finger: 4 }, // C
        { string: 3, fret: 12, finger: 2 }, // G
        { string: 4, fret: 10, finger: 1 }, // C (raiz)
        // Cordas 5 e 6 mutadas
      ],
    },
  },

  keyboardVoicings: {
    root: {
      notes: ["C4", "E4", "G4"],
      inversion: 0,
    },
    firstInversion: {
      notes: ["E4", "G4", "C5"],
      inversion: 1,
    },
    secondInversion: {
      notes: ["G4", "C5", "E5"],
      inversion: 2,
    },
    openVoicing: {
      notes: ["C3", "G3", "E4"],
      inversion: 0,
    },
  },

  reharmonizations: {
    slashChords: ["C/E", "C/G"],
    substitutes: ["Am7", "Em7", "Fmaj7"],
    parallel: ["Cm"],
    relatedDominants: ["G7", "Dm7"],
  },
};

// =============================================
// SISTEMA CAGED - ACORDE DE G (SOL MAIOR)
// =============================================

export const G_MAJOR: ChordData = {
  name: "G",
  fullName: "G Major",
  quality: "major",
  notes: ["G", "B", "D"],
  root: "G",

  cagedShapes: {
    // Forma G (posição aberta)
    G: {
      name: "G (Forma G)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 3, finger: 3 }, // G
        { string: 2, fret: 0 }, // B
        { string: 3, fret: 0 }, // G
        { string: 4, fret: 0 }, // D
        { string: 5, fret: 2, finger: 1 }, // B
        { string: 6, fret: 3, finger: 2 }, // G (raiz)
      ],
    },

    // Forma E (3ª casa)
    E: {
      name: "G (Forma E)",
      baseFret: 3,
      notes: [
        { string: 1, fret: 3, finger: 1 }, // G
        { string: 2, fret: 3, finger: 1 }, // D
        { string: 3, fret: 4, finger: 2 }, // B
        { string: 4, fret: 5, finger: 4 }, // G
        { string: 5, fret: 5, finger: 3 }, // D
        { string: 6, fret: 3, finger: 1 }, // G (raiz)
      ],
      barre: {
        fret: 3,
        fromString: 1,
        toString: 6,
      },
    },

    // Forma D (5ª casa)
    D: {
      name: "G (Forma D)",
      baseFret: 5,
      notes: [
        { string: 1, fret: 7, finger: 3 }, // B
        { string: 2, fret: 8, finger: 4 }, // G
        { string: 3, fret: 7, finger: 2 }, // D
        { string: 4, fret: 5, finger: 1 }, // G (raiz)
        // Cordas 5 e 6 mutadas
      ],
    },

    // Forma C (7ª casa)
    C: {
      name: "G (Forma C)",
      baseFret: 7,
      notes: [
        { string: 1, fret: 7, finger: 1 }, // B
        { string: 2, fret: 8, finger: 2 }, // G
        { string: 3, fret: 7, finger: 1 }, // D
        { string: 4, fret: 9, finger: 3 }, // B
        { string: 5, fret: 10, finger: 4 }, // G (raiz)
        // Corda 6 mutada
      ],
    },

    // Forma A (1ª casa - EXATAMENTE igual Cifra Club)
    A: {
      name: "G (Forma A)",
      baseFret: 1,
      notes: [
        { string: 6, fret: -1 }, // Mutada (X)
        { string: 5, fret: 1, finger: 1 }, // B (pestana)
        { string: 4, fret: 3, finger: 3 }, // G
        { string: 3, fret: 5, finger: 6 }, // D
        { string: 2, fret: 5, finger: 5 }, // B
        { string: 1, fret: 0 }, // G (corda solta)
      ],
      barre: {
        fret: 1,
        fromString: 2,
        toString: 5,
      },
    },
  },

  keyboardVoicings: {
    root: {
      notes: ["G3", "B3", "D4"],
      inversion: 0,
    },
    firstInversion: {
      notes: ["B3", "D4", "G4"],
      inversion: 1,
    },
    secondInversion: {
      notes: ["D4", "G4", "B4"],
      inversion: 2,
    },
    openVoicing: {
      notes: ["G3", "D4", "B4"],
      inversion: 0,
    },
  },

  reharmonizations: {
    slashChords: ["G/B", "G/D"],
    substitutes: ["Em7", "Bm7", "Cmaj7"],
    parallel: ["Gm"],
    relatedDominants: ["D7", "Am7"],
  },
};

// =============================================
// SISTEMA CAGED - ACORDE DE Am (LÁ MENOR)
// =============================================

export const A_MINOR: ChordData = {
  name: "Am",
  fullName: "A minor",
  quality: "minor",
  notes: ["A", "C", "E"],
  root: "A",

  cagedShapes: {
    // Forma A (posição aberta)
    A: {
      name: "Am (Forma A)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 }, // E
        { string: 2, fret: 1, finger: 1 }, // C
        { string: 3, fret: 2, finger: 3 }, // A
        { string: 4, fret: 2, finger: 2 }, // E
        { string: 5, fret: 0 }, // A (raiz)
        // Corda 6 mutada
      ],
    },

    // Forma G (5ª casa)
    G: {
      name: "Am (Forma G)",
      baseFret: 5,
      notes: [
        { string: 1, fret: 8, finger: 4 }, // A
        { string: 2, fret: 6, finger: 2 }, // E
        { string: 3, fret: 5, finger: 1 }, // C
        { string: 4, fret: 7, finger: 3 }, // A
        { string: 5, fret: 7, finger: 3 }, // E
        { string: 6, fret: 5, finger: 1 }, // A (raiz)
      ],
    },

    // Forma E (5ª casa - alternativa)
    E: {
      name: "Am (Forma E)",
      baseFret: 5,
      notes: [
        { string: 1, fret: 5, finger: 1 }, // A
        { string: 2, fret: 5, finger: 1 }, // E
        { string: 3, fret: 5, finger: 1 }, // C
        { string: 4, fret: 7, finger: 3 }, // A
        { string: 5, fret: 7, finger: 4 }, // E
        { string: 6, fret: 5, finger: 1 }, // A (raiz)
      ],
      barre: {
        fret: 5,
        fromString: 1,
        toString: 6,
      },
    },

    // Forma D (7ª casa)
    D: {
      name: "Am (Forma D)",
      baseFret: 7,
      notes: [
        { string: 1, fret: 9, finger: 2 }, // C
        { string: 2, fret: 10, finger: 3 }, // A
        { string: 3, fret: 9, finger: 1 }, // E
        { string: 4, fret: 7, finger: 1 }, // A (raiz)
        // Cordas 5 e 6 mutadas
      ],
    },

    // Forma C (12ª casa)
    C: {
      name: "Am (Forma C)",
      baseFret: 12,
      notes: [
        { string: 1, fret: 12, finger: 1 }, // C
        { string: 2, fret: 13, finger: 2 }, // A
        { string: 3, fret: 14, finger: 4 }, // E
        { string: 4, fret: 14, finger: 3 }, // C
        { string: 5, fret: 12, finger: 1 }, // A (raiz)
        // Corda 6 mutada
      ],
    },
  },

  keyboardVoicings: {
    root: {
      notes: ["A3", "C4", "E4"],
      inversion: 0,
    },
    firstInversion: {
      notes: ["C4", "E4", "A4"],
      inversion: 1,
    },
    secondInversion: {
      notes: ["E4", "A4", "C5"],
      inversion: 2,
    },
    openVoicing: {
      notes: ["A3", "E4", "C5"],
      inversion: 0,
    },
  },

  reharmonizations: {
    slashChords: ["Am/C", "Am/E"],
    substitutes: ["C", "Fmaj7", "Am7"],
    parallel: ["A"],
    relatedDominants: ["E7", "Dm"],
  },
};

// =============================================
// SISTEMA CAGED - ACORDE DE F (FÁ MAIOR)
// =============================================

export const F_MAJOR: ChordData = {
  name: "F",
  fullName: "F Major",
  quality: "major",
  notes: ["F", "A", "C"],
  root: "F",

  cagedShapes: {
    // Forma E (1ª casa - pestana)
    E: {
      name: "F (Forma E)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 1, finger: 1 }, // F
        { string: 2, fret: 1, finger: 1 }, // C
        { string: 3, fret: 2, finger: 2 }, // A
        { string: 4, fret: 3, finger: 4 }, // F
        { string: 5, fret: 3, finger: 3 }, // C
        { string: 6, fret: 1, finger: 1 }, // F (raiz)
      ],
      barre: {
        fret: 1,
        fromString: 1,
        toString: 6,
      },
    },

    // Forma D (3ª casa)
    D: {
      name: "F (Forma D)",
      baseFret: 3,
      notes: [
        { string: 1, fret: 5, finger: 3 }, // A
        { string: 2, fret: 6, finger: 4 }, // F
        { string: 3, fret: 5, finger: 2 }, // C
        { string: 4, fret: 3, finger: 1 }, // F (raiz)
        // Cordas 5 e 6 mutadas
      ],
    },

    // Forma C (5ª casa)
    C: {
      name: "F (Forma C)",
      baseFret: 5,
      notes: [
        { string: 1, fret: 5, finger: 1 }, // A
        { string: 2, fret: 6, finger: 2 }, // F
        { string: 3, fret: 5, finger: 1 }, // C
        { string: 4, fret: 7, finger: 3 }, // A
        { string: 5, fret: 8, finger: 4 }, // F (raiz)
        // Corda 6 mutada
      ],
    },

    // Forma A (8ª casa)
    A: {
      name: "F (Forma A)",
      baseFret: 8,
      notes: [
        { string: 1, fret: 8, finger: 1 }, // C
        { string: 2, fret: 10, finger: 3 }, // A
        { string: 3, fret: 10, finger: 4 }, // F
        { string: 4, fret: 10, finger: 4 }, // C
        { string: 5, fret: 8, finger: 1 }, // F (raiz)
        // Corda 6 mutada
      ],
      barre: {
        fret: 10,
        fromString: 2,
        toString: 4,
      },
    },

    // Forma G (10ª casa)
    G: {
      name: "F (Forma G)",
      baseFret: 10,
      notes: [
        { string: 1, fret: 13, finger: 4 }, // F
        { string: 2, fret: 13, finger: 3 }, // C
        { string: 3, fret: 14, finger: 5 }, // A
        { string: 4, fret: 15, finger: 6 }, // F
        { string: 5, fret: 15, finger: 6 }, // C
        { string: 6, fret: 13, finger: 1 }, // F (raiz)
      ],
    },
  },

  keyboardVoicings: {
    root: {
      notes: ["F3", "A3", "C4"],
      inversion: 0,
    },
    firstInversion: {
      notes: ["A3", "C4", "F4"],
      inversion: 1,
    },
    secondInversion: {
      notes: ["C4", "F4", "A4"],
      inversion: 2,
    },
    openVoicing: {
      notes: ["F3", "C4", "A4"],
      inversion: 0,
    },
  },

  reharmonizations: {
    slashChords: ["F/A", "F/C"],
    substitutes: ["Dm7", "Am7", "Fmaj7"],
    parallel: ["Fm"],
    relatedDominants: ["C7", "Gm7"],
  },
};

// =============================================
// Cm7 - DÓ MENOR COM SÉTIMA
// =============================================

export const C_MINOR_7: ChordData = {
  name: "Cm7",
  fullName: "C Minor 7th",
  quality: "minor7",
  notes: ["C", "Eb", "G", "Bb"],
  root: "C",

  cagedShapes: {
    // Forma C (3ª casa com pestana)
    C: {
      name: "Cm7 (Forma C)",
      baseFret: 3,
      notes: [
        { string: 1, fret: 3, finger: 1 }, // G
        { string: 2, fret: 4, finger: 2 }, // Eb
        { string: 3, fret: 3, finger: 1 }, // Bb
        { string: 4, fret: 5, finger: 3 }, // G
        { string: 5, fret: 3, finger: 1 }, // C (raiz)
        { string: 6, fret: -1 }, // Mutada
      ],
      barre: {
        fret: 3,
        fromString: 1,
        toString: 5,
      },
    },

    // Forma A (8ª casa)
    A: {
      name: "Cm7 (Forma A)",
      baseFret: 8,
      notes: [
        { string: 1, fret: 8, finger: 1 }, // C
        { string: 2, fret: 9, finger: 2 }, // G
        { string: 3, fret: 8, finger: 1 }, // Eb
        { string: 4, fret: 10, finger: 3 }, // Bb
        { string: 5, fret: 8, finger: 1 }, // C (raiz)
        { string: 6, fret: -1 }, // Mutada
      ],
      barre: {
        fret: 8,
        fromString: 1,
        toString: 5,
      },
    },
  },

  keyboardVoicings: {
    root: {
      notes: ["C4", "Eb4", "G4", "Bb4"],
      inversion: 0,
    },
    firstInversion: {
      notes: ["Eb4", "G4", "Bb4", "C5"],
      inversion: 1,
    },
    secondInversion: {
      notes: ["G4", "Bb4", "C5", "Eb5"],
      inversion: 2,
    },
  },

  reharmonizations: {
    slashChords: ["Cm7/Eb", "Cm7/G"],
    substitutes: ["Eb6", "Abmaj7"],
    parallel: ["C7"],
    relatedDominants: ["G7", "Bb7"],
  },
};

// =============================================
// A#7 (Bb7) - LÁ SUSTENIDO / SI BEMOL SÉTIMA DOMINANTE
// =============================================

export const A_SHARP_7: ChordData = {
  name: "A#7",
  fullName: "A# Dominant 7th (Bb7)",
  quality: "dominant7",
  notes: ["A#", "D", "F", "G#"],
  root: "A#",

  cagedShapes: {
    // Forma E (6ª casa com pestana)
    E: {
      name: "A#7 (Forma E)",
      baseFret: 6,
      notes: [
        { string: 1, fret: 6, finger: 1 }, // A#
        { string: 2, fret: 6, finger: 1 }, // F
        { string: 3, fret: 7, finger: 2 }, // D
        { string: 4, fret: 6, finger: 1 }, // G# (7ª)
        { string: 5, fret: 8, finger: 3 }, // F
        { string: 6, fret: 6, finger: 1 }, // A# (raiz)
      ],
      barre: {
        fret: 6,
        fromString: 1,
        toString: 6,
      },
    },

    // Forma D (8ª casa)
    D: {
      name: "A#7 (Forma D)",
      baseFret: 8,
      notes: [
        { string: 1, fret: 10, finger: 3 }, // D
        { string: 2, fret: 11, finger: 4 }, // A#
        { string: 3, fret: 10, finger: 2 }, // F
        { string: 4, fret: 8, finger: 1 }, // A# (raiz)
        { string: 5, fret: -1 }, // Mutada
        { string: 6, fret: -1 }, // Mutada
      ],
    },

    // Forma C (1ª casa)
    C: {
      name: "A#7 (Forma C)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 1, finger: 1 }, // F
        { string: 2, fret: 1, finger: 1 }, // A#
        { string: 3, fret: 0 }, // D
        { string: 4, fret: 3, finger: 3 }, // G#
        { string: 5, fret: 1, finger: 1 }, // A# (raiz)
        { string: 6, fret: -1 }, // Mutada
      ],
    },

    // Forma A (1ª casa - alternativa)
    A: {
      name: "A#7 (Forma A)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 1, finger: 1 }, // F
        { string: 2, fret: 3, finger: 3 }, // D
        { string: 3, fret: 3, finger: 4 }, // A#
        { string: 4, fret: 3, finger: 4 }, // F
        { string: 5, fret: 1, finger: 1 }, // A# (raiz)
        { string: 6, fret: -1 }, // Mutada
      ],
    },
  },

  keyboardVoicings: {
    root: {
      notes: ["A#3", "D4", "F4", "G#4"],
      inversion: 0,
    },
    firstInversion: {
      notes: ["D4", "F4", "G#4", "A#4"],
      inversion: 1,
    },
    secondInversion: {
      notes: ["F4", "G#4", "A#4", "D5"],
      inversion: 2,
    },
    thirdInversion: {
      notes: ["G#4", "A#4", "D5", "F5"],
      inversion: 3,
    },
  },

  reharmonizations: {
    slashChords: ["A#7/D", "A#7/F"],
    substitutes: ["Dm7b5", "Gm7", "E7"],
    parallel: ["A#m7"],
    relatedDominants: ["D#", "F7", "Cm7"],
  },
};

// =============================================
// ACORDES BASE PARA CADA QUALIDADE (em C)
// =============================================

// Usaremos C como base e transporemos para todos os tons

// C Menor
const C_MINOR: ChordData = {
  name: "Cm",
  fullName: "C minor",
  quality: "minor",
  notes: ["C", "D#", "G"],
  root: "C",
  cagedShapes: {
    E: {
      name: "Cm (Forma E)",
      baseFret: 3,
      notes: [
        { string: 1, fret: 3, finger: 1 },
        { string: 2, fret: 4, finger: 2 },
        { string: 3, fret: 5, finger: 4 },
        { string: 4, fret: 5, finger: 3 },
        { string: 5, fret: 3, finger: 1 },
        { string: 6, fret: -1 },
      ],
      barre: {
        fret: 3,
        fromString: 1,
        toString: 5,
      },
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "D#4", "G4"], inversion: 0 },
    firstInversion: { notes: ["D#4", "G4", "C5"], inversion: 1 },
    secondInversion: { notes: ["G4", "C5", "D#5"], inversion: 2 },
  },
  reharmonizations: {
    slashChords: ["Cm/D#", "Cm/G"],
    substitutes: ["D#", "G7"],
    parallel: ["C"],
    relatedDominants: ["G7"],
  },
};

// C Diminuto
const C_DIMINISHED: ChordData = {
  name: "Cdim",
  fullName: "C Diminished",
  quality: "diminished",
  notes: ["C", "D#", "F#"],
  root: "C",
  cagedShapes: {
    E: {
      name: "Cdim (Forma E)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 0 },
        { string: 3, fret: 1, finger: 2 },
        { string: 4, fret: 0 },
        { string: 5, fret: 3, finger: 3 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "D#4", "F#4"], inversion: 0 },
  },
  reharmonizations: {
    slashChords: [],
    substitutes: ["Cm", "C7b9"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Aumentado
const C_AUGMENTED: ChordData = {
  name: "Caug",
  fullName: "C Augmented",
  quality: "augmented",
  notes: ["C", "E", "G#"],
  root: "C",
  cagedShapes: {
    E: {
      name: "Caug (Forma E)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 1, finger: 2 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "E4", "G#4"], inversion: 0 },
  },
  reharmonizations: {
    slashChords: [],
    substitutes: ["E+", "G#+"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Suspenso 2
const C_SUS2: ChordData = {
  name: "Csus2",
  fullName: "C Suspended 2nd",
  quality: "sus2",
  notes: ["C", "D", "G"],
  root: "C",
  cagedShapes: {
    C: {
      name: "Csus2 (Forma C)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 0 },
        { string: 5, fret: 3, finger: 2 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "D4", "G4"], inversion: 0 },
  },
  reharmonizations: {
    slashChords: [],
    substitutes: ["C", "Dm"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Suspenso 4
const C_SUS4: ChordData = {
  name: "Csus4",
  fullName: "C Suspended 4th",
  quality: "sus4",
  notes: ["C", "F", "G"],
  root: "C",
  cagedShapes: {
    C: {
      name: "Csus4 (Forma C)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 1, finger: 1 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 0 },
        { string: 4, fret: 3, finger: 3 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "F4", "G4"], inversion: 0 },
  },
  reharmonizations: {
    slashChords: [],
    substitutes: ["C", "F"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Sexta
const C_6: ChordData = {
  name: "C6",
  fullName: "C Major 6th",
  quality: "major",
  notes: ["C", "E", "G", "A"],
  root: "C",
  cagedShapes: {
    C: {
      name: "C6 (Forma C)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 2, finger: 2 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "E4", "G4", "A4"], inversion: 0 },
  },
  reharmonizations: {
    slashChords: [],
    substitutes: ["Am7"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Menor 6
const C_M6: ChordData = {
  name: "Cm6",
  fullName: "C Minor 6th",
  quality: "minor",
  notes: ["C", "D#", "G", "A"],
  root: "C",
  cagedShapes: {
    E: {
      name: "Cm6 (Forma E)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 1, finger: 2 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "D#4", "G4", "A4"], inversion: 0 },
  },
  reharmonizations: {
    slashChords: [],
    substitutes: ["Am7b5"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Nona (Dominante)
const C_9: ChordData = {
  name: "C9",
  fullName: "C Dominant 9th",
  quality: "dominant7",
  notes: ["C", "E", "G", "A#", "D"],
  root: "C",
  cagedShapes: {
    E: {
      name: "C9 (Forma E)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 3, finger: 3 },
        { string: 2, fret: 3, finger: 4 },
        { string: 3, fret: 2, finger: 1 },
        { string: 4, fret: 3, finger: 2 },
        { string: 5, fret: -1 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "E4", "G4", "A#4", "D5"], inversion: 0 },
    firstInversion: { notes: ["E4", "G4", "A#4", "D5", "C5"], inversion: 1 },
  },
  reharmonizations: {
    slashChords: [],
    substitutes: ["C7", "Cmaj9"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Add9
const C_ADD9: ChordData = {
  name: "Cadd9",
  fullName: "C Major Add 9",
  quality: "major",
  notes: ["C", "D", "E", "G"],
  root: "C",
  cagedShapes: {
    C: {
      name: "Cadd9 (Forma C)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 },
        { string: 2, fret: 3, finger: 3 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 1 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "D4", "E4", "G4"], inversion: 0 },
  },
  reharmonizations: {
    slashChords: [],
    substitutes: ["C", "Cmaj9"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Maior 7ª (já existe C_MAJOR, mas precisamos da versão Cmaj7)
const C_MAJOR_7: ChordData = {
  name: "Cmaj7",
  fullName: "C Major 7th",
  quality: "major7",
  notes: ["C", "E", "G", "B"],
  root: "C",
  cagedShapes: {
    C: {
      name: "Cmaj7 (Forma C)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 0 },
        { string: 4, fret: 2, finger: 1 },
        { string: 5, fret: 3, finger: 2 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "E4", "G4", "B4"], inversion: 0 },
    firstInversion: { notes: ["E4", "G4", "B4", "C5"], inversion: 1 },
    secondInversion: { notes: ["G4", "B4", "C5", "E5"], inversion: 2 },
    thirdInversion: { notes: ["B4", "C5", "E5", "G5"], inversion: 3 },
  },
  reharmonizations: {
    slashChords: ["Cmaj7/E", "Cmaj7/G"],
    substitutes: ["Em7", "Am7"],
    parallel: [],
    relatedDominants: [],
  },
};

// C Dominante 7ª
const C_DOMINANT_7: ChordData = {
  name: "C7",
  fullName: "C Dominant 7th",
  quality: "dominant7",
  notes: ["C", "E", "G", "A#"],
  root: "C",
  cagedShapes: {
    E: {
      name: "C7 (Forma E)",
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 },
        { string: 2, fret: 1, finger: 1 },
        { string: 3, fret: 3, finger: 3 },
        { string: 4, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 4 },
        { string: 6, fret: -1 },
      ],
    },
  },
  keyboardVoicings: {
    root: { notes: ["C4", "E4", "G4", "A#4"], inversion: 0 },
    firstInversion: { notes: ["E4", "G4", "A#4", "C5"], inversion: 1 },
    secondInversion: { notes: ["G4", "A#4", "C5", "E5"], inversion: 2 },
    thirdInversion: { notes: ["A#4", "C5", "E5", "G5"], inversion: 3 },
  },
  reharmonizations: {
    slashChords: ["C7/E", "C7/G"],
    substitutes: ["F#7", "Cdim7"],
    parallel: [],
    relatedDominants: ["F"],
  },
};

// =============================================
// GERAÇÃO AUTOMÁTICA DE TODOS OS 156 ACORDES
// =============================================

// Mapeia cada tipo de acorde para seu template base em C
const CHORD_TEMPLATES: Record<string, ChordData> = {
  "": C_MAJOR,           // Maior
  "m": C_MINOR,          // Menor
  "7": C_DOMINANT_7,     // Dominante 7ª
  "maj7": C_MAJOR_7,     // Maior 7ª
  "m7": C_MINOR_7,       // Menor 7ª
  "dim": C_DIMINISHED,   // Diminuto
  "aug": C_AUGMENTED,    // Aumentado
  "sus2": C_SUS2,        // Suspenso 2
  "sus4": C_SUS4,        // Suspenso 4
  "6": C_6,              // Sexta
  "m6": C_M6,            // Menor com 6ª
  "9": C_9,              // Nona
  "add9": C_ADD9,        // Maior com 9ª
};

// Gera a biblioteca completa com todos os 156 acordes
function generateCompleteLibrary(): Record<string, ChordData> {
  const library: Record<string, ChordData> = {};

  // Para cada tom (12 tons)
  CHROMATIC_NOTES.forEach(rootNote => {
    // Para cada tipo de acorde (13 tipos)
    Object.entries(CHORD_TEMPLATES).forEach(([suffix, template]) => {
      const chordName = `${rootNote}${suffix}`;
      library[chordName] = generateAllVariations(template, rootNote);
    });
  });

  // Adiciona aliases para notação bemol (Bb, Eb, Ab, Db, Gb)
  library["Bb"] = library["A#"];
  library["Eb"] = library["D#"];
  library["Ab"] = library["G#"];
  library["Db"] = library["C#"];
  library["Gb"] = library["F#"];

  library["Bb7"] = library["A#7"];
  library["Bbm"] = library["A#m"];
  library["Bbmaj7"] = library["A#maj7"];
  library["Bbm7"] = library["A#m7"];

  library["Eb7"] = library["D#7"];
  library["Ebm"] = library["D#m"];
  library["Ebmaj7"] = library["D#maj7"];
  library["Ebm7"] = library["D#m7"];

  return library;
}

// =============================================
// EXPORTAR BIBLIOTECA COMPLETA
// =============================================

// Gera biblioteca base e sobrescreve com acordes corrigidos
const generatedLibrary = generateCompleteLibrary();
export const CHORD_LIBRARY: Record<string, ChordData> = {
  ...generatedLibrary,
  ...CORRECTED_CHORDS, // Acordes corrigidos sobrescrevem os gerados automaticamente
};

/**
 * Busca dados de um acorde na biblioteca
 * IMPORTANTE: Esta função agora busca do banco de dados (chord_diagrams)
 * Use getOrGenerateChord() do chordGenerator.ts para buscar ou gerar acordes
 */
export function getChordData(chordName: string): ChordData | null {
  // Mantém compatibilidade com acordes já existentes em memória
  return CHORD_LIBRARY[chordName] || null;
}

/**
 * Lista todas as formas CAGED disponíveis para um acorde
 */
export function getCagedShapes(chordName: string): Array<{ shape: string; data: GuitarChord }> {
  const chordData = getChordData(chordName);
  if (!chordData) return [];

  return Object.entries(chordData.cagedShapes)
    .filter(([_, data]) => data !== undefined)
    .map(([shape, data]) => ({ shape, data: data! }));
}

/**
 * Retorna sugestões de reharmonização para um acorde
 */
export function getReharmonizations(chordName: string) {
  const chordData = getChordData(chordName);
  return chordData?.reharmonizations || null;
}
