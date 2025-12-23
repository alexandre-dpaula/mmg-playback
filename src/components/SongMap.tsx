import React, { useMemo } from "react";
import { isChordLine } from "@/utils/cifraClubParser";

export interface SongSection {
  id: string;
  label: string;
  type: string;
  color: string;
  count?: number; // Para seções repetidas (V1, V2, C1, C2, etc)
}

interface SongMapProps {
  cifraContent?: string;
  className?: string;
  onSectionClick?: (sectionId: string) => void;
}

// Mapeamento de tipos de seção e suas cores - Nova paleta do ChartBuilder
const SECTION_COLORS: Record<string, string> = {
  I: "bg-transparent text-[#F1C500] border-[#F1C500]", // Intro - Amarelo
  V: "bg-transparent text-[#4CB4FF] border-[#4CB4FF]", // Verse 1 - Azul claro
  S: "bg-transparent text-[#FF4848] border-[#FF4848]", // Solo - Vermelho
  C: "bg-transparent text-[#F59D00] border-[#F59D00]", // Chorus/Refrão - Laranja
  R: "bg-transparent text-[#F59D00] border-[#F59D00]", // Refrão - Laranja
  PR: "bg-transparent text-[#34CD62] border-[#34CD62]", // Pré-Refrão - Verde
  PC: "bg-transparent text-[#34CD62] border-[#34CD62]", // Pré-Chorus - Verde
  P: "bg-transparent text-[#34CD62] border-[#34CD62]", // Ponte - Verde
  B: "bg-transparent text-[#9A58BB] border-[#9A58BB]", // Bridge - Roxo
  PO: "bg-transparent text-[#34CD62] border-[#34CD62]", // Ponte - Verde
  T: "bg-transparent text-[#F1C500] border-[#F1C500]", // Turnaround - Amarelo
  TA: "bg-transparent text-[#F1C500] border-[#F1C500]", // Turnaround - Amarelo
  TG: "bg-transparent text-[#FF4848] border-[#FF4848]", // Tag - Vermelho
  IS: "bg-transparent text-[#9A58BB] border-[#9A58BB]", // Instrumental - Roxo
  IN: "bg-transparent text-[#9A58BB] border-[#9A58BB]", // Instrumental - Roxo
  RF: "bg-transparent text-[#FF4848] border-[#FF4848]", // Riff - Vermelho
  O: "bg-transparent text-[#45A2FF] border-[#45A2FF]", // Outro - Azul
  IT: "bg-transparent text-[#9A58BB] border-[#9A58BB]", // Interlúdio - Roxo
};

const DEFAULT_COLOR = "bg-transparent text-white/70 border-white/40";

// Extrai apenas as linhas de acordes de uma seção para comparação
const extractSectionChords = (lines: string[], startIndex: number, endIndex: number): string => {
  const chords: string[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i];
    if (line && isChordLine(line.trim())) {
      chords.push(line.trim());
    }
  }
  return chords.join('|'); // Junta com pipe para criar assinatura única
};

// Mapeamento de cores para as bordas das seções na cifra
export const SECTION_BORDER_COLORS: Record<string, string> = {
  I: "border-l-[#F1C500]", // Intro - Amarelo
  V: "border-l-[#4CB4FF]", // Verse 1 - Azul claro
  S: "border-l-[#FF4848]", // Solo - Vermelho
  C: "border-l-[#F59D00]", // Chorus/Refrão - Laranja
  R: "border-l-[#F59D00]", // Refrão - Laranja
  PR: "border-l-[#34CD62]", // Pré-Refrão - Verde
  PC: "border-l-[#34CD62]", // Pré-Chorus - Verde
  P: "border-l-[#34CD62]", // Ponte - Verde
  B: "border-l-[#9A58BB]", // Bridge - Roxo
  PO: "border-l-[#34CD62]", // Ponte - Verde
  T: "border-l-[#F1C500]", // Turnaround - Amarelo
  TA: "border-l-[#F1C500]", // Turnaround - Amarelo
  TG: "border-l-[#FF4848]", // Tag - Vermelho
  IS: "border-l-[#9A58BB]", // Instrumental - Roxo
  IN: "border-l-[#9A58BB]", // Instrumental - Roxo
  RF: "border-l-[#FF4848]", // Refrão Final - Vermelho
  O: "border-l-[#45A2FF]", // Outro - Azul
  IT: "border-l-[#9A58BB]", // Interlúdio - Roxo
  SQ: "border-l-[#A0A0A0]", // Sequência (seção vazia) - Cinza
};

// Normaliza o conteúdo da cifra antes de processar
const normalizeCifraContent = (content: string): string => {
  if (!content) return content;

  console.log("[SongMap] Normalizando conteúdo da cifra...");

  // Substitui [ ] vazios ou apenas com espaços por [SQ] (Sequência)
  let normalized = content.replace(/\[\s*\]/g, '[SQ]');

  console.log("[SongMap] Normalização concluída");
  return normalized;
};

// Extrai seções da cifra
const extractSections = (content: string): SongSection[] => {
  if (!content) return [];

  console.log("[SongMap] Conteúdo recebido (primeiras 500 chars):", content.substring(0, 500));

  // Normaliza o conteúdo antes de processar
  const normalizedContent = normalizeCifraContent(content);
  const lines = normalizedContent.split("\n");

  // Regex para detectar marcadores de seção
  // Exemplos: [INTRO], [V1], [VERSE 1], [CHORUS], [SOLO 2], [PRÉ-REFRÃO], [Primeira Parte], etc.
  // IMPORTANTE: Ordem importa! Palavras completas ANTES de abreviações
  // EXIGE colchetes para evitar capturar acordes e letras
  // Seções personalizadas devem ter no mínimo 2 caracteres: [A-ZÀ-Ú]{2,}
  const sectionRegex =
    /^\s*\[\s*(PRIMEIRA\s+PARTE|SEGUNDA\s+PARTE|TERCEIRA\s+PARTE|QUARTA\s+PARTE|REFRÃO\s+FINAL|INTRO|VERSE\s*\d*|VERSO\s*\d*|SOLO\s*\d*|CHORUS\s*\d*|REFRÃO\s*\d*|PRÉ[- ]?REFRÃO|PRE[- ]?CHORUS|PONTE|BRIDGE|TURNAROUND|TAG|INSTRUMENTAL|INTERLÚDIO|FINAL|SQ|V\d+|S\d+|C\d+|R\d+|PR|PC|PO|B\d*|TA|TG|IS|IN|RF|IT|I|[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]+)*)\s*\]/i;

  // PRIMEIRA PASSAGEM: Detecta todas as seções e extrai seus acordes
  const sectionsWithChords: Array<{ lineIndex: number; rawType: string; chords: string; startLine: number; endLine: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].trim().match(sectionRegex);
    if (match) {
      const rawType = match[1].toUpperCase().trim();
      const startLine = i + 1;

      // Encontra o fim desta seção (próxima seção ou fim do arquivo)
      let endLine = lines.length;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().match(sectionRegex)) {
          endLine = j;
          break;
        }
      }

      const chords = extractSectionChords(lines, startLine, endLine);
      sectionsWithChords.push({ lineIndex: i, rawType, chords, startLine, endLine });
    }
  }

  // Detecta se há variações nos Refrões (R ou CHORUS)
  const chorusOccurrences = sectionsWithChords.filter(s =>
    s.rawType.startsWith("REFRÃO") ||
    s.rawType.startsWith("CHORUS") ||
    s.rawType === "R" ||
    s.rawType === "C"
  );

  const uniqueChorusChords = new Set(chorusOccurrences.map(c => c.chords));
  const hasChorusVariations = uniqueChorusChords.size > 1 && chorusOccurrences.length > 1;

  console.log(`[SongMap] Detectadas ${chorusOccurrences.length} ocorrências de Refrão com ${uniqueChorusChords.size} variações diferentes`);
  console.log(`[SongMap] Aplicar numeração nos Refrões: ${hasChorusVariations}`);

  // SEGUNDA PASSAGEM: Cria as seções com numeração
  const sections: SongSection[] = [];
  const seenSections = new Map<string, number>();
  const addedLabels = new Set<string>(); // Para evitar duplicatas no SongMap
  const chorusChordToNumber = new Map<string, number>();
  let chorusCounter = 0;

  sectionsWithChords.forEach(({ lineIndex, rawType: originalRawType, chords }) => {
    let rawType = originalRawType;
    console.log(`[SongMap] Linha ${lineIndex}: rawType original = "${rawType}"`);

    // Normaliza "Primeira Parte", "Segunda Parte", etc. para Versos
    if (rawType === "PRIMEIRA PARTE") {
      rawType = "VERSE 1";
    } else if (rawType === "SEGUNDA PARTE") {
      rawType = "VERSE 2";
    } else if (rawType === "TERCEIRA PARTE") {
      rawType = "VERSE 3";
    } else if (rawType === "QUARTA PARTE") {
      rawType = "VERSE 4";
    }

    // Normaliza tipos comuns
    let type = rawType;
    let label = rawType;

    // Processa tipos por extenso PRIMEIRO (antes do regex de números)
    if (rawType.startsWith("VERSE")) {
      type = "V";
      const num = rawType.replace("VERSE", "").trim();
      label = num ? `V${num}` : "V1";
    } else if (rawType.startsWith("VERSO")) {
      type = "V";
      const num = rawType.replace("VERSO", "").trim();
      label = num ? `V${num}` : "V1";
    } else if (rawType.startsWith("SOLO")) {
      type = "S";
      const num = rawType.replace("SOLO", "").trim();
      label = num ? `S${num}` : "S";
    } else if (rawType.startsWith("CHORUS") || rawType.startsWith("REFRÃO") || rawType === "C" || rawType === "R") {
      // LÓGICA INTELIGENTE: Numera apenas se houver variações
      if (hasChorusVariations) {
        // Verifica se já vimos esse conjunto de acordes antes
        if (!chorusChordToNumber.has(chords)) {
          chorusCounter++;
          chorusChordToNumber.set(chords, chorusCounter);
        }
        const num = chorusChordToNumber.get(chords);
        type = "R";
        label = `R${num}`;
      } else {
        // Sem variações: todos os refrões ficam como "R" sem número
        type = "R";
        label = "R";
      }
    } else if (
      rawType.startsWith("PRÉ-REFRÃO") ||
      rawType.startsWith("PRE-CHORUS") ||
      rawType === "PR" ||
      rawType === "PC"
    ) {
      type = "PR";
      label = "PR";
    } else if (rawType.startsWith("PONTE") || rawType.startsWith("PO")) {
      type = "PO";
      label = "PO";
    } else if (rawType.startsWith("BRIDGE")) {
      type = "B";
      const num = rawType.replace("BRIDGE", "").trim();
      label = num ? `B${num}` : "B";
    } else if (rawType.startsWith("INTRO")) {
      type = "I";
      label = "I";
    } else if (rawType.startsWith("TURNAROUND") || rawType === "TA") {
      type = "TA";
      label = "TA";
    } else if (rawType.startsWith("TAG") || rawType === "TG") {
      type = "TG";
      label = "TG";
    } else if (
      rawType.startsWith("INSTRUMENTAL") ||
      rawType === "IS" ||
      rawType === "IN"
    ) {
      type = "IS";
      label = "IS";
    } else if (rawType.startsWith("INTERLÚDIO") || rawType === "IT") {
      type = "IT";
      label = "IT";
    } else if (rawType.startsWith("REFRÃO FINAL") || rawType === "FINAL" || rawType === "RF") {
      type = "RF";
      label = "RF";
    } else if (rawType === "SQ") {
      type = "SQ";
      label = "SQ";
    } else {
      // Fallback: Mantém números se existir (V1 -> V1, C2 -> C2)
      const numberMatch = rawType.match(/^([A-Z]+)(\d+)$/);
      if (numberMatch) {
        type = numberMatch[1];
        const num = numberMatch[2];
        label = `${type}${num}`; // Mantém V1, V2, C1, etc.
      } else {
        // Seção personalizada: usa o nome original com label das 2 primeiras letras
        type = rawType;
        label = rawType.substring(0, 2);
      }
    }

    // Conta ocorrências para adicionar números automaticamente se necessário
    const baseType = type.replace(/\d+$/, "");
    const count = (seenSections.get(baseType) || 0) + 1;
    seenSections.set(baseType, count);

    const color = SECTION_COLORS[baseType] || DEFAULT_COLOR;

    console.log(`[SongMap] Processando seção: label="${label}", type="${type}", baseType="${baseType}"`);

    // Adiciona apenas se ainda não foi adicionada (evita duplicatas no SongMap)
    if (!addedLabels.has(label)) {
      addedLabels.add(label);
      sections.push({
        id: `${type}-${sections.length}`,
        label,
        type: baseType,
        color,
        count,
      });
      console.log(`[SongMap] ✓ Seção "${label}" adicionada ao SongMap`);
    } else {
      console.log(`[SongMap] ✗ Seção "${label}" já existe, ignorando duplicata`);
    }
  });

  return sections;
};

export const SongMap: React.FC<SongMapProps> = ({
  cifraContent,
  className = "",
  onSectionClick
}) => {
  const sections = useMemo(() => {
    return extractSections(cifraContent || "");
  }, [cifraContent]);

  const handleSectionClick = (section: SongSection) => {
    // Cria o ID exatamente como está no CifraDisplay
    // Exemplo: "V1" -> "section-v1", "Verso 1" -> "section-verso-1"
    const sectionId = `section-${section.label.toLowerCase().replace(/\s+/g, '-')}`;

    const element = document.getElementById(sectionId);

    if (element) {
      // Scroll para o topo da seção
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        onSectionClick?.(sectionId);
      }, 300);
    }
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Container com scroll horizontal */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="flex pb-1 min-w-min" style={{ gap: '-0.5rem' }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section)}
              className={`
                flex-shrink-0
                px-4 sm:px-5
                py-2 sm:py-2.5
                rounded-full
                border-2
                font-bold
                text-sm sm:text-base
                uppercase
                tracking-wide
                transition-all
                duration-200
                hover:scale-105
                active:scale-95
                ${section.color}
              `}
              aria-label={`Ir para ${section.label}`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
