-- =====================================================
-- AJUSTAR RLS PARA PERMITIR EVENTOS "SEM IGREJA"
-- =====================================================
-- Eventos com church_id = '00000000-0000-0000-0000-000000000000'
-- são PESSOAIS do usuário que criou (visíveis apenas para ele)
-- =====================================================

-- Dropar políticas antigas de events
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

-- Recriar política SELECT
CREATE POLICY "events_select"
  ON public.events
  FOR SELECT
  USING (
    church_id = public.get_user_church_id()  -- Eventos da igreja
    OR (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())  -- Eventos pessoais
  );

-- Recriar política INSERT
CREATE POLICY "events_insert"
  ON public.events
  FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id()  -- Eventos da igreja
    OR (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())  -- Eventos pessoais
  );

-- Recriar política UPDATE
CREATE POLICY "events_update"
  ON public.events
  FOR UPDATE
  USING (
    church_id = public.get_user_church_id()  -- Eventos da igreja
    OR (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())  -- Eventos pessoais
  )
  WITH CHECK (
    church_id = public.get_user_church_id()
    OR (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())
  );

-- Recriar política DELETE
CREATE POLICY "events_delete"
  ON public.events
  FOR DELETE
  USING (
    (church_id = public.get_user_church_id() AND public.is_user_leader() = true)  -- Apenas líder deleta eventos da igreja
    OR (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())  -- Qualquer um deleta seus eventos pessoais
  );

-- Comentários
COMMENT ON POLICY "events_select" ON public.events IS
  'Ver eventos da própria igreja OU eventos pessoais (sem igreja) que você criou';

COMMENT ON POLICY "events_insert" ON public.events IS
  'Criar eventos da própria igreja OU eventos pessoais';

COMMENT ON POLICY "events_update" ON public.events IS
  'Editar eventos da própria igreja OU eventos pessoais que você criou';

COMMENT ON POLICY "events_delete" ON public.events IS
  'Deletar eventos da própria igreja (apenas líder) OU eventos pessoais que você criou';

-- Verificar
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'events'
ORDER BY cmd;
