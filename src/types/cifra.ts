/**
 * Tipos para processamento de cifras musicais
 */

export interface CifraMetadata {
  title?: string;
  artist?: string;
  originalKey?: string;
  version?: string;
}

export interface CifraSection {
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'solo' | 'tab' | 'other';
  label: string;
  content: string[];
}

export interface ParsedCifra {
  metadata: CifraMetadata;
  sections: CifraSection[];
  rawContent: string;
}

export interface CifraLine {
  text: string;
  isChordLine: boolean;
  isSection: boolean;
  isTab: boolean;
}
