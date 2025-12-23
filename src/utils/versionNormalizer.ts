/**
 * Mapeia nomes de versões longas para suas abreviações
 */
const VERSION_ABBREVIATIONS: Record<string, string> = {
  // Florianopolis House of Prayer -> Fhop Music
  "florianopolis house of prayer": "Fhop Music",
  "florianópolis house of prayer": "Fhop Music",
  "fhop": "Fhop Music",

  // Kansas City -> IHOP KC ou IHOPKC
  "kansas city": "IHOPKC",
  "ihop kansas city": "IHOPKC",

  // International House of Prayer -> IHOP
  "international house of prayer": "IHOP",

  // Diante do Trono
  "diante do trono": "Diante do Trono",

  // Hillsong
  "hillsong worship": "Hillsong",
  "hillsong united": "Hillsong United",

  // Bethel Music
  "bethel music": "Bethel Music",

  // Adicione mais mapeamentos conforme necessário
};

/**
 * Normaliza o nome de uma versão, substituindo nomes longos por abreviações
 * @param version - Nome da versão a ser normalizado
 * @returns Nome normalizado da versão
 */
export function normalizeVersion(version: string | null | undefined): string {
  if (!version) return "";

  // Remove espaços extras e converte para lowercase para comparação
  const trimmed = version.trim();
  const lowercase = trimmed.toLowerCase();

  // Procura por abreviação exata
  if (VERSION_ABBREVIATIONS[lowercase]) {
    return VERSION_ABBREVIATIONS[lowercase];
  }

  // Procura por match parcial (ex: "Florianopolis House of Prayer (Fhop Music)")
  // Extrai o que está entre parênteses e capitaliza
  const parenthesesMatch = trimmed.match(/\(([^)]+)\)/);
  if (parenthesesMatch) {
    const extracted = parenthesesMatch[1].trim();
    // Capitaliza primeira letra de cada palavra
    return extracted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Se não encontrou abreviação, retorna o original
  return trimmed;
}

/**
 * Processa o nome da versão extraído do CifraClub
 * Remove prefixos comuns e normaliza
 */
export function processCifraClubVersion(version: string | null | undefined): string {
  if (!version) return "";

  let processed = version.trim();

  // Remove prefixos comuns do CifraClub
  processed = processed.replace(/^(Versão|Version|Ver\.|V\.)\s*/i, "");

  // Normaliza usando a função principal
  return normalizeVersion(processed);
}
