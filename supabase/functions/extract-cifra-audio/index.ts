import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cifraUrl } = await req.json();

    if (!cifraUrl) {
      return new Response(
        JSON.stringify({ error: 'cifraUrl é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ExtractCifraAudio] Buscando áudio de: ${cifraUrl}`);

    // Fetch da página do CifraClub
    const response = await fetch(cifraUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar página: ${response.status}`);
    }

    const html = await response.text();

    // Padrão 1: Procura por URLs .mp3 ou .m4a
    let audioUrlMatch = html.match(/(https?:\/\/[^\s"']+\.(?:mp3|m4a))/i);
    if (audioUrlMatch) {
      console.log(`[ExtractCifraAudio] Áudio encontrado (padrão 1): ${audioUrlMatch[1]}`);
      return new Response(
        JSON.stringify({ audioUrl: audioUrlMatch[1] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Padrão 2: Procura por data-audio attributes
    audioUrlMatch = html.match(/data-audio=["']([^"']+)["']/i);
    if (audioUrlMatch) {
      console.log(`[ExtractCifraAudio] Áudio encontrado (padrão 2): ${audioUrlMatch[1]}`);
      return new Response(
        JSON.stringify({ audioUrl: audioUrlMatch[1] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Padrão 3: Procura por estruturas JSON com "audio"
    audioUrlMatch = html.match(/"audio":\s*"([^"]+)"/i);
    if (audioUrlMatch) {
      console.log(`[ExtractCifraAudio] Áudio encontrado (padrão 3): ${audioUrlMatch[1]}`);
      return new Response(
        JSON.stringify({ audioUrl: audioUrlMatch[1] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Padrão 4: Procura por "playback" ou "media" em estruturas JSON
    audioUrlMatch = html.match(/"(?:playback|media)":\s*"([^"]+)"/i);
    if (audioUrlMatch) {
      console.log(`[ExtractCifraAudio] Áudio encontrado (padrão 4): ${audioUrlMatch[1]}`);
      return new Response(
        JSON.stringify({ audioUrl: audioUrlMatch[1] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.warn('[ExtractCifraAudio] Nenhuma URL de áudio encontrada');
    return new Response(
      JSON.stringify({ audioUrl: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ExtractCifraAudio] Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
