-- =====================================================
-- FIX: RLS para Eventos Pessoais
-- =====================================================
-- Problema: Policy estava bloqueando inserts de eventos pessoais
-- Solução: Ajustar lógica para permitir quando user não tem igreja
-- =====================================================

-- Dropar política INSERT antiga
DROP POLICY IF EXISTS "events_insert" ON public.events;

-- Recriar política INSERT CORRIGIDA
CREATE POLICY "events_insert"
  ON public.events
  FOR INSERT
  WITH CHECK (
    -- Usuário autenticado
    auth.uid() IS NOT NULL
    AND
    (
      -- OPÇÃO 1: Eventos da igreja (quando user tem igreja)
      (
        public.get_user_church_id() IS NOT NULL
        AND church_id = public.get_user_church_id()
      )
      OR
      -- OPÇÃO 2: Eventos pessoais (quando user NÃO tem igreja ou escolhe criar pessoal)
      (
        church_id = '00000000-0000-0000-0000-000000000000'::uuid
        AND created_by = auth.uid()
      )
    )
  );

-- Também corrigir SELECT para ser consistente
DROP POLICY IF EXISTS "events_select" ON public.events;

CREATE POLICY "events_select"
  ON public.events
  FOR SELECT
  USING (
    -- Ver eventos da igreja (se user tiver igreja)
    (
      public.get_user_church_id() IS NOT NULL
      AND church_id = public.get_user_church_id()
    )
    OR
    -- Ver eventos pessoais que criou
    (
      church_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND created_by = auth.uid()
    )
  );

-- Comentários
COMMENT ON POLICY "events_insert" ON public.events IS
  'Permite criar eventos da igreja (se tiver) OU eventos pessoais (sempre)';

COMMENT ON POLICY "events_select" ON public.events IS
  'Permite ver eventos da igreja (se tiver) OU eventos pessoais próprios';

-- =====================================================
-- Validação
-- =====================================================

SELECT
  'Políticas atualizadas com sucesso!' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'events'
  AND policyname IN ('events_insert', 'events_select');
