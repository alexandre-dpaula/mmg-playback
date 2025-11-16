// Notas musicais em ordem cromática (apenas estas 12 notas são válidas)
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Mapa de conversão de enarmônicos inválidos para notas válidas
const ENHARMONIC_MAP: Record<string, string> = {
  // Bemóis -> Sustenidos
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',

  // Enarmônicos que não existem
  'E#': 'F',    // E# não existe, é F
  'B#': 'C',    // B# não existe, é C
  'Fb': 'E',    // Fb não existe, é E
  'Cb': 'B',    // Cb não existe, é B

  // Dobrados sustenidos (##) - não existem
  'C##': 'D',
  'D##': 'E',
  'E##': 'F#',
  'F##': 'G',
  'G##': 'A',
  'A##': 'B',
  'B##': 'C#',

  // Dobrados bemóis (bb) - não existem
  'Cbb': 'A#',
  'Dbb': 'C',
  'Ebb': 'D',
  'Fbb': 'D#',
  'Gbb': 'F',
  'Abb': 'G',
  'Bbb': 'A'
};

/**
 * Normaliza uma nota para usar sustenidos e corrige enarmônicos inválidos
 * Converte: Db->C#, E#->F, B#->C, C##->D, etc.
 */
const normalizeNote = (note: string): string => {
  // Primeiro, converte bemóis e enarmônicos inválidos
  const converted = ENHARMONIC_MAP[note] || note;
  // Garante que a nota está no array NOTES
  return NOTES.includes(converted) ? converted : note;
};

export const formatNoteForDisplay = (note: string): string => {
  return normalizeNote(note);
};

/**
 * Obtém o índice de uma nota na escala cromática
 */
const getNoteIndex = (note: string): number => {
  const normalized = normalizeNote(note);
  const index = NOTES.indexOf(normalized);
  return index;
};

/**
 * Transpõe uma nota individual (sempre retorna notas válidas)
 */
const transposeNote = (note: string, semitones: number): string => {
  const noteIndex = getNoteIndex(note);
  if (noteIndex === -1) {
    console.warn(`Nota inválida encontrada: ${note}`);
    return note;
  }

  // Calcula o novo índice (sempre positivo)
  const newIndex = ((noteIndex + semitones) % 12 + 12) % 12;
  const transposedNote = NOTES[newIndex];

  // Verifica se a nota resultante é válida
  if (!transposedNote) {
    console.error(`Erro ao transpor ${note} por ${semitones} semitons`);
    return note;
  }

  return transposedNote;
};

/**
 * Extrai a nota base de um acorde (ex: "Am7" -> "A", "C#m" -> "C#", "D9(11)" -> "D")
 * Também captura notas inválidas como C##, Ebb, etc para depois normalizar
 */
const extractBaseNote = (chord: string): { baseNote: string; suffix: string } => {
  // Captura nota base (A-G) + acidentes opcionais (##, #, bb, b)
  // Ordem: primeiro tenta capturar duplos (## ou bb), depois simples (# ou b)
  const match = chord.match(/^([A-G](?:##|bb|#|b)?)(.*)/);
  if (!match) return { baseNote: chord, suffix: '' };

  return {
    baseNote: match[1],
    suffix: match[2]
  };
};

/**
 * Transpõe um acorde completo
 */
export const transposeChord = (chord: string, semitones: number): string => {
  const { baseNote, suffix } = extractBaseNote(chord);
  const transposedNote = transposeNote(baseNote, semitones);
  return transposedNote + suffix;
};

/**
 * Calcula quantos semitons são necessários para ir de uma nota para outra
 */
export const getSemitoneDifference = (fromKey: string, toKey: string): number => {
  const fromIndex = getNoteIndex(fromKey);
  const toIndex = getNoteIndex(toKey);

  if (fromIndex === -1 || toIndex === -1) return 0;

  return (toIndex - fromIndex + 12) % 12;
};

/**
 * Transpõe todas as cifras em uma linha de texto
 */
export const transposeLine = (line: string, semitones: number): string => {
  // Regex melhorado para capturar acordes complexos:
  // - Nota base: A-G
  // - Acidentes: ##, #, bb, b (opcional) - captura também inválidos para normalizar
  // - Qualidade: m, maj, min, dim, aug, sus, add (opcional)
  // - Extensões: números como 7, 9, 11, 13 (opcional)
  // - Extensões complexas: (9), (11), (add9), etc (opcional)
  // - Baixo invertido: /[A-G][acidentes]? (opcional)
  const chordRegex = /\b([A-G](?:##|bb|#|b)?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\([^)]+\))?(?:\/[A-G](?:##|bb|#|b)?)?)\b/g;

  return line.replace(chordRegex, (match) => {
    // Se o acorde tem uma barra (ex: C/G), transpõe ambas as partes
    if (match.includes('/')) {
      const [chord, bass] = match.split('/');
      const transposedChord = transposeChord(chord, semitones);
      const transposedBass = transposeChord(bass, semitones);
      return `${transposedChord}/${transposedBass}`;
    }

    return transposeChord(match, semitones);
  });
};

/**
 * Transpõe todo o conteúdo de uma cifra
 * IMPORTANTE: O título (primeira linha não vazia) NÃO é transposto e mantém-se sempre em negrito
 */
export const transposeContent = (content: string, fromKey: string, toKey: string): string => {
  const semitones = getSemitoneDifference(fromKey, toKey);

  if (semitones === 0) return content;

  const lines = content.split('\n');
  let firstNonEmptyLineFound = false;

  return lines.map((line) => {
    const trimmed = line.trim();

    // Se é a primeira linha não vazia (título), retorna sem modificar
    if (!firstNonEmptyLineFound && trimmed.length > 0) {
      firstNonEmptyLineFound = true;
      return line; // Título não é transposto
    }

    // Para as demais linhas, transpõe normalmente
    return transposeLine(line, semitones);
  }).join('\n');
};

/**
 * Mapa de conversão de tons menores para seus relativos maiores
 * Aceita tanto bemóis quanto sustenidos, mas sempre retorna sustenidos
 */
const MINOR_TO_RELATIVE_MAJOR: Record<string, string> = {
  'Am': 'C',
  'A#m': 'C#',
  'Bbm': 'C#',  // Converte Bbm para C# (equivalente de A#m)
  'Bm': 'D',
  'Cm': 'D#',
  'C#m': 'E',
  'Dbm': 'E',   // Converte Dbm para E (equivalente de C#m)
  'Dm': 'F',
  'D#m': 'F#',
  'Ebm': 'F#',  // Converte Ebm para F# (equivalente de D#m)
  'Em': 'G',
  'Fm': 'G#',
  'F#m': 'A',
  'Gbm': 'A',   // Converte Gbm para A (equivalente de F#m)
  'Gm': 'A#',
  'G#m': 'B',
  'Abm': 'B'    // Converte Abm para B (equivalente de G#m)
};

/**
 * Converte um tom menor para seu relativo maior
 * Ex: Em -> G, Bm -> D
 */
export const convertMinorToRelativeMajor = (key: string): string => {
  const normalized = key.trim();
  if (!normalized.toLowerCase().includes('m')) return normalized;

  const match = normalized.match(/^([A-G][#b]?)m/i);
  if (!match) return normalized;

  const minorKey = match[1].charAt(0).toUpperCase() + (match[1].charAt(1) || '') + 'm';
  return MINOR_TO_RELATIVE_MAJOR[minorKey] || normalized;
};

/**
 * Lista de todos os tons disponíveis (usando sustenidos)
 */
export const AVAILABLE_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
