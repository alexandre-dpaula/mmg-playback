/**
 * ADAPTADOR DE COMPATIBILIDADE
 * Converte entre o novo formato (chord.types.ts) e o formato antigo (types.ts)
 * Permite usar o novo chordDatabase sem quebrar o código existente
 */

import type { Chord as NewChord, GuitarShape as NewGuitarShape } from '../types/chord.types';
import type { ChordData, GuitarChord } from '../data/chordLibrary';

/**
 * Converte um Chord do novo formato para ChordData do formato antigo
 */
export function convertToLegacyChordData(newChord: NewChord): ChordData {
  return {
    name: newChord.name,
    fullName: newChord.fullName,
    quality: newChord.quality as any,
    notes: newChord.notes,
    root: newChord.root,

    // Converte guitar shapes para cagedShapes
    cagedShapes: convertGuitarShapesToCAGED(newChord.guitarShapes),

    // Keyboard voicings (simplificado)
    keyboardVoicings: {
      root: {
        notes: newChord.notes.map((note, i) => `${note}${4 + i}`),
        inversion: 0
      }
    },

    // Reharmonizações
    reharmonizations: {
      slashChords: newChord.substitutes || [],
      substitutes: newChord.substitutes || [],
      parallel: newChord.relatedChords || [],
      relatedDominants: []
    }
  };
}

/**
 * Converte array de GuitarShape para objeto cagedShapes
 */
function convertGuitarShapesToCAGED(shapes: NewGuitarShape[]): Record<string, GuitarChord> {
  const cagedShapes: Record<string, GuitarChord> = {};

  shapes.forEach(shape => {
    cagedShapes[shape.position] = {
      name: shape.name,
      baseFret: shape.baseFret,
      notes: shape.notes,
      barre: shape.barre
    };
  });

  return cagedShapes;
}

/**
 * Converte GuitarShape individual para GuitarChord
 */
export function convertToLegacyGuitarChord(shape: NewGuitarShape): GuitarChord {
  return {
    name: shape.name,
    baseFret: shape.baseFret,
    notes: shape.notes,
    barre: shape.barre
  };
}
