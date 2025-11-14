/**
 * Utilitários para extrair e processar cifras do CifraClub
 */

/**
 * Verifica se uma URL é do CifraClub
 */
export function isCifraClubUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('cifraclub.com');
  } catch {
    return false;
  }
}

/**
 * Extrai o conteúdo da cifra do HTML do CifraClub
 * Remove tags HTML e mantém apenas letra + acordes formatados
 */
export function parseCifraClubContent(html: string): string {
  try {
    // Criar um elemento temporário para parsear HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // O CifraClub usa a tag <pre> para o conteúdo da cifra
    const preElement = doc.querySelector('pre');

    if (!preElement) {
      throw new Error('Não foi possível encontrar o conteúdo da cifra na página');
    }

    let result = '';

    // Processar cada nó dentro do <pre>
    const processNode = (node: Node): string => {
      let text = '';

      if (node.nodeType === Node.TEXT_NODE) {
        // Texto normal (letra da música)
        text = node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        if (element.tagName === 'B' || element.classList.contains('js-modal-trigger')) {
          // Acordes em negrito - adicionar em MAIÚSCULAS
          text = element.textContent || '';
        } else if (element.classList.contains('tablatura')) {
          // Tablaturas - manter formatação
          text = '\n' + (element.textContent || '').trim() + '\n';
        } else if (element.tagName === 'SPAN') {
          // Spans podem conter tablatura ou outras partes
          text = element.textContent || '';
        } else {
          // Outros elementos - processar filhos recursivamente
          element.childNodes.forEach(child => {
            text += processNode(child);
          });
        }
      }

      return text;
    };

    // Processar todos os filhos do <pre>
    preElement.childNodes.forEach(child => {
      result += processNode(child);
    });

    // Limpar resultado
    result = result
      .replace(/\n{3,}/g, '\n\n')  // Remover linhas em branco excessivas
      .trim();

    return result;
  } catch (error) {
    console.error('Erro ao processar cifra do CifraClub:', error);
    throw new Error('Erro ao processar conteúdo da cifra');
  }
}

/**
 * Busca a cifra do CifraClub via proxy/CORS
 * Nota: Pode ser necessário usar um proxy CORS ou backend para fazer a requisição
 */
export async function fetchCifraClubContent(url: string): Promise<string> {
  try {
    if (!isCifraClubUrl(url)) {
      throw new Error('URL não é do CifraClub');
    }

    // Tentar buscar diretamente (pode falhar por CORS)
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar cifra: ${response.statusText}`);
    }

    const html = await response.text();
    return parseCifraClubContent(html);
  } catch (error) {
    console.error('Erro ao buscar cifra do CifraClub:', error);
    throw new Error('Não foi possível buscar a cifra. Copie e cole o conteúdo manualmente.');
  }
}

/**
 * Extrai metadados da cifra (título, artista, tom)
 */
export function extractCifraMetadata(html: string): {
  title?: string;
  artist?: string;
  originalKey?: string;
} {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('h1')?.textContent?.trim();
    const artist = doc.querySelector('.artist-name')?.textContent?.trim();

    // Tentar extrair o tom original da cifra
    const originalKey = doc.querySelector('.original-key')?.textContent?.trim();

    return {
      title,
      artist,
      originalKey,
    };
  } catch (error) {
    console.error('Erro ao extrair metadados:', error);
    return {};
  }
}
