/**
 * Script para importar diagramas do Cifra Club
 * Execute: npx tsx scripts/import-cifraclub-chords.ts
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de acordes para importar
const CHORDS_TO_IMPORT = [
  'C', 'Cm', 'C7', 'Cmaj7', 'Cm7',
  'D', 'Dm', 'D7', 'Dmaj7', 'Dm7',
  'E', 'Em', 'E7', 'Emaj7', 'Em7',
  'F', 'Fm', 'F7', 'Fmaj7', 'Fm7',
  'G', 'Gm', 'G7', 'Gmaj7', 'Gm7',
  'A', 'Am', 'A7', 'Amaj7', 'Am7',
  'B', 'Bm', 'B7', 'Bmaj7', 'Bm7',
];

async function importFromCifraClub() {
  console.log('🎸 Importando diagramas do Cifra Club...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const chordName of CHORDS_TO_IMPORT) {
    try {
      console.log(`📥 Buscando: ${chordName}...`);

      // Faz request para a página do acorde no Cifra Club
      const url = `https://www.cifraclub.com.br/acordes/${chordName.toLowerCase()}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`  ❌ Erro ao buscar ${chordName}: ${response.status}`);
        errorCount++;
        continue;
      }

      const html = await response.text();

      // Extrai variações do HTML
      const variations = extractVariations(html, chordName);

      if (variations.length === 0) {
        console.log(`  ⚠️  Nenhuma variação encontrada para ${chordName}`);
        errorCount++;
        continue;
      }

      console.log(`  ✅ Encontradas ${variations.length} variações`);

      // Salva no Supabase (atualiza se já existe)
      const chordData = {
        chord_name: chordName,
        full_name: getFullName(chordName),
        quality: getQuality(chordName),
        root_note: getRootNote(chordName),
        notes: extractNotes(chordName),
        caged_shapes: convertToCagedFormat(variations),
        keyboard_voicings: { root: { notes: [], inversion: 0 } },
        generated_by: 'cifraclub',
        verified: true,
      };

      const { error } = await supabase
        .from('chord_diagrams')
        .upsert(chordData, { onConflict: 'chord_name' });

      if (error) {
        console.error(`  ❌ Erro ao salvar ${chordName}:`, error.message);
        errorCount++;
      } else {
        console.log(`  💾 Salvo no banco!`);
        successCount++;
      }

      // Delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err: any) {
      console.error(`  ❌ Erro inesperado com ${chordName}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Importação concluída!');
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log('='.repeat(50));
}

function extractVariations(html: string, chordName: string): any[] {
  // Extrai diagramas do HTML do Cifra Club
  // O Cifra Club usa um formato específico de divs com data attributes
  const variations: any[] = [];

  // Regex para encontrar elementos de diagrama
  const diagramRegex = /<li[^>]*data-diagram="([^"]+)"[^>]*>/g;
  let match;

  while ((match = diagramRegex.exec(html)) !== null) {
    try {
      const diagramData = JSON.parse(match[1].replace(/&quot;/g, '"'));
      variations.push(diagramData);
    } catch (e) {
      // Ignora erros de parsing
    }
  }

  return variations;
}

function convertToCagedFormat(variations: any[]): any {
  const caged: any = {};

  variations.slice(0, 5).forEach((variation, index) => {
    const shapeName = ['C', 'A', 'G', 'E', 'D'][index] || `V${index + 1}`;

    caged[shapeName] = {
      name: `Variação ${index + 1}`,
      baseFret: variation.baseFret || 1,
      notes: variation.positions || [],
      barre: variation.barre,
    };
  });

  return caged;
}

function getFullName(chord: string): string {
  if (chord.includes('maj7')) return `${chord.replace('maj7', '')} Major 7th`;
  if (chord.includes('m7')) return `${chord.replace('m7', '')} minor 7th`;
  if (chord.includes('7')) return `${chord.replace('7', '')} Dominant 7th`;
  if (chord.includes('m')) return `${chord.replace('m', '')} minor`;
  return `${chord} Major`;
}

function getQuality(chord: string): string {
  if (chord.includes('maj7')) return 'major7';
  if (chord.includes('m7')) return 'minor7';
  if (chord.includes('7')) return 'dominant7';
  if (chord.includes('m')) return 'minor';
  return 'major';
}

function getRootNote(chord: string): string {
  return chord.replace(/[^A-G#b]/g, '');
}

function extractNotes(chord: string): string[] {
  // Simplificado - retorna apenas a raiz
  return [getRootNote(chord)];
}

// Executa
importFromCifraClub()
  .then(() => {
    console.log('\n✅ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
