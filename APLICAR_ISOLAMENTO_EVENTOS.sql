-- =====================================================
-- APLICAR ISOLAMENTO DE EVENTOS PESSOAIS
-- =====================================================
-- Cada usuário vê APENAS seus eventos pessoais
-- Eventos de igreja são visíveis para todos da igreja
-- =====================================================

-- 1. Dropar policies atuais (muito permissivas)
DROP POLICY IF EXISTS "events_select_all" ON public.events;
DROP POLICY IF EXISTS "events_insert_authenticated" ON public.events;
DROP POLICY IF EXISTS "events_update_owner" ON public.events;
DROP POLICY IF EXISTS "events_delete_owner" ON public.events;

-- =====================================================
-- 2. CRIAR POLICIES COM ISOLAMENTO CORRETO
-- =====================================================

-- SELECT: Ver eventos da igreja OU apenas eventos pessoais próprios
CREATE POLICY "events_select"
  ON public.events
  FOR SELECT
  USING (
    -- Eventos de igreja (todos da igreja veem)
    (
      church_id IS NOT NULL
      AND church_id != '00000000-0000-0000-0000-000000000000'::uuid
      AND church_id = (
        SELECT church_id FROM users_app
        WHERE auth_user_id = auth.uid()
        LIMIT 1
      )
    )
    OR
    -- Eventos pessoais (APENAS quem criou vê)
    (
      church_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND created_by = auth.uid()
    )
  );

-- INSERT: Criar eventos (qualquer user autenticado)
CREATE POLICY "events_insert"
  ON public.events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- UPDATE: Editar APENAS eventos que criou
CREATE POLICY "events_update"
  ON public.events
  FOR UPDATE
  USING (
    created_by = auth.uid()
  )
  WITH CHECK (
    created_by = auth.uid()
  );

-- DELETE: Deletar APENAS eventos que criou (ou líder pode deletar eventos da igreja)
CREATE POLICY "events_delete"
  ON public.events
  FOR DELETE
  USING (
    -- Líder pode deletar eventos da igreja
    (
      church_id IS NOT NULL
      AND church_id != '00000000-0000-0000-0000-000000000000'::uuid
      AND EXISTS (
        SELECT 1 FROM users_app
        WHERE auth_user_id = auth.uid()
        AND role = 'lider'
        AND church_id = events.church_id
      )
    )
    OR
    -- Qualquer um pode deletar seus eventos pessoais
    (
      church_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND created_by = auth.uid()
    )
  );

-- =====================================================
-- 3. VERIFICAR
-- =====================================================

SELECT
  '✅ Políticas de isolamento aplicadas!' as status;

SELECT
  'Políticas criadas:' as info,
  policyname,
  cmd,
  CASE cmd
    WHEN 'SELECT' THEN '👁️ Ver apenas seus eventos pessoais ou da igreja'
    WHEN 'INSERT' THEN '➕ Criar eventos'
    WHEN 'UPDATE' THEN '✏️ Editar APENAS eventos que criou'
    WHEN 'DELETE' THEN '🗑️ Deletar APENAS eventos que criou'
  END as descricao
FROM pg_policies
WHERE tablename = 'events'
ORDER BY cmd;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Usuário A (sem igreja) cria evento pessoal → APENAS ele vê
-- ✅ Usuário B (sem igreja) cria evento pessoal → APENAS ele vê
-- ✅ Usuário C (da igreja X) cria evento → TODOS da igreja X veem
-- ❌ Usuário A NÃO vê eventos do Usuário B
-- ❌ Usuário B NÃO pode editar eventos do Usuário A
-- =====================================================
