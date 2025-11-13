// Notas musicais em ordem cromática
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapa de conversão entre sustenidos e bemóis
const SHARP_TO_FLAT: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
};

const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
};

/**
 * Normaliza uma nota para usar sustenidos
 */
const normalizeNote = (note: string): string => {
  return FLAT_TO_SHARP[note] || note;
};

const formatNoteForDisplay = (note: string): string => {
  return SHARP_TO_FLAT[note] || note;
};

/**
 * Obtém o índice de uma nota na escala cromática
 */
const getNoteIndex = (note: string): number => {
  const normalized = normalizeNote(note);
  return NOTES.indexOf(normalized);
};

/**
 * Transpõe uma nota individual
 */
const transposeNote = (note: string, semitones: number): string => {
  const noteIndex = getNoteIndex(note);
  if (noteIndex === -1) return note;

  const newIndex = (noteIndex + semitones + 12) % 12;
  return NOTES[newIndex];
};

/**
 * Extrai a nota base de um acorde (ex: "Am7" -> "A", "C#m" -> "C#")
 */
const extractBaseNote = (chord: string): { baseNote: string; suffix: string } => {
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
export const transposeChord = (chord: string, semitones: number): string => {
  const { baseNote, suffix } = extractBaseNote(chord);
  const transposedNote = transposeNote(baseNote, semitones);
  const formattedNote = formatNoteForDisplay(transposedNote);
  return formattedNote + suffix;
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
  // Regex para encontrar acordes musicais
  const chordRegex = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g;

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
 * Lista de todos os tons disponíveis
 */
export const AVAILABLE_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
