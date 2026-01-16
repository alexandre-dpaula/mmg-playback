import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { ChordRelation } from "../types";

/**
 * Hook MVP para buscar relações harmônicas
 * Retorna sugestões de acordes relacionados
 */
export const useChordRelations = (chordName: string | null) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["chord-relations", chordName, profile.churchId],
    queryFn: async (): Promise<ChordRelation[]> => {
      if (!chordName) return [];

      // TODO: Integrar com Supabase
      return getMockChordRelations(chordName);
    },
    enabled: !!chordName,
  });
};

// Sugestões harmônicas mockadas
function getMockChordRelations(chordName: string): ChordRelation[] {
  const relations: Record<string, ChordRelation[]> = {
    "C": [
      {
        id: "1",
        chord_from: "C",
        chord_to: "Am",
        relation_type: "parallel",
        church_id: "",
      },
      {
        id: "2",
        chord_from: "C",
        chord_to: "Cmaj7",
        relation_type: "substitute",
        church_id: "",
      },
      {
        id: "3",
        chord_from: "C",
        chord_to: "C/E",
        relation_type: "altered_bass",
        church_id: "",
      },
    ],
    "G": [
      {
        id: "4",
        chord_from: "G",
        chord_to: "Em",
        relation_type: "parallel",
        church_id: "",
      },
      {
        id: "5",
        chord_from: "G",
        chord_to: "G7",
        relation_type: "substitute",
        church_id: "",
      },
    ],
    "Am": [
      {
        id: "6",
        chord_from: "Am",
        chord_to: "C",
        relation_type: "relative",
        church_id: "",
      },
      {
        id: "7",
        chord_from: "Am",
        chord_to: "Am7",
        relation_type: "substitute",
        church_id: "",
      },
    ],
    "F": [
      {
        id: "8",
        chord_from: "F",
        chord_to: "Dm",
        relation_type: "parallel",
        church_id: "",
      },
      {
        id: "9",
        chord_from: "F",
        chord_to: "Fmaj7",
        relation_type: "substitute",
        church_id: "",
      },
    ],
  };

  return relations[chordName] || [];
}
