import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sffebcfgkthjcfnpgjvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFhop() {
  console.log('🔄 Atualizando "fhop music" para "Fhop Music"...\n');

  const { error } = await supabase
    .from('tracks')
    .update({ versao: 'Fhop Music' })
    .eq('versao', 'fhop music');

  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Versões atualizadas com sucesso!');
  }
}

fixFhop();
