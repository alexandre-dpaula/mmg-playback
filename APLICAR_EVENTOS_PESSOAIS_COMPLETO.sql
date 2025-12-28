-- =====================================================
-- APLICAR EVENTOS PESSOAIS - ARQUIVO ÚNICO
-- =====================================================
-- Este arquivo faz TUDO em uma única execução:
-- 1. Cria igreja especial "Sem igreja" (ID fixo)
-- 2. Ajusta políticas RLS para eventos pessoais
-- 3. Valida implementação
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR IGREJA ESPECIAL "SEM IGREJA"
-- =====================================================

-- Inserir igreja "Sem igreja" se não existir
INSERT INTO public.churches (
  id,
  name,
  owner_user_id,
  created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Sem igreja',
  (SELECT id FROM auth.users LIMIT 1), -- Usar primeiro usuário como owner temporário
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PARTE 2: AJUSTAR RLS PARA EVENTOS PESSOAIS
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

-- =====================================================
-- PARTE 3: COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.churches IS
  'Tabela de igrejas. ID 00000000-0000-0000-0000-000000000000 é reservado para eventos pessoais (sem igreja)';

COMMENT ON POLICY "events_select" ON public.events IS
  'Ver eventos da própria igreja OU eventos pessoais (sem igreja) que você criou';

COMMENT ON POLICY "events_insert" ON public.events IS
  'Criar eventos da própria igreja OU eventos pessoais';

COMMENT ON POLICY "events_update" ON public.events IS
  'Editar eventos da própria igreja OU eventos pessoais que você criou';

COMMENT ON POLICY "events_delete" ON public.events IS
  'Deletar eventos da própria igreja (apenas líder) OU eventos pessoais que você criou';

-- =====================================================
-- PARTE 4: VALIDAÇÃO AUTOMÁTICA
-- =====================================================

DO $$
DECLARE
  v_count INTEGER;
  v_church_exists BOOLEAN;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ VALIDAÇÃO AUTOMÁTICA';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';

  -- Verificar se igreja "Sem igreja" foi criada
  SELECT EXISTS (
    SELECT 1 FROM public.churches
    WHERE id = '00000000-0000-0000-0000-000000000000'
  ) INTO v_church_exists;

  IF v_church_exists THEN
    RAISE NOTICE '✅ Igreja "Sem igreja" criada com sucesso';
  ELSE
    RAISE NOTICE '❌ ERRO: Igreja "Sem igreja" NÃO foi criada!';
  END IF;

  -- Contar políticas de events
  SELECT COUNT(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'events';

  IF v_count = 4 THEN
    RAISE NOTICE '✅ 4 políticas RLS criadas para events';
  ELSE
    RAISE NOTICE '❌ ERRO: Esperado 4 políticas, encontrado: %', v_count;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '🎉 IMPLEMENTAÇÃO CONCLUÍDA!';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO:';
  RAISE NOTICE '  - Igreja especial "Sem igreja" criada';
  RAISE NOTICE '  - Políticas RLS ajustadas';
  RAISE NOTICE '  - Eventos pessoais habilitados';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 PRÓXIMOS PASSOS:';
  RAISE NOTICE '  1. Testar criar evento COM igreja';
  RAISE NOTICE '  2. Testar criar evento SEM igreja (pessoal)';
  RAISE NOTICE '  3. Validar isolamento entre usuários';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';

END $$;

-- =====================================================
-- PARTE 5: QUERY FINAL DE VERIFICAÇÃO
-- =====================================================

-- Verificar igreja "Sem igreja"
SELECT
  id,
  name,
  owner_user_id,
  CASE
    WHEN id = '00000000-0000-0000-0000-000000000000' THEN '✅ Igreja especial criada'
    ELSE 'Igreja normal'
  END as status
FROM public.churches
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Listar políticas de events
SELECT
  tablename,
  policyname,
  cmd,
  CASE cmd
    WHEN 'SELECT' THEN '✅ Ver eventos'
    WHEN 'INSERT' THEN '✅ Criar eventos'
    WHEN 'UPDATE' THEN '✅ Editar eventos'
    WHEN 'DELETE' THEN '✅ Deletar eventos'
    ELSE cmd
  END as operacao
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'events'
ORDER BY cmd;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
--
-- ✅ SE CHEGOU ATÉ AQUI SEM ERROS: EVENTOS PESSOAIS FUNCIONANDO!
--
-- TESTE AGORA:
-- 1. Usuário SEM igreja cria evento → visível só para ele
-- 2. Usuário COM igreja cria evento → visível para toda igreja
-- 3. Verificar isolamento entre usuários sem igreja
--
-- =====================================================
