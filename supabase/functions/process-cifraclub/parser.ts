/**
 * Utilitários compartilhados entre a Edge Function e os testes locais.
 * Contém apenas funções puras para facilitar o reaproveitamento em scripts Node.
 */

const ARTIST_SEPARATOR_REGEX = /\s*(?:-|–|—|•|·|\||:)\s*/;
const TRAILING_BRAND_REGEX = /\s*(?:-|–|—)\s*(cifra\s*club|letras(?:\.mus)?\.br).*$/i;
const LOWERCASE_WORDS = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'di']);

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
 * Extrai a URL da foto do artista do HTML do CifraClub
 */
export function parseArtistPhoto(html: string): string | null {
  try {
    const patterns = [
      /<div[^>]+id="side-menu"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
      /<img[^>]+src="(https:\/\/[^"]*(?:akam|cdn|artist-images|fotos)[^"]+\.(?:jpg|jpeg|png|webp))"/i,
      /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair foto do artista:', error);
    return null;
  }
}

/**
 * Mapa de tons menores para seus relativos maiores
 */
const MINOR_TO_RELATIVE_MAJOR: Record<string, string> = {
  'Am': 'C',
  'A#m': 'C#',
  'Bbm': 'C#',
  'Bm': 'D',
  'Cm': 'D#',
  'C#m': 'E',
  'Dbm': 'E',
  'Dm': 'F',
  'D#m': 'F#',
  'Ebm': 'F#',
  'Em': 'G',
  'Fm': 'G#',
  'F#m': 'A',
  'Gbm': 'A',
  'Gm': 'A#',
  'G#m': 'B',
  'Abm': 'B'
};

/**
 * Converte tom menor para seu relativo maior
 */
export function convertMinorToRelativeMajor(key: string): string {
  const normalized = key.trim();

  if (!normalized.toLowerCase().includes('m')) {
    return normalized;
  }

  const match = normalized.match(/^([A-G][#b]?)(m)(?![a-z])/i);
  if (!match) {
    return normalized;
  }

  const minorKey = `${match[1].toUpperCase()}m`;
  return MINOR_TO_RELATIVE_MAJOR[minorKey] || normalized;
}

/**
 * Extrai o tom (tonalidade) do HTML do CifraClub
 */
export function parseKey(html: string): string | null {
  try {
    let extractedKey: string | null = null;

    let tomMatch = html.match(/data-key="([A-G][#b]?m?)"/i);
    if (tomMatch?.[1]) {
      extractedKey = tomMatch[1].trim();
    }

    if (!extractedKey) {
      tomMatch = html.match(/Tom:\s*<[^>]+>([A-G][#b]?m?)<\/[^>]+>/i);
      if (tomMatch?.[1]) {
        extractedKey = tomMatch[1].trim();
      }
    }

    if (!extractedKey) {
      tomMatch = html.match(/id="cifra_tom"[^>]*>([A-G][#b]?m?)<\/[^>]+>/i);
      if (tomMatch?.[1]) {
        extractedKey = tomMatch[1].trim();
      }
    }

    if (!extractedKey) {
      tomMatch = html.match(/class="[^"]*key[^"]*"[^>]*>([A-G][#b]?m?)<\/[^>]+>/i);
      if (tomMatch?.[1]) {
        extractedKey = tomMatch[1].trim();
      }
    }

    if (!extractedKey) {
      const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      if (preMatch) {
        const lines = preMatch[1].split('\n');
        for (const line of lines.slice(0, 20)) {
          const chordMatch = line.match(/\b([A-G][#b]?m?)\b/);
          if (chordMatch?.[1]) {
            extractedKey = chordMatch[1].trim();
            break;
          }
        }
      }
    }

    if (extractedKey) {
      return convertMinorToRelativeMajor(extractedKey);
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair tom:', error);
    return null;
  }
}

const htmlEntityMap: Record<string, string> = {
  '&amp;': '&',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&lt;': '<',
  '&gt;': '>',
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(amp|nbsp|quot|lt|gt);/g, (match) => htmlEntityMap[match] ?? match);
}

function sanitizeTextCandidate(value?: string | null): string | null {
  if (!value) return null;
  const cleaned = decodeHtmlEntities(value)
    .replace(/\s+/g, ' ')
    .replace(/["'«»]/g, '')
    .trim();
  return cleaned || null;
}

function extractTitleParts(content: string): string[] {
  return content
    .replace(TRAILING_BRAND_REGEX, '')
    .split(ARTIST_SEPARATOR_REGEX)
    .map(part => part.trim())
    .filter(Boolean);
}

function extractFromMetaTag(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1] ?? null;
}

function extractArtistFromDescription(html: string): string | null {
  const description = extractFromMetaTag(html, /<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
  if (!description) return null;

  const parenthesesMatch = description.match(/\(([^)]+)\)\s+no\s+Cifra\s+Club/i);
  if (parenthesesMatch?.[1]) {
    return parenthesesMatch[1];
  }

  return null;
}

function extractFromBreadcrumb(html: string): string | null {
  const match = html.match(/Mais acessadas de\s+([^<]+)/i);
  return match?.[1] ?? null;
}

function extractFromArtistLink(html: string): string | null {
  const linkMatch = html.match(/<a[^>]+href="[^"]*\/artista\/[^"]+"[^>]*>([^<]+)<\/a>/i);
  if (linkMatch?.[1]) return linkMatch[1];

  const genericLinkMatch = html.match(/<a[^>]+href="\/([^"\/]+)\/"[^>]*>Mais acessadas de\s+([^<]+)<\/a>/i);
  if (genericLinkMatch?.[2]) return genericLinkMatch[2];

  return null;
}

function formatSlugValue(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && LOWERCASE_WORDS.has(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ')
    .trim();
}

function extractArtistFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const segments = urlObj.pathname.split('/').filter(Boolean);
    if (segments.length >= 1) {
      const artistSlug = decodeURIComponent(segments[0]).replace(/\.html$/i, '');
      if (artistSlug && !artistSlug.includes('.')) {
        return formatSlugValue(artistSlug);
      }
    }
  } catch {
    // Ignora erros ao tentar parsear URL
  }
  return null;
}

function extractSongFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const segments = urlObj.pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const songSlug = decodeURIComponent(segments[1])
        .replace(/\.html$/i, '')
        .replace(/-+$/g, '');
      if (songSlug) {
        return formatSlugValue(songSlug);
      }
    }
  } catch {
    // Ignora erros ao parsear URL
  }
  return null;
}

function extractTitleFromHeader(html: string): string | null {
  const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return match?.[1]?.trim() ?? null;
}

function extractTitlePartsFromMeta(html: string, pattern: RegExp): string[] | null {
  const match = html.match(pattern);
  if (!match?.[1]) return null;
  const parts = extractTitleParts(match[1]);
  return parts.length ? parts : null;
}

/**
 * Extrai a versão/intérprete do título da página
 */
export function parseVersion(html: string, sourceUrl?: string): string | null {
  try {
    const strategies: Array<() => string | null> = [
      () => {
        const parts = extractTitlePartsFromMeta(html, /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
        if (parts && parts.length >= 2) {
          return parts[parts.length - 1];
        }
        return null;
      },
      () => {
        const parts = extractTitlePartsFromMeta(html, /<title>\s*([^<]+)<\/title>/i);
        if (parts && parts.length >= 2) {
          return parts[parts.length - 1];
        }
        return null;
      },
      () => extractFromBreadcrumb(html),
      () => extractFromArtistLink(html),
      () => extractFromMetaTag(html, /data-artist="([^"]+)"/i),
      () => extractArtistFromDescription(html),
      () => extractArtistFromUrl(sourceUrl),
    ];

    for (const strategy of strategies) {
      const result = sanitizeTextCandidate(strategy());
      if (result) {
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair versão:', error);
    return null;
  }
}

export function parseSongTitle(html: string, sourceUrl?: string): string | null {
  try {
    const strategies: Array<() => string | null> = [
      () => {
        const parts = extractTitlePartsFromMeta(html, /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
        return parts?.[0] ?? null;
      },
      () => {
        const parts = extractTitlePartsFromMeta(html, /<title>\s*([^<]+)<\/title>/i);
        return parts?.[0] ?? null;
      },
      () => extractTitleFromHeader(html),
      () => extractSongFromUrl(sourceUrl),
    ];

    for (const strategy of strategies) {
      const result = sanitizeTextCandidate(strategy());
      if (result) {
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair título:', error);
    return null;
  }
}

/**
 * Verifica se uma linha é tablatura (TAB)
 */
function isTabLine(line: string): boolean {
  const trimmed = line.trim();

  if (/^\s*[EADGBe][\|\-\d\s]+/.test(trimmed)) return true;
  if (/^[\|\-\d\s]{10,}/.test(trimmed)) return true;
  if (/Parte\s+\d+\s+de\s+\d+/.test(trimmed)) return true;

  return false;
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
 * Extrai o conteúdo da cifra do HTML do CifraClub
 * Remove tablaturas e mantém apenas acordes e letras
 */
export function parseCifraClubContent(html: string): string {
  try {
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);

    if (!preMatch) {
      throw new Error('Não foi possível encontrar o conteúdo da cifra');
    }

    let content = preMatch[1];

    content = content.replace(/<span[^>]*class="tablatura"[^>]*>[\s\S]*?<\/span>/gi, '');

    content = content
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
      .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const lines = content.split('\n');
    const filteredLines: string[] = [];
    let insideTab = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (isTabSection(line)) {
        insideTab = true;
        continue;
      }

      if (insideTab && /^\[.+\]$/.test(trimmed) && !isTabSection(line)) {
        insideTab = false;
        filteredLines.push(line);
        continue;
      }

      if (insideTab || isTabLine(line)) {
        continue;
      }

      if (trimmed.startsWith('Tab -')) {
        continue;
      }

      filteredLines.push(line);
    }

    content = filteredLines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return content;
  } catch (error) {
    console.error('Erro ao processar cifra:', error);
    throw new Error('Erro ao processar conteúdo da cifra');
  }
}
