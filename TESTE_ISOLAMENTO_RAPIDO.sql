-- =====================================================
-- TESTE RÁPIDO DE ISOLAMENTO - EVENTS
-- =====================================================

-- 1. Ver todas as políticas RLS ativas para events
SELECT
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'events'
ORDER BY cmd;

-- 2. Ver se RLS está ativado
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'events';

-- 3. Verificar função get_user_church_id
SELECT
  proname as function_name,
  prosecdef as is_security_definer,
  provolatile as volatility
FROM pg_proc
WHERE proname = 'get_user_church_id';

-- 4. TESTE: Ver church_id do usuário atual
SELECT public.get_user_church_id() as meu_church_id;

-- 5. TESTE: Ver quantos eventos você consegue ver
SELECT COUNT(*) as eventos_visiveis
FROM public.events;

-- 6. TESTE: Ver detalhes dos eventos que você vê
SELECT
  e.id,
  e.name,
  e.date,
  e.church_id,
  c.name as igreja_nome
FROM public.events e
LEFT JOIN public.churches c ON c.id = e.church_id
ORDER BY e.date DESC;

-- 7. TESTE: Ver total de eventos por igreja (DEVERIA VER APENAS SUA IGREJA)
SELECT
  church_id,
  c.name as igreja_nome,
  COUNT(*) as total
FROM public.events e
LEFT JOIN public.churches c ON c.id = e.church_id
GROUP BY church_id, c.name;

-- 8. Ver seu usuário e igreja
SELECT
  auth.uid() as meu_auth_id,
  u.full_name,
  u.email,
  u.church_id,
  c.name as minha_igreja
FROM public.users_app u
LEFT JOIN public.churches c ON c.id = u.church_id
WHERE u.auth_user_id = auth.uid();

-- =====================================================
-- DIAGNÓSTICO DE PROBLEMA
-- =====================================================

-- Se você está vendo eventos de outras igrejas, uma destas queries
-- vai mostrar o problema:

-- Verificar se alguma política está com permissive = true (problema)
SELECT policyname, permissive
FROM pg_policies
WHERE tablename = 'events' AND permissive = 'PERMISSIVE';

-- Ver a expressão USING da política de SELECT
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'events' AND cmd = 'SELECT';

-- =====================================================
-- SE AINDA HOUVER PROBLEMA, RECRIAR POLÍTICAS
-- =====================================================

-- APENAS EXECUTE ISTO SE O TESTE ACIMA FALHAR

-- Deletar TODAS as políticas de events
-- DROP POLICY IF EXISTS "events_select" ON public.events;
-- DROP POLICY IF EXISTS "events_insert" ON public.events;
-- DROP POLICY IF EXISTS "events_update" ON public.events;
-- DROP POLICY IF EXISTS "events_delete" ON public.events;

-- Recriar política SELECT correta
-- CREATE POLICY "events_select"
--   ON public.events
--   FOR SELECT
--   USING (church_id = public.get_user_church_id());

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
/*
Query 4: Deve retornar o UUID da sua igreja
Query 5: Deve retornar apenas o COUNT de eventos da SUA igreja
Query 6: Deve mostrar apenas eventos da SUA igreja
Query 7: Deve mostrar apenas UMA linha (sua igreja)
Query 8: Deve mostrar seus dados e nome da sua igreja
*/
