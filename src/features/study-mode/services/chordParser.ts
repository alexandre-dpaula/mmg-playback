/**
 * PARSER DE CIFRAS
 * Detecta e extrai acordes de textos cifrados
 * Suporta todos os 156 acordes da biblioteca + variações
 */

export interface ParsedChord {
  original: string;      // Texto original (ex: "C#m7(b5)")
  normalized: string;    // Nome normalizado (ex: "C#m7")
  root: string;          // Nota fundamental (ex: "C#")
  quality: string;       // Qualidade do acorde (ex: "m7")
  position: number;      // Posição no texto
  line: number;          // Linha no texto
}

export interface ParsedLine {
  type: 'chord' | 'lyric' | 'empty';
  content: string;
  chords?: ParsedChord[];
  lineNumber: number;
}

export interface ParseResult {
  lines: ParsedLine[];
  allChords: ParsedChord[];
  uniqueChords: string[];
  key?: string;
}

/**
 * Mapeamento de variações de notação para formato padrão
 */
const NOTATION_MAP: Record<string, string> = {
  // Sustenidos
  'C#': 'C#', 'Db': 'Db',
  'D#': 'Eb', 'Eb': 'Eb',
  'E#': 'F',
  'F#': 'F#', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'Ab',
  'A#': 'Bb', 'Bb': 'Bb',
  'B#': 'C',

  // Naturais
  'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B',
};

/**
 * Regex principal para detectar acordes
 * Suporta: C, C#, Db, Cm, C7, Cmaj7, Cm7, C°, C+, Csus4, C6, C9, Cadd9, etc.
 */
const CHORD_REGEX = /\b([A-G][b#]?)(maj7|min7|m7|maj|min|m|dim|aug|sus2|sus4|add9|add|°|\+|7|6|9|5)?(\/[A-G][b#]?)?\b/gi;

/**
 * Mapeamento de qualidades de acordes para formato padrão
 */
const QUALITY_MAP: Record<string, string> = {
  // Maior
  'M': '', 'maj': '', 'major': '',

  // Menor
  'm': 'm', 'min': 'm', 'minor': 'm', '-': 'm',

  // Sétimas
  '7': '7',
  'maj7': 'maj7', 'M7': 'maj7', 'Δ7': 'maj7',
  'm7': 'm7', 'min7': 'm7', '-7': 'm7',

  // Diminuto/Aumentado
  'dim': '°', '°': '°', 'o': '°',
  'aug': '+', '+': '+',

  // Suspensas
  'sus2': 'sus2', 'sus4': 'sus4', 'sus': 'sus4',

  // Sextas
  '6': '6',
  'm6': 'm6', 'min6': 'm6',

  // Nonas
  '9': '9',
  'add9': 'add9',

  // Quinta
  '5': '5',
};

/**
 * Normaliza um acorde para o formato da biblioteca
 */
function normalizeChord(chordText: string): string {
  // Remove espaços
  let normalized = chordText.trim();

  // Extrai componentes
  const match = normalized.match(/^([A-G][b#]?)(.*?)(\/[A-G][b#]?)?$/i);
  if (!match) return normalized;

  let [, root, quality, bass] = match;

  // Normaliza a raiz
  root = NOTATION_MAP[root] || root;

  // Normaliza a qualidade
  const qualityLower = quality.toLowerCase();
  const mappedQuality = QUALITY_MAP[qualityLower] || quality;

  // Reconstrói o acorde
  normalized = root + mappedQuality;

  // Adiciona baixo se houver
  if (bass) {
    const bassNote = NOTATION_MAP[bass.slice(1)] || bass.slice(1);
    normalized += '/' + bassNote;
  }

  return normalized;
}

/**
 * Detecta se uma linha contém cifras
 */
function isChordLine(line: string): boolean {
  // Remove espaços
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Conta acordes na linha
  const matches = line.match(CHORD_REGEX);
  if (!matches || matches.length === 0) return false;

  // Se mais de 30% da linha são acordes, considera linha de cifra
  const chordChars = matches.join('').length;
  const totalChars = trimmed.replace(/\s/g, '').length;

  return chordChars / totalChars > 0.3;
}

/**
 * Extrai acordes de uma linha
 */
function extractChords(line: string, lineNumber: number): ParsedChord[] {
  const chords: ParsedChord[] = [];
  let match;

  // Reset regex
  CHORD_REGEX.lastIndex = 0;

  while ((match = CHORD_REGEX.exec(line)) !== null) {
    const original = match[0];
    const normalized = normalizeChord(original);
    const root = match[1];
    const quality = match[2] || '';

    chords.push({
      original,
      normalized,
      root: NOTATION_MAP[root] || root,
      quality: QUALITY_MAP[quality.toLowerCase()] || quality,
      position: match.index,
      line: lineNumber,
    });
  }

  return chords;
}

/**
 * Detecta a tonalidade da música (heurística simples)
 */
function detectKey(chords: ParsedChord[]): string | undefined {
  if (chords.length === 0) return undefined;

  // Conta frequência de cada raiz
  const rootCounts: Record<string, number> = {};
  chords.forEach(chord => {
    rootCounts[chord.root] = (rootCounts[chord.root] || 0) + 1;
  });

  // Raiz mais frequente é provavelmente a tônica
  const sortedRoots = Object.entries(rootCounts)
    .sort(([, a], [, b]) => b - a);

  if (sortedRoots.length > 0) {
    const [mostCommonRoot] = sortedRoots[0];

    // Se há acordes menores dessa raiz, provavelmente tom menor
    const hasMinor = chords.some(
      c => c.root === mostCommonRoot && c.quality.includes('m')
    );

    return hasMinor ? `${mostCommonRoot}m` : mostCommonRoot;
  }

  return undefined;
}

/**
 * Função principal: faz parsing de texto cifrado
 */
export function parseChordSheet(text: string): ParseResult {
  const lines: ParsedLine[] = [];
  const allChords: ParsedChord[] = [];
  const uniqueChordsSet = new Set<string>();

  // Divide em linhas
  const textLines = text.split('\n');

  textLines.forEach((lineText, index) => {
    const lineNumber = index + 1;
    const trimmed = lineText.trim();

    // Linha vazia
    if (!trimmed) {
      lines.push({
        type: 'empty',
        content: '',
        lineNumber,
      });
      return;
    }

    // Verifica se é linha de cifras
    if (isChordLine(lineText)) {
      const chords = extractChords(lineText, lineNumber);

      lines.push({
        type: 'chord',
        content: lineText,
        chords,
        lineNumber,
      });

      // Adiciona aos acordes totais
      chords.forEach(chord => {
        allChords.push(chord);
        uniqueChordsSet.add(chord.normalized);
      });
    } else {
      // Linha de letra (pode conter alguns acordes inline)
      const chords = extractChords(lineText, lineNumber);

      if (chords.length > 0) {
        // Letra com cifras inline
        chords.forEach(chord => {
          allChords.push(chord);
          uniqueChordsSet.add(chord.normalized);
        });
      }

      lines.push({
        type: 'lyric',
        content: lineText,
        chords: chords.length > 0 ? chords : undefined,
        lineNumber,
      });
    }
  });

  // Detecta tonalidade
  const key = detectKey(allChords);

  return {
    lines,
    allChords,
    uniqueChords: Array.from(uniqueChordsSet).sort(),
    key,
  };
}

/**
 * Extrai apenas os acordes únicos de um texto
 */
export function extractUniqueChords(text: string): string[] {
  const result = parseChordSheet(text);
  return result.uniqueChords;
}

/**
 * Valida se um texto contém cifras válidas
 */
export function hasValidChords(text: string): boolean {
  const result = parseChordSheet(text);
  return result.allChords.length > 0;
}

/**
 * Retorna estatísticas sobre as cifras
 */
export function getChordStats(text: string) {
  const result = parseChordSheet(text);

  return {
    totalChords: result.allChords.length,
    uniqueChords: result.uniqueChords.length,
    detectedKey: result.key,
    chordLines: result.lines.filter(l => l.type === 'chord').length,
    lyricLines: result.lines.filter(l => l.type === 'lyric').length,
  };
}
