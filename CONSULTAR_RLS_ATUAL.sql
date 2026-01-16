-- ============================================
-- CONSULTAR POLÍTICAS RLS ATUAIS
-- Execute PRIMEIRO para ver o estado atual
-- ============================================

-- 1. VER TODAS AS POLÍTICAS ATIVAS
SELECT
  schemaname,
  tablename,
  policyname,
  cmd::text as operacao,
  qual::text as condicao_using,
  with_check::text as condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;


-- 2. VER QUAIS TABELAS TEM RLS ATIVO
SELECT
  tablename,
  rowsecurity as rls_ativo,
  CASE
    WHEN rowsecurity = true THEN '✅ RLS Ativo'
    ELSE '🚨 RLS DESATIVADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;


-- 3. CONTAR POLÍTICAS POR TABELA
SELECT
  tablename,
  COUNT(*) as total_politicas
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;


-- 4. VER POLÍTICAS ESPECÍFICAS DAS TABELAS CRÍTICAS
SELECT
  tablename,
  policyname,
  cmd::text as operacao,
  LEFT(qual::text, 100) as condicao_resumida
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users_app', 'profiles', 'events', 'tracks', 'notifications', 'churches')
ORDER BY tablename, cmd;
