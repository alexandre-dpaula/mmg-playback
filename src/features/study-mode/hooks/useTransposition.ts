/**
 * HOOK: useTransposition
 * Gerencia transposição de cifras no React
 */

import { useState, useMemo, useCallback } from 'react';
import {
  transposeChordSheet,
  performTransposition,
  getAllKeys,
  getSemitonesBetween,
  TranspositionResult,
} from '../services/chordTransposer';
import { parseChordSheet } from '../services/chordParser';

export interface UseTranspositionOptions {
  initialSemitones?: number;
  autoDetectKey?: boolean;
}

export interface UseTranspositionResult {
  // Estado
  semitones: number;
  transposedText: string;
  originalKey?: string;
  currentKey?: string;

  // Ações
  transpose: (semitones: number) => void;
  transposeUp: () => void;
  transposeDown: () => void;
  reset: () => void;
  setKey: (key: string) => void;

  // Informações
  result: TranspositionResult;
  availableKeys: string[];
  canTransposeUp: boolean;
  canTransposeDown: boolean;
}

/**
 * Hook para gerenciar transposição de cifras
 */
export function useTransposition(
  text: string,
  options: UseTranspositionOptions = {}
): UseTranspositionResult {
  const { initialSemitones = 0, autoDetectKey = true } = options;

  // Estado de transposição
  const [semitones, setSemitones] = useState(initialSemitones);

  // Detecta tonalidade original
  const originalKey = useMemo(() => {
    if (!autoDetectKey || !text) return undefined;
    const parsed = parseChordSheet(text);
    return parsed.key;
  }, [text, autoDetectKey]);

  // Executa transposição
  const result = useMemo(() => {
    return performTransposition(text, semitones);
  }, [text, semitones]);

  // Texto transposto
  const transposedText = useMemo(() => {
    return transposeChordSheet(text, semitones);
  }, [text, semitones]);

  // Tonalidade atual
  const currentKey = useMemo(() => {
    if (!result.newKey) return originalKey;
    return result.newKey;
  }, [result.newKey, originalKey]);

  // Lista de tonalidades disponíveis
  const availableKeys = useMemo(() => getAllKeys(), []);

  // Ações
  const transpose = useCallback((newSemitones: number) => {
    // Limita entre -12 e +12
    const clamped = Math.max(-12, Math.min(12, newSemitones));
    setSemitones(clamped);
  }, []);

  const transposeUp = useCallback(() => {
    setSemitones(prev => Math.min(12, prev + 1));
  }, []);

  const transposeDown = useCallback(() => {
    setSemitones(prev => Math.max(-12, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setSemitones(0);
  }, []);

  const setKey = useCallback((targetKey: string) => {
    if (!originalKey) {
      console.warn('Não é possível mudar tonalidade sem detectar a original');
      return;
    }

    const diff = getSemitonesBetween(
      originalKey.replace('m', ''),
      targetKey.replace('m', '')
    );

    setSemitones(diff);
  }, [originalKey]);

  // Limites de transposição
  const canTransposeUp = semitones < 12;
  const canTransposeDown = semitones > -12;

  return {
    // Estado
    semitones,
    transposedText,
    originalKey,
    currentKey,

    // Ações
    transpose,
    transposeUp,
    transposeDown,
    reset,
    setKey,

    // Informações
    result,
    availableKeys,
    canTransposeUp,
    canTransposeDown,
  };
}
