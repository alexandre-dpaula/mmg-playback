/**
 * Utilitários para extrair e processar cifras do CifraClub
 */

import type { CifraMetadata, ParsedCifra, CifraSection } from '@/types/cifra';

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
 * Extrai metadados da cifra (título, artista, tom, versão)
 */
export function extractCifraMetadata(html: string): CifraMetadata {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('h1')?.textContent?.trim();
    const artist = doc.querySelector('.artist-name, .artist_name, [itemprop="byArtist"]')?.textContent?.trim();

    // Tentar extrair o tom original da cifra
    let originalKey = doc.querySelector('.cifra_tom, .original-key, [data-cipher-key]')?.textContent?.trim();

    // Se não encontrou, tenta extrair do conteúdo da página
    if (!originalKey) {
      const tomMatch = doc.body.textContent?.match(/Tom:\s*([A-G][#b]?[m]?)/i);
      if (tomMatch) {
        originalKey = tomMatch[1];
      }
    }

    // Extrair versão (se houver)
    const versionElement = doc.querySelector('.version, .cifra_versao');
    const version = versionElement?.textContent?.trim();

    return {
      title,
      artist,
      originalKey,
      version,
    };
  } catch (error) {
    console.error('Erro ao extrair metadados:', error);
    return {};
  }
}

/**
 * Verifica se uma linha é uma tablatura (TAB)
 * Tablaturas geralmente contêm sequências de números e símbolos |-E-B-G-D-A-E
 */
function isTabLine(line: string): boolean {
  const trimmed = line.trim();

  // Verifica se contém indicadores típicos de tablatura
  if (/^\s*[EADGBe][\|\-\d\s]+/.test(trimmed)) return true;
  if (/^[\|\-\d\s]{10,}/.test(trimmed)) return true;
  if (/Parte\s+\d+\s+de\s+\d+/.test(trimmed)) return true;

  return false;
}

/**
 * Verifica se uma linha contém apenas acordes musicais
 * Cifras universais: C, D, E, F, G, A, B com modificadores (#, b, m, maj, etc.)
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();

  // Linha vazia não é acorde
  if (!trimmed) return false;

  // Muito longa para ser linha de acordes
  if (trimmed.length > 120) return false;

  // Regex melhorado para capturar acordes complexos:
  // - Nota base: A-G
  // - Acidentes: ##, #, bb, b (opcional) - captura também inválidos para normalizar
  // - Qualidade: m, maj, min, dim, aug, sus, add (opcional)
  // - Extensões: números como 7, 9, 11, 13 (opcional)
  // - Extensões complexas: (9), (11), (add9), etc (opcional)
  // - Baixo invertido: /[A-G][acidentes]? (opcional)
  const chordPattern = /\b([A-G](?:##|bb|#|b)?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\([^)]+\))?(?:\/[A-G](?:##|bb|#|b)?)?)\b/g;
  const chords = trimmed.match(chordPattern) || [];

  // Remove os acordes encontrados
  let withoutChords = trimmed;
  chords.forEach(chord => {
    withoutChords = withoutChords.replace(chord, '');
  });

  // Após remover acordes, deve sobrar principalmente espaços e alguns símbolos (parênteses, etc)
  const remaining = withoutChords.replace(/[\s\(\)\[\]]/g, '');

  // Se tem acordes e pouco texto restante, é linha de acordes
  // Tolerância maior para linhas com acordes complexos
  return chords.length > 0 && remaining.length < 10;
}

/**
 * Verifica se uma seção é de tablatura/dedilhado (deve ser removida)
 */
function isTabSection(line: string): boolean {
  const trimmed = line.trim().toLowerCase();

  if (/^\[.*dedilhado/.test(trimmed)) return true;
  if (/^\[.*tablatura/.test(trimmed)) return true;
  if (/^\[.*\btab\b/.test(trimmed)) return true;
  if (/^\[.*riff/.test(trimmed)) return true;
  if (/^\[.*solo\s+\(tab/.test(trimmed)) return true;
  if (/^dedilhado\b/.test(trimmed)) return true;
  if (/^tab\b/.test(trimmed)) return true;

  return false;
}

/**
 * Detecta seções da música (Intro, Verso, Refrão, etc.)
 * Retorna null se for seção de tab que deve ser removida
 */
function detectSection(line: string): { isSection: boolean; type: CifraSection['type']; label: string } | null {
  const trimmed = line.trim();

  // Se é seção de tab/dedilhado, retorna null para ser removida
  if (isTabSection(trimmed)) {
    return null;
  }

  const sectionPatterns: Array<{ pattern: RegExp; type: CifraSection['type'] }> = [
    { pattern: /^\[?\s*intro/i, type: 'intro' },
    { pattern: /^\[?\s*(primeira parte|segunda parte|terceira parte|parte \d+|verso|verse)/i, type: 'verse' },
    { pattern: /^\[?\s*(refr[aã]o|chorus|coro)/i, type: 'chorus' },
    { pattern: /^\[?\s*(ponte|bridge)/i, type: 'bridge' },
    { pattern: /^\[?\s*(final|outro)/i, type: 'outro' },
    { pattern: /^\[?\s*solo/i, type: 'solo' },
  ];

  for (const { pattern, type } of sectionPatterns) {
    if (pattern.test(trimmed)) {
      return { isSection: true, type, label: line.trim() };
    }
  }

  // Verifica padrão genérico [Texto] - aceita qualquer seção que não seja tab
  if (/^\[.+\]$/.test(trimmed)) {
    return { isSection: true, type: 'other', label: line.trim() };
  }

  return { isSection: false, type: 'other', label: '' };
}

/**
 * Processa o conteúdo da cifra e organiza em seções
 * Ignora tablaturas e dedilhados conforme solicitado
 */
export function parseCifraStructure(content: string): ParsedCifra {
  const lines = content.split('\n');
  const sections: CifraSection[] = [];
  let currentSection: CifraSection | null = null;
  let insideTab = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Ignora linhas vazias no início
    if (!currentSection && !trimmed) continue;

    // Detecta seção
    const sectionInfo = detectSection(line);

    // Se retornou null, é uma seção de tab/dedilhado - marca para ignorar
    if (sectionInfo === null) {
      insideTab = true;
      continue;
    }

    // Se é uma seção válida
    if (sectionInfo.isSection) {
      // Salva seção anterior se existir
      if (currentSection) {
        sections.push(currentSection);
      }

      // Cria nova seção
      currentSection = {
        type: sectionInfo.type,
        label: sectionInfo.label,
        content: []
      };
      insideTab = false;
      continue;
    }

    // Ignora linhas de tab
    if (insideTab || isTabLine(line)) {
      insideTab = true;
      // Se encontrar linha que não é tab, sai do modo tab
      if (!isTabLine(line) && trimmed && !trimmed.startsWith('Parte')) {
        insideTab = false;
      } else {
        continue;
      }
    }

    // Adiciona linha à seção atual
    if (!insideTab) {
      if (!currentSection) {
        currentSection = {
          type: 'other',
          label: '',
          content: []
        };
      }
      currentSection.content.push(line);
    }
  }

  // Adiciona última seção
  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return {
    metadata: {},
    sections,
    rawContent: content
  };
}
