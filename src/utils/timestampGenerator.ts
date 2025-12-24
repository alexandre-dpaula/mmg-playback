/**
 * Gera timestamps automáticos para seções de uma música
 * baseado na estrutura da cifra e duração estimada
 */

interface SectionInfo {
  id: string;
  lineIndex: number;
  lineCount: number; // Número de linhas da seção
}

/**
 * Extrai seções da cifra com informações de posição
 */
function extractSectionsInfo(cifraContent: string): SectionInfo[] {
  if (!cifraContent) return [];

  const lines = cifraContent.split('\n');
  const sections: SectionInfo[] = [];

  // Regex para detectar marcadores de seção
  const sectionRegex =
    /^\s*\[\s*(PRIMEIRA\s+PARTE|SEGUNDA\s+PARTE|TERCEIRA\s+PARTE|QUARTA\s+PARTE|REFRÃO\s+FINAL|INTRO|VERSE\s*\d*|VERSO\s*\d*|SOLO\s*\d*|CHORUS\s*\d*|REFRÃO\s*\d*|PRÉ[- ]?REFRÃO|PRE[- ]?CHORUS|PONTE|BRIDGE|TURNAROUND|TAG|INSTRUMENTAL|INTERLÚDIO|FINAL|SQ|V\d+|S\d+|C\d+|R\d+|PR|PC|PO|B\d*|TA|TG|IS|IN|RF|IT|I|[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]+)*)\s*\]/i;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].trim().match(sectionRegex);
    if (match) {
      const rawType = match[1].toUpperCase().trim();

      // Normaliza tipos comuns
      let sectionId = normalizeSectionType(rawType);

      // Conta linhas até a próxima seção
      let lineCount = 0;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().match(sectionRegex)) break;
        if (lines[j].trim()) lineCount++; // Só conta linhas não vazias
      }

      sections.push({
        id: sectionId,
        lineIndex: i,
        lineCount: Math.max(lineCount, 1), // Mínimo 1 linha
      });
    }
  }

  return sections;
}

/**
 * Normaliza o nome da seção para o formato padrão
 */
function normalizeSectionType(rawType: string): string {
  // Normaliza "Primeira Parte", etc.
  if (rawType === 'PRIMEIRA PARTE') return 'V1';
  if (rawType === 'SEGUNDA PARTE') return 'V2';
  if (rawType === 'TERCEIRA PARTE') return 'V3';
  if (rawType === 'QUARTA PARTE') return 'V4';

  // Normaliza tipos por extenso
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

  // Se já está no formato correto (V1, R2, etc.), mantém
  const shortMatch = rawType.match(/^([A-Z]+)(\d*)$/);
  if (shortMatch) return rawType;

  // Fallback: primeiras 2 letras
  return rawType.substring(0, 2);
}

/**
 * Gera timestamps automáticos baseado na estrutura da cifra
 * Distribui o tempo proporcionalmente ao número de linhas de cada seção
 */
export function generateTimestamps(
  cifraContent: string,
  estimatedDuration: number = 240 // 4 minutos por padrão
): Record<string, number> {
  const sections = extractSectionsInfo(cifraContent);

  if (sections.length === 0) {
    return {};
  }

  // Calcula total de linhas
  const totalLines = sections.reduce((sum, section) => sum + section.lineCount, 0);

  if (totalLines === 0) {
    return {};
  }

  // Gera timestamps proporcionais
  const timestamps: Record<string, number> = {};
  let currentTime = 0;

  sections.forEach((section, index) => {
    timestamps[section.id] = Math.round(currentTime);

    // Calcula duração desta seção (proporcional ao número de linhas)
    const proportion = section.lineCount / totalLines;
    const sectionDuration = estimatedDuration * proportion;

    currentTime += sectionDuration;
  });

  return timestamps;
}

/**
 * Estima a duração de uma música baseado no comprimento da cifra
 */
export function estimateDuration(cifraContent: string): number {
  if (!cifraContent) return 240; // 4 minutos padrão

  const lines = cifraContent.split('\n').filter(l => l.trim());
  const lineCount = lines.length;

  // Estimativa: ~2-3 segundos por linha de cifra
  // Músicas curtas: 2min (120s)
  // Músicas médias: 4min (240s)
  // Músicas longas: 6min (360s)

  if (lineCount < 50) return 120;  // 2 minutos
  if (lineCount < 100) return 180; // 3 minutos
  if (lineCount < 150) return 240; // 4 minutos
  if (lineCount < 200) return 300; // 5 minutos
  return 360; // 6 minutos
}

/**
 * Gera timestamps automáticos com estimativa de duração
 */
export function autoGenerateTimestamps(cifraContent: string): Record<string, number> {
  const duration = estimateDuration(cifraContent);
  return generateTimestamps(cifraContent, duration);
}
