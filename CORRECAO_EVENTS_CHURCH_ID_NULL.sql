-- =====================================================
-- CORREÇÃO: Eventos com church_id NULL
-- =====================================================
-- PROBLEMA REAL: Coluna church_id existe, mas aceita NULL
-- RESULTADO: Eventos com church_id NULL são visíveis para todos
-- =====================================================

-- PASSO 1: Verificar quantos eventos estão com church_id NULL
SELECT COUNT(*) as eventos_sem_igreja
FROM public.events
WHERE church_id IS NULL;

-- PASSO 2: Ver quais são estes eventos
SELECT id, name, date, church_id, created_by
FROM public.events
WHERE church_id IS NULL
ORDER BY created_at DESC;

-- PASSO 3: Ver quem criou estes eventos (para associar à igreja correta)
SELECT
  e.id as event_id,
  e.name as event_name,
  e.created_by,
  u.full_name as criador,
  u.email,
  u.church_id as igreja_do_criador,
  c.name as nome_igreja
FROM public.events e
LEFT JOIN public.users_app u ON u.auth_user_id = e.created_by
LEFT JOIN public.churches c ON c.id = u.church_id
WHERE e.church_id IS NULL;

-- =====================================================
-- CORREÇÃO AUTOMÁTICA
-- =====================================================

-- Opção 1: Associar eventos ao church_id do criador
UPDATE public.events e
SET church_id = u.church_id
FROM public.users_app u
WHERE e.created_by = u.auth_user_id
  AND e.church_id IS NULL
  AND u.church_id IS NOT NULL;

-- Verificar se ainda há eventos sem igreja
SELECT COUNT(*) as eventos_ainda_sem_igreja
FROM public.events
WHERE church_id IS NULL;

-- =====================================================
-- Se ainda houver eventos sem igreja após update acima:
-- =====================================================

-- Opção 2A: Associar à primeira igreja do sistema (CUIDADO!)
UPDATE public.events
SET church_id = (SELECT id FROM public.churches ORDER BY created_at ASC LIMIT 1)
WHERE church_id IS NULL;

-- Opção 2B: Deletar eventos órfãos (PERDA DE DADOS!)
-- DELETE FROM public.events WHERE church_id IS NULL;

-- =====================================================
-- TORNAR church_id OBRIGATÓRIO
-- =====================================================

-- Depois de garantir que todos os eventos têm church_id:
ALTER TABLE public.events
ALTER COLUMN church_id SET NOT NULL;

-- =====================================================
-- RECRIAR POLÍTICAS RLS (garantir que estão corretas)
-- =====================================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_select_own_church" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

-- Garantir que RLS está ativado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- POLÍTICA SELECT: Ver apenas eventos da própria igreja
CREATE POLICY "events_select"
  ON public.events
  FOR SELECT
  USING (
    church_id = public.get_user_church_id()
  );

-- POLÍTICA INSERT: Criar eventos apenas na própria igreja
-- E garantir que church_id é sempre preenchido
CREATE POLICY "events_insert"
  ON public.events
  FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id()
    AND church_id IS NOT NULL
  );

-- POLÍTICA UPDATE: Editar apenas eventos da própria igreja
CREATE POLICY "events_update"
  ON public.events
  FOR UPDATE
  USING (
    church_id = public.get_user_church_id()
  )
  WITH CHECK (
    church_id = public.get_user_church_id()
    AND church_id IS NOT NULL
  );

-- POLÍTICA DELETE: Apenas líderes podem deletar eventos da própria igreja
CREATE POLICY "events_delete"
  ON public.events
  FOR DELETE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );

-- =====================================================
-- VALIDAÇÃO FINAL
-- =====================================================

-- 1. Verificar que church_id agora é NOT NULL
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'events'
  AND column_name = 'church_id';
-- ESPERADO: is_nullable = NO

-- 2. Verificar que não há mais eventos sem igreja
SELECT COUNT(*)
FROM public.events
WHERE church_id IS NULL;
-- ESPERADO: 0

-- 3. Verificar políticas RLS
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'events';
-- ESPERADO: 4 políticas

-- 4. Testar isolamento
SELECT
  e.name,
  e.church_id,
  c.name as igreja
FROM public.events e
JOIN public.churches c ON c.id = e.church_id;
-- ESPERADO: Ver apenas eventos da sua igreja

-- =====================================================
-- FIM DA CORREÇÃO
-- =====================================================
