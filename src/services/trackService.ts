/**
 * Serviço unificado de gestão de músicas
 * Gerencia biblioteca global de tracks compartilhada entre ensaios e eventos
 */

import { supabase } from '@/lib/supabase';

export interface Track {
  id: string;
  church_id: string;
  title: string;
  artist?: string;
  cifra_url?: string;
  cifra_content?: string;
  tom?: string;
  artist_photo?: string;
  versao?: string;
  created_at: string;
  updated_at?: string;
}

export interface AddTrackOptions {
  churchId: string;
  title: string;
  artist?: string;
  cifraUrl?: string;
  checkDuplicates?: boolean; // default: true
}

export interface TrackSearchResult {
  exists: boolean;
  track?: Track;
  similarity?: number;
  matchType?: 'exact-url' | 'exact-title' | 'similar-title';
}

/**
 * Serviço unificado de gestão de músicas
 */
export const TrackService = {
  /**
   * Busca música existente (anti-duplicação)
   * Ordem de prioridade:
   * 1. URL do Cifra Club (100% confiável)
   * 2. Título exato (case insensitive)
   * 3. Título similar (>= 85% similaridade)
   */
  async findExisting(options: AddTrackOptions): Promise<TrackSearchResult> {
    const { churchId, title, cifraUrl } = options;

    try {
      // 1. Busca por URL (mais confiável)
      if (cifraUrl) {
        const { data: urlMatch } = await supabase
          .from('tracks')
          .select('*')
          .eq('church_id', churchId)
          .eq('cifra_url', cifraUrl)
          .maybeSingle();

        if (urlMatch) {
          console.log('[TrackService] Música encontrada por URL:', urlMatch.title);
          return {
            exists: true,
            track: urlMatch,
            similarity: 100,
            matchType: 'exact-url',
          };
        }
      }

      // 2. Busca por título exato (case insensitive)
      const { data: exactMatch } = await supabase
        .from('tracks')
        .select('*')
        .eq('church_id', churchId)
        .ilike('title', title)
        .maybeSingle();

      if (exactMatch) {
        console.log('[TrackService] Música encontrada por título exato:', exactMatch.title);
        return {
          exists: true,
          track: exactMatch,
          similarity: 100,
          matchType: 'exact-title',
        };
      }

      // 3. Busca por similaridade (fuzzy search)
      const { data: allTracks } = await supabase
        .from('tracks')
        .select('*')
        .eq('church_id', churchId);

      if (allTracks && allTracks.length > 0) {
        const similar = findMostSimilar(title, allTracks);

        if (similar && similar.similarity >= 85) {
          console.log(
            `[TrackService] Música similar encontrada: "${similar.track.title}" (${similar.similarity}% similar)`
          );
          return {
            exists: true,
            track: similar.track,
            similarity: similar.similarity,
            matchType: 'similar-title',
          };
        }
      }

      console.log('[TrackService] Nenhuma música existente encontrada');
      return { exists: false };
    } catch (error) {
      console.error('[TrackService] Erro ao buscar música existente:', error);
      return { exists: false };
    }
  },

  /**
   * Adiciona ou reutiliza música
   * Se checkDuplicates=true, verifica se já existe antes de criar
   */
  async addOrReuse(options: AddTrackOptions): Promise<Track> {
    const { checkDuplicates = true, churchId, title, artist, cifraUrl } = options;

    try {
      // Verifica duplicatas
      if (checkDuplicates) {
        const existing = await this.findExisting(options);

        if (existing.exists && existing.track) {
          console.log(`[TrackService] Reutilizando música existente: ${existing.track.title}`);
          return existing.track;
        }
      }

      // Cria nova música
      console.log(`[TrackService] Criando nova música: ${title}`);

      const { data: newTrack, error } = await supabase
        .from('tracks')
        .insert({
          church_id: churchId,
          title,
          artist: artist || null,
          cifra_url: cifraUrl || null,
        })
        .select()
        .single();

      if (error) {
        console.error('[TrackService] Erro ao criar música:', error);
        throw error;
      }

      console.log(`[TrackService] Música criada com sucesso: ${newTrack.title}`);
      return newTrack;
    } catch (error) {
      console.error('[TrackService] Erro em addOrReuse:', error);
      throw error;
    }
  },

  /**
   * Adiciona música a um evento
   */
  async addToEvent(trackId: string, eventId: string, order?: number): Promise<void> {
    try {
      // Verifica se já existe na playlist
      const { data: existing } = await supabase
        .from('event_tracks')
        .select('id')
        .eq('event_id', eventId)
        .eq('track_id', trackId)
        .maybeSingle();

      if (existing) {
        console.log('[TrackService] Música já está no evento, ignorando...');
        return;
      }

      // Adiciona à playlist do evento
      const { error } = await supabase.from('event_tracks').insert({
        event_id: eventId,
        track_id: trackId,
        order: order || 0,
      });

      if (error) {
        console.error('[TrackService] Erro ao adicionar música ao evento:', error);
        throw error;
      }

      console.log(`[TrackService] Música adicionada ao evento: ${trackId}`);
    } catch (error) {
      console.error('[TrackService] Erro em addToEvent:', error);
      throw error;
    }
  },

  /**
   * Remove música de um evento (não deleta a track, apenas remove da playlist)
   */
  async removeFromEvent(trackId: string, eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_tracks')
        .delete()
        .eq('event_id', eventId)
        .eq('track_id', trackId);

      if (error) throw error;

      console.log(`[TrackService] Música removida do evento: ${trackId}`);
    } catch (error) {
      console.error('[TrackService] Erro ao remover música do evento:', error);
      throw error;
    }
  },

  /**
   * Busca todas as músicas da biblioteca global de uma igreja
   */
  async getAllTracks(churchId: string): Promise<Track[]> {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('church_id', churchId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[TrackService] Erro ao buscar todas as músicas:', error);
      return [];
    }
  },

  /**
   * Busca músicas por texto (título ou artista)
   */
  async searchTracks(churchId: string, query: string): Promise<Track[]> {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('church_id', churchId)
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[TrackService] Erro ao buscar músicas:', error);
      return [];
    }
  },

  /**
   * Atualiza dados de uma música
   */
  async updateTrack(trackId: string, updates: Partial<Track>): Promise<Track | null> {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', trackId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[TrackService] Música atualizada: ${data.title}`);
      return data;
    } catch (error) {
      console.error('[TrackService] Erro ao atualizar música:', error);
      return null;
    }
  },
};

/**
 * Calcula similaridade entre strings usando algoritmo de Levenshtein
 * Retorna valor entre 0-100 (100 = idênticas)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const len1 = s1.length;
  const len2 = s2.length;

  // Matriz para o algoritmo de Levenshtein
  const matrix: number[][] = [];

  // Inicializa primeira coluna
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  // Inicializa primeira linha
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Preenche a matriz
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1, // inserção
          matrix[i - 1][j] + 1 // deleção
        );
      }
    }
  }

  // Calcula distância final
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);

  // Converte distância em percentual de similaridade
  const similarity = ((maxLen - distance) / maxLen) * 100;

  return Math.round(similarity);
}

/**
 * Encontra a música mais similar em uma lista
 */
function findMostSimilar(
  title: string,
  tracks: Track[]
): { track: Track; similarity: number } | null {
  let bestMatch: { track: Track; similarity: number } | null = null;

  for (const track of tracks) {
    const similarity = calculateSimilarity(title, track.title);

    if (!bestMatch || similarity > bestMatch.similarity) {
      bestMatch = { track, similarity };
    }
  }

  return bestMatch && bestMatch.similarity >= 85 ? bestMatch : null;
}
