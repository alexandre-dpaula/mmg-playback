// Edge Function para processar URLs do CifraClub
// Deploy: supabase functions deploy process-cifraclub

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Verifica se uma URL é do CifraClub
 */
function isCifraClubUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('cifraclub.com');
  } catch {
    return false;
  }
}

/**
 * Extrai a URL da foto do artista do HTML do CifraClub
 */
function parseArtistPhoto(html: string): string | null {
  try {
    // Múltiplos padrões para encontrar a imagem do artista
    const patterns = [
      // Padrão 1: img dentro de #side-menu
      /<div[^>]+id="side-menu"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
      // Padrão 2: img com akam, cdn ou artist-images
      /<img[^>]+src="(https:\/\/[^"]*(?:akam|cdn|artist-images|fotos)[^"]+\.(?:jpg|jpeg|png|webp))"/i,
      // Padrão 3: og:image meta tag
      /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair foto do artista:', error);
    return null;
  }
}

/**
 * Extrai o tom (tonalidade) do HTML do CifraClub
 */
function parseKey(html: string): string | null {
  try {
    // Procura por: Tom: <span>E</span> ou similar
    const tomMatch = html.match(/Tom:\s*<[^>]+>([A-G][#b]?[m]?)<\/[^>]+>/i) ||
                     html.match(/id="cifra_tom"[^>]*>([A-G][#b]?[m]?)<\/[^>]+>/i) ||
                     html.match(/<span[^>]*>Tom:\s*([A-G][#b]?[m]?)<\/span>/i);

    if (tomMatch && tomMatch[1]) {
      return tomMatch[1].trim();
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair tom:', error);
    return null;
  }
}

/**
 * Extrai a versão/intérprete do título da página
 */
function parseVersion(html: string): string | null {
  try {
    // Padrão 1: Título formato "Música - Artista - Cifra Club"
    let titleMatch = html.match(/<title>([^-]+)\s*-\s*([^-]+)\s*-/i);
    if (titleMatch && titleMatch[2]) {
      const artist = titleMatch[2].trim();
      // Remove " cifra" ou " Cifra Club" do final
      return artist.replace(/\s*(cifra|Cifra Club).*$/i, '').trim();
    }

    // Padrão 2: Procura por meta tag og:title
    titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
    if (titleMatch && titleMatch[1]) {
      // Formato: "Música - Artista"
      const parts = titleMatch[1].split('-');
      if (parts.length >= 2) {
        return parts[1].trim();
      }
    }

    // Padrão 3: Procura por h1 com classe do artista
    const h1Match = html.match(/<h1[^>]*class="[^"]*artist[^"]*"[^>]*>([^<]+)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      return h1Match[1].trim();
    }

    // Padrão 4: Procura por link do artista
    const artistLinkMatch = html.match(/<a[^>]+href="\/artista\/[^"]+"[^>]*>([^<]+)<\/a>/i);
    if (artistLinkMatch && artistLinkMatch[1]) {
      return artistLinkMatch[1].trim();
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair versão:', error);
    return null;
  }
}

/**
 * Extrai o conteúdo da cifra do HTML do CifraClub
 */
function parseCifraClubContent(html: string): string {
  try {
    // Usar regex para extrair conteúdo do <pre>
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);

    if (!preMatch) {
      throw new Error('Não foi possível encontrar o conteúdo da cifra');
    }

    let content = preMatch[1];

    // Remover completamente as tablaturas (tabs)
    content = content.replace(/<span[^>]*class="tablatura"[^>]*>[\s\S]*?<\/span>/gi, '');

    // Remover tags <b> e <span> mas manter texto
    content = content
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
      .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
      // Remover outras tags HTML
      .replace(/<[^>]+>/g, '')
      // Decodificar entidades HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      // Remover linhas que contêm [Tab (independente do texto após)
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return !trimmed.includes('[Tab') && !trimmed.startsWith('Tab -');
      })
      .join('\n')
      // Limpar espaços excessivos
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return content;
  } catch (error) {
    console.error('Erro ao processar cifra:', error);
    throw new Error('Erro ao processar conteúdo da cifra');
  }
}

/**
 * Busca e processa cifra do CifraClub
 */
async function fetchAndParseCifra(url: string): Promise<{
  content: string;
  artistPhoto: string | null;
  key: string | null;
  version: string | null;
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
    const version = parseVersion(html);

    return { content, artistPhoto, key, version };
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

    const { trackId, cifraUrl } = await req.json()

    if (!trackId || !cifraUrl) {
      throw new Error('trackId e cifraUrl são obrigatórios')
    }

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

    console.log(`Processando cifra do CifraClub para track ${trackId}`)

    // Buscar e processar cifra
    const { content: extractedContent, artistPhoto, key, version } = await fetchAndParseCifra(cifraUrl)

    // Preparar dados para atualizar
    const updateData: any = { cifra_content: extractedContent }

    // Adicionar foto do artista se encontrada
    if (artistPhoto) {
      updateData.artist_photo = artistPhoto
    }

    // Adicionar tom se encontrado
    if (key) {
      updateData.original_key = key
    }

    // Adicionar versão se encontrada
    if (version) {
      updateData.version = version
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
        version: version || null
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
