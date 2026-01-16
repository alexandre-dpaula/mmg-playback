-- ============================================
-- ROLLBACK DE EMERGÊNCIA - RESTAURAR RLS PERMISSIVO
-- Use SOMENTE se RLS_SEGURO_FINAL.sql quebrar o sistema
-- ============================================

-- ESTE SCRIPT RESTAURA AS POLÍTICAS PERMISSIVAS (USANDO true)
-- QUE PERMITEM ACESSO A TODOS OS USUÁRIOS AUTENTICADOS

BEGIN;

-- 1. USERS_APP - Permissivo temporário
DROP POLICY IF EXISTS "users_app_select_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_update_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_insert_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_delete_policy" ON public.users_app;

CREATE POLICY "users_app_select_policy" ON public.users_app FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_app_update_policy" ON public.users_app FOR UPDATE TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "users_app_insert_policy" ON public.users_app FOR INSERT TO authenticated WITH CHECK (auth_user_id = auth.uid());


-- 2. PROFILES - Permissivo temporário
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());


-- 3. EVENTS - Permissivo temporário
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;

CREATE POLICY "events_select_policy" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_insert_policy" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "events_update_policy" ON public.events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "events_delete_policy" ON public.events FOR DELETE TO authenticated USING (true);


-- 4. NOTIFICATIONS - Permissivo temporário
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;

CREATE POLICY "notifications_select_policy" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "notifications_update_policy" ON public.notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "notifications_insert_policy" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);


-- 5. EVENT_MEMBERS - Permissivo temporário
DROP POLICY IF EXISTS "event_members_select_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_insert_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_update_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_delete_policy" ON public.event_members;

CREATE POLICY "event_members_select_policy" ON public.event_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_members_insert_policy" ON public.event_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "event_members_update_policy" ON public.event_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "event_members_delete_policy" ON public.event_members FOR DELETE TO authenticated USING (true);


-- 6. EVENT_TRACKS - Permissivo temporário
DROP POLICY IF EXISTS "event_tracks_select_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_insert_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_update_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_delete_policy" ON public.event_tracks;

CREATE POLICY "event_tracks_select_policy" ON public.event_tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_tracks_insert_policy" ON public.event_tracks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "event_tracks_update_policy" ON public.event_tracks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "event_tracks_delete_policy" ON public.event_tracks FOR DELETE TO authenticated USING (true);


-- VERIFICAR RESTAURAÇÃO
SELECT
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

COMMIT;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- Se após executar RLS_SEGURO_FINAL.sql você NÃO conseguir:
-- - Ver eventos
-- - Ver notificações
-- - Acessar dados da igreja
--
-- EXECUTE ESTE SCRIPT para voltar ao estado anterior
-- (políticas permissivas que funcionavam)
-- ============================================
