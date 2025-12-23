/**
 * Parser para extrair metadados de cifras em Google Docs
 *
 * Formato esperado:
 * Título: Nome da Música
 * Versão: Nome do Artista
 * Tom: A
 * Referência: https://youtube.com/...
 *
 * [Intro]
 * Cifra...
 */

export interface GoogleDocMetadata {
  titulo?: string;
  versao?: string;
  tom?: string;
  referencia?: string;
  cifraContent: string; // Conteúdo sem os metadados
}

/**
 * Extrai metadados de um documento Google Docs formatado
 */
export const parseGoogleDocContent = (content: string): GoogleDocMetadata => {
  const lines = content.split('\n');
  const metadata: GoogleDocMetadata = {
    cifraContent: content, // Por padrão, retorna todo o conteúdo
  };

  let cifraStartIndex = 0;

  // Procura por metadados nas primeiras 20 linhas
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim();

    // Título
    if (line.match(/^T[ií]tulo\s*:/i)) {
      metadata.titulo = line.replace(/^T[ií]tulo\s*:\s*/i, '').trim();
      cifraStartIndex = i + 1;
      continue;
    }

    // Versão
    if (line.match(/^Vers[ãa]o\s*:/i)) {
      metadata.versao = line.replace(/^Vers[ãa]o\s*:\s*/i, '').trim();
      cifraStartIndex = i + 1;
      continue;
    }

    // Tom
    if (line.match(/^Tom\s*:/i)) {
      metadata.tom = line.replace(/^Tom\s*:\s*/i, '').trim();
      cifraStartIndex = i + 1;
      continue;
    }

    // Referência (URL do YouTube)
    if (line.match(/^Refer[eê]ncia\s*:/i)) {
      const refMatch = line.match(/^Refer[eê]ncia\s*:\s*(.+)/i);
      if (refMatch) {
        metadata.referencia = refMatch[1].trim();
      }
      cifraStartIndex = i + 1;
      continue;
    }

    // Se encontrou uma seção ([Intro], [Verso], etc), para de procurar metadados
    if (line.match(/^\[.+\]$/)) {
      break;
    }
  }

  // Remove metadados do conteúdo da cifra
  if (cifraStartIndex > 0) {
    // Pula linhas vazias após os metadados
    while (cifraStartIndex < lines.length && lines[cifraStartIndex].trim() === '') {
      cifraStartIndex++;
    }
    metadata.cifraContent = lines.slice(cifraStartIndex).join('\n').trim();
  }

  return metadata;
};

/**
 * Valida se uma URL é do YouTube
 */
export const isYouTubeUrl = (url?: string): boolean => {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
};

/**
 * Extrai o ID do vídeo do YouTube de uma URL
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  // Padrões comuns de URLs do YouTube:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};
