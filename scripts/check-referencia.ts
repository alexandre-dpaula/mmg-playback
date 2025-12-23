import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sffebcfgkthjcfnpgjvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReferencia() {
  console.log('🔍 Verificando coluna referencia na tabela tracks...\n');

  // 1. Busca a música "Quem É Esse?"
  const { data: tracks, error: searchError } = await supabase
    .from('tracks')
    .select('id, titulo, versao, referencia, cifra_url')
    .ilike('titulo', '%Quem É Esse%')
    .limit(5);

  if (searchError) {
    console.error('❌ Erro ao buscar músicas:', searchError);
    return;
  }

  console.log('📋 Músicas encontradas:');
  tracks?.forEach((track, i) => {
    console.log(`  ${i + 1}. ${track.titulo} ${track.versao ? `(${track.versao})` : ''}`);
    console.log(`     ID: ${track.id}`);
    console.log(`     Cifra URL: ${track.cifra_url || '(vazio)'}`);
    console.log(`     Referência: ${track.referencia || '(vazio)'}`);
    console.log('');
  });
}

checkReferencia().catch(console.error);
