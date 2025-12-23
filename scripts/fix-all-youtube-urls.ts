import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sffebcfgkthjcfnpgjvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchCifraPreview(cifraUrl: string) {
  try {
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

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.success) {
      const message = data?.error || 'Erro ao buscar prévia da cifra';
      console.error('Erro na requisição:', response.status, message);
      return null;
    }

    return {
      title: data.title ?? null,
      version: data.version ?? null,
      key: data.key ?? null,
      youtubeUrl: data.youtubeUrl ?? null,
    };
  } catch (error) {
    console.error('Erro ao buscar prévia:', error);
    return null;
  }
}

async function fixAllYouTubeUrls() {
  console.log('🔍 Buscando TODAS as músicas com URL do CifraClub...\n');

  // Busca TODAS as músicas com URL do CifraClub (mesmo as que já têm referência)
  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, titulo, versao, cifra_url, referencia')
    .like('cifra_url', '%cifraclub.com%')
    .order('titulo');

  if (error) {
    console.error('❌ Erro ao buscar músicas:', error);
    return;
  }

  if (!tracks || tracks.length === 0) {
    console.log('✅ Nenhuma música encontrada!');
    return;
  }

  console.log(`📋 Encontradas ${tracks.length} músicas para atualizar:\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const track of tracks) {
    const displayName = `${track.titulo}${track.versao ? ` (${track.versao})` : ''}`;
    console.log(`⏳ Processando: ${displayName}`);

    try {
      const preview = await fetchCifraPreview(track.cifra_url!);

      if (preview?.youtubeUrl) {
        // Verifica se a URL já é a correta
        if (track.referencia === preview.youtubeUrl) {
          console.log(`   ✓ URL já está correta: ${preview.youtubeUrl}`);
          skipped++;
        } else {
          const { error: updateError } = await supabase
            .from('tracks')
            .update({ referencia: preview.youtubeUrl })
            .eq('id', track.id);

          if (updateError) {
            console.error(`   ❌ Erro ao atualizar: ${updateError.message}`);
            failed++;
          } else {
            console.log(`   ✅ Atualizado! Nova URL: ${preview.youtubeUrl}`);
            if (track.referencia) {
              console.log(`      (anterior: ${track.referencia})`);
            }
            updated++;
          }
        }
      } else {
        console.log(`   ⚠️  Nenhuma URL do YouTube encontrada`);
        failed++;
      }

      // Aguarda um pouco entre requisições
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Erro: ${error}`);
      failed++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Atualizadas: ${updated}`);
  console.log(`   ✓  Já corretas: ${skipped}`);
  console.log(`   ❌ Falharam: ${failed}`);
  console.log(`   📝 Total: ${tracks.length}`);
}

fixAllYouTubeUrls().catch(console.error);
