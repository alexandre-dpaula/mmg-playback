/**
 * Hook para carregar dados de acordes com cache
 * Busca do Supabase ou gera por IA se necessário
 */

import { useState, useEffect } from 'react';
import { ChordData, getChordData } from '../data/chordLibrary';
import { getOrGenerateChord } from '../services/chordGenerator';

interface UseChordDataReturn {
  chordData: ChordData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook que busca ou gera um acorde sob demanda
 * @param chordName Nome do acorde (ex: "C", "Am7", "Bb9")
 */
export function useChordData(chordName: string | null): UseChordDataReturn {
  const [chordData, setChordData] = useState<ChordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chordName) {
      setChordData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadChord() {
      setLoading(true);
      setError(null);

      try {
        // 1. Tenta buscar da biblioteca em memória primeiro (instantâneo)
        const memoryData = getChordData(chordName);

        if (memoryData) {
          if (!cancelled) {
            setChordData(memoryData);
            setLoading(false);
            setError(null);
          }
          return;
        }

        // 2. Se não existe em memória, busca do banco ou gera
        const data = await getOrGenerateChord(chordName);

        if (!cancelled) {
          if (data) {
            setChordData(data);
            setError(null);
          } else {
            setChordData(null);
            setError(`Não foi possível carregar o acorde ${chordName}`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Erro ao carregar acorde:', err);
          setError('Erro ao carregar acorde');
          setChordData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChord();

    return () => {
      cancelled = true;
    };
  }, [chordName]);

  return { chordData, loading, error };
}

/**
 * Hook para pré-carregar múltiplos acordes
 * Útil para carregar todos os acordes de um tom de uma vez
 */
export function usePreloadChords(chordNames: string[]) {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (chordNames.length === 0) {
      setLoaded(true);
      return;
    }

    let cancelled = false;

    async function preloadChords() {
      setLoaded(false);
      setProgress(0);

      for (let i = 0; i < chordNames.length; i++) {
        if (cancelled) break;

        await getOrGenerateChord(chordNames[i]);

        if (!cancelled) {
          setProgress(((i + 1) / chordNames.length) * 100);
        }
      }

      if (!cancelled) {
        setLoaded(true);
      }
    }

    preloadChords();

    return () => {
      cancelled = true;
    };
  }, [chordNames]);

  return { loaded, progress };
}
