/**
 * Hook para buscar dados de acordes do novo chordDatabase
 * Compatível com o formato antigo via adaptador
 */

import { useMemo } from 'react';
import { chordDatabase } from '../services/chordDatabase';
import { convertToLegacyChordData } from '../services/chordAdapter';
import type { ChordData } from '../data/chordLibrary';

/**
 * Busca acorde do novo banco de dados
 * Retorna no formato antigo (ChordData) para compatibilidade
 */
export function useNewChordData(chordName: string | null): {
  chordData: ChordData | null;
  loading: boolean;
  error: Error | null;
} {
  const result = useMemo(() => {
    if (!chordName) {
      return { chordData: null, loading: false, error: null };
    }

    try {
      // Busca no novo banco de dados
      const newChord = chordDatabase.get(chordName);

      if (!newChord) {
        return {
          chordData: null,
          loading: false,
          error: new Error(`Acorde ${chordName} não encontrado`)
        };
      }

      // Converte para formato antigo
      const legacyChordData = convertToLegacyChordData(newChord);

      return {
        chordData: legacyChordData,
        loading: false,
        error: null
      };
    } catch (error) {
      return {
        chordData: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Erro desconhecido')
      };
    }
  }, [chordName]);

  return result;
}
