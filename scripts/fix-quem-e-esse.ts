import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sffebcfgkthjcfnpgjvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchCifraPreview(cifraUrl: string) {
  const response = await fetch(`${supabaseUrl}/functions/v1/process-cifraclub`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      trackId: '00000000-0000-0000-0000-000000000000',
      cifraUrl,
      previewOnly: true,
    }),
  });

  const data = await response.json();
  return data;
}

async function fixQuemEEsse() {
  const cifraUrl = 'https://www.cifraclub.com.br/julliany-souza/quem-e-esse/';

  console.log('🔍 Buscando URL do YouTube para "Quem É Esse?"...\n');

  const preview = await fetchCifraPreview(cifraUrl);

  if (preview?.youtubeUrl) {
    console.log('✅ URL encontrada:', preview.youtubeUrl);

    const { error } = await supabase
      .from('tracks')
      .update({ referencia: preview.youtubeUrl })
      .eq('titulo', 'Quem É Esse?')
      .eq('versao', 'Julliany Souza');

    if (error) {
      console.error('❌ Erro ao atualizar:', error);
    } else {
      console.log('✅ Música atualizada com sucesso!');
    }
  } else {
    console.log('⚠️  Nenhuma URL do YouTube encontrada');
    console.log('Preview:', JSON.stringify(preview, null, 2));
  }
}

fixQuemEEsse().catch(console.error);
