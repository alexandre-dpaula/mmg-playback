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

async function updateYouTubeReferences() {
  console.log('🔍 Buscando músicas com CifraClub URL mas sem referência YouTube...\n');

  // Busca todas as músicas que têm cifra_url do CifraClub mas não têm referencia
  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, titulo, versao, cifra_url, referencia')
    .like('cifra_url', '%cifraclub.com%')
    .is('referencia', null)
    .order('titulo');

  if (error) {
    console.error('❌ Erro ao buscar músicas:', error);
    return;
  }

  if (!tracks || tracks.length === 0) {
    console.log('✅ Nenhuma música precisa ser atualizada!');
    return;
  }

  console.log(`📋 Encontradas ${tracks.length} músicas para atualizar:\n`);

  let updated = 0;
  let failed = 0;

  for (const track of tracks) {
    const displayName = `${track.titulo}${track.versao ? ` (${track.versao})` : ''}`;
    console.log(`⏳ Processando: ${displayName}`);

    try {
      const preview = await fetchCifraPreview(track.cifra_url!);

      if (preview?.youtubeUrl) {
        const { error: updateError } = await supabase
          .from('tracks')
          .update({ referencia: preview.youtubeUrl })
          .eq('id', track.id);

        if (updateError) {
          console.error(`   ❌ Erro ao atualizar: ${updateError.message}`);
          failed++;
        } else {
          console.log(`   ✅ Atualizado! URL: ${preview.youtubeUrl}`);
          updated++;
        }
      } else {
        console.log(`   ⚠️  Nenhuma URL do YouTube encontrada`);
        failed++;
      }

      // Aguarda um pouco entre requisições para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Erro: ${error}`);
      failed++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Atualizadas: ${updated}`);
  console.log(`   ❌ Falharam: ${failed}`);
  console.log(`   📝 Total: ${tracks.length}`);
}

updateYouTubeReferences().catch(console.error);
