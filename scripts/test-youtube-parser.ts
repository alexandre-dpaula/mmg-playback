import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sffebcfgkthjcfnpgjvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA';

async function testYouTubeParser() {
  const testUrls = [
    'https://www.cifraclub.com.br/julliany-souza/quem-e-esse/',
    'https://www.cifraclub.com.br/diante-do-trono/te-agradeco/',
  ];

  for (const url of testUrls) {
    console.log(`\n🔍 Testando: ${url}`);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/process-cifraclub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          trackId: '00000000-0000-0000-0000-000000000000',
          cifraUrl: url,
          previewOnly: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Título:', data.title);
        console.log('✅ Versão:', data.version);
        console.log('✅ Tom:', data.key);
        console.log('✅ YouTube URL:', data.youtubeUrl);
      } else {
        console.log('❌ Erro:', data.error);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
    }
  }
}

testYouTubeParser().catch(console.error);
