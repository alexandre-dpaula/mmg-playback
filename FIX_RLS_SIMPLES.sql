-- =====================================================
-- FIX DEFINITIVO: RLS Eventos Pessoais
-- =====================================================
-- Abordagem simplificada: qualquer user autenticado pode criar eventos
-- =====================================================

-- 1. Verificar estado atual
SELECT 'Estado atual das policies' as info;
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'events'
ORDER BY policyname;

-- 2. Dropar TODAS as policies de events
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

-- 3. Criar policy INSERT super permissiva (temporária para testar)
CREATE POLICY "events_insert"
  ON public.events
  FOR INSERT
  WITH CHECK (
    -- Qualquer usuário autenticado pode inserir
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- 4. Criar policy SELECT permissiva
CREATE POLICY "events_select"
  ON public.events
  FOR SELECT
  USING (
    -- Ver eventos da própria igreja
    (church_id = public.get_user_church_id() AND church_id IS NOT NULL)
    OR
    -- Ver eventos pessoais que criou
    (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())
  );

-- 5. Criar policy UPDATE
CREATE POLICY "events_update"
  ON public.events
  FOR UPDATE
  USING (
    (church_id = public.get_user_church_id() AND church_id IS NOT NULL)
    OR
    (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- 6. Criar policy DELETE
CREATE POLICY "events_delete"
  ON public.events
  FOR DELETE
  USING (
    (church_id = public.get_user_church_id() AND public.is_user_leader() = true AND church_id IS NOT NULL)
    OR
    (church_id = '00000000-0000-0000-0000-000000000000'::uuid AND created_by = auth.uid())
  );

-- 7. Verificar se foi aplicado
SELECT 'Policies criadas com sucesso!' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'events'
ORDER BY policyname;

-- =====================================================
-- TESTE: Tentar inserir evento como usuário
-- =====================================================
-- Depois de executar este SQL, tente criar o evento no app
-- Se ainda der erro, o problema pode ser em outra table (event_tracks)
-- =====================================================
