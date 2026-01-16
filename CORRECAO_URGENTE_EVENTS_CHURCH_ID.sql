-- =====================================================
-- CORREÇÃO URGENTE: Adicionar church_id à tabela events
-- =====================================================
-- PROBLEMA: Eventos estão sendo compartilhados entre todas as igrejas
-- SOLUÇÃO: Adicionar coluna church_id para isolar eventos por igreja
-- =====================================================

-- 1. Adicionar coluna church_id à tabela events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_events_church_id ON public.events(church_id);

-- 3. IMPORTANTE: Atualizar eventos existentes
-- Se houver eventos sem church_id, eles precisam ser associados
-- Opção 1: Deletar eventos órfãos (CUIDADO!)
-- DELETE FROM public.events WHERE church_id IS NULL;

-- Opção 2: Associar eventos órfãos à primeira igreja (mais seguro para teste)
UPDATE public.events
SET church_id = (SELECT id FROM public.churches LIMIT 1)
WHERE church_id IS NULL;

-- 4. Tornar church_id obrigatório (depois de associar eventos existentes)
ALTER TABLE public.events
ALTER COLUMN church_id SET NOT NULL;

-- 5. Atualizar comentário da tabela
COMMENT ON COLUMN public.events.church_id IS
  'ID da igreja dona do evento - eventos são SEMPRE privados por igreja';

-- =====================================================
-- VERIFICAÇÃO: Execute estas queries após aplicar
-- =====================================================
-- Ver quantos eventos cada igreja tem:
-- SELECT church_id, COUNT(*) as total_events FROM public.events GROUP BY church_id;

-- Ver eventos sem igreja (deve retornar 0):
-- SELECT COUNT(*) FROM public.events WHERE church_id IS NULL;

-- =====================================================
-- RECRIAR POLÍTICAS RLS PARA EVENTS (se necessário)
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

-- Garantir que RLS está ativado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver apenas eventos da própria igreja
CREATE POLICY "events_select"
  ON public.events
  FOR SELECT
  USING (
    church_id = public.get_user_church_id()
  );

-- INSERT: Criar evento apenas na própria igreja
CREATE POLICY "events_insert"
  ON public.events
  FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id()
  );

-- UPDATE: Editar apenas eventos da própria igreja
CREATE POLICY "events_update"
  ON public.events
  FOR UPDATE
  USING (church_id = public.get_user_church_id())
  WITH CHECK (church_id = public.get_user_church_id());

-- DELETE: Apenas líderes podem deletar eventos da própria igreja
CREATE POLICY "events_delete"
  ON public.events
  FOR DELETE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );

-- =====================================================
-- FIM DA CORREÇÃO
-- =====================================================
