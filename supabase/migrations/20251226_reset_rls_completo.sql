-- =====================================================
-- RESET COMPLETO: Limpar TODAS as políticas RLS
-- Data: 26/12/2025
-- Objetivo: Começar do ZERO com a lógica CORRETA
-- =====================================================

-- =====================================================
-- PASSO 1: DESABILITAR RLS EM TODAS AS TABELAS
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
-- PASSO 2: DROPAR TODAS AS POLÍTICAS ANTIGAS
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

-- User Team
DROP POLICY IF EXISTS "Users can view church team members" ON public.user_team;
DROP POLICY IF EXISTS "Leaders can add team members" ON public.user_team;
DROP POLICY IF EXISTS "Leaders can update team members" ON public.user_team;
DROP POLICY IF EXISTS "Leaders can remove team members" ON public.user_team;

-- Tracks
DROP POLICY IF EXISTS "Users can view church tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can create church tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can update church tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can delete church tracks" ON public.tracks;
DROP POLICY IF EXISTS "tracks_select_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_insert_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_update_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_delete_policy" ON public.tracks;

-- Events
DROP POLICY IF EXISTS "Users can view church events" ON public.events;
DROP POLICY IF EXISTS "Users can create church events" ON public.events;
DROP POLICY IF EXISTS "Users can update church events" ON public.events;
DROP POLICY IF EXISTS "Users can delete church events" ON public.events;
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;

-- Event Tracks
DROP POLICY IF EXISTS "Users can view church event tracks" ON public.event_tracks;
DROP POLICY IF EXISTS "Users can add tracks to church events" ON public.event_tracks;
DROP POLICY IF EXISTS "Users can update church event tracks" ON public.event_tracks;
DROP POLICY IF EXISTS "Users can delete church event tracks" ON public.event_tracks;

-- Subscriptions
DROP POLICY IF EXISTS "subscriptions_select_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_policy" ON public.subscriptions;

-- Payments
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;

-- =====================================================
-- PASSO 3: DROPAR FUNÇÕES ANTIGAS
-- =====================================================
DROP FUNCTION IF EXISTS public.get_user_church_id();
DROP FUNCTION IF EXISTS auth.get_user_church_id();
DROP FUNCTION IF EXISTS auth.church_id();

-- =====================================================
-- RESULTADO: Banco limpo, pronto para RLS CORRETO
-- =====================================================
-- Próxima migration: 20251226_rls_correto_final.sql
-- =====================================================
