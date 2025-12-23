/**
 * Normaliza marcadores de seções de cifras do CifraClub
 * para um formato padrão (ex: "Primeira Parte" -> "Verso 1")
 */

export const normalizeSectionMarkers = (content: string): string => {
  if (!content) return content;

  let normalized = content;

  // Normaliza "Primeira Parte" -> "Verso 1"
  normalized = normalized.replace(
    /\[(Primeira\s+Parte)\]/gi,
    "[Verso 1]"
  );

  // Normaliza "Segunda Parte" -> "Verso 2"
  normalized = normalized.replace(
    /\[(Segunda\s+Parte)\]/gi,
    "[Verso 2]"
  );

  // Normaliza "Terceira Parte" -> "Verso 3"
  normalized = normalized.replace(
    /\[(Terceira\s+Parte)\]/gi,
    "[Verso 3]"
  );

  // Normaliza "Quarta Parte" -> "Verso 4"
  normalized = normalized.replace(
    /\[(Quarta\s+Parte)\]/gi,
    "[Verso 4]"
  );

  // Normaliza "Quinta Parte" -> "Verso 5" (caso exista)
  normalized = normalized.replace(
    /\[(Quinta\s+Parte)\]/gi,
    "[Verso 5]"
  );

  // Normaliza "Final" -> "Outro"
  normalized = normalized.replace(
    /\[Final\]/gi,
    "[Outro]"
  );

  return normalized;
};
