-- =====================================================
-- REVERTER MIGRATIONS PROBLEMÁTICAS
-- Data: 26/12/2025
-- Objetivo: Desfazer migrations RLS antigas que causaram problemas
-- =====================================================
--
-- IMPORTANTE: Execute este SQL ANTES de aplicar as novas migrations
-- Este script desfaz:
-- - 20251225_add_rls_multitenancy.sql (RLS errado)
-- - 20251225_fix_rls_CORRECT.sql (tentativa de fix)
-- - Qualquer resquício de RLS antigo
--
-- =====================================================

-- =====================================================
-- 1. REMOVER DO HISTÓRICO DE MIGRATIONS (Supabase)
-- =====================================================
-- Supabase rastreia migrations aplicadas na tabela supabase_migrations.schema_migrations
-- Vamos remover as migrations problemáticas do histórico

DELETE FROM supabase_migrations.schema_migrations
WHERE version IN (
  '20251225_add_rls_multitenancy',
  '20251225_fix_rls_CORRECT',
  '20251225_fix_user_roles_logic'
);

-- =====================================================
-- 2. DESABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE public.churches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_app DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_team DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. DROPAR TODAS AS POLÍTICAS RLS ANTIGAS
-- =====================================================

-- Churches
DROP POLICY IF EXISTS "Users can view own church" ON public.churches;
DROP POLICY IF EXISTS "Church owner can update" ON public.churches;
DROP POLICY IF EXISTS "Church owner can delete" ON public.churches;
DROP POLICY IF EXISTS "Anyone can create church" ON public.churches;
DROP POLICY IF EXISTS "churches_select_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_insert_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_update_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_delete_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_select" ON public.churches;
DROP POLICY IF EXISTS "churches_insert" ON public.churches;
DROP POLICY IF EXISTS "churches_update" ON public.churches;
DROP POLICY IF EXISTS "churches_delete" ON public.churches;

-- Users App
DROP POLICY IF EXISTS "Users can view church members" ON public.users_app;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users_app;
DROP POLICY IF EXISTS "System can insert users" ON public.users_app;
DROP POLICY IF EXISTS "users_app_select_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_insert_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_update_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_delete_policy" ON public.users_app;

-- Teams
DROP POLICY IF EXISTS "Users can view church teams" ON public.teams;
DROP POLICY IF EXISTS "Leaders can create teams" ON public.teams;
DROP POLICY IF EXISTS "Leaders can update teams" ON public.teams;
DROP POLICY IF EXISTS "Leaders can delete teams" ON public.teams;
DROP POLICY IF EXISTS "teams_select" ON public.teams;
DROP POLICY IF EXISTS "teams_insert" ON public.teams;
DROP POLICY IF EXISTS "teams_update" ON public.teams;
DROP POLICY IF EXISTS "teams_delete" ON public.teams;

-- User Team
DROP POLICY IF EXISTS "Users can view church team members" ON public.user_team;
DROP POLICY IF EXISTS "Leaders can add team members" ON public.user_team;
DROP POLICY IF EXISTS "Leaders can update team members" ON public.user_team;
DROP POLICY IF EXISTS "Leaders can remove team members" ON public.user_team;
DROP POLICY IF EXISTS "user_team_select" ON public.user_team;
DROP POLICY IF EXISTS "user_team_insert" ON public.user_team;
DROP POLICY IF EXISTS "user_team_update" ON public.user_team;
DROP POLICY IF EXISTS "user_team_delete" ON public.user_team;

-- Tracks
DROP POLICY IF EXISTS "Users can view church tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can create church tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can update church tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can delete church tracks" ON public.tracks;
DROP POLICY IF EXISTS "tracks_select_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_insert_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_update_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_delete_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_select" ON public.tracks;
DROP POLICY IF EXISTS "tracks_insert" ON public.tracks;
DROP POLICY IF EXISTS "tracks_update" ON public.tracks;
DROP POLICY IF EXISTS "tracks_delete" ON public.tracks;

-- Events
DROP POLICY IF EXISTS "Users can view church events" ON public.events;
DROP POLICY IF EXISTS "Users can create church events" ON public.events;
DROP POLICY IF EXISTS "Users can update church events" ON public.events;
DROP POLICY IF EXISTS "Users can delete church events" ON public.events;
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

-- Event Tracks
DROP POLICY IF EXISTS "Users can view church event tracks" ON public.event_tracks;
DROP POLICY IF EXISTS "Users can add tracks to church events" ON public.event_tracks;
DROP POLICY IF EXISTS "Users can update church event tracks" ON public.event_tracks;
DROP POLICY IF EXISTS "Users can delete church event tracks" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_select" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_insert" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_update" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_delete" ON public.event_tracks;

-- Subscriptions
DROP POLICY IF EXISTS "subscriptions_select_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON public.subscriptions;

-- Payments
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "payments_insert" ON public.payments;

-- =====================================================
-- 4. DROPAR FUNÇÕES ANTIGAS/PROBLEMÁTICAS
-- =====================================================
DROP FUNCTION IF EXISTS public.get_user_church_id();
DROP FUNCTION IF EXISTS public.is_user_leader();
DROP FUNCTION IF EXISTS auth.get_user_church_id();
DROP FUNCTION IF EXISTS auth.church_id();

-- =====================================================
-- 5. REMOVER COLUNAS QUE FORAM ADICIONADAS ERRADAS (se houver)
-- =====================================================
-- As migrations antigas podem ter adicionado colunas desnecessárias
-- Vamos verificar e remover apenas se existirem

-- Verificar se tracks.church_id foi adicionado pela migration antiga
-- Se sim, NÃO removemos (porque vamos usar nas novas migrations)
-- Apenas garantir que está NULL para dados antigos

-- IMPORTANTE: NÃO REMOVER church_id, vamos usar nas novas policies!
-- Apenas garantir que dados antigos estão corretos

-- =====================================================
-- 6. VERIFICAR ESTADO FINAL
-- =====================================================
-- Após executar este script, verificar:

SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '❌ AINDA TEM RLS'
    ELSE '✅ RLS DESABILITADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'churches', 'users_app', 'tracks', 'events', 'event_tracks',
    'teams', 'user_team', 'subscriptions', 'payments'
  )
ORDER BY tablename;

-- Contar políticas restantes (deve ser 0)
SELECT
  COUNT(*) as total_politicas_restantes
FROM pg_policies
WHERE schemaname = 'public';

-- Contar funções restantes relacionadas a RLS
SELECT
  COUNT(*) as total_funcoes_rls_restantes
FROM pg_proc
WHERE proname IN ('get_user_church_id', 'is_user_leader')
  AND pronamespace = 'public'::regnamespace;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ RLS desabilitado em todas as tabelas
-- ✅ 0 políticas RLS restantes
-- ✅ 0 funções RLS antigas
-- ✅ Migrations problemáticas removidas do histórico
-- ✅ Banco limpo e pronto para novas migrations
-- =====================================================

-- =====================================================
-- PRÓXIMOS PASSOS:
-- =====================================================
-- 1. Verificar que este script rodou sem erros
-- 2. Conferir resultados das queries de verificação acima
-- 3. Executar: 20251226_reset_rls_completo.sql (confirma limpeza)
-- 4. Executar: 20251226_rls_correto_final.sql (aplica RLS correto)
-- =====================================================
