import React, { useState } from "react";
import { useGoogleDoc, isGoogleDocsUrl } from "@/hooks/useGoogleDoc";
import { Loader2 } from "lucide-react";
import { transposeContent } from "@/utils/chordTransposer";
import { isChordLine, parseCifraStructure } from "@/utils/cifraClubParser";
import { CifraEditor } from "./CifraEditor";

type CifraDisplayProps = {
  cifra?: string;
  cifraContent?: string; // Conteúdo extraído do CifraClub
  originalKey?: string;
  selectedKey?: string;
  isEditing?: boolean;
  onEditClose?: () => void;
};

const renderCifraContent = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  const renderLine = (key: string | number, color: string, fontWeight: number | undefined, value: string, isSectionLabel = false) => (
    <div
      key={key}
      style={{
        color,
        fontWeight,
        whiteSpace: 'pre',
        marginTop: isSectionLabel ? '1rem' : undefined,
        marginBottom: isSectionLabel ? '0.5rem' : undefined,
      }}
    >
      {value || '\u00A0'}
    </div>
  );

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    // Detecta padrão [Seção] Acordes na mesma linha
    // Ex: [Intro] A D/F# E D2
    const sectionWithChordsMatch = trimmed.match(/^(\[.+?\])\s+(.+)$/);
    if (sectionWithChordsMatch) {
      const sectionPart = sectionWithChordsMatch[1];
      const chordsPart = sectionWithChordsMatch[2];

      // Verifica se a parte após a seção contém acordes
      if (isChordLine(chordsPart)) {
        elements.push(
          <div key={lineIndex} style={{ whiteSpace: 'pre', marginTop: '1rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 600 }}>{sectionPart}</span>
            <span style={{ color: '#ff7700', fontWeight: 600 }}> {chordsPart}</span>
          </div>
        );
        continue;
      }
    }

    // Detecta divisões/seções: [Intro], [Primeira Parte], etc.
    const isSectionLabel = /^\[.+\]$/.test(trimmed);
    if (isSectionLabel) {
      elements.push(renderLine(lineIndex, 'rgba(255, 255, 255, 0.3)', 600, line, true));
      continue;
    }

    // Identifica cifras musicais universais (linha laranja)
    if (isChordLine(line)) {
      elements.push(renderLine(lineIndex, '#ff7700', 600, line));
      continue;
    }

    // Linha normal (letra da música)
    elements.push(renderLine(lineIndex, 'white', undefined, line));
  }

  return elements;
};

export const CifraDisplay: React.FC<CifraDisplayProps> = ({
  cifra,
  cifraContent,
  originalKey,
  selectedKey,
  isEditing = false,
  onEditClose
}) => {
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
            {renderCifraContent(transposedContent || contentToUse || '')}
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
