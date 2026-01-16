/**
 * Script para gerar biblioteca de acordes baseada no Cifra Club
 *
 * Este script:
 * 1. Busca variações de acordes do Cifra Club
 * 2. Mapeia para formas CAGED
 * 3. Salva no banco de dados (chord_diagrams)
 *
 * Uso:
 * npx tsx scripts/generate-chords-from-cifraclub.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { preloadCifraClubChords } from '../src/features/study-mode/services/cifraClubScraper';
import { GuitarChord } from '../src/features/study-mode/types';

// Carrega variáveis de ambiente do .env
config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidos no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista dos 156 acordes que queremos gerar
const CHORD_NAMES = [
  // Maiores (12)
  'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',

  // Menores (12)
  'Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm',

  // Dominante 7ª (12)
  'C7', 'C#7', 'D7', 'Eb7', 'E7', 'F7', 'F#7', 'G7', 'Ab7', 'A7', 'Bb7', 'B7',

  // Major 7ª (12)
  'Cmaj7', 'C#maj7', 'Dmaj7', 'Ebmaj7', 'Emaj7', 'Fmaj7', 'F#maj7', 'Gmaj7', 'Abmaj7', 'Amaj7', 'Bbmaj7', 'Bmaj7',

  // Minor 7ª (12)
  'Cm7', 'C#m7', 'Dm7', 'Ebm7', 'Em7', 'Fm7', 'F#m7', 'Gm7', 'Abm7', 'Am7', 'Bbm7', 'Bm7',

  // Diminutos (12)
  'Cdim', 'C#dim', 'Ddim', 'Ebdim', 'Edim', 'Fdim', 'F#dim', 'Gdim', 'Abdim', 'Adim', 'Bbdim', 'Bdim',

  // Aumentados (12)
  'Caug', 'C#aug', 'Daug', 'Ebaug', 'Eaug', 'Faug', 'F#aug', 'Gaug', 'Abaug', 'Aaug', 'Bbaug', 'Baug',

  // Sus2 (12)
  'Csus2', 'C#sus2', 'Dsus2', 'Ebsus2', 'Esus2', 'Fsus2', 'F#sus2', 'Gsus2', 'Absus2', 'Asus2', 'Bbsus2', 'Bsus2',

  // Sus4 (12)
  'Csus4', 'C#sus4', 'Dsus4', 'Ebsus4', 'Esus4', 'Fsus4', 'F#sus4', 'Gsus4', 'Absus4', 'Asus4', 'Bbsus4', 'Bsus4',

  // 6ª (12)
  'C6', 'C#6', 'D6', 'Eb6', 'E6', 'F6', 'F#6', 'G6', 'Ab6', 'A6', 'Bb6', 'B6',

  // Minor 6ª (12)
  'Cm6', 'C#m6', 'Dm6', 'Ebm6', 'Em6', 'Fm6', 'F#m6', 'Gm6', 'Abm6', 'Am6', 'Bbm6', 'Bm6',

  // 9ª (12)
  'C9', 'C#9', 'D9', 'Eb9', 'E9', 'F9', 'F#9', 'G9', 'Ab9', 'A9', 'Bb9', 'B9',

  // Add9 (12)
  'Cadd9', 'C#add9', 'Dadd9', 'Ebadd9', 'Eadd9', 'Fadd9', 'F#add9', 'Gadd9', 'Abadd9', 'Aadd9', 'Bbadd9', 'Badd9',
];

/**
 * Mapeia variações do Cifra Club para formas CAGED
 */
function mapVariationsToCAGED(variations: GuitarChord[]): Record<string, GuitarChord> {
  const shapes: Record<string, GuitarChord> = {};

  // Mapeia cada variação para uma forma CAGED
  variations.forEach((variation, index) => {
    const cagedLetter = inferCAGEDShape(variation, index);
    if (cagedLetter && !shapes[cagedLetter]) {
      shapes[cagedLetter] = variation;
    }
  });

  return shapes;
}

/**
 * Infere qual letra CAGED baseado na posição e padrão do acorde
 */
function inferCAGEDShape(chord: GuitarChord, index: number): string | null {
  const baseFret = chord.baseFret;
  const hasBarre = !!chord.barre;
  const rootString = findRootString(chord);

  // Heurística baseada em:
  // - Posição no braço (baseFret)
  // - Presença de pestana
  // - Corda raiz
  // - Índice da variação (primeira variação geralmente é a mais comum)

  // Primeira variação (índice 0) - geralmente é a forma mais básica/aberta
  if (index === 0) {
    // Se é posição aberta (baseFret = 1) e não tem pestana
    if (baseFret === 1 && !hasBarre) {
      // Verifica qual forma aberta é baseado na corda raiz
      if (rootString === 6) return 'E'; // Forma E (corda 6 como raiz)
      if (rootString === 5) return 'A'; // Forma A (corda 5 como raiz)
      if (rootString === 4) return 'D'; // Forma D (corda 4 como raiz)
      if (rootString === 3) return 'C'; // Forma C (corda 3 como raiz)
      return 'G'; // Forma G (geralmente múltiplas cordas)
    }
  }

  // Formas com pestana
  if (hasBarre) {
    const barreFromString = chord.barre!.fromString;

    // Pestana completa (6 cordas) ou começando na 6ª corda = Forma E
    if (barreFromString === 6 || (barreFromString === 1 && chord.barre!.toString === 6)) {
      return 'E';
    }

    // Pestana começando na 5ª corda = Forma A
    if (barreFromString === 5 || (barreFromString === 1 && chord.barre!.toString === 5)) {
      return 'A';
    }

    // Pestana começando na 4ª corda = Forma D
    if (barreFromString === 4) {
      return 'D';
    }

    // Pestana em posição alta = Forma C ou G
    if (baseFret >= 3) {
      return index === 1 ? 'C' : 'G';
    }
  }

  // Formas sem pestana baseadas na posição
  if (baseFret >= 8) {
    return index === 1 ? 'G' : 'E';
  }

  if (baseFret >= 5) {
    return index === 1 ? 'C' : 'A';
  }

  if (baseFret >= 3) {
    return 'C';
  }

  // Fallback: distribui entre as formas restantes
  const cagedOrder = ['D', 'C', 'G', 'E', 'A'];
  return cagedOrder[index % 5];
}

/**
 * Encontra a corda raiz do acorde
 */
function findRootString(chord: GuitarChord): number {
  // A corda raiz é geralmente a nota mais grave tocada (maior número de corda)
  const playedStrings = chord.notes
    .filter(note => note.fret >= 0)
    .map(note => note.string)
    .sort((a, b) => b - a); // Ordena do maior (mais grave) para o menor

  return playedStrings[0] || 5; // Retorna a mais grave, ou 5 como padrão
}

/**
 * Extrai a nota raiz do nome do acorde
 */
function getRootNote(chordName: string): string {
  // Remove qualidade do acorde para obter apenas a nota raiz
  const match = chordName.match(/^([A-G][#b]?)/);
  return match ? match[1] : chordName;
}

/**
 * Identifica a qualidade do acorde
 */
function getChordQuality(chordName: string): string {
  const normalized = chordName.toLowerCase();

  if (normalized.includes('maj7')) return 'major7';
  if (normalized.includes('m7') && !normalized.includes('maj')) return 'minor7';
  if (normalized.match(/[^m]7$/)) return 'dominant7';
  if (normalized.includes('dim')) return 'diminished';
  if (normalized.includes('aug')) return 'augmented';
  if (normalized.includes('sus2')) return 'sus2';
  if (normalized.includes('sus4') || normalized.includes('sus')) return 'sus4';
  if (normalized.includes('m') && !normalized.includes('maj')) return 'minor';
  if (normalized.includes('add9')) return 'add9';
  if (normalized.match(/6$/)) return 'sixth';
  if (normalized.match(/9$/)) return 'ninth';

  return 'major';
}

/**
 * Obtém nome completo do acorde
 */
function getFullChordName(chordName: string): string {
  const quality = getChordQuality(chordName);
  const root = getRootNote(chordName);

  const qualityNames: Record<string, string> = {
    major: 'Major',
    minor: 'minor',
    dominant7: 'Dominant 7th',
    major7: 'Major 7th',
    minor7: 'minor 7th',
    diminished: 'Diminished',
    augmented: 'Augmented',
    sus2: 'Suspended 2nd',
    sus4: 'Suspended 4th',
    add9: 'Add 9',
    sixth: '6th',
    ninth: '9th',
  };

  return `${root} ${qualityNames[quality] || quality}`;
}

/**
 * Extrai as notas que compõem o acorde (simplificado)
 */
function getChordNotes(chordName: string): string[] {
  // Esta é uma versão simplificada
  // Em produção, seria necessária uma tabela completa de teoria musical
  const root = getRootNote(chordName);
  const quality = getChordQuality(chordName);

  // Por enquanto, retorna apenas a raiz
  // TODO: Implementar extração completa de notas baseada em teoria musical
  return [root];
}

/**
 * Função principal de geração
 */
async function generateChords() {
  console.log('🎸 Gerando biblioteca de acordes do Cifra Club...\n');
  console.log(`📋 Total de acordes: ${CHORD_NAMES.length}\n`);

  // Busca todos os acordes do Cifra Club
  console.log('⏳ Buscando acordes do Cifra Club (isso pode levar alguns minutos)...\n');
  const chordCache = await preloadCifraClubChords(CHORD_NAMES);

  console.log(`\n✅ Buscados ${chordCache.size} acordes com sucesso!\n`);
  console.log('📊 Salvando no banco de dados...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const [chordName, variations] of chordCache.entries()) {
    try {
      // Mapeia variações para formas CAGED
      const cagedShapes = mapVariationsToCAGED(variations);

      // Salva no Supabase
      const { error } = await supabase
        .from('chord_diagrams')
        .upsert({
          chord_name: chordName,
          full_name: getFullChordName(chordName),
          quality: getChordQuality(chordName),
          root_note: getRootNote(chordName),
          caged_shapes: cagedShapes,
          notes: getChordNotes(chordName),
          generated_by: 'cifraclub-scraper',
          verified: false,
        }, {
          onConflict: 'chord_name'
        });

      if (error) {
        console.error(`❌ Erro ao salvar ${chordName}:`, error.message);
        errorCount++;
      } else {
        const shapeCount = Object.keys(cagedShapes).length;
        console.log(`✅ ${chordName.padEnd(8)} - ${shapeCount} formas CAGED salvas`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${chordName}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Geração concluída!');
  console.log(`✅ Sucesso: ${successCount} acordes`);
  console.log(`❌ Erros: ${errorCount} acordes`);
  console.log('='.repeat(60) + '\n');

  if (successCount > 0) {
    console.log('💡 Próximos passos:');
    console.log('   1. Teste o acorde D na interface para verificar se a Forma A está correta');
    console.log('   2. Revise manualmente os acordes e marque como "verified: true"');
    console.log('   3. Atualize a interface para usar os novos dados do banco\n');
  }
}

// Executa o script
generateChords()
  .then(() => {
    console.log('✨ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
