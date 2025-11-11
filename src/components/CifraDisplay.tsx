import React from "react";
import { useGoogleDoc, isGoogleDocsUrl } from "@/hooks/useGoogleDoc";
import { Loader2 } from "lucide-react";
import { transposeContent } from "@/utils/chordTransposer";

type CifraDisplayProps = {
  cifra?: string;
  originalKey?: string;
  selectedKey?: string;
};

// Regex para detectar acordes musicais
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g;

const renderCifraContent = (content: string, highlightTitle = false) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let titleRendered = !highlightTitle;
  let blankAfterTitleCount = 0;
  let ensuredTitleSpacing = !highlightTitle;

  const renderLine = (key: string | number, color: string, fontWeight: number | undefined, value: string) => (
    <div key={key} style={{ color, fontWeight, whiteSpace: 'pre' }}>
      {value || '\u00A0'}
    </div>
  );

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    if (!titleRendered && trimmed.length > 0) {
      elements.push(renderLine(`title-${lineIndex}`, 'white', 700, line));
      titleRendered = true;
      blankAfterTitleCount = 0;
      ensuredTitleSpacing = false;
      continue;
    }

    if (titleRendered && !ensuredTitleSpacing) {
      if (trimmed.length === 0) {
        blankAfterTitleCount++;
        // Não adiciona linhas em branco, apenas conta
        if (blankAfterTitleCount >= 0) {
          ensuredTitleSpacing = true;
        }
        continue;
      } else {
        // Não adiciona linhas em branco forçadas
        ensuredTitleSpacing = true;
      }
    }

    // Se a linha contém apenas acordes (sem letras longas)
    const hasOnlyChords = trimmed.length > 0 &&
                          trimmed.length < 50 &&
                          /^[A-G#b\s\/m0-9]+$/.test(trimmed);

    if (hasOnlyChords) {
      elements.push(renderLine(lineIndex, '#ff7700', undefined, line));
      continue;
    }

    elements.push(renderLine(lineIndex, 'white', undefined, line));
  }

  return elements;
};

export const CifraDisplay: React.FC<CifraDisplayProps> = ({ cifra, originalKey, selectedKey }) => {
  const isDocUrl = isGoogleDocsUrl(cifra);
  const { data: docContent, isLoading, error } = useGoogleDoc(cifra);

  // Aplica transposição se necessário (para Google Docs)
  const transposedContent = React.useMemo(() => {
    if (!docContent || !originalKey || !selectedKey) return docContent;
    return transposeContent(docContent, originalKey, selectedKey);
  }, [docContent, originalKey, selectedKey]);

  // Aplica transposição para cifras simples
  const transposedCifra = React.useMemo(() => {
    if (!originalKey || !selectedKey || !cifra) return cifra;
    return transposeContent(cifra, originalKey, selectedKey);
  }, [cifra, originalKey, selectedKey]);

  if (!cifra) {
    return null;
  }

  // Se for uma URL do Google Docs
  if (isDocUrl) {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando cifra...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-400 text-sm">
          Erro ao carregar cifra. <a href={cifra} target="_blank" rel="noopener noreferrer" className="underline">Abrir documento</a>
        </div>
      );
    }

    if (transposedContent || docContent) {
      return (
        <div className="mt-3 sm:mt-4 md:mt-5 w-full p-3 sm:p-4 md:p-5 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
          <div className="flex items-center justify-end mb-2 sm:mb-2.5">
            <a
              href={cifra}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1DB954] text-xs sm:text-sm hover:underline transition-colors"
            >
              Abrir no Google Docs
            </a>
          </div>
          <div className="text-sm sm:text-base md:text-lg font-mono overflow-x-auto max-h-[500px] sm:max-h-[600px] md:max-h-[700px] overflow-y-auto leading-relaxed">
            {renderCifraContent(transposedContent || docContent || '', true)}
          </div>
        </div>
      );
    }
  }

  // Se não for URL do Google Docs, exibe como texto normal (com transposição se aplicável)
  return (
    <p className="mt-2 sm:mt-3 md:mt-4 w-full font-semibold text-xs sm:text-sm" style={{ color: '#ff7700' }}>
      {transposedCifra}
    </p>
  );
};
