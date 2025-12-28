-- =====================================================
-- LIMPEZA COMPLETA DO BANCO DE DADOS
-- Data: 26/12/2025
-- ⚠️ ATENÇÃO: Este script é DESTRUTIVO para RLS
-- Use APENAS se quiser começar do ZERO
-- =====================================================
--
-- O QUE ESTE SCRIPT FAZ:
-- 1. Remove migrations problemáticas do histórico Supabase
-- 2. Desabilita RLS em todas as tabelas
-- 3. Dropa TODAS as políticas RLS
-- 4. Dropa TODAS as funções helper RLS
-- 5. Limpa resquícios de tentativas antigas
--
-- O QUE ESTE SCRIPT NÃO FAZ:
-- - NÃO deleta dados (tracks, events, users, churches)
-- - NÃO altera estrutura de tabelas (colunas permanecem)
-- - NÃO remove migrations de estrutura (01_, 02_, etc)
--
-- =====================================================

-- =====================================================
-- PARTE 1: HISTÓRICO DE MIGRATIONS
-- =====================================================

-- Verificar migrations aplicadas
SELECT version, name
FROM supabase_migrations.schema_migrations
WHERE version LIKE '202512%'
ORDER BY version;

-- Remover migrations RLS problemáticas do histórico
DELETE FROM supabase_migrations.schema_migrations
WHERE version IN (
  '20251225_add_rls_multitenancy',
  '20251225_fix_rls_CORRECT',
  '20251225_fix_user_roles_logic'
);

-- Confirmar remoção
SELECT
  COUNT(*) as migrations_rls_antigas_removidas
FROM supabase_migrations.schema_migrations
WHERE version IN (
  '20251225_add_rls_multitenancy',
  '20251225_fix_rls_CORRECT',
  '20251225_fix_user_roles_logic'
);
-- Deve retornar 0

-- =====================================================
-- PARTE 2: DESABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE IF EXISTS public.churches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users_app DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_team DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 3: DROPAR TODAS AS POLÍTICAS RLS
-- =====================================================

-- Função helper para dropar todas as políticas de uma tabela
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- Confirmar que não há mais políticas
SELECT COUNT(*) as politicas_restantes
FROM pg_policies
WHERE schemaname = 'public';
-- Deve retornar 0

-- =====================================================
-- PARTE 4: DROPAR FUNÇÕES HELPER RLS
-- =====================================================

-- Listar funções RLS existentes
SELECT
  proname as funcao,
  pg_get_functiondef(oid) as definicao
FROM pg_proc
WHERE proname IN (
  'get_user_church_id',
  'is_user_leader',
  'church_id'
)
ORDER BY proname;

-- Dropar funções (todos os schemas)
DROP FUNCTION IF EXISTS public.get_user_church_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_user_leader() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_church() CASCADE;
DROP FUNCTION IF EXISTS public.auto_set_church_id() CASCADE;
DROP FUNCTION IF EXISTS auth.get_user_church_id() CASCADE;
DROP FUNCTION IF EXISTS auth.is_user_leader() CASCADE;
DROP FUNCTION IF EXISTS auth.church_id() CASCADE;

-- Confirmar remoção
SELECT COUNT(*) as funcoes_rls_restantes
FROM pg_proc
WHERE proname IN (
  'get_user_church_id',
  'is_user_leader',
  'church_id'
);
-- Deve retornar 0

-- =====================================================
-- PARTE 5: LIMPAR TRIGGERS RELACIONADOS A RLS (se houver)
-- =====================================================

-- Listar triggers relacionados a church_id
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (
    trigger_name LIKE '%church%'
    OR trigger_name LIKE '%rls%'
  );

-- Dropar triggers de auto_set_church_id (se existirem)
DROP TRIGGER IF EXISTS tracks_auto_church_id ON public.tracks;
DROP TRIGGER IF EXISTS events_auto_church_id ON public.events;
DROP TRIGGER IF EXISTS auto_set_church_id_trigger ON public.tracks;
DROP TRIGGER IF EXISTS auto_set_church_id_trigger ON public.events;

-- =====================================================
-- PARTE 6: VERIFICAÇÃO FINAL - STATUS DO BANCO
-- =====================================================

-- 1. RLS Status (todas devem estar desabilitadas)
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '❌ RLS HABILITADO (PROBLEMA!)'
    ELSE '✅ RLS Desabilitado'
  END as status_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'churches', 'users_app', 'tracks', 'events', 'event_tracks',
    'teams', 'user_team', 'subscriptions', 'payments', 'profiles'
  )
ORDER BY tablename;

-- 2. Políticas RLS (deve ser 0)
SELECT
  COUNT(*) as total_politicas,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Nenhuma política (correto)'
    ELSE '❌ Ainda tem políticas (PROBLEMA!)'
  END as status
FROM pg_policies
WHERE schemaname = 'public';

-- 3. Funções RLS (deve ser 0)
SELECT
  COUNT(*) as total_funcoes_rls,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Nenhuma função RLS (correto)'
    ELSE '❌ Ainda tem funções (PROBLEMA!)'
  END as status
FROM pg_proc
WHERE proname IN ('get_user_church_id', 'is_user_leader', 'church_id');

-- 4. Triggers RLS (deve ser 0 ou apenas triggers essenciais)
SELECT
  COUNT(*) as total_triggers_church,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Nenhum trigger RLS (correto)'
    ELSE '⚠️ Triggers encontrados (verificar)'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (trigger_name LIKE '%church%' OR trigger_name LIKE '%rls%');

-- 5. Migrations problemáticas (deve ser 0)
SELECT
  COUNT(*) as migrations_problematicas,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Migrations problemáticas removidas'
    ELSE '❌ Ainda tem migrations antigas (PROBLEMA!)'
  END as status
FROM supabase_migrations.schema_migrations
WHERE version IN (
  '20251225_add_rls_multitenancy',
  '20251225_fix_rls_CORRECT',
  '20251225_fix_user_roles_logic'
);

-- =====================================================
-- PARTE 7: DADOS - Verificar Integridade
-- =====================================================

-- Verificar se dados permanecem intactos
SELECT 'CHURCHES' as tabela, COUNT(*) as total FROM public.churches
UNION ALL
SELECT 'USERS_APP', COUNT(*) FROM public.users_app
UNION ALL
SELECT 'TRACKS', COUNT(*) FROM public.tracks
UNION ALL
SELECT 'EVENTS', COUNT(*) FROM public.events
UNION ALL
SELECT 'SUBSCRIPTIONS', COUNT(*) FROM public.subscriptions
ORDER BY tabela;

-- Verificar church_id nos dados (importante para novas policies)
SELECT
  'Tracks GLOBAIS (church_id = NULL)' as tipo,
  COUNT(*) as total
FROM public.tracks
WHERE church_id IS NULL
UNION ALL
SELECT
  'Tracks PRIVADAS (church_id preenchido)',
  COUNT(*)
FROM public.tracks
WHERE church_id IS NOT NULL
UNION ALL
SELECT
  'Events com church_id',
  COUNT(*)
FROM public.events
WHERE church_id IS NOT NULL
UNION ALL
SELECT
  'Events SEM church_id (PROBLEMA)',
  COUNT(*)
FROM public.events
WHERE church_id IS NULL;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ RLS: Desabilitado em todas as tabelas
-- ✅ Políticas: 0 políticas RLS
-- ✅ Funções: 0 funções RLS antigas
-- ✅ Triggers: 0 triggers RLS
-- ✅ Migrations: 0 migrations problemáticas no histórico
-- ✅ Dados: Intactos e preservados
-- ✅ church_id: Colunas existem e dados preservados
-- =====================================================

-- =====================================================
-- PRÓXIMOS PASSOS:
-- =====================================================
-- Se todos os checks acima passaram:
--
-- 1. ✅ Executar: 20251226_reset_rls_completo.sql
--    (confirma limpeza - pode pular se já fez este script)
--
-- 2. ✅ Executar: 20251226_rls_correto_final.sql
--    (implementa RLS correto)
--
-- 3. ✅ Executar: VALIDAR_RLS.sql
--    (valida implementação)
--
-- 4. ✅ Testar aplicação seguindo:
--    GUIA_TESTE_RLS_COMPLETO.md
--
-- =====================================================

-- =====================================================
-- FIM DO SCRIPT DE LIMPEZA
-- =====================================================
