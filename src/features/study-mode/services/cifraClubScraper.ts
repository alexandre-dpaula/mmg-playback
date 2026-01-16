/**
 * Scraper para buscar diagramas de acordes do Cifra Club
 * Usa a API pública do site para obter variações de acordes
 */

import { GuitarChord } from "../types";

// Base URL da API do Cifra Club
const CIFRA_CLUB_API = "https://www.cifraclub.com.br";

interface CifraClubChordVariation {
  id: number;
  name: string;
  frets: string; // Exemplo: "x32010" (x = mutado, números = casas)
  fingers: string; // Exemplo: "032010" (0 = sem dedo, 1-4 = dedos)
  baseFret: number;
  variations?: CifraClubChordVariation[];
}

interface CifraClubResponse {
  chord: string;
  variations: CifraClubChordVariation[];
}

/**
 * Busca variações de um acorde no Cifra Club
 */
export async function fetchCifraClubChord(chordName: string): Promise<GuitarChord[] | null> {
  try {
    // Normaliza o nome do acorde para o formato do Cifra Club
    const normalizedChord = normalizeChordName(chordName);

    console.log(`[Cifra Club] Buscando variações de: ${normalizedChord}`);

    // URL da API do Cifra Club (endpoint de acordes)
    const url = `${CIFRA_CLUB_API}/acordes/${normalizedChord}`;

    // Faz a requisição
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ChordLibrary/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`[Cifra Club] Erro ao buscar acorde: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extrai os diagramas do HTML (Cifra Club retorna HTML com dados em JSON embarcados)
    const variations = extractChordVariationsFromHTML(html, chordName);

    console.log(`[Cifra Club] Encontradas ${variations.length} variações`);

    return variations;
  } catch (error) {
    console.error('[Cifra Club] Erro ao buscar acorde:', error);
    return null;
  }
}

/**
 * Normaliza o nome do acorde para o formato aceito pelo Cifra Club
 */
function normalizeChordName(chord: string): string {
  // Cifra Club usa maiúsculas e alguns símbolos específicos
  return chord
    .replace(/maj7/gi, '7M')
    .replace(/m7/gi, 'm7')
    .replace(/dim/gi, 'dim')
    .replace(/aug/gi, 'aug')
    .replace(/sus4/gi, 'sus4')
    .replace(/sus2/gi, 'sus2')
    .replace(/add9/gi, 'add9')
    .replace(/#/g, '%23') // Encode # para URL
    .replace(/b/g, 'b');
}

/**
 * Extrai variações de acordes do HTML do Cifra Club
 */
function extractChordVariationsFromHTML(html: string, chordName: string): GuitarChord[] {
  const variations: GuitarChord[] = [];

  try {
    // Regex para encontrar dados de acordes no HTML
    // O Cifra Club embarca os dados em tags <div data-chord="...">
    const chordRegex = /data-chord="([^"]+)"/g;
    const matches = html.matchAll(chordRegex);

    let index = 0;
    for (const match of matches) {
      try {
        const chordData = JSON.parse(match[1]);
        const guitarChord = convertCifraClubToGuitarChord(chordData, chordName, index);
        if (guitarChord) {
          variations.push(guitarChord);
          index++;
        }
      } catch (e) {
        // Ignora erros de parsing individuais
        continue;
      }
    }

    // Se não encontrou via regex, tenta buscar no script JSON
    if (variations.length === 0) {
      const scriptRegex = /<script[^>]*>(.*?window\.__INITIAL_STATE__\s*=\s*({.*?});.*?)<\/script>/s;
      const scriptMatch = html.match(scriptRegex);

      if (scriptMatch) {
        try {
          const stateJson = scriptMatch[2];
          const state = JSON.parse(stateJson);

          // Navega pelo objeto para encontrar as variações
          if (state.chord?.variations) {
            state.chord.variations.forEach((variation: any, idx: number) => {
              const guitarChord = convertCifraClubToGuitarChord(variation, chordName, idx);
              if (guitarChord) {
                variations.push(guitarChord);
              }
            });
          }
        } catch (e) {
          console.error('[Cifra Club] Erro ao parsear state:', e);
        }
      }
    }
  } catch (error) {
    console.error('[Cifra Club] Erro ao extrair variações:', error);
  }

  return variations;
}

/**
 * Converte formato do Cifra Club para o nosso GuitarChord
 */
function convertCifraClubToGuitarChord(
  cifraData: any,
  chordName: string,
  index: number
): GuitarChord | null {
  try {
    const frets = cifraData.frets || cifraData.positions || '';
    const fingers = cifraData.fingers || '';
    const baseFret = cifraData.baseFret || cifraData.capo || 1;

    // Converte string de trastes (ex: "x32010") para nosso formato
    const notes = convertFretsToNotes(frets, fingers, baseFret);

    if (notes.length === 0) return null;

    return {
      name: `${chordName} (Var. ${index + 1})`,
      baseFret,
      notes,
      barre: detectBarre(frets, fingers, baseFret),
    };
  } catch (error) {
    console.error('[Cifra Club] Erro ao converter acorde:', error);
    return null;
  }
}

/**
 * Converte string de trastes do Cifra Club para nosso formato de notas
 */
function convertFretsToNotes(
  frets: string,
  fingers: string,
  baseFret: number
): Array<{ string: number; fret: number; finger?: number }> {
  const notes = [];

  // Cifra Club usa formato de 6 caracteres, um por corda (da mais aguda para a mais grave)
  // Exemplo: "x32010" = corda 6 mutada, corda 5 = casa 3, etc.

  for (let i = 0; i < frets.length && i < 6; i++) {
    const fretChar = frets[i];
    const fingerChar = fingers[i] || '0';

    if (fretChar === 'x' || fretChar === 'X') {
      // Corda mutada
      notes.push({ string: 6 - i, fret: -1 });
    } else {
      const fretNum = parseInt(fretChar);
      const fingerNum = parseInt(fingerChar);

      if (!isNaN(fretNum)) {
        const actualFret = fretNum === 0 ? 0 : baseFret + fretNum - 1;
        notes.push({
          string: 6 - i,
          fret: actualFret,
          finger: fingerNum > 0 ? fingerNum : undefined,
        });
      }
    }
  }

  return notes;
}

/**
 * Detecta se há pestana (barre) no acorde
 */
function detectBarre(
  frets: string,
  fingers: string,
  baseFret: number
): { fret: number; fromString: number; toString: number } | undefined {
  // Verifica se há dedos repetidos (indica pestana)
  const fingerCounts: Record<string, number[]> = {};

  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    if (finger !== '0' && finger !== 'x' && finger !== 'X') {
      if (!fingerCounts[finger]) {
        fingerCounts[finger] = [];
      }
      fingerCounts[finger].push(6 - i); // número da corda
    }
  }

  // Procura por dedo que aparece em múltiplas cordas consecutivas
  for (const [finger, strings] of Object.entries(fingerCounts)) {
    if (strings.length >= 2) {
      // Há pestana!
      const fromString = Math.min(...strings);
      const toString = Math.max(...strings);
      const fretIndex = fingers.indexOf(finger);
      const fretNum = parseInt(frets[fretIndex]);

      return {
        fret: fretNum === 0 ? 0 : baseFret + fretNum - 1,
        fromString,
        toString,
      };
    }
  }

  return undefined;
}

/**
 * Busca e cacheia acordes do Cifra Club para uso offline
 */
export async function preloadCifraClubChords(chordNames: string[]): Promise<Map<string, GuitarChord[]>> {
  const cache = new Map<string, GuitarChord[]>();

  console.log(`[Cifra Club] Pré-carregando ${chordNames.length} acordes...`);

  for (const chordName of chordNames) {
    const variations = await fetchCifraClubChord(chordName);
    if (variations && variations.length > 0) {
      cache.set(chordName, variations);
      console.log(`[Cifra Club] ✅ ${chordName}: ${variations.length} variações`);
    } else {
      console.log(`[Cifra Club] ⚠️  ${chordName}: nenhuma variação encontrada`);
    }

    // Delay para não sobrecarregar o servidor
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`[Cifra Club] Pré-carregamento concluído! ${cache.size}/${chordNames.length} acordes`);

  return cache;
}
