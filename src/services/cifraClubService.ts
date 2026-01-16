// Serviço para buscar músicas no Cifra Club
// API não oficial do Cifra Club

export interface CifraClubTrack {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface CifraClubSearchResult {
  tracks: CifraClubTrack[];
  artists: {
    id: string;
    name: string;
    url: string;
    image?: string;
  }[];
}

/**
 * Busca músicas no Cifra Club usando Edge Function (evita CORS)
 * @param query - Termo de busca (ex: "me amas")
 * @returns Lista de músicas encontradas
 */
export async function searchCifraClub(query: string): Promise<CifraClubTrack[]> {
  if (!query || query.trim().length < 2) {
    console.log('[cifraClubService] Query muito curta, retornando vazio');
    return [];
  }

  try {
    console.log(`[cifraClubService] Iniciando busca por: "${query}"`);

    // Usa a Edge Function do Supabase como proxy
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/search-cifraclub`;

    console.log(`[cifraClubService] URL da Edge Function: ${edgeFunctionUrl}`);

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ query }),
    });

    console.log(`[cifraClubService] Status da resposta: ${response.status}`);

    if (!response.ok) {
      console.error('[cifraClubService] Erro HTTP:', response.status);
      const errorText = await response.text();
      console.error('[cifraClubService] Resposta de erro:', errorText);
      return [];
    }

    const data = await response.json();
    console.log('[cifraClubService] Dados recebidos:', data);

    // Converte o formato da Edge Function para o formato esperado
    const results = data.results || [];
    console.log(`[cifraClubService] Total de resultados: ${results.length}`);

    // Filtra apenas URLs do Cifra Club
    const filteredResults = results
      .filter((result: any) => {
        const url = result.url || '';
        const isCifraClub = url.includes('cifraclub.com.br') || url.startsWith('/');
        if (!isCifraClub) {
          console.log(`[cifraClubService] Filtrando URL não-Cifra Club: ${url}`);
        }
        return isCifraClub;
      })
      .map((result: any) => ({
        id: result.url,
        name: result.title,
        url: result.url,
        description: result.description,
      }));

    console.log(`[cifraClubService] Resultados após filtro: ${filteredResults.length}`);
    return filteredResults;
  } catch (error) {
    console.error('[cifraClubService] Erro ao buscar no Cifra Club:', error);
    return [];
  }
}

/**
 * Busca a cifra completa de uma música do Cifra Club usando Edge Function
 * @param url - URL da música no Cifra Club (ex: "https://www.cifraclub.com.br/thalles-roberto/me-amas/")
 * @returns Cifra da música em formato texto
 */
export async function fetchCifraFromUrl(url: string): Promise<{
  title: string;
  artist: string;
  key: string;
  cifra: string;
} | null> {
  try {
    console.log(`[fetchCifraFromUrl] Processando URL: ${url}`);

    // Usa a Edge Function do Supabase para processar a URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/process-cifraclub`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        cifraUrl: url,
        previewOnly: true
      }),
    });

    console.log(`[fetchCifraFromUrl] Status da resposta: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao processar cifra:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[fetchCifraFromUrl] Dados recebidos:', data);

    // Extrai o artista da URL (já que a função retorna apenas o título)
    const artistMatch = url.match(/cifraclub\.com\.br\/([^\/]+)\//);
    const artist = artistMatch ? artistMatch[1].replace(/-/g, ' ') : '';

    return {
      title: data.title || '',
      artist: artist.charAt(0).toUpperCase() + artist.slice(1),
      key: data.key || '',
      cifra: data.cifra_content || data.content || '',
    };
  } catch (error) {
    console.error('Erro ao buscar cifra do Cifra Club:', error);
    return null;
  }
}

/**
 * Extrai artista e título de uma URL do Cifra Club
 * @param url - URL do Cifra Club
 * @returns Objeto com artista e título
 */
export function parseUrlCifraClub(url: string): { artist: string; title: string } | null {
  try {
    const match = url.match(/cifraclub\.com\.br\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const artist = match[1].replace(/-/g, ' ');
      const title = match[2].replace(/-/g, ' ');
      return {
        artist: artist.charAt(0).toUpperCase() + artist.slice(1),
        title: title.charAt(0).toUpperCase() + title.slice(1),
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao fazer parse da URL:', error);
    return null;
  }
}

