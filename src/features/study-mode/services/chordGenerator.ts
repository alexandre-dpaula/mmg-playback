/**
 * Serviço de geração de acordes por IA
 * Usa conhecimento de teoria musical para gerar diagramas convencionais
 */

import { supabase } from "@/lib/supabase";
import { GuitarChord, KeyboardChord } from "../types";
import { ChordData } from "../data/chordLibrary";

// Estrutura de resposta da IA
interface AIChordResponse {
  chordName: string;
  fullName: string;
  quality: string;
  rootNote: string;
  notes: string[];
  cagedShapes: Record<string, GuitarChord>;
  keyboardVoicings: {
    root: KeyboardChord;
    firstInversion?: KeyboardChord;
    secondInversion?: KeyboardChord;
    thirdInversion?: KeyboardChord;
  };
  reharmonizations?: {
    slashChords: string[];
    substitutes: string[];
    parallel: string[];
    relatedDominants: string[];
  };
}

/**
 * Gera um acorde usando IA baseada em teoria musical convencional
 */
export async function generateChordByAI(chordName: string): Promise<ChordData | null> {
  try {
    console.log(`[AI] Gerando acorde: ${chordName}`);

    // Aqui você pode integrar com uma API de IA (Claude, OpenAI, etc.)
    // Por enquanto, vamos usar um sistema baseado em regras de teoria musical
    const aiResponse = await generateChordByRules(chordName);

    if (!aiResponse) {
      console.error(`[AI] Não foi possível gerar o acorde: ${chordName}`);
      return null;
    }

    // Salva no Supabase
    const { data, error } = await supabase
      .from('chord_diagrams')
      .insert({
        chord_name: aiResponse.chordName,
        full_name: aiResponse.fullName,
        quality: aiResponse.quality,
        root_note: aiResponse.rootNote,
        notes: aiResponse.notes,
        caged_shapes: aiResponse.cagedShapes,
        keyboard_voicings: aiResponse.keyboardVoicings,
        reharmonizations: aiResponse.reharmonizations || {},
        generated_by: 'ai',
        verified: false
      })
      .select()
      .single();

    if (error) {
      console.error('[AI] Erro ao salvar acorde:', error);
      return null;
    }

    console.log(`[AI] Acorde ${chordName} gerado e salvo com sucesso`);

    // Converte para ChordData
    return convertDBToChordData(data);
  } catch (error) {
    console.error('[AI] Erro ao gerar acorde:', error);
    return null;
  }
}

/**
 * Busca um acorde salvo no Supabase
 */
export async function fetchChordFromDB(chordName: string): Promise<ChordData | null> {
  try {
    const { data, error } = await supabase
      .from('chord_diagrams')
      .select('*')
      .eq('chord_name', chordName)
      .single();

    if (error || !data) {
      return null;
    }

    return convertDBToChordData(data);
  } catch (error) {
    console.error('[Cache] Erro ao buscar acorde:', error);
    return null;
  }
}

/**
 * Busca ou gera um acorde (cache-first)
 */
export async function getOrGenerateChord(chordName: string): Promise<ChordData | null> {
  // 1. Tenta buscar do cache
  const cached = await fetchChordFromDB(chordName);
  if (cached) {
    console.log(`[Cache] Acorde ${chordName} encontrado no cache`);
    return cached;
  }

  // 2. Se não existe, gera por IA
  console.log(`[Cache] Acorde ${chordName} não encontrado, gerando...`);
  return await generateChordByAI(chordName);
}

/**
 * Gera acorde usando regras de teoria musical convencional
 */
async function generateChordByRules(chordName: string): Promise<AIChordResponse | null> {
  // Parse do nome do acorde
  const parsed = parseChordName(chordName);
  if (!parsed) return null;

  const { root, quality, suffix } = parsed;

  // Gera as notas do acorde
  const notes = generateChordNotes(root, quality);

  // Gera diagramas de violão (CAGED)
  const cagedShapes = generateGuitarShapes(root, quality);

  // Gera voicings de teclado
  const keyboardVoicings = generateKeyboardVoicings(root, notes);

  // Reharmonizações comuns
  const reharmonizations = generateReharmonizations(root, quality);

  return {
    chordName,
    fullName: `${root} ${getQualityFullName(quality)}`,
    quality,
    rootNote: root,
    notes,
    cagedShapes,
    keyboardVoicings,
    reharmonizations
  };
}

/**
 * Parse do nome do acorde (C, Am7, Bb9, etc.)
 */
function parseChordName(chordName: string): { root: string; quality: string; suffix: string } | null {
  const match = chordName.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return null;

  const root = match[1];
  const suffix = match[2];

  // Mapeia sufixo para qualidade
  const qualityMap: Record<string, string> = {
    '': 'major',
    'm': 'minor',
    '7': 'dominant7',
    'maj7': 'major7',
    'm7': 'minor7',
    'dim': 'diminished',
    'aug': 'augmented',
    'sus2': 'sus2',
    'sus4': 'sus4',
    '6': 'major',
    'm6': 'minor',
    '9': 'dominant7',
    'add9': 'major'
  };

  const quality = qualityMap[suffix] || 'major';

  return { root, quality, suffix };
}

/**
 * Gera as notas de um acorde
 */
function generateChordNotes(root: string, quality: string): string[] {
  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Normaliza bemóis para sustenidos
  const normalizedRoot = root.replace('Db', 'C#').replace('Eb', 'D#')
    .replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#');

  const rootIndex = chromatic.indexOf(normalizedRoot);
  if (rootIndex === -1) return [root];

  const getNote = (semitones: number) => chromatic[(rootIndex + semitones) % 12];

  switch (quality) {
    case 'major': return [root, getNote(4), getNote(7)];
    case 'minor': return [root, getNote(3), getNote(7)];
    case 'dominant7': return [root, getNote(4), getNote(7), getNote(10)];
    case 'major7': return [root, getNote(4), getNote(7), getNote(11)];
    case 'minor7': return [root, getNote(3), getNote(7), getNote(10)];
    case 'diminished': return [root, getNote(3), getNote(6)];
    case 'augmented': return [root, getNote(4), getNote(8)];
    case 'sus2': return [root, getNote(2), getNote(7)];
    case 'sus4': return [root, getNote(5), getNote(7)];
    default: return [root, getNote(4), getNote(7)];
  }
}

/**
 * Gera formas CAGED básicas para violão
 */
function generateGuitarShapes(root: string, quality: string): Record<string, GuitarChord> {
  // Por enquanto, retorna forma básica na primeira posição
  // Futuramente pode usar IA mais sofisticada
  return {
    E: {
      name: `${root} (Forma E)`,
      baseFret: 1,
      notes: [
        { string: 1, fret: 0 },
        { string: 2, fret: 0 },
        { string: 3, fret: 1, finger: 1 },
        { string: 4, fret: 2, finger: 3 },
        { string: 5, fret: 2, finger: 2 },
        { string: 6, fret: 0 }
      ]
    }
  };
}

/**
 * Gera voicings de teclado
 */
function generateKeyboardVoicings(root: string, notes: string[]): {
  root: KeyboardChord;
  firstInversion?: KeyboardChord;
  secondInversion?: KeyboardChord;
} {
  return {
    root: {
      notes: notes.map((n, i) => `${n}${i === 0 ? '4' : '4'}`),
      inversion: 0
    },
    firstInversion: notes.length > 2 ? {
      notes: [
        `${notes[1]}4`,
        `${notes[2]}4`,
        `${notes[0]}5`
      ],
      inversion: 1
    } : undefined,
    secondInversion: notes.length > 2 ? {
      notes: [
        `${notes[2]}4`,
        `${notes[0]}5`,
        `${notes[1]}5`
      ],
      inversion: 2
    } : undefined
  };
}

/**
 * Gera reharmonizações comuns
 */
function generateReharmonizations(root: string, quality: string) {
  return {
    slashChords: [],
    substitutes: [],
    parallel: [],
    relatedDominants: []
  };
}

/**
 * Nome completo da qualidade
 */
function getQualityFullName(quality: string): string {
  const map: Record<string, string> = {
    'major': 'Major',
    'minor': 'minor',
    'dominant7': 'Dominant 7th',
    'major7': 'Major 7th',
    'minor7': 'minor 7th',
    'diminished': 'Diminished',
    'augmented': 'Augmented',
    'sus2': 'Suspended 2nd',
    'sus4': 'Suspended 4th'
  };
  return map[quality] || 'Major';
}

/**
 * Converte dados do DB para ChordData
 */
function convertDBToChordData(dbData: any): ChordData {
  return {
    name: dbData.chord_name,
    fullName: dbData.full_name,
    quality: dbData.quality,
    notes: dbData.notes,
    root: dbData.root_note,
    cagedShapes: dbData.caged_shapes,
    keyboardVoicings: dbData.keyboard_voicings,
    reharmonizations: dbData.reharmonizations || {
      slashChords: [],
      substitutes: [],
      parallel: [],
      relatedDominants: []
    }
  };
}
