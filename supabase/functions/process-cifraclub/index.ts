// Edge Function para processar URLs do CifraClub
// Deploy: supabase functions deploy process-cifraclub

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  isCifraClubUrl,
  parseArtistPhoto,
  parseCifraClubContent,
  parseKey,
  parseSongTitle,
  parseVersion,
} from './parser.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Busca e processa cifra do CifraClub
 */
async function fetchAndParseCifra(url: string): Promise<{
  content: string;
  artistPhoto: string | null;
  key: string | null;
  version: string | null;
  title: string | null;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar cifra: ${response.statusText}`);
    }

    const html = await response.text();
    const content = parseCifraClubContent(html);
    const artistPhoto = parseArtistPhoto(html);
    const key = parseKey(html);
    const version = parseVersion(html, url);
    const title = parseSongTitle(html, url);

    return { content, artistPhoto, key, version, title };
  } catch (error) {
    console.error('Erro ao buscar cifra:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { trackId, cifraUrl, previewOnly } = await req.json()

    if (!cifraUrl) {
      throw new Error('cifraUrl é obrigatório')
    }

    const isPreviewRequest = previewOnly === true || !trackId;

    // Verificar se é URL do CifraClub
    if (!isCifraClubUrl(cifraUrl)) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'URL não é do CifraClub, nenhuma ação necessária',
          processed: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar e processar cifra
    const {
      content: extractedContent,
      artistPhoto,
      key,
      version,
      title,
    } = await fetchAndParseCifra(cifraUrl)

    if (isPreviewRequest) {
      return new Response(
        JSON.stringify({
          success: true,
          preview: true,
          title: title || null,
          version: version || null,
          key: key || null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!trackId) {
      throw new Error('trackId é obrigatório para processar e salvar a cifra')
    }

    console.log(`Processando cifra do CifraClub para track ${trackId}`)

    // Preparar dados para atualizar
    const updateData: any = { cifra_content: extractedContent }

    // Adicionar foto do artista se encontrada
    if (artistPhoto) {
      updateData.artist_photo = artistPhoto
    }

    // Adicionar tom se encontrado (atualiza campo 'tom' se estiver vazio)
    if (key) {
      // Buscar registro atual para verificar se tom já existe
      const { data: currentTrack } = await supabaseClient
        .from('tracks')
        .select('tom')
        .eq('id', trackId)
        .single()

      // Só atualiza tom se estiver vazio
      if (!currentTrack?.tom) {
        updateData.tom = key
      }
    }

    // Adicionar versão se encontrada (atualiza campo 'versao' se estiver vazio)
    if (version) {
      const { data: currentTrack } = await supabaseClient
        .from('tracks')
        .select('versao')
        .eq('id', trackId)
        .single()

      // Só atualiza versão se estiver vazia
      if (!currentTrack?.versao) {
        updateData.versao = version
      }
    }

    // Salvar conteúdo extraído, foto, tom e versão
    const { error: updateError } = await supabaseClient
      .from('tracks')
      .update(updateData)
      .eq('id', trackId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cifra, foto, tom e versão extraídos com sucesso',
        processed: true,
        contentLength: extractedContent.length,
        artistPhoto: artistPhoto || null,
        key: key || null,
        version: version || null,
        title: title || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
