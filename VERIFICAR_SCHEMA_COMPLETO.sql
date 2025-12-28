-- =====================================================
-- VERIFICAR ESTRUTURA COMPLETA DO SCHEMA
-- Execute no Supabase SQL Editor
-- =====================================================

-- 1. Estrutura da tabela TRACKS
SELECT
  'TRACKS' as tabela,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tracks'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Estrutura da tabela EVENTS
SELECT
  'EVENTS' as tabela,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Estrutura da tabela USERS_APP
SELECT
  'USERS_APP' as tabela,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users_app'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Estrutura da tabela CHURCHES
SELECT
  'CHURCHES' as tabela,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'churches'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar políticas RLS existentes
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Verificar se RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tracks', 'events', 'users_app', 'churches', 'subscriptions', 'payments')
ORDER BY tablename;
