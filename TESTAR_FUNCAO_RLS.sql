-- =====================================================
-- TESTE: Verificar se função RLS está funcionando
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se a função existe
SELECT
  proname as funcao,
  prorettype::regtype as tipo_retorno
FROM pg_proc
WHERE proname = 'get_user_church_id'
  AND pronamespace = 'public'::regnamespace;

-- 2. Testar se a função retorna valor (precisa estar logado)
-- IMPORTANTE: Execute este comando ENQUANTO ESTIVER LOGADO na aplicação
SELECT public.get_user_church_id() as meu_church_id;

-- 3. Verificar dados do usuário autenticado atual
SELECT
  id,
  auth_user_id,
  full_name,
  email,
  church_id,
  role
FROM public.users_app
WHERE auth_user_id = auth.uid();

-- 4. Verificar se RLS está bloqueando events
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'events'
  AND schemaname = 'public';

-- 5. Ver políticas de events
SELECT
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'events'
  AND schemaname = 'public'
ORDER BY cmd;

-- =====================================================
-- DIAGNÓSTICO:
-- - Se get_user_church_id() retornar NULL: usuário não tem igreja
-- - Se retornar UUID: função está OK
-- - Se users_app retornar vazio: usuário não está em users_app
-- =====================================================
