// Notas musicais em ordem cromática
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Tons que preferem bemóis (flat) em vez de sustenidos (sharp)
const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];

// Mapa de conversão entre sustenidos e bemóis
const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
};

const SHARP_TO_FLAT: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
};

/**
 * Normaliza uma nota para usar sustenidos
 */
const normalizeNote = (note: string): string => {
  return FLAT_TO_SHARP[note] || note;
};

export const formatNoteForDisplay = (note: string): string => {
  return FLAT_TO_SHARP[note] || note;
};

/**
 * Obtém o índice de uma nota na escala cromática
 */
const getNoteIndex = (note: string): number => {
  const normalized = normalizeNote(note);
  return NOTES.indexOf(normalized);
};

/**
 * Transpõe uma nota individual, escolhendo entre bemol e sustenido baseado no tom de destino
 */
const transposeNote = (note: string, semitones: number, targetKey?: string): string => {
  const noteIndex = getNoteIndex(note);
  if (noteIndex === -1) return note;

  const newIndex = (noteIndex + semitones + 12) % 12;

  // Escolhe entre bemol e sustenido baseado no tom de destino
  const useFlats = targetKey && FLAT_KEYS.includes(targetKey);
  const newNote = useFlats ? NOTES_FLAT[newIndex] : NOTES[newIndex];

  return newNote;
};

/**
 * Extrai a nota base de um acorde (ex: "Am7" -> "A", "C#m" -> "C#", "D9(11)" -> "D")
 */
const extractBaseNote = (chord: string): { baseNote: string; suffix: string } => {
  // Captura nota base (A-G) + acidente opcional (# ou b)
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return { baseNote: chord, suffix: '' };

  return {
    baseNote: match[1],
    suffix: match[2]
  };
};

/**
 * Transpõe um acorde completo
 */
export const transposeChord = (chord: string, semitones: number, targetKey?: string): string => {
  const { baseNote, suffix } = extractBaseNote(chord);
  const transposedNote = transposeNote(baseNote, semitones, targetKey);
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
export const transposeLine = (line: string, semitones: number, targetKey?: string): string => {
  // Regex melhorado para capturar acordes complexos:
  // - Nota base: A-G
  // - Acidentes: # ou b (opcional)
  // - Qualidade: m, maj, min, dim, aug, sus, add (opcional)
  // - Extensões: números como 7, 9, 11, 13 (opcional)
  // - Extensões complexas: (9), (11), (add9), etc (opcional)
  // - Baixo invertido: /[A-G][#b]? (opcional)
  const chordRegex = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\([^)]+\))?(?:\/[A-G][#b]?)?)\b/g;

  return line.replace(chordRegex, (match) => {
    // Se o acorde tem uma barra (ex: C/G), transpõe ambas as partes
    if (match.includes('/')) {
      const [chord, bass] = match.split('/');
      const transposedChord = transposeChord(chord, semitones, targetKey);
      const transposedBass = transposeChord(bass, semitones, targetKey);
      return `${transposedChord}/${transposedBass}`;
    }

    return transposeChord(match, semitones, targetKey);
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

    // Para as demais linhas, transpõe normalmente passando o tom de destino
    return transposeLine(line, semitones, toKey);
  }).join('\n');
};

/**
 * Mapa de conversão de tons menores para seus relativos maiores
 */
const MINOR_TO_RELATIVE_MAJOR: Record<string, string> = {
  'Am': 'C',
  'A#m': 'C#',
  'Bbm': 'C#',
  'Bm': 'D',
  'Cm': 'D#',
  'C#m': 'E',
  'Dbm': 'E',
  'Dm': 'F',
  'D#m': 'F#',
  'Ebm': 'F#',
  'Em': 'G',
  'Fm': 'G#',
  'F#m': 'A',
  'Gbm': 'A',
  'Gm': 'A#',
  'G#m': 'B',
  'Abm': 'B'
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
 * Lista de todos os tons disponíveis
 */
export const AVAILABLE_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
