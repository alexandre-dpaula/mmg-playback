import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Normaliza o nome da seção para o formato padrão
 */
function normalizeSectionType(rawType: string): string {
  if (rawType === 'PRIMEIRA PARTE') return 'V1';
  if (rawType === 'SEGUNDA PARTE') return 'V2';
  if (rawType === 'TERCEIRA PARTE') return 'V3';
  if (rawType === 'QUARTA PARTE') return 'V4';

  if (rawType.startsWith('VERSE')) {
    const num = rawType.replace('VERSE', '').trim();
    return num ? `V${num}` : 'V1';
  }
  if (rawType.startsWith('VERSO')) {
    const num = rawType.replace('VERSO', '').trim();
    return num ? `V${num}` : 'V1';
  }
  if (rawType.startsWith('SOLO')) {
    const num = rawType.replace('SOLO', '').trim();
    return num ? `S${num}` : 'S';
  }
  if (rawType.startsWith('CHORUS') || rawType.startsWith('REFRÃO')) {
    const num = rawType.replace(/CHORUS|REFRÃO/, '').trim();
    return num ? `R${num}` : 'R';
  }
  if (rawType.startsWith('PRÉ-REFRÃO') || rawType.startsWith('PRE-CHORUS')) {
    return 'PR';
  }
  if (rawType.startsWith('PONTE')) return 'PO';
  if (rawType.startsWith('BRIDGE')) {
    const num = rawType.replace('BRIDGE', '').trim();
    return num ? `B${num}` : 'B';
  }
  if (rawType.startsWith('INTRO')) return 'I';
  if (rawType.startsWith('TURNAROUND')) return 'TA';
  if (rawType.startsWith('TAG')) return 'TG';
  if (rawType.startsWith('INSTRUMENTAL')) return 'IS';
  if (rawType.startsWith('INTERLÚDIO')) return 'IT';
  if (rawType.startsWith('REFRÃO FINAL') || rawType === 'FINAL') return 'RF';
  if (rawType === 'SQ') return 'SQ';

  const shortMatch = rawType.match(/^([A-Z]+)(\d*)$/);
  if (shortMatch) return rawType;

  return rawType.substring(0, 2);
}

/**
 * Extrai seções da cifra com informações de posição
 */
function extractSectionsInfo(cifraContent: string) {
  if (!cifraContent) return [];

  const lines = cifraContent.split('\n');
  const sections: Array<{ id: string; lineIndex: number; lineCount: number }> = [];

  const sectionRegex =
    /^\s*\[\s*(PRIMEIRA\s+PARTE|SEGUNDA\s+PARTE|TERCEIRA\s+PARTE|QUARTA\s+PARTE|REFRÃO\s+FINAL|INTRO|VERSE\s*\d*|VERSO\s*\d*|SOLO\s*\d*|CHORUS\s*\d*|REFRÃO\s*\d*|PRÉ[- ]?REFRÃO|PRE[- ]?CHORUS|PONTE|BRIDGE|TURNAROUND|TAG|INSTRUMENTAL|INTERLÚDIO|FINAL|SQ|V\d+|S\d+|C\d+|R\d+|PR|PC|PO|B\d*|TA|TG|IS|IN|RF|IT|I|[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]+)*)\s*\]/i;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].trim().match(sectionRegex);
    if (match) {
      const rawType = match[1].toUpperCase().trim();
      const sectionId = normalizeSectionType(rawType);

      let lineCount = 0;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().match(sectionRegex)) break;
        if (lines[j].trim()) lineCount++;
      }

      sections.push({
        id: sectionId,
        lineIndex: i,
        lineCount: Math.max(lineCount, 1),
      });
    }
  }

  return sections;
}

/**
 * Estima a duração baseado no comprimento da cifra
 */
function estimateDuration(cifraContent: string): number {
  if (!cifraContent) return 240;

  const lines = cifraContent.split('\n').filter(l => l.trim());
  const lineCount = lines.length;

  if (lineCount < 50) return 120;
  if (lineCount < 100) return 180;
  if (lineCount < 150) return 240;
  if (lineCount < 200) return 300;
  return 360;
}

/**
 * Gera timestamps automáticos
 */
function generateTimestamps(cifraContent: string, estimatedDuration: number = 240): Record<string, number> {
  const sections = extractSectionsInfo(cifraContent);

  if (sections.length === 0) return {};

  const totalLines = sections.reduce((sum, section) => sum + section.lineCount, 0);
  if (totalLines === 0) return {};

  const timestamps: Record<string, number> = {};
  let currentTime = 0;

  sections.forEach((section) => {
    timestamps[section.id] = Math.round(currentTime);
    const proportion = section.lineCount / totalLines;
    const sectionDuration = estimatedDuration * proportion;
    currentTime += sectionDuration;
  });

  return timestamps;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Busca todas as músicas com cifra_content mas sem timestamps
    const { data: tracks, error: fetchError } = await supabaseClient
      .from('tracks')
      .select('id, titulo, cifra_content, section_timestamps')
      .not('cifra_content', 'is', null)
      .or('section_timestamps.is.null,section_timestamps.eq.{}')

    if (fetchError) throw fetchError

    console.log(`Encontradas ${tracks?.length || 0} músicas para processar`)

    const results = []

    for (const track of tracks || []) {
      try {
        const duration = estimateDuration(track.cifra_content);
        const timestamps = generateTimestamps(track.cifra_content, duration);

        if (Object.keys(timestamps).length > 0) {
          const { error: updateError } = await supabaseClient
            .from('tracks')
            .update({ section_timestamps: timestamps })
            .eq('id', track.id)

          if (updateError) {
            console.error(`Erro ao atualizar ${track.titulo}:`, updateError)
            results.push({ id: track.id, titulo: track.titulo, status: 'error', error: updateError.message })
          } else {
            console.log(`✓ ${track.titulo} - ${Object.keys(timestamps).length} seções`)
            results.push({ id: track.id, titulo: track.titulo, status: 'success', sections: Object.keys(timestamps).length })
          }
        } else {
          results.push({ id: track.id, titulo: track.titulo, status: 'skipped', reason: 'no sections found' })
        }
      } catch (err) {
        console.error(`Erro processando ${track.titulo}:`, err)
        results.push({ id: track.id, titulo: track.titulo, status: 'error', error: String(err) })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
