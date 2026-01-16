import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { ChordShape } from "../types";

/**
 * Hook MVP para buscar shapes de acordes
 * Por enquanto retorna dados mockados, depois integra com Supabase
 */
export const useChordShapes = (chordName: string | null) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["chord-shapes", chordName, profile.churchId],
    queryFn: async (): Promise<ChordShape[]> => {
      if (!chordName) return [];

      // TODO: Integrar com Supabase quando as tabelas estiverem populadas
      // Por enquanto, retorna shapes básicos mockados
      return getMockChordShapes(chordName);
    },
    enabled: !!chordName,
  });
};

// Dados mockados temporários
function getMockChordShapes(chordName: string): ChordShape[] {
  const mockShapes: Record<string, ChordShape[]> = {
    "C": [{
      id: "c-1",
      chord_name: "C",
      instrument: "guitar",
      variation_name: "Aberta",
      church_id: "",
      created_at: new Date().toISOString(),
      shape_data: {
        frets: ["x", 3, 2, 0, 1, 0],
        base_fret: 1,
        fingers: [null, 3, 2, null, 1, null],
      }
    }],
    "G": [{
      id: "g-1",
      chord_name: "G",
      instrument: "guitar",
      variation_name: "Aberta",
      church_id: "",
      created_at: new Date().toISOString(),
      shape_data: {
        frets: [3, 2, 0, 0, 0, 3],
        base_fret: 1,
        fingers: [3, 2, null, null, null, 4],
      }
    }],
    "Am": [{
      id: "am-1",
      chord_name: "Am",
      instrument: "guitar",
      variation_name: "Aberta",
      church_id: "",
      created_at: new Date().toISOString(),
      shape_data: {
        frets: ["x", 0, 2, 2, 1, 0],
        base_fret: 1,
        fingers: [null, null, 2, 3, 1, null],
      }
    }],
    "F": [{
      id: "f-1",
      chord_name: "F",
      instrument: "guitar",
      variation_name: "Pestana 1ª casa",
      church_id: "",
      created_at: new Date().toISOString(),
      shape_data: {
        frets: [1, 3, 3, 2, 1, 1],
        base_fret: 1,
        fingers: [1, 3, 4, 2, 1, 1],
        barres: [{ fret: 1, fromString: 1, toString: 6 }],
      }
    }],
  };

  return mockShapes[chordName] || [];
}
