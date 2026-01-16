import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SongData {
  id: string;
  titulo: string;
  cifra_content?: string;
  tom?: string;
  tag?: string;
  versao?: string;
  referencia?: string;
}

/**
 * Hook para buscar dados completos de uma música
 * Retorna título, cifra, tom, etc.
 */
export function useSongData(songId: string | null) {
  return useQuery({
    queryKey: ['song-data', songId],
    queryFn: async () => {
      if (!songId) throw new Error('Song ID is required');

      const { data, error } = await supabase
        .from('tracks')
        .select('id, titulo, cifra_content, tom, tag, versao, referencia')
        .eq('id', songId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Song not found');

      return data as SongData;
    },
    enabled: !!songId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
