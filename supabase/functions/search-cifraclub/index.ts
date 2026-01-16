import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface SearchResult {
  title: string;
  url: string;
  description: string;
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

    console.log(`[search-cifraclub] Buscador Web - Pesquisando: "${query}"`);

    const results: SearchResult[] = [];

    // Busca usando DuckDuckGo HTML (mais amigável que Google)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' cifra')}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`[search-cifraclub] Erro ao buscar: ${response.status}`);
      return new Response(
        JSON.stringify({ results: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const html = await response.text();
    console.log(`[search-cifraclub] HTML recebido: ${html.length} caracteres`);

    // Extrai links dos resultados (DuckDuckGo usa class="result__url")
    const linkPattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const snippetPattern = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/g;

    const linkMatches = [...html.matchAll(linkPattern)];
    const snippetMatches = [...html.matchAll(snippetPattern)];

    console.log(`[search-cifraclub] Links encontrados: ${linkMatches.length}`);

    // Processa resultados do DuckDuckGo
    for (let i = 0; i < Math.min(linkMatches.length, 15); i++) {
      const linkMatch = linkMatches[i];
      let url = linkMatch[1];
      const title = linkMatch[2];
      const description = snippetMatches[i] ? snippetMatches[i][1] : `Resultado da busca por: ${query}`;

      // Extrai a URL real do redirecionamento do DuckDuckGo
      // URLs do DuckDuckGo vêm como: //duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.cifraclub.com.br%2F...
      if (url.includes('uddg=')) {
        try {
          const uddgMatch = url.match(/uddg=([^&]+)/);
          if (uddgMatch) {
            url = decodeURIComponent(uddgMatch[1]);
            console.log(`[search-cifraclub] URL decodificada: ${url}`);
          }
        } catch (e) {
          console.error(`[search-cifraclub] Erro ao decodificar URL: ${e}`);
        }
      }

      console.log(`[search-cifraclub] Resultado ${i + 1}: ${title}`);
      console.log(`[search-cifraclub] URL final: ${url}`);

      results.push({
        title: title,
        url: url,
        description: description
      });
    }

    console.log(`[search-cifraclub] Retornando ${results.length} resultados para o frontend`);

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
      JSON.stringify({ error: error.message || 'Erro ao buscar músicas', results: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
