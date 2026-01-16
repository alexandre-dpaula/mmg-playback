/**
 * Hook unificado para adicionar músicas
 * Funciona tanto para ENSAIOS quanto para EVENTOS
 * Detecta duplicatas e mostra confirmação
 */

import { useState } from 'react';
import { TrackService, TrackSearchResult } from '@/services/trackService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface UseAddTrackOptions {
  onSuccess?: (trackId?: string) => void;
  onError?: (error: Error) => void;
}

interface AddTrackParams {
  title: string;
  artist?: string;
  cifraUrl?: string;
  context: 'event' | 'rehearsal';
  contextId: string;
  order?: number;
}

export function useAddTrack(options: UseAddTrackOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState<TrackSearchResult | null>(null);
  const [pendingTrack, setPendingTrack] = useState<AddTrackParams | null>(null);

  const { toast } = useToast();
  const { currentChurch } = useAuth();

  /**
   * Inicia processo de adicionar música
   * Detecta duplicatas e pede confirmação se necessário
   */
  const addTrack = async (params: AddTrackParams) => {
    if (!currentChurch?.id) {
      toast({
        title: '❌ Erro',
        description: 'Igreja não identificada',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Busca duplicatas na biblioteca
      console.log(`[useAddTrack] Buscando duplicatas de "${params.title}"...`);

      const searchResult = await TrackService.findExisting({
        churchId: currentChurch.id,
        title: params.title,
        artist: params.artist,
        cifraUrl: params.cifraUrl,
      });

      // 2. Se encontrou duplicata, mostra modal de confirmação
      if (searchResult.exists && searchResult.track) {
        console.log(`[useAddTrack] Duplicata encontrada: ${searchResult.track.title} (${searchResult.similarity}%)`);

        setDuplicateFound(searchResult);
        setPendingTrack(params);
        setLoading(false);
        return; // Aguarda decisão do usuário
      }

      // 3. Se não há duplicata, adiciona diretamente
      await executeAddTrack(params);

    } catch (error: any) {
      console.error('[useAddTrack] Erro ao adicionar música:', error);

      toast({
        title: '❌ Erro ao adicionar música',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });

      options.onError?.(error);
      setLoading(false);
    }
  };

  /**
   * Confirma uso da música existente (duplicata)
   */
  const confirmUseExisting = async () => {
    if (!duplicateFound?.track || !pendingTrack) {
      console.error('[useAddTrack] Nenhuma música duplicada ou pendente');
      return;
    }

    setLoading(true);

    try {
      console.log(`[useAddTrack] Usando música existente: ${duplicateFound.track.title}`);

      // Adiciona track existente ao contexto (evento ou ensaio)
      await TrackService.addToEvent(
        duplicateFound.track.id,
        pendingTrack.contextId,
        pendingTrack.order
      );

      toast({
        title: '✅ Música adicionada',
        description: `"${duplicateFound.track.title}" foi adicionada ao ${pendingTrack.context === 'event' ? 'evento' : 'ensaio'}!`,
      });

      options.onSuccess?.(duplicateFound.track.id);
      resetDuplicateState();

    } catch (error: any) {
      console.error('[useAddTrack] Erro ao usar música existente:', error);

      toast({
        title: '❌ Erro',
        description: error.message || 'Não foi possível adicionar a música',
        variant: 'destructive',
      });

      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirma criação de nova música (ignora duplicata)
   */
  const confirmCreateNew = async () => {
    if (!pendingTrack) {
      console.error('[useAddTrack] Nenhuma música pendente');
      return;
    }

    setLoading(true);

    try {
      console.log(`[useAddTrack] Criando nova música: ${pendingTrack.title}`);

      await executeAddTrack(pendingTrack, { forceDuplicate: true });
      resetDuplicateState();

    } catch (error: any) {
      console.error('[useAddTrack] Erro ao criar nova música:', error);

      toast({
        title: '❌ Erro',
        description: error.message || 'Não foi possível criar a música',
        variant: 'destructive',
      });

      options.onError?.(error);
      setLoading(false);
    }
  };

  /**
   * Cancela modal de duplicata
   */
  const cancelDuplicate = () => {
    resetDuplicateState();
  };

  /**
   * Executa adição de música (cria nova + adiciona ao contexto)
   */
  const executeAddTrack = async (
    params: AddTrackParams,
    opts: { forceDuplicate?: boolean } = {}
  ) => {
    if (!currentChurch?.id) {
      throw new Error('Igreja não identificada');
    }

    try {
      // 1. Cria ou reutiliza música na biblioteca global
      const track = await TrackService.addOrReuse({
        churchId: currentChurch.id,
        title: params.title,
        artist: params.artist,
        cifraUrl: params.cifraUrl,
        checkDuplicates: !opts.forceDuplicate, // Se forceDuplicate, pula verificação
      });

      console.log(`[useAddTrack] Track obtido/criado: ${track.id} - ${track.title}`);

      // 2. Adiciona ao contexto (evento ou ensaio)
      await TrackService.addToEvent(track.id, params.contextId, params.order);

      console.log(`[useAddTrack] Track adicionado ao ${params.context}: ${params.contextId}`);

      // 3. Se tem URL do Cifra Club, inicia processamento automático
      if (params.cifraUrl) {
        console.log('[useAddTrack] Iniciando processamento do Cifra Club...');
        // O processamento é assíncrono e acontece via edge function
        // Não bloqueamos a UI aqui
      }

      toast({
        title: '✅ Música adicionada com sucesso',
        description: params.cifraUrl
          ? `"${params.title}" foi adicionada! Aguarde enquanto processamos a cifra...`
          : `"${params.title}" foi adicionada!`,
      });

      options.onSuccess?.(track.id);

    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reseta estado de duplicata
   */
  const resetDuplicateState = () => {
    setDuplicateFound(null);
    setPendingTrack(null);
  };

  return {
    addTrack,
    confirmUseExisting,
    confirmCreateNew,
    cancelDuplicate,
    loading,
    duplicateFound,
    pendingTrack,
  };
}
