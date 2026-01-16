/**
 * Extrai acordes de uma cifra e busca diagramas no Cifra Club
 */

interface ChordDiagram {
  chord_name: string;
  full_name: string;
  quality: string;
  root_note: string;
  notes: string[];
  caged_shapes: any;
  keyboard_voicings: any;
  generated_by: string;
  verified: boolean;
}

/**
 * Extrai acordes únicos de uma cifra
 */
export function extractUniqueChords(cifraContent: string): string[] {
  const chordRegex = /\b([A-G][#b]?(?:m|maj|dim|aug|sus)?[0-9]?(?:\/[A-G][#b]?)?)\b/g;
  const matches = cifraContent.match(chordRegex) || [];

  // Remove duplicatas e retorna lista única
  const uniqueChords = [...new Set(matches)];

  console.log(`[Chord Extractor] Encontrados ${uniqueChords.length} acordes únicos:`, uniqueChords);

  return uniqueChords;
}

/**
 * Busca diagramas de um acorde no dicionário do Cifra Club
 */
export async function fetchChordDiagrams(chordName: string): Promise<any[] | null> {
  try {
    // Normaliza o nome do acorde para a URL
    const normalizedChord = normalizeChordForUrl(chordName);

    // URL do dicionário de acordes do Cifra Club
    const url = `https://www.cifraclub.com.br/dicionario-acordes/${normalizedChord}/`;

    console.log(`[Chord Extractor] Buscando diagramas de ${chordName} em: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`[Chord Extractor] Erro ao buscar ${chordName}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extrai os diagramas do HTML
    const diagrams = extractDiagramsFromHTML(html, chordName);

    console.log(`[Chord Extractor] Encontrados ${diagrams.length} diagramas para ${chordName}`);

    return diagrams;
  } catch (error) {
    console.error(`[Chord Extractor] Erro ao buscar diagrama de ${chordName}:`, error);
    return null;
  }
}

/**
 * Normaliza nome do acorde para URL do Cifra Club
 */
function normalizeChordForUrl(chord: string): string {
  return chord
    .replace(/#/g, '%23')
    .replace(/\//g, '-')
    .toLowerCase();
}

/**
 * Extrai diagramas do HTML do dicionário do Cifra Club
 */
function extractDiagramsFromHTML(html: string, chordName: string): any[] {
  const diagrams: any[] = [];

  try {
    // O Cifra Club usa um padrão específico para os diagramas
    // Procura por elementos <li> com classe "item-list" que contém os dados do diagrama
    const diagramPattern = /<li[^>]*class="[^"]*item-list[^"]*"[^>]*data-diagram='({[^']+})'[^>]*>/g;

    let match;
    while ((match = diagramPattern.exec(html)) !== null) {
      try {
        const diagramData = JSON.parse(match[1]);
        diagrams.push(parseDiagramData(diagramData, chordName));
      } catch (e) {
        console.error('[Chord Extractor] Erro ao parsear diagrama:', e);
      }
    }

    // Fallback: tenta extrair do script JSON embarcado
    if (diagrams.length === 0) {
      const scriptPattern = /var\s+positions\s*=\s*(\[[\s\S]*?\]);/;
      const scriptMatch = html.match(scriptPattern);

      if (scriptMatch) {
        try {
          const positions = JSON.parse(scriptMatch[1]);
          positions.forEach((pos: any) => {
            diagrams.push(parseDiagramData(pos, chordName));
          });
        } catch (e) {
          console.error('[Chord Extractor] Erro ao parsear positions:', e);
        }
      }
    }
  } catch (error) {
    console.error('[Chord Extractor] Erro ao extrair diagramas:', error);
  }

  return diagrams;
}

/**
 * Converte dados do diagrama do Cifra Club para nosso formato
 */
function parseDiagramData(data: any, chordName: string): any {
  const frets = data.frets || data.positions || '';
  const fingers = data.fingers || '';
  const baseFret = data.baseFret || data.capo || 1;

  // Converte formato de string (ex: "x32010") para array de notas
  const notes = convertFretsToNotes(frets, fingers, baseFret);

  return {
    name: `${chordName} (${data.shapeName || 'Variação'})`,
    baseFret,
    notes,
    barre: detectBarre(frets, fingers, baseFret),
  };
}

/**
 * Converte string de trastes para array de notas
 */
function convertFretsToNotes(frets: string, fingers: string, baseFret: number): any[] {
  const notes = [];

  for (let i = 0; i < frets.length && i < 6; i++) {
    const fretChar = frets[i];
    const fingerChar = fingers[i] || '0';

    if (fretChar === 'x' || fretChar === 'X') {
      notes.push({ string: 6 - i, fret: -1 });
    } else {
      const fretNum = parseInt(fretChar);
      const fingerNum = parseInt(fingerChar);

      if (!isNaN(fretNum)) {
        notes.push({
          string: 6 - i,
          fret: fretNum === 0 ? 0 : baseFret + fretNum - 1,
          finger: fingerNum > 0 ? fingerNum : undefined,
        });
      }
    }
  }

  return notes;
}

/**
 * Detecta pestana (barre) no acorde
 */
function detectBarre(frets: string, fingers: string, baseFret: number): any | undefined {
  const fingerCounts: Record<string, number[]> = {};

  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    if (finger !== '0' && finger !== 'x' && finger !== 'X') {
      if (!fingerCounts[finger]) {
        fingerCounts[finger] = [];
      }
      fingerCounts[finger].push(6 - i);
    }
  }

  for (const [finger, strings] of Object.entries(fingerCounts)) {
    if (strings.length >= 2) {
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
 * Salva acordes no banco de dados
 */
export async function saveChordsToDB(
  supabaseClient: any,
  chords: string[],
  churchId: string
): Promise<{ saved: number; errors: number }> {
  let saved = 0;
  let errors = 0;

  console.log(`[Chord Extractor] Salvando ${chords.length} acordes no banco...`);

  for (const chordName of chords) {
    try {
      // Verifica se já existe no banco
      const { data: existing } = await supabaseClient
        .from('chord_diagrams')
        .select('chord_name')
        .eq('chord_name', chordName)
        .single();

      if (existing) {
        console.log(`[Chord Extractor] Acorde ${chordName} já existe, pulando...`);
        continue;
      }

      // Busca diagramas no Cifra Club
      const diagrams = await fetchChordDiagrams(chordName);

      if (!diagrams || diagrams.length === 0) {
        console.warn(`[Chord Extractor] Nenhum diagrama encontrado para ${chordName}`);
        errors++;
        continue;
      }

      // Converte para formato CAGED
      const cagedShapes: any = {};
      const shapeNames = ['C', 'A', 'G', 'E', 'D'];

      diagrams.slice(0, 5).forEach((diagram, index) => {
        cagedShapes[shapeNames[index] || `V${index + 1}`] = diagram;
      });

      // Prepara dados para salvar
      const chordData: ChordDiagram = {
        chord_name: chordName,
        full_name: getFullChordName(chordName),
        quality: getChordQuality(chordName),
        root_note: getRootNote(chordName),
        notes: extractChordNotes(chordName),
        caged_shapes: cagedShapes,
        keyboard_voicings: { root: { notes: [], inversion: 0 } },
        generated_by: 'cifraclub',
        verified: true,
      };

      // Salva no banco
      const { error } = await supabaseClient
        .from('chord_diagrams')
        .insert(chordData);

      if (error) {
        console.error(`[Chord Extractor] Erro ao salvar ${chordName}:`, error.message);
        errors++;
      } else {
        console.log(`[Chord Extractor] ✅ Acorde ${chordName} salvo com sucesso`);
        saved++;
      }

      // Delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`[Chord Extractor] Erro ao processar ${chordName}:`, error);
      errors++;
    }
  }

  console.log(`[Chord Extractor] Processamento concluído: ${saved} salvos, ${errors} erros`);

  return { saved, errors };
}

// Funções auxiliares
function getFullChordName(chord: string): string {
  if (chord.includes('maj7')) return `${chord.replace('maj7', '')} Major 7th`;
  if (chord.includes('m7')) return `${chord.replace('m7', '')} minor 7th`;
  if (chord.includes('7')) return `${chord.replace('7', '')} Dominant 7th`;
  if (chord.includes('m')) return `${chord.replace('m', '')} minor`;
  return `${chord} Major`;
}

function getChordQuality(chord: string): string {
  if (chord.includes('maj7')) return 'major7';
  if (chord.includes('m7')) return 'minor7';
  if (chord.includes('7')) return 'dominant7';
  if (chord.includes('m')) return 'minor';
  if (chord.includes('dim')) return 'diminished';
  if (chord.includes('aug')) return 'augmented';
  if (chord.includes('sus')) return 'sus4';
  return 'major';
}

function getRootNote(chord: string): string {
  const match = chord.match(/^([A-G][#b]?)/);
  return match ? match[1] : chord[0];
}

function extractChordNotes(chord: string): string[] {
  // Simplificado - retorna apenas a raiz
  return [getRootNote(chord)];
}
