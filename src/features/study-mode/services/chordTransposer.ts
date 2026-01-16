/**
 * SERVIÇO DE TRANSPOSIÇÃO
 * Transpõe acordes e cifras automaticamente
 */

import { parseChordSheet, ParseResult } from './chordParser';

/**
 * Notas na ordem cromática
 */
const CHROMATIC_SCALE = [
  'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
];

/**
 * Mapeamento enarmônico (notas equivalentes)
 */
const ENHARMONIC_MAP: Record<string, string> = {
  'Db': 'C#',
  'D#': 'Eb',
  'Gb': 'F#',
  'G#': 'Ab',
  'A#': 'Bb',
};

/**
 * Normaliza nota para a escala cromática
 */
function normalizeNote(note: string): string {
  // Remove acidentes duplos e normaliza
  const normalized = ENHARMONIC_MAP[note] || note;

  // Verifica se está na escala
  if (!CHROMATIC_SCALE.includes(normalized)) {
    console.warn(`Nota inválida: ${note}, usando C como padrão`);
    return 'C';
  }

  return normalized;
}

/**
 * Transpõe uma nota por N semitons
 */
export function transposeNote(note: string, semitones: number): string {
  const normalized = normalizeNote(note);
  const currentIndex = CHROMATIC_SCALE.indexOf(normalized);

  if (currentIndex === -1) {
    console.error(`Nota não encontrada na escala: ${note}`);
    return note;
  }

  // Calcula novo índice (módulo 12 para circular)
  let newIndex = (currentIndex + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return CHROMATIC_SCALE[newIndex];
}

/**
 * Transpõe um acorde completo
 */
export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;

  // Extrai componentes do acorde: raiz, qualidade, baixo
  const match = chord.match(/^([A-G][b#]?)(.*?)(\/([A-G][b#]?))?$/);

  if (!match) {
    console.warn(`Formato de acorde inválido: ${chord}`);
    return chord;
  }

  const [, root, quality = '', , bass] = match;

  // Transpõe a raiz
  const newRoot = transposeNote(root, semitones);

  // Transpõe o baixo se houver
  const newBass = bass ? transposeNote(bass, semitones) : null;

  // Reconstrói o acorde
  let transposed = newRoot + quality;
  if (newBass) {
    transposed += '/' + newBass;
  }

  return transposed;
}

/**
 * Transpõe um texto cifrado completo
 */
export function transposeChordSheet(text: string, semitones: number): string {
  if (semitones === 0) return text;

  // Faz parsing do texto
  const parsed = parseChordSheet(text);

  // Cria mapa de substituições
  const replacements = new Map<string, string>();
  parsed.allChords.forEach(chord => {
    if (!replacements.has(chord.original)) {
      const transposed = transposeChord(chord.normalized, semitones);
      replacements.set(chord.original, transposed);
    }
  });

  // Substitui os acordes no texto original
  let result = text;

  // Ordena por tamanho decrescente para evitar substituições parciais
  const sortedReplacements = Array.from(replacements.entries())
    .sort(([a], [b]) => b.length - a.length);

  sortedReplacements.forEach(([original, transposed]) => {
    // Usa regex com word boundaries para match exato
    const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    result = result.replace(regex, transposed);
  });

  return result;
}

/**
 * Calcula a diferença de semitons entre duas tonalidades
 */
export function getSemitonesBetween(fromKey: string, toKey: string): number {
  const fromIndex = CHROMATIC_SCALE.indexOf(normalizeNote(fromKey));
  const toIndex = CHROMATIC_SCALE.indexOf(normalizeNote(toKey));

  if (fromIndex === -1 || toIndex === -1) {
    return 0;
  }

  let diff = toIndex - fromIndex;

  // Normaliza para o menor caminho (-6 a +6)
  if (diff > 6) diff -= 12;
  if (diff < -6) diff += 12;

  return diff;
}

/**
 * Lista todas as tonalidades possíveis
 */
export function getAllKeys(): string[] {
  return [...CHROMATIC_SCALE];
}

/**
 * Retorna nomes amigáveis para intervalos de transposição
 */
export function getTranspositionLabel(semitones: number): string {
  const labels: Record<number, string> = {
    0: 'Original',
    1: '+1 semitom (meio tom acima)',
    2: '+2 semitons (1 tom acima)',
    3: '+3 semitons (1 tom e meio acima)',
    4: '+4 semitons (2 tons acima)',
    5: '+5 semitons (2 tons e meio acima)',
    6: '+6 semitons (3 tons acima / trítono)',
    7: '+7 semitons (3 tons e meio acima)',
    8: '+8 semitons (4 tons acima)',
    9: '+9 semitons (4 tons e meio acima)',
    10: '+10 semitons (5 tons acima)',
    11: '+11 semitons (5 tons e meio acima)',
    12: '+1 oitava (12 semitons)',
    '-1': '-1 semitom (meio tom abaixo)',
    '-2': '-2 semitons (1 tom abaixo)',
    '-3': '-3 semitons (1 tom e meio abaixo)',
    '-4': '-4 semitons (2 tons abaixo)',
    '-5': '-5 semitons (2 tons e meio abaixo)',
    '-6': '-6 semitons (3 tons abaixo / trítono)',
    '-7': '-7 semitons (3 tons e meio abaixo)',
    '-8': '-8 semitons (4 tons abaixo)',
    '-9': '-9 semitons (4 tons e meio abaixo)',
    '-10': '-10 semitons (5 tons abaixo)',
    '-11': '-11 semitons (5 tons e meio abaixo)',
    '-12': '-1 oitava (12 semitons)',
  };

  return labels[semitones] || `${semitones > 0 ? '+' : ''}${semitones} semitons`;
}

/**
 * Interface para resultado de transposição
 */
export interface TranspositionResult {
  originalText: string;
  transposedText: string;
  semitones: number;
  originalKey?: string;
  newKey?: string;
  label: string;
}

/**
 * Função completa de transposição com metadados
 */
export function performTransposition(
  text: string,
  semitones: number
): TranspositionResult {
  // Parse do texto original
  const originalParsed = parseChordSheet(text);

  // Transpõe o texto
  const transposedText = transposeChordSheet(text, semitones);

  // Parse do texto transposto
  const transposedParsed = parseChordSheet(transposedText);

  // Calcula nova tonalidade
  const newKey = originalParsed.key
    ? transposeNote(originalParsed.key.replace('m', ''), semitones) +
      (originalParsed.key.includes('m') ? 'm' : '')
    : undefined;

  return {
    originalText: text,
    transposedText,
    semitones,
    originalKey: originalParsed.key,
    newKey,
    label: getTranspositionLabel(semitones),
  };
}
