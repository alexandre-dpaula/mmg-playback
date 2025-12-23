import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

interface SearchResult {
  title: string;
  artist: string;
  url: string;
  imageUrl?: string;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Query é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[search-cifraclub] Buscando: ${query}`);

    // Usa o Google para buscar no site do CifraClub
    const googleSearchUrl = `https://www.google.com/search?q=site:cifraclub.com.br+${encodeURIComponent(query)}`;

    const response = await fetch(googleSearchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na busca do Google: ${response.status}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Erro ao parsear HTML');
    }

    const results: SearchResult[] = [];
    const seen = new Set<string>();

    // Procura por links nos resultados do Google
    const allLinks = doc.querySelectorAll('a');

    console.log(`[search-cifraclub] Processando ${allLinks.length} links do Google`);

    for (const linkEl of allLinks) {
      try {
        const href = linkEl.getAttribute('href');
        if (!href) continue;

        // Extrai URL do formato do Google: /url?q=URL_REAL
        let realUrl = '';
        if (href.includes('/url?q=')) {
          const urlMatch = href.match(/\/url\?q=([^&]+)/);
          if (urlMatch && urlMatch[1]) {
            realUrl = decodeURIComponent(urlMatch[1]);
          }
        } else if (href.includes('cifraclub.com.br/cifra/')) {
          realUrl = href;
        }

        // Verifica se é uma URL válida do CifraClub com cifra
        if (!realUrl || !realUrl.includes('cifraclub.com.br/cifra/') || seen.has(realUrl)) {
          continue;
        }

        seen.add(realUrl);

        // Extrai informações da URL
        // Formato: https://www.cifraclub.com.br/cifra/ARTISTA/MUSICA/
        const urlParts = realUrl.split('/').filter(p => p);
        let artist = '';
        let title = '';

        // Encontra os índices de 'cifra', artista e música
        const cifraIndex = urlParts.findIndex(p => p === 'cifra');
        if (cifraIndex >= 0 && urlParts.length > cifraIndex + 2) {
          artist = urlParts[cifraIndex + 1].replace(/-/g, ' ');
          title = urlParts[cifraIndex + 2].replace(/-/g, ' ');
        }

        if (title && results.length < 15) {
          results.push({
            title: title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            artist: artist.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            url: realUrl,
            imageUrl: undefined, // Pode adicionar depois se necessário
          });
        }
      } catch (error) {
        console.error('[search-cifraclub] Erro ao processar link:', error);
        continue;
      }
    }

    console.log(`[search-cifraclub] Encontrados ${results.length} resultados`);

    return new Response(
      JSON.stringify({ results }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[search-cifraclub] Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao buscar músicas' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
