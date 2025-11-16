import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('⚠️ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não foram carregados. Verifique seu arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Retorna a URL pública de um pad do Supabase Storage
 * @param fileName - Nome do arquivo do pad
 * @returns URL pública do arquivo
 */
export function getPadUrl(fileName: string): string {
  const { data } = supabase.storage
    .from('pads')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Faz upload de arquivo de áudio para o Supabase Storage
 * @param file - Arquivo de áudio a ser enviado
 * @param folder - Pasta no bucket (default: "audios")
 * @returns URL pública do arquivo
 */
export async function uploadAudioToSupabase(
  file: File,
  folder: string = 'audios'
): Promise<string> {
  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${folder}/${fileName}`;

    // Upload do arquivo para o bucket 'mmg-audios'
    const { data, error } = await supabase.storage
      .from('mmg-audios')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    // Obter URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from('mmg-audios')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload para Supabase:', error);
    throw error;
  }
}

/**
 * Remove arquivo de áudio do Supabase Storage
 * @param filePath - Caminho do arquivo no bucket
 */
export async function deleteAudioFromSupabase(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('mmg-audios')
      .remove([filePath]);

    if (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao deletar arquivo do Supabase:', error);
    throw error;
  }
}

/**
 * Interface para dados de uma faixa musical
 */
export interface Track {
  evento: string;
  titulo: string;
  tag: string;
  tom: string;
  versao: string;
  cifra_url: string;
  audio_url: string;
}

/**
 * Adiciona uma nova faixa musical no banco de dados Supabase
 * @param track - Dados da faixa a ser adicionada
 * @returns ID da faixa criada
 * @throws Error se houver falha ao salvar
 */
export async function addTrackToSupabase(track: Track): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .insert({
        evento: track.evento || '',
        titulo: track.titulo,
        tag: track.tag || '',
        tom: track.tom || '',
        versao: track.versao || '',
        cifra_url: track.cifra_url || '',
        audio_url: track.audio_url || '',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao salvar faixa no Supabase:', error);
      throw new Error(`Erro ao salvar faixa no banco: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('Erro ao adicionar faixa:', error);
    throw error;
  }
}

/**
 * Processa cifra do CifraClub via Edge Function
 * @param trackId - ID da faixa
 * @param cifraUrl - URL do CifraClub
 */
export async function processCifraClub(trackId: string, cifraUrl: string): Promise<void> {
  try {
    // Verificar se é URL do CifraClub
    if (!cifraUrl.includes('cifraclub.com')) {
      return; // Não é CifraClub, não faz nada
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const functionUrl = `${supabaseUrl}/functions/v1/process-cifraclub`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        trackId,
        cifraUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao processar cifra');
    }

    const result = await response.json();
    console.log('Cifra processada:', result);
  } catch (error) {
    console.error('Erro ao processar cifra do CifraClub:', error);
    // Não lança erro para não bloquear o fluxo principal
    // A cifra será processada pelo webhook como fallback
  }
}

interface CifraPreviewResponse {
  title: string | null;
  version: string | null;
  key: string | null;
}

/**
 * Busca título, versão e tom de uma URL do CifraClub sem salvar no banco
 */
export async function fetchCifraPreview(cifraUrl: string): Promise<CifraPreviewResponse | null> {
  if (!cifraUrl || !cifraUrl.includes('cifraclub.com')) {
    return null;
  }

  const functionUrl = `${supabaseUrl}/functions/v1/process-cifraclub`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      // Mantém compatibilidade com versões antigas da function exigindo UUID
      trackId: '00000000-0000-0000-0000-000000000000',
      cifraUrl,
      previewOnly: true,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.success) {
    const message = data?.error || 'Erro ao buscar prévia da cifra';
    throw new Error(message);
  }

  return {
    title: data.title ?? null,
    version: data.version ?? null,
    key: data.key ?? null,
  };
}

/**
 * Busca conteúdo de cifras extraídas do CifraClub
 * @returns Map de cifra_url para { content, artistPhoto }
 */
export async function getCifraContents(): Promise<Map<string, { content: string; artistPhoto?: string }>> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('cifra_url, cifra_content, artist_photo')
      .not('cifra_content', 'is', null)
      .not('cifra_url', 'is', null);

    if (error) {
      console.error('Erro ao buscar cifras:', error);
      return new Map();
    }

    const map = new Map<string, { content: string; artistPhoto?: string }>();
    data?.forEach((row) => {
      if (row.cifra_url && row.cifra_content) {
        map.set(row.cifra_url, {
          content: row.cifra_content,
          artistPhoto: row.artist_photo || undefined,
        });
      }
    });

    return map;
  } catch (error) {
    console.error('Erro ao buscar cifras do Supabase:', error);
    return new Map();
  }
}

/**
 * Atualiza o conteúdo da cifra no Supabase
 * @param cifraUrl - URL da cifra (chave única)
 * @param newContent - Novo conteúdo da cifra
 */
export async function updateCifraContent(cifraUrl: string, newContent: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tracks')
      .update({ cifra_content: newContent })
      .eq('cifra_url', cifraUrl);

    if (error) {
      console.error('Erro ao atualizar cifra:', error);
      throw new Error(`Erro ao atualizar cifra: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar cifra no Supabase:', error);
    throw error;
  }
}
