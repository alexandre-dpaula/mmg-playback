import React, { useState } from "react";
import { useGoogleDoc, isGoogleDocsUrl } from "@/hooks/useGoogleDoc";
import { Loader2 } from "lucide-react";
import { transposeContent } from "@/utils/chordTransposer";
import { CifraEditor } from "./CifraEditor";

type CifraDisplayProps = {
  cifra?: string;
  cifraContent?: string; // Conteúdo extraído do CifraClub
  originalKey?: string;
  selectedKey?: string;
  onEditClick?: () => void;
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
                          /^[A-G#b\s/m0-9]+$/.test(trimmed);

    if (hasOnlyChords) {
      elements.push(renderLine(lineIndex, '#ff7700', undefined, line));
      continue;
    }

    elements.push(renderLine(lineIndex, 'white', undefined, line));
  }

  return elements;
};

export const CifraDisplay: React.FC<CifraDisplayProps> = ({ cifra, cifraContent, originalKey, selectedKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string | undefined>();

  const isDocUrl = isGoogleDocsUrl(cifra);
  const isCifraClub = cifra?.includes('cifraclub.com');

  // Só busca do Google Docs se não for CifraClub e não tiver cifraContent
  const { data: docContent, isLoading, error } = useGoogleDoc(!isCifraClub && !cifraContent ? cifra : undefined);

  // Determina qual conteúdo usar (prioridade: editedContent > cifraContent > docContent)
  const contentToUse = editedContent || cifraContent || docContent;

  // Aplica transposição se necessário
  const transposedContent = React.useMemo(() => {
    if (!contentToUse || !originalKey || !selectedKey) return contentToUse;
    return transposeContent(contentToUse, originalKey, selectedKey);
  }, [contentToUse, originalKey, selectedKey]);

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
      return (
        <>
          <div className="text-sm sm:text-base md:text-lg font-mono overflow-x-auto max-h-[500px] sm:max-h-[600px] md:max-h-[700px] overflow-y-auto leading-relaxed">
            {renderCifraContent(transposedContent || contentToUse || '', true)}
          </div>

          {isEditing && cifra && cifraContent && (
            <CifraEditor
              cifraUrl={cifra}
              initialContent={editedContent || cifraContent}
              onClose={() => setIsEditing(false)}
              onSave={(newContent) => {
                setEditedContent(newContent);
                setIsEditing(false);
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
