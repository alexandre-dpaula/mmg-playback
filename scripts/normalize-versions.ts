import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sffebcfgkthjcfnpgjvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Mapeia nomes de versões longas para suas abreviações
 */
const VERSION_ABBREVIATIONS: Record<string, string> = {
  "florianopolis house of prayer": "Fhop Music",
  "florianópolis house of prayer": "Fhop Music",
  "fhop": "Fhop Music",
  "kansas city": "IHOPKC",
  "ihop kansas city": "IHOPKC",
  "international house of prayer": "IHOP",
  "diante do trono": "Diante do Trono",
  "hillsong worship": "Hillsong",
  "hillsong united": "Hillsong United",
  "bethel music": "Bethel Music",
};

function normalizeVersion(version: string | null): string | null {
  if (!version) return null;

  const trimmed = version.trim();
  const lowercase = trimmed.toLowerCase();

  // Procura por abreviação exata
  if (VERSION_ABBREVIATIONS[lowercase]) {
    return VERSION_ABBREVIATIONS[lowercase];
  }

  // Extrai o que está entre parênteses e capitaliza
  const parenthesesMatch = trimmed.match(/\(([^)]+)\)/);
  if (parenthesesMatch) {
    const extracted = parenthesesMatch[1].trim();
    // Capitaliza primeira letra de cada palavra
    return extracted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Se não encontrou abreviação, retorna o original
  return trimmed;
}

async function normalizeAllVersions() {
  console.log('🔄 Buscando todas as músicas com versão...\n');

  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, titulo, versao')
    .not('versao', 'is', null)
    .neq('versao', '')
    .order('titulo');

  if (error) {
    console.error('❌ Erro ao buscar músicas:', error);
    return;
  }

  if (!tracks || tracks.length === 0) {
    console.log('✅ Nenhuma música com versão encontrada!');
    return;
  }

  console.log(`📋 Encontradas ${tracks.length} músicas com versão:\n`);

  let updated = 0;
  let skipped = 0;

  for (const track of tracks) {
    const normalizedVersion = normalizeVersion(track.versao);

    if (normalizedVersion !== track.versao) {
      console.log(`⏳ ${track.titulo}`);
      console.log(`   Versão antiga: "${track.versao}"`);
      console.log(`   Versão nova:   "${normalizedVersion}"`);

      const { error: updateError } = await supabase
        .from('tracks')
        .update({ versao: normalizedVersion })
        .eq('id', track.id);

      if (updateError) {
        console.error(`   ❌ Erro ao atualizar: ${updateError.message}`);
      } else {
        console.log(`   ✅ Atualizado!\n`);
        updated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Atualizadas: ${updated}`);
  console.log(`   ⏭️  Já normalizadas: ${skipped}`);
  console.log(`   📝 Total: ${tracks.length}`);
}

normalizeAllVersions().catch(console.error);
