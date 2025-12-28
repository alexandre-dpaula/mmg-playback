-- =====================================================
-- REFINAR SEGURANÇA: Isolamento de Eventos Pessoais
-- =====================================================
-- EXECUTE APENAS se quiser isolar eventos pessoais
-- Por enquanto todos veem todos os eventos (funcional)
-- =====================================================

-- Dropar policy SELECT atual (muito permissiva)
DROP POLICY IF EXISTS "events_select_all" ON public.events;

-- Criar policy SELECT com isolamento
CREATE POLICY "events_select_with_isolation"
  ON public.events
  FOR SELECT
  USING (
    -- Ver eventos da própria igreja
    (
      church_id IS NOT NULL
      AND church_id != '00000000-0000-0000-0000-000000000000'
      AND church_id = (
        SELECT church_id FROM users_app
        WHERE auth_user_id = auth.uid()
        LIMIT 1
      )
    )
    OR
    -- Ver APENAS eventos pessoais que você criou
    (
      church_id = '00000000-0000-0000-0000-000000000000'
      AND created_by = auth.uid()
    )
  );

-- Verificar
SELECT
  'Policy SELECT atualizada com isolamento!' as status;

SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'events'
ORDER BY cmd;

-- =====================================================
-- TESTE:
-- - Usuário A com igreja → vê eventos da igreja
-- - Usuário B sem igreja → vê APENAS seus eventos pessoais
-- - Usuário C sem igreja → NÃO vê eventos do usuário B
-- =====================================================
