import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SongChord, parseChords } from "../types";

/**
 * Extrai acordes únicos de uma cifra (conteúdo textual)
 * Busca padrões como [C], [Am7], [G/B], etc.
 */
function extractChordsFromCifra(cifraContent: string | null | undefined): string[] {
  if (!cifraContent) return [];

  // Regex para capturar acordes entre colchetes: [C], [Am], [G7], [C/E], etc.
  const chordRegex = /\[([A-G][#b]?(?:m|maj|min|dim|aug|sus)?[0-9]?(?:\/[A-G][#b]?)?)\]/g;

  const matches = cifraContent.matchAll(chordRegex);
  const chordsSet = new Set<string>();

  for (const match of matches) {
    chordsSet.add(match[1]); // Adiciona acorde sem os colchetes
  }

  return Array.from(chordsSet);
}

/**
 * Hook para buscar os acordes de uma música
 * Parseia o campo 'acordes' da tabela tracks
 */
export const useSongChords = (songId: string | null) => {
  return useQuery({
    queryKey: ["song-chords", songId],
    queryFn: async () => {
      if (!songId) return [];

      // Busca a track no banco
      const { data: track, error } = await supabase
        .from("tracks")
        .select("id, titulo, tom, cifra_content")
        .eq("id", songId)
        .single();

      if (error || !track) {
        console.error("Erro ao buscar música:", error);
        return [];
      }

      // TODO: Quando a coluna 'acordes' existir, usar:
      // const chordNames = parseChords(track.acordes);

      // Por enquanto, extrai acordes da cifra_content (fallback temporário)
      const chordNames = extractChordsFromCifra(track.cifra_content);

      // Transforma em formato SongChord
      return chordNames.map((chord, index) => ({
        id: `${track.id}-${index}`,
        song_id: track.id,
        chord_name: chord,
        position: index,
        church_id: "", // Será preenchido automaticamente pelo RLS
      })) as SongChord[];
    },
    enabled: !!songId,
  });
};
