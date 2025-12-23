import React, { useState } from "react";
import { useGoogleDoc, isGoogleDocsUrl } from "@/hooks/useGoogleDoc";
import { Loader2 } from "lucide-react";
import { transposeContent } from "@/utils/chordTransposer";
import { isChordLine, parseCifraStructure } from "@/utils/cifraClubParser";
import { normalizeSectionMarkers } from "@/utils/sectionNormalizer";
import { parseGoogleDocContent } from "@/utils/googleDocParser";
import { CifraEditor } from "./CifraEditor";

type CifraDisplayProps = {
  cifra?: string;
  cifraContent?: string; // Conteúdo extraído do CifraClub
  originalKey?: string;
  selectedKey?: string;
  capo?: number; // Capotraste (0 = sem capo, 1-12 = casa)
  activeSection?: string | null; // ID da seção ativa (quando clicada no SongMap)
  isEditing?: boolean;
  onEditClose?: () => void;
  onContentResolved?: (content: string) => void;
  onMetadataExtracted?: (metadata: { titulo?: string; versao?: string; tom?: string; referencia?: string }) => void;
  fontSize?: number; // Tamanho da fonte (em porcentagem: 100 = normal, 125 = maior, etc)
  columnLayout?: boolean; // Layout em colunas para desktop/tablet
  lyricsOnly?: boolean; // Exibir apenas letras (sem acordes)
};

// Mapeamento de cores de seção - Nova paleta do ChartBuilder
const SECTION_COLORS: Record<string, { borderColor: string; textColor: string }> = {
  I: { borderColor: '#F1C500', textColor: '#F1C500' }, // Intro - Amarelo
  V: { borderColor: '#4CB4FF', textColor: '#4CB4FF' }, // Verse 1 - Azul claro
  S: { borderColor: '#FF4848', textColor: '#FF4848' }, // Solo - Vermelho
  C: { borderColor: '#F59D00', textColor: '#F59D00' }, // Chorus/Refrão - Laranja
  R: { borderColor: '#F59D00', textColor: '#F59D00' }, // Refrão - Laranja
  PR: { borderColor: '#34CD62', textColor: '#34CD62' }, // Pré-Refrão - Verde
  PO: { borderColor: '#34CD62', textColor: '#34CD62' }, // Ponte - Verde
  B: { borderColor: '#9A58BB', textColor: '#9A58BB' }, // Bridge - Roxo
  TA: { borderColor: '#F1C500', textColor: '#F1C500' }, // Turnaround - Amarelo
  T: { borderColor: '#F1C500', textColor: '#F1C500' }, // Turnaround - Amarelo
  IS: { borderColor: '#9A58BB', textColor: '#9A58BB' }, // Instrumental - Roxo
  RF: { borderColor: '#FF4848', textColor: '#FF4848' }, // Riff - Vermelho
  O: { borderColor: '#45A2FF', textColor: '#45A2FF' }, // Outro - Azul
  IT: { borderColor: '#9A58BB', textColor: '#9A58BB' }, // Interlúdio - Roxo
};

const getSectionType = (sectionText: string): string | null => {
  const cleaned = sectionText.replace(/[\[\]]/g, '').trim().toUpperCase();
  if (cleaned.startsWith('INTRO') || cleaned === 'I') return 'I';
  if (cleaned.startsWith('VERS') || /^V\d*$/.test(cleaned)) return 'V';
  if (cleaned.startsWith('SOLO') || /^S\d*$/.test(cleaned)) return 'S';
  if (cleaned.startsWith('CHOR') || cleaned.startsWith('REFR') || /^[CR]\d*$/.test(cleaned)) return 'C';
  if (cleaned.startsWith('PRÉ') || cleaned.startsWith('PRE') || cleaned === 'PR') return 'PR';
  if (cleaned.startsWith('PONT') || cleaned.startsWith('PO')) return 'PO';
  if (cleaned.startsWith('BRIDGE') || /^B\d*$/.test(cleaned)) return 'B';
  if (cleaned.startsWith('TURN') || cleaned === 'TA') return 'TA';
  if (cleaned.startsWith('RIFF') || /^RF\d*$/.test(cleaned)) return 'RF';
  if (cleaned.startsWith('OUTRO') || cleaned === 'O') return 'O';
  if (cleaned.startsWith('INSTRU') || cleaned === 'IS' || cleaned === 'IN') return 'IS';
  if (cleaned.startsWith('INTERL') || cleaned === 'IT') return 'IT';
  return null;
};

// Normaliza o nome da seção para criar IDs compatíveis com o SongMap
const normalizeSectionLabel = (sectionText: string): string => {
  let rawType = sectionText.toUpperCase().trim();

  // Normaliza tipos por extenso PRIMEIRO (antes do regex)
  if (rawType.startsWith("VERSE")) {
    const num = rawType.replace("VERSE", "").trim();
    return num ? `V${num}` : "V1";
  }
  if (rawType.startsWith("VERSO")) {
    const num = rawType.replace("VERSO", "").trim();
    return num ? `V${num}` : "V1";
  }
  if (rawType.startsWith("SOLO")) {
    const num = rawType.replace("SOLO", "").trim();
    return num ? `S${num}` : "S";
  }
  if (rawType.startsWith("CHORUS")) {
    const num = rawType.replace("CHORUS", "").trim();
    return num ? `C${num}` : "C";
  }
  if (rawType.startsWith("REFRÃO")) {
    const num = rawType.replace("REFRÃO", "").trim();
    return num ? `R${num}` : "R";
  }
  if (rawType.startsWith("PRÉ-REFRÃO") || rawType.startsWith("PRE-CHORUS") || rawType === "PR" || rawType === "PC") {
    return "PR";
  }
  if (rawType.startsWith("PONTE") || rawType.startsWith("PO")) {
    return "PO";
  }
  if (rawType.startsWith("BRIDGE")) {
    const num = rawType.replace("BRIDGE", "").trim();
    return num ? `B${num}` : "B";
  }
  if (rawType.startsWith("INTRO")) {
    return "I";
  }
  if (rawType.startsWith("TURNAROUND") || rawType === "TA") {
    return "TA";
  }
  if (rawType.startsWith("TAG") || rawType === "TG") {
    return "TG";
  }
  if (rawType.startsWith("INSTRUMENTAL") || rawType === "IS" || rawType === "IN") {
    return "IS";
  }
  if (rawType.startsWith("RIFF") || rawType.startsWith("RF")) {
    const num = rawType.replace("RIFF", "").replace("RF", "").trim();
    return num ? `RF${num}` : "RF";
  }
  if (rawType.startsWith("OUTRO")) {
    return "O";
  }
  if (rawType.startsWith("INTERLÚDIO") || rawType === "IT") {
    return "IT";
  }

  // Fallback: Extrai número se existir (V1 -> V1, R2 -> R2)
  const numberMatch = rawType.match(/^([A-Z]+)(\d+)$/);
  if (numberMatch) {
    const type = numberMatch[1];
    const num = numberMatch[2];
    return `${type}${num}`;
  }

  // Se não reconheceu, retorna o texto original normalizado
  return sectionText.toLowerCase().replace(/\s+/g, '-');
};

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

const renderCifraContent = (
  content: string,
  activeSectionId?: string | null,
  onSectionClick?: (sectionId: string) => void,
  lyricsOnly: boolean = false
) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentSection: { type: string; startIndex: number; id: string } | null = null;
  const sectionLines: React.ReactNode[] = [];

  // PRIMEIRA PASSAGEM: Detecta todas as seções de refrão e extrai seus acordes
  const sectionRegex = /^\[(.+?)\]$/;
  const chorusSections: Array<{ lineIndex: number; sectionText: string; chords: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const sectionMatch = trimmed.match(sectionRegex);

    if (sectionMatch) {
      const sectionText = sectionMatch[1];
      const sectionType = getSectionType(sectionText);

      // Apenas para refrões/chorus
      if (sectionType === 'C') {
        // Encontra o fim desta seção (próxima seção ou fim do arquivo)
        let endLine = lines.length;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim().match(sectionRegex)) {
            endLine = j;
            break;
          }
        }

        const chords = extractSectionChords(lines, i + 1, endLine);
        chorusSections.push({ lineIndex: i, sectionText, chords });
      }
    }
  }

  // Detecta se há variações nos Refrões
  const uniqueChorusChords = new Set(chorusSections.map(c => c.chords));
  const hasChorusVariations = uniqueChorusChords.size > 1 && chorusSections.length > 1;

  // Mapeamento de acordes para números de refrão
  const chorusChordToNumber = new Map<string, number>();
  let chorusCounter = 0;

  // Popula o mapeamento na ordem de aparição
  chorusSections.forEach(({ chords }) => {
    if (hasChorusVariations && !chorusChordToNumber.has(chords)) {
      chorusCounter++;
      chorusChordToNumber.set(chords, chorusCounter);
    }
  });

  console.log(`[CifraDisplay] Detectadas ${chorusSections.length} ocorrências de Refrão com ${uniqueChorusChords.size} variações diferentes`);
  console.log(`[CifraDisplay] Aplicar numeração nos Refrões: ${hasChorusVariations}`);

  const finishSection = (lineIndex: number) => {
    if (currentSection && sectionLines.length > 0) {
      const sectionColor = SECTION_COLORS[currentSection.type];
      const isActive = activeSectionId === currentSection.id;

      // Borda lateral grossa sempre
      // Quando ativo: cor do label + bordas finas coloridas nas outras laterais
      const borderLeftColor = isActive && sectionColor ? sectionColor.borderColor : '#ffffff20';
      const borderOtherColor = isActive && sectionColor ? sectionColor.borderColor : 'transparent';

      const borderStyle = {
        borderLeftColor: borderLeftColor,
        borderLeftWidth: '4px',
        borderTopColor: borderOtherColor,
        borderRightColor: borderOtherColor,
        borderBottomColor: borderOtherColor,
      };

      // Bordas adicionais quando ativo (topo, direita, baixo) - finas e da cor do label
      const activeBorderClass = isActive ? 'border-t border-r border-b' : '';

      // Primeira seção não tem margin-top
      const isFirstSection = elements.length === 0;
      const marginClass = isFirstSection ? 'mb-2 sm:mb-3' : 'my-2 sm:my-3';

      // Última seção não tem padding-bottom nem margin-bottom
      const isLastSection = lineIndex >= lines.length;
      const paddingClass = isLastSection ? 'pt-3 sm:pt-4 px-3 sm:px-4' : 'p-3 sm:p-4';
      const finalMarginClass = isLastSection ? (isFirstSection ? '' : 'mt-2 sm:mt-3') : marginClass;

      elements.push(
        <div
          key={`section-${currentSection.startIndex}`}
          style={borderStyle}
          className={`bg-transparent border-l-[4px] ${activeBorderClass} rounded-r-lg ${paddingClass} ${finalMarginClass} transition-all duration-300 ease-in-out break-inside-avoid`}
        >
          {sectionLines.map((line, idx) => (
            <React.Fragment key={`line-${currentSection.startIndex}-${idx}`}>
              {line}
            </React.Fragment>
          ))}
        </div>
      );
      sectionLines.length = 0;
    }
  };

  // SEGUNDA PASSAGEM: Renderiza com numeração inteligente
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    // Detecta divisões/seções: [Intro], [Verso 1], etc.
    const sectionMatch = trimmed.match(/^\[(.+?)\]$/);
    if (sectionMatch) {
      finishSection(lineIndex);

      const sectionText = sectionMatch[1];
      const sectionType = getSectionType(sectionText);

      // Determina o label normalizado com numeração inteligente para refrões
      let normalizedLabel: string;
      if (sectionType === 'C' && hasChorusVariations) {
        // Encontra o fim desta seção para extrair os acordes
        let endLine = lines.length;
        for (let j = lineIndex + 1; j < lines.length; j++) {
          if (lines[j].trim().match(sectionRegex)) {
            endLine = j;
            break;
          }
        }
        const chords = extractSectionChords(lines, lineIndex + 1, endLine);
        const chorusNum = chorusChordToNumber.get(chords) || 1;
        normalizedLabel = `R${chorusNum}`;
      } else if (sectionType === 'C') {
        // Sem variações, usa apenas "R"
        normalizedLabel = 'R';
      } else {
        normalizedLabel = normalizeSectionLabel(sectionText);
      }

      const sectionId = `section-${normalizedLabel.toLowerCase()}`;

      currentSection = sectionType ? { type: sectionType, startIndex: lineIndex, id: sectionId } : null;

      // Título sempre com a cor da seção (igual aos botões do SongMap)
      const isActive = activeSectionId === sectionId;
      const sectionColor = sectionType ? SECTION_COLORS[sectionType] : null;
      const titleColor = sectionColor ? sectionColor.textColor : '#ffffffb3'; // usa cor da seção ou branco/70

      sectionLines.push(
        <div
          id={sectionId}
          key={lineIndex}
          onClick={() => onSectionClick?.(sectionId)}
          className="font-bold uppercase tracking-wider mb-2 scroll-mt-48 transition-all duration-300 cursor-pointer hover:opacity-80"
          style={{
            color: titleColor,
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
        >
          {sectionText}
        </div>
      );
      continue;
    }

    // Padrão [Seção] Acordes na mesma linha
    const sectionWithChordsMatch = trimmed.match(/^(\[.+?\])\s+(.+)$/);
    if (sectionWithChordsMatch) {
      const sectionPart = sectionWithChordsMatch[1];
      const chordsPart = sectionWithChordsMatch[2];

      if (isChordLine(chordsPart)) {
        finishSection(lineIndex);

        const sectionText = sectionPart.replace(/[\[\]]/g, '');
        const sectionType = getSectionType(sectionPart);

        // Aplica mesma lógica de numeração inteligente para inline sections
        let normalizedLabel: string;
        if (sectionType === 'C' && hasChorusVariations) {
          // Para seções inline com acordes, usa os acordes da própria linha
          const chords = chordsPart.trim();
          // Procura se há um mapeamento para esses acordes exatos ou usa o primeiro
          let chorusNum = 1;
          for (const [chordsKey, num] of chorusChordToNumber.entries()) {
            if (chordsKey.includes(chords) || chords.includes(chordsKey.split('|')[0])) {
              chorusNum = num;
              break;
            }
          }
          normalizedLabel = `R${chorusNum}`;
        } else if (sectionType === 'C') {
          normalizedLabel = 'R';
        } else {
          normalizedLabel = normalizeSectionLabel(sectionText);
        }

        const sectionId = `section-${normalizedLabel.toLowerCase()}`;

        currentSection = sectionType ? { type: sectionType, startIndex: lineIndex, id: sectionId } : null;

        // Título sempre com a cor da seção (igual aos botões do SongMap)
        const isActive = activeSectionId === sectionId;
        const sectionColor = sectionType ? SECTION_COLORS[sectionType] : null;
        const chordColor = isActive && sectionColor ? sectionColor.textColor : '#ffffff99';
        const titleColor = sectionColor ? sectionColor.textColor : '#ffffffb3'; // usa cor da seção ou branco/70

        sectionLines.push(
          <div key={lineIndex} id={sectionId} className="scroll-mt-48">
            <span
              onClick={() => onSectionClick?.(sectionId)}
              className="font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer hover:opacity-80"
              style={{
                color: titleColor,
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}
            >
              {sectionText}
            </span>
            <span
              className="font-semibold ml-2 transition-colors duration-300"
              style={{ color: chordColor, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              {chordsPart}
            </span>
          </div>
        );
        continue;
      }
    }

    // Identifica cifras musicais (acordes)
    if (isChordLine(line)) {
      // Se lyricsOnly está ativo, pula linhas de acordes
      if (lyricsOnly) {
        continue;
      }

      // Determina a cor dos acordes baseado se a seção está ativa
      const isActive = currentSection && activeSectionId === currentSection.id;
      const sectionColor = currentSection ? SECTION_COLORS[currentSection.type] : null;
      const chordColor = isActive && sectionColor ? sectionColor.textColor : '#ffffffcc'; // branco/80 quando inativo

      sectionLines.push(
        <div
          key={lineIndex}
          className="font-semibold whitespace-pre transition-colors duration-300"
          style={{ color: chordColor, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          {line || '\u00A0'}
        </div>
      );
      continue;
    }

    // Linha normal (letra da música)
    sectionLines.push(
      <div
        key={lineIndex}
        className="text-white whitespace-pre leading-relaxed"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        {line || '\u00A0'}
      </div>
    );
  }

  finishSection(lines.length);

  return elements;
};

export const CifraDisplay: React.FC<CifraDisplayProps> = ({
  cifra,
  cifraContent,
  originalKey,
  selectedKey,
  capo = 0,
  activeSection,
  isEditing = false,
  onEditClose,
  onContentResolved,
  onMetadataExtracted,
  fontSize = 100,
  columnLayout = false,
  lyricsOnly = false
}) => {
  const [editedContent, setEditedContent] = useState<string | undefined>();
  const [internalActiveSection, setInternalActiveSection] = useState<string | null>(null);

  const handleSectionClick = (sectionId: string) => {
    setInternalActiveSection(sectionId);
  };

  // Usa activeSection externo (do SongMap) ou interno (clique na cifra)
  const currentActiveSection = activeSection || internalActiveSection;

  const isDocUrl = isGoogleDocsUrl(cifra);
  const isCifraClub = cifra?.includes('cifraclub.com');

  // Só busca do Google Docs se não for CifraClub e não tiver cifraContent
  const { data: docContent, isLoading, error } = useGoogleDoc(!isCifraClub && !cifraContent ? cifra : undefined);

  // Extrai metadados de Google Docs (se aplicável)
  const processedDocContent = React.useMemo(() => {
    if (!docContent || !isDocUrl) return docContent;

    const parsed = parseGoogleDocContent(docContent);

    // Notifica o componente pai sobre os metadados extraídos
    if (onMetadataExtracted && (parsed.titulo || parsed.versao || parsed.tom || parsed.referencia)) {
      console.log('[CifraDisplay] Metadados extraídos do Google Docs:', {
        titulo: parsed.titulo,
        versao: parsed.versao,
        tom: parsed.tom,
        referencia: parsed.referencia
      });
      onMetadataExtracted({
        titulo: parsed.titulo,
        versao: parsed.versao,
        tom: parsed.tom,
        referencia: parsed.referencia
      });
    }

    // Retorna apenas o conteúdo da cifra (sem metadados)
    return parsed.cifraContent;
  }, [docContent, isDocUrl, onMetadataExtracted]);

  // Determina qual conteúdo usar (prioridade: editedContent > cifraContent > processedDocContent)
  const rawContent = editedContent || cifraContent || processedDocContent;

  // Normaliza marcadores de seção ANTES de qualquer processamento
  const contentToUse = React.useMemo(() => {
    return rawContent ? normalizeSectionMarkers(rawContent) : rawContent;
  }, [rawContent]);

  React.useEffect(() => {
    if (contentToUse) {
      onContentResolved?.(contentToUse);
    }
  }, [contentToUse, onContentResolved]);

  // Aplica transposição se necessário (tom + capotraste)
  const transposedContent = React.useMemo(() => {
    if (!contentToUse || !originalKey || !selectedKey) return contentToUse;

    // Primeiro transpõe para o tom selecionado
    let result = transposeContent(contentToUse, originalKey, selectedKey);

    // Se houver capotraste, transpõe para baixo (subtrai semitons)
    if (capo > 0) {
      // Para aplicar capo, transpomos os acordes para BAIXO
      // Exemplo: capo na casa 2 significa que C vira Bb (2 semitons abaixo)
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const currentKeyIndex = keys.findIndex(k => k === selectedKey || k === selectedKey.replace('b', '#'));
      if (currentKeyIndex !== -1) {
        const targetIndex = (currentKeyIndex - capo + 12) % 12;
        const targetKey = keys[targetIndex];
        result = transposeContent(result, selectedKey, targetKey);
      }
    }

    return result;
  }, [contentToUse, originalKey, selectedKey, capo]);

  // Aplica transposição para cifras simples
  const transposedCifra = React.useMemo(() => {
    if (!originalKey || !selectedKey || !cifra) return cifra;
    return transposeContent(cifra, originalKey, selectedKey);
  }, [cifra, originalKey, selectedKey]);

  if (!cifra && !cifraContent) {
    return null;
  }

  // Se tiver conteúdo extraído do CifraClub ou do Google Docs
  if (cifraContent || (isDocUrl && contentToUse)) {
    if (isLoading && !cifraContent) {
      return (
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando cifra...</span>
        </div>
      );
    }

    if (error && !cifraContent) {
      return (
        <div className="text-red-400 text-sm">
          Erro ao carregar cifra. <a href={cifra} target="_blank" rel="noopener noreferrer" className="underline">Abrir documento</a>
        </div>
      );
    }

    if (transposedContent || contentToUse) {
      const fontSizeStyle = {
        fontSize: `${fontSize}%`
      };

      // Analisa o tamanho da cifra para determinar número de colunas
      // Mobile: sempre 1 coluna (desabilitado)
      // Tablet: 2 colunas se tiver conteúdo suficiente
      // Desktop: 2 ou 3 colunas baseado no tamanho
      const content = transposedContent || contentToUse || '';
      const lines = content.split('\n');
      const sectionCount = lines.filter(line => line.trim().match(/^\[.+?\]$/)).length;
      const totalLines = lines.length;

      // Lógica de colunas automática:
      // - Mobile: sempre 1 coluna
      // - Tablet (md): 2 colunas se tiver 6+ seções OU 80+ linhas
      // - Desktop (lg): 3 colunas se tiver 10+ seções OU 120+ linhas, senão 2 colunas
      let columnClasses = "";
      if (columnLayout) {
        const shouldUse2ColumnsTablet = sectionCount >= 6 || totalLines >= 80;
        const shouldUse3ColumnsDesktop = sectionCount >= 10 || totalLines >= 120;

        if (shouldUse3ColumnsDesktop) {
          // Cifra grande: mobile=1, tablet=2, desktop=3
          columnClasses = "columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 lg:gap-10";
        } else if (shouldUse2ColumnsTablet) {
          // Cifra média: mobile=1, tablet=2, desktop=2
          columnClasses = "columns-1 md:columns-2 lg:columns-2 gap-6 md:gap-8 lg:gap-10";
        } else {
          // Cifra pequena: mobile=1, tablet=1, desktop=2
          columnClasses = "columns-1 md:columns-1 lg:columns-2 gap-6 md:gap-8 lg:gap-10";
        }
      }

      return (
        <>
          <div
            className={`font-sans overflow-x-auto overflow-y-auto leading-relaxed ${columnClasses}`}
            style={fontSizeStyle}
          >
            {renderCifraContent(content, currentActiveSection, handleSectionClick, lyricsOnly)}
          </div>

          {isEditing && cifra && cifraContent && onEditClose && (
            <CifraEditor
              cifraUrl={cifra}
              initialContent={editedContent || cifraContent}
              onClose={onEditClose}
              onSave={(newContent) => {
                setEditedContent(newContent);
                onEditClose();
              }}
            />
          )}
        </>
      );
    }
  }

  // Se não há conteúdo para exibir, não mostra nada
  return null;
};
