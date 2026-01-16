/**
 * Modal de confirmação quando música duplicada é detectada
 */

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Music2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Track, TrackSearchResult } from '@/services/trackService';

interface DuplicateTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchResult: TrackSearchResult;
  newTrackTitle: string;
  onConfirmUseExisting: () => void;
  onConfirmCreateNew: () => void;
}

export function DuplicateTrackDialog({
  open,
  onOpenChange,
  searchResult,
  newTrackTitle,
  onConfirmUseExisting,
  onConfirmCreateNew,
}: DuplicateTrackDialogProps) {
  const { track, similarity, matchType } = searchResult;

  if (!track) return null;

  const getMatchTypeLabel = () => {
    switch (matchType) {
      case 'exact-url':
        return 'URL do Cifra Club idêntica';
      case 'exact-title':
        return 'Título idêntico';
      case 'similar-title':
        return `Título ${similarity}% similar`;
      default:
        return 'Música similar';
    }
  };

  const getMatchIcon = () => {
    if (similarity === 100) {
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getMatchIcon()}
            <AlertDialogTitle className="text-white">
              Música Já Existe na Biblioteca
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="space-y-4">
            {/* Comparação visual */}
            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
              {/* Música que você está tentando adicionar */}
              <div>
                <p className="text-xs text-zinc-500 mb-1">Você está adicionando:</p>
                <div className="flex items-center gap-2 text-white">
                  <Music2 className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{newTrackTitle}</span>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-zinc-700" />

              {/* Música existente */}
              <div>
                <p className="text-xs text-zinc-500 mb-1">
                  Música existente ({getMatchTypeLabel()}):
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white">
                    <Music2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold">{track.title}</span>
                  </div>
                  {track.artist && (
                    <p className="text-sm text-zinc-400 ml-6">{track.artist}</p>
                  )}
                  {track.tom && (
                    <p className="text-xs text-zinc-500 ml-6">Tom: {track.tom}</p>
                  )}
                  {track.cifra_url && (
                    <p className="text-xs text-zinc-500 ml-6 truncate">
                      {track.cifra_url}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informação adicional */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Reutilizar a música existente evita duplicatas e mantém a biblioteca organizada!
                </span>
              </p>
            </div>

            {/* Aviso se similaridade não é 100% */}
            {similarity && similarity < 100 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-sm text-amber-400">
                  <strong>Atenção:</strong> Os títulos não são exatamente iguais. Se forem músicas
                  diferentes, clique em "Criar Nova Música".
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onConfirmCreateNew}
            className="bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700"
          >
            Criar Nova Música
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmUseExisting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Usar Música Existente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
