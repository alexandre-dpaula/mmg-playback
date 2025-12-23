import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sffebcfgkthjcfnpgjvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVersions() {
  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, titulo, versao')
    .not('versao', 'is', null)
    .neq('versao', '')
    .order('versao');

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log(`\n📋 Versões únicas no banco:\n`);

  const uniqueVersions = new Set(tracks?.map(t => t.versao));
  uniqueVersions.forEach(v => {
    const count = tracks?.filter(t => t.versao === v).length;
    console.log(`   "${v}" (${count} música${count > 1 ? 's' : ''})`);
  });
}

checkVersions();
