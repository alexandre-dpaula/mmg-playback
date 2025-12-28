-- =====================================================
-- FIX: Isolamento completo de dados por igreja
-- Data: 25/12/2025
-- VERSÃO CORRETA - auth_user_id é UUID, auth.uid()::uuid é UUID
-- NÃO PRECISA DE CAST!
-- =====================================================

-- 1. DROPS de políticas antigas
DROP POLICY IF EXISTS "tracks_select_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_insert_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_update_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_delete_policy" ON public.tracks;

DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;

DROP POLICY IF EXISTS "users_app_select_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_insert_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_update_policy" ON public.users_app;

DROP POLICY IF EXISTS "churches_select_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_insert_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_update_policy" ON public.churches;

-- 2. HABILITAR RLS
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. TRACKS
-- =====================================================

CREATE POLICY "tracks_select_policy" ON public.tracks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = tracks.church_id
    )
  );

CREATE POLICY "tracks_insert_policy" ON public.tracks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = tracks.church_id
        AND users_app.role IN ('lider', 'vocal', 'instrumental')
    )
  );

CREATE POLICY "tracks_update_policy" ON public.tracks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = tracks.church_id
        AND users_app.role IN ('lider', 'vocal', 'instrumental')
    )
  );

CREATE POLICY "tracks_delete_policy" ON public.tracks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = tracks.church_id
        AND users_app.role = 'lider'
    )
  );

-- =====================================================
-- 4. EVENTS
-- =====================================================

CREATE POLICY "events_select_policy" ON public.events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = events.church_id
    )
  );

CREATE POLICY "events_insert_policy" ON public.events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = events.church_id
        AND users_app.role IN ('lider', 'vocal', 'instrumental', 'multimidia')
    )
  );

CREATE POLICY "events_update_policy" ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = events.church_id
        AND users_app.role IN ('lider', 'vocal', 'instrumental', 'multimidia')
    )
  );

CREATE POLICY "events_delete_policy" ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = events.church_id
        AND users_app.role = 'lider'
    )
  );

-- =====================================================
-- 5. USERS_APP
-- =====================================================

CREATE POLICY "users_app_select_policy" ON public.users_app
  FOR SELECT
  USING (
    auth_user_id = auth.uid()::uuid
    OR EXISTS (
      SELECT 1 FROM public.users_app AS me
      WHERE me.auth_user_id = auth.uid()::uuid
        AND me.church_id = users_app.church_id
    )
  );

CREATE POLICY "users_app_insert_policy" ON public.users_app
  FOR INSERT
  WITH CHECK (auth_user_id = auth.uid()::uuid);

CREATE POLICY "users_app_update_policy" ON public.users_app
  FOR UPDATE
  USING (
    auth_user_id = auth.uid()::uuid
    OR EXISTS (
      SELECT 1 FROM public.users_app AS me
      WHERE me.auth_user_id = auth.uid()::uuid
        AND me.church_id = users_app.church_id
        AND me.role = 'lider'
    )
  )
  WITH CHECK (
    auth_user_id = auth.uid()::uuid
    OR EXISTS (
      SELECT 1 FROM public.users_app AS me
      WHERE me.auth_user_id = auth.uid()::uuid
        AND me.church_id = users_app.church_id
        AND me.role = 'lider'
    )
  );

-- =====================================================
-- 6. CHURCHES
-- =====================================================

CREATE POLICY "churches_select_policy" ON public.churches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = churches.id
    )
  );

CREATE POLICY "churches_insert_policy" ON public.churches
  FOR INSERT
  WITH CHECK (auth.uid()::uuid IS NOT NULL);

CREATE POLICY "churches_update_policy" ON public.churches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE users_app.auth_user_id = auth.uid()::uuid
        AND users_app.church_id = churches.id
        AND users_app.role = 'lider'
    )
  );
