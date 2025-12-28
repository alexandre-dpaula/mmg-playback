-- =====================================================
-- SCRIPT DE VALIDAÇÃO RLS
-- Execute no Supabase SQL Editor para verificar se tudo está OK
-- =====================================================

-- =====================================================
-- 1. Verificar se RLS está habilitado nas tabelas certas
-- =====================================================
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END as status,
  CASE tablename
    WHEN 'churches' THEN 'Deve estar HABILITADO'
    WHEN 'users_app' THEN 'Deve estar DESABILITADO (evita recursão)'
    WHEN 'tracks' THEN 'Deve estar HABILITADO'
    WHEN 'events' THEN 'Deve estar HABILITADO'
    WHEN 'event_tracks' THEN 'Deve estar HABILITADO'
    WHEN 'teams' THEN 'Deve estar HABILITADO'
    WHEN 'user_team' THEN 'Deve estar HABILITADO'
    WHEN 'subscriptions' THEN 'Deve estar HABILITADO'
    WHEN 'payments' THEN 'Deve estar HABILITADO'
    ELSE 'N/A'
  END as esperado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'churches', 'users_app', 'tracks', 'events', 'event_tracks',
    'teams', 'user_team', 'subscriptions', 'payments'
  )
ORDER BY tablename;

-- =====================================================
-- 2. Verificar se as funções helper existem
-- =====================================================
SELECT
  proname as funcao,
  CASE
    WHEN proname = 'get_user_church_id' THEN '✅ Retorna church_id do usuário'
    WHEN proname = 'is_user_leader' THEN '✅ Verifica se é líder'
    ELSE 'Desconhecida'
  END as descricao
FROM pg_proc
WHERE proname IN ('get_user_church_id', 'is_user_leader')
  AND pronamespace = 'public'::regnamespace;

-- =====================================================
-- 3. Contar políticas RLS por tabela
-- =====================================================
SELECT
  tablename,
  COUNT(*) as total_politicas,
  CASE tablename
    WHEN 'churches' THEN '4 esperadas (SELECT, INSERT, UPDATE, DELETE)'
    WHEN 'users_app' THEN '0 esperadas (RLS desabilitado)'
    WHEN 'tracks' THEN '4 esperadas'
    WHEN 'events' THEN '4 esperadas'
    WHEN 'event_tracks' THEN '4 esperadas'
    WHEN 'teams' THEN '4 esperadas'
    WHEN 'user_team' THEN '4 esperadas'
    WHEN 'subscriptions' THEN '3 esperadas'
    WHEN 'payments' THEN '2 esperadas'
    ELSE 'N/A'
  END as esperado
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 4. Listar TODAS as políticas criadas
-- =====================================================
SELECT
  tablename,
  policyname,
  cmd as operacao,
  CASE
    WHEN cmd = 'SELECT' THEN 'Leitura'
    WHEN cmd = 'INSERT' THEN 'Inserção'
    WHEN cmd = 'UPDATE' THEN 'Atualização'
    WHEN cmd = 'DELETE' THEN 'Exclusão'
    WHEN cmd = 'ALL' THEN 'Todas'
  END as tipo
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- =====================================================
-- 5. Verificar estrutura da tabela TRACKS
-- =====================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  CASE column_name
    WHEN 'church_id' THEN 'NULL = Global, NOT NULL = Cópia privada'
    ELSE ''
  END as observacao
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tracks'
  AND column_name IN ('id', 'name', 'church_id', 'key', 'user_id')
ORDER BY ordinal_position;

-- =====================================================
-- 6. Verificar estrutura da tabela EVENTS
-- =====================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  CASE column_name
    WHEN 'church_id' THEN 'SEMPRE preenchido (eventos privados)'
    ELSE ''
  END as observacao
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'events'
  AND column_name IN ('id', 'name', 'church_id', 'created_by', 'date')
ORDER BY ordinal_position;

-- =====================================================
-- 7. Verificar dados existentes - TRACKS
-- =====================================================
SELECT
  COUNT(*) as total_tracks,
  COUNT(CASE WHEN church_id IS NULL THEN 1 END) as globais,
  COUNT(CASE WHEN church_id IS NOT NULL THEN 1 END) as privadas,
  CONCAT(
    ROUND(
      100.0 * COUNT(CASE WHEN church_id IS NULL THEN 1 END) / NULLIF(COUNT(*), 0),
      1
    ),
    '% globais'
  ) as percentual_globais
FROM public.tracks;

-- =====================================================
-- 8. Verificar dados existentes - EVENTS
-- =====================================================
SELECT
  COUNT(*) as total_eventos,
  COUNT(DISTINCT church_id) as total_igrejas_com_eventos,
  COUNT(CASE WHEN church_id IS NULL THEN 1 END) as eventos_sem_igreja
FROM public.events;

-- =====================================================
-- 9. Verificar dados existentes - CHURCHES
-- =====================================================
SELECT
  COUNT(*) as total_igrejas,
  COUNT(DISTINCT owner_user_id) as total_owners
FROM public.churches;

-- =====================================================
-- 10. Verificar dados existentes - USERS_APP
-- =====================================================
SELECT
  role,
  COUNT(*) as total
FROM public.users_app
GROUP BY role
ORDER BY role;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ churches: RLS HABILITADO, 4 políticas
-- ✅ users_app: RLS DESABILITADO, 0 políticas
-- ✅ tracks: RLS HABILITADO, 4 políticas
-- ✅ events: RLS HABILITADO, 4 políticas
-- ✅ event_tracks: RLS HABILITADO, 4 políticas
-- ✅ teams: RLS HABILITADO, 4 políticas
-- ✅ user_team: RLS HABILITADO, 4 políticas
-- ✅ subscriptions: RLS HABILITADO, 3 políticas
-- ✅ payments: RLS HABILITADO, 2 políticas
-- ✅ Funções: get_user_church_id e is_user_leader existem
-- =====================================================
