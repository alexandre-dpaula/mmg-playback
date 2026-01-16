/**
 * Script de teste para verificar o acorde D do Cifra Club
 * Antes de gerar todos os 156 acordes, vamos testar com D para confirmar
 */

import { config } from 'dotenv';
import { fetchCifraClubChord } from '../src/features/study-mode/services/cifraClubScraper';

// Carrega variáveis de ambiente
config();

async function testDChord() {
  console.log('🎸 Testando busca do acorde D no Cifra Club...\n');

  const variations = await fetchCifraClubChord('D');

  if (!variations || variations.length === 0) {
    console.error('❌ Nenhuma variação encontrada para o acorde D');
    return;
  }

  console.log(`✅ Encontradas ${variations.length} variações do acorde D\n`);
  console.log('='.repeat(60) + '\n');

  variations.forEach((variation, index) => {
    console.log(`Variação ${index + 1}: ${variation.name}`);
    console.log(`  Casa base: ${variation.baseFret}`);
    console.log(`  Pestana: ${variation.barre ? 'Sim (casa ' + variation.barre.fret + ')' : 'Não'}`);
    console.log(`  Notas:`);

    variation.notes.forEach(note => {
      const fretDisplay = note.fret === -1 ? 'X (mutada)' : note.fret === 0 ? '0 (solta)' : note.fret;
      const fingerDisplay = note.finger ? ` - dedo ${note.finger}` : '';
      console.log(`    Corda ${note.string}: casa ${fretDisplay}${fingerDisplay}`);
    });

    console.log('');
  });

  console.log('='.repeat(60));
  console.log('\n💡 Compare com o Cifra Club em: https://www.cifraclub.com.br/acordes/D');
  console.log('   A primeira variação deve corresponder à "Forma D" padrão (posição aberta)\n');
}

testDChord()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erro:', error);
    process.exit(1);
  });
