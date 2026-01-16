/**
 * Script para gerar todos os 156 acordes e salvar no Supabase
 * Execute: npx tsx scripts/generate-all-chords.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ES module equivalentes de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  console.error('Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================
// TEORIA MUSICAL
// =============================================

const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const CHORD_QUALITIES: Record<string, {
  suffix: string;
  fullName: string;
  quality: string;
  intervals: number[];
}> = {
  "major": { suffix: "", fullName: "Major", quality: "major", intervals: [0, 4, 7] },
  "minor": { suffix: "m", fullName: "minor", quality: "minor", intervals: [0, 3, 7] },
  "dominant7": { suffix: "7", fullName: "Dominant 7th", quality: "dominant7", intervals: [0, 4, 7, 10] },
  "major7": { suffix: "maj7", fullName: "Major 7th", quality: "major7", intervals: [0, 4, 7, 11] },
  "minor7": { suffix: "m7", fullName: "minor 7th", quality: "minor7", intervals: [0, 3, 7, 10] },
  "diminished": { suffix: "dim", fullName: "Diminished", quality: "diminished", intervals: [0, 3, 6] },
  "augmented": { suffix: "aug", fullName: "Augmented", quality: "augmented", intervals: [0, 4, 8] },
  "sus2": { suffix: "sus2", fullName: "Suspended 2nd", quality: "sus2", intervals: [0, 2, 7] },
  "sus4": { suffix: "sus4", fullName: "Suspended 4th", quality: "sus4", intervals: [0, 5, 7] },
  "6": { suffix: "6", fullName: "Major 6th", quality: "major", intervals: [0, 4, 7, 9] },
  "m6": { suffix: "m6", fullName: "minor 6th", quality: "minor", intervals: [0, 3, 7, 9] },
  "9": { suffix: "9", fullName: "Dominant 9th", quality: "dominant7", intervals: [0, 4, 7, 10, 14] },
  "add9": { suffix: "add9", fullName: "Major add 9", quality: "major", intervals: [0, 2, 4, 7] },
};

// =============================================
// GERAÇÃO DE ACORDES
// =============================================

function generateChordNotes(root: string, intervals: number[]): string[] {
  const rootIndex = CHROMATIC_NOTES.indexOf(root);
  if (rootIndex === -1) return [];

  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return CHROMATIC_NOTES[noteIndex];
  });
}

function generateGuitarShape(root: string, quality: string): any {
  // Gera forma E básica (mais comum)
  const rootIndex = CHROMATIC_NOTES.indexOf(root);
  const baseFret = rootIndex > 0 ? rootIndex : 1;

  // Forma E padrão ajustada para o tom
  return {
    E: {
      name: `${root} (Forma E)`,
      baseFret: Math.min(baseFret, 7),
      notes: [
        { string: 1, fret: baseFret, finger: 1 },
        { string: 2, fret: baseFret, finger: 1 },
        { string: 3, fret: baseFret + 1, finger: 2 },
        { string: 4, fret: baseFret + 2, finger: 3 },
        { string: 5, fret: baseFret + 2, finger: 4 },
        { string: 6, fret: baseFret, finger: 1 },
      ],
      barre: baseFret > 0 ? {
        fret: baseFret,
        fromString: 1,
        toString: 6,
      } : undefined,
    }
  };
}

function generateKeyboardVoicing(notes: string[]): any {
  // Gera voicing básico na oitava 4
  return {
    root: {
      notes: notes.map(note => `${note}4`),
      inversion: 0,
    }
  };
}

async function generateAllChords() {
  console.log('🎵 Gerando todos os 156 acordes...\n');

  const allChords = [];
  let successCount = 0;
  let errorCount = 0;

  // Para cada tom (12 tons)
  for (const root of CHROMATIC_NOTES) {
    // Para cada qualidade (13 tipos)
    for (const [qualityKey, qualityData] of Object.entries(CHORD_QUALITIES)) {
      const chordName = `${root}${qualityData.suffix}`;
      const notes = generateChordNotes(root, qualityData.intervals);
      const cagedShapes = generateGuitarShape(root, qualityData.quality);
      const keyboardVoicings = generateKeyboardVoicing(notes);

      const chordData = {
        chord_name: chordName,
        full_name: `${root} ${qualityData.fullName}`,
        quality: qualityData.quality,
        root_note: root,
        notes: notes,
        caged_shapes: cagedShapes,
        keyboard_voicings: keyboardVoicings,
        reharmonizations: {},
        generated_by: 'script',
        verified: false,
      };

      allChords.push(chordData);
    }
  }

  console.log(`📊 Total de acordes a gerar: ${allChords.length}\n`);
  console.log('💾 Salvando no Supabase...\n');

  // Salva em lotes de 10 para evitar timeout
  const batchSize = 10;
  for (let i = 0; i < allChords.length; i += batchSize) {
    const batch = allChords.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from('chord_diagrams')
        .upsert(batch, {
          onConflict: 'chord_name',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        const progress = Math.round((successCount / allChords.length) * 100);
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} salvo (${successCount}/${allChords.length}) - ${progress}%`);
      }
    } catch (err: any) {
      console.error(`❌ Erro inesperado no lote ${Math.floor(i / batchSize) + 1}:`, err.message);
      errorCount += batch.length;
    }

    // Pequeno delay entre lotes
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Processo concluído!`);
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log('='.repeat(50));
}

// Executa o script
generateAllChords()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
