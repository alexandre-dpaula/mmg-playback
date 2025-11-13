import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key devem estar configurados no arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
