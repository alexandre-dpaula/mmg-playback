/**
 * HOOK: useChordParser
 * Integra o parser de cifras com React
 */

import { useMemo } from 'react';
import { parseChordSheet, ParseResult } from '../services/chordParser';

export interface UseChordParserResult extends ParseResult {
  isEmpty: boolean;
  hasChords: boolean;
  stats: {
    totalChords: number;
    uniqueChords: number;
    chordLines: number;
    lyricLines: number;
  };
}

/**
 * Hook para fazer parsing de cifras
 */
export function useChordParser(text: string): UseChordParserResult {
  const result = useMemo(() => {
    if (!text || !text.trim()) {
      return {
        lines: [],
        allChords: [],
        uniqueChords: [],
        key: undefined,
      };
    }

    return parseChordSheet(text);
  }, [text]);

  const stats = useMemo(() => ({
    totalChords: result.allChords.length,
    uniqueChords: result.uniqueChords.length,
    chordLines: result.lines.filter(l => l.type === 'chord').length,
    lyricLines: result.lines.filter(l => l.type === 'lyric').length,
  }), [result]);

  return {
    ...result,
    isEmpty: result.lines.length === 0,
    hasChords: result.allChords.length > 0,
    stats,
  };
}
