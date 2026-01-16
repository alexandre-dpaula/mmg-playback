-- ============================================
-- FIX DEFINITIVO DE TODAS AS POLÍTICAS RLS
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. TABELA users_app
-- ============================================
DROP POLICY IF EXISTS "users_app_select_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_update_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_insert_policy" ON public.users_app;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users_app;
DROP POLICY IF EXISTS "Users can update own record" ON public.users_app;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users_app;

CREATE POLICY "users_app_select_policy" ON public.users_app FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_app_update_policy" ON public.users_app FOR UPDATE TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "users_app_insert_policy" ON public.users_app FOR INSERT TO authenticated WITH CHECK (auth_user_id = auth.uid());


-- 2. TABELA profiles
-- ============================================
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());


-- 3. TABELA events
-- ============================================
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.events;

CREATE POLICY "events_select_policy" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_insert_policy" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "events_update_policy" ON public.events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "events_delete_policy" ON public.events FOR DELETE TO authenticated USING (true);


-- 4. TABELA event_members (se existir)
-- ============================================
DROP POLICY IF EXISTS "event_members_select_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_insert_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_update_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_delete_policy" ON public.event_members;

CREATE POLICY "event_members_select_policy" ON public.event_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_members_insert_policy" ON public.event_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "event_members_update_policy" ON public.event_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "event_members_delete_policy" ON public.event_members FOR DELETE TO authenticated USING (true);


-- 5. TABELA event_tracks (se existir)
-- ============================================
DROP POLICY IF EXISTS "event_tracks_select_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_insert_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_update_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_delete_policy" ON public.event_tracks;

CREATE POLICY "event_tracks_select_policy" ON public.event_tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_tracks_insert_policy" ON public.event_tracks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "event_tracks_update_policy" ON public.event_tracks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "event_tracks_delete_policy" ON public.event_tracks FOR DELETE TO authenticated USING (true);


-- 6. TABELA notifications
-- ============================================
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.notifications;

CREATE POLICY "notifications_select_policy" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "notifications_update_policy" ON public.notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "notifications_insert_policy" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notifications_delete_policy" ON public.notifications FOR DELETE TO authenticated USING (true);


-- 7. VERIFICAR SE FUNCIONOU
-- ============================================
SELECT
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users_app', 'profiles', 'events', 'event_members', 'event_tracks', 'notifications')
GROUP BY tablename
ORDER BY tablename;
