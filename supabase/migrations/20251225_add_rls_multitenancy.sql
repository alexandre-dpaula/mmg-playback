-- Migration: Add Row Level Security for Multi-Church (Multitenancy)
-- Created: 2025-12-25
-- Description: Isolate data by church - users only see their own church's data

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tracks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. HELPER FUNCTION: Get Current User's Church ID
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_church_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT church_id
    FROM public.users_app
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CHURCHES POLICIES
-- =====================================================
-- Users can view their own church
CREATE POLICY "Users can view own church"
  ON public.churches FOR SELECT
  USING (
    id = public.get_user_church_id()
    OR owner_user_id = auth.uid()
  );

-- Only church owner can update
CREATE POLICY "Church owner can update"
  ON public.churches FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Only church owner can delete
CREATE POLICY "Church owner can delete"
  ON public.churches FOR DELETE
  USING (owner_user_id = auth.uid());

-- Anyone can create a church (during onboarding)
CREATE POLICY "Anyone can create church"
  ON public.churches FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- =====================================================
-- 4. USERS_APP POLICIES
-- =====================================================
-- Users can view members of their own church
CREATE POLICY "Users can view church members"
  ON public.users_app FOR SELECT
  USING (church_id = public.get_user_church_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users_app FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- System can insert users (during registration)
CREATE POLICY "System can insert users"
  ON public.users_app FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 5. TEAMS POLICIES
-- =====================================================
-- Users can view teams from their church
CREATE POLICY "Users can view church teams"
  ON public.teams FOR SELECT
  USING (church_id = public.get_user_church_id());

-- Leaders can create teams in their church
CREATE POLICY "Leaders can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (church_id = public.get_user_church_id());

-- Leaders can update teams
CREATE POLICY "Leaders can update teams"
  ON public.teams FOR UPDATE
  USING (church_id = public.get_user_church_id())
  WITH CHECK (church_id = public.get_user_church_id());

-- Leaders can delete teams
CREATE POLICY "Leaders can delete teams"
  ON public.teams FOR DELETE
  USING (church_id = public.get_user_church_id());

-- =====================================================
-- 6. USER_TEAM POLICIES
-- =====================================================
-- Users can view team members from their church
CREATE POLICY "Users can view church team members"
  ON public.user_team FOR SELECT
  USING (church_id = public.get_user_church_id());

-- Leaders can add members to teams
CREATE POLICY "Leaders can add team members"
  ON public.user_team FOR INSERT
  WITH CHECK (church_id = public.get_user_church_id());

-- Leaders can update team members
CREATE POLICY "Leaders can update team members"
  ON public.user_team FOR UPDATE
  USING (church_id = public.get_user_church_id())
  WITH CHECK (church_id = public.get_user_church_id());

-- Leaders can remove team members
CREATE POLICY "Leaders can remove team members"
  ON public.user_team FOR DELETE
  USING (church_id = public.get_user_church_id());

-- =====================================================
-- 7. TRACKS POLICIES (Cifras isoladas por igreja)
-- =====================================================
-- Add church_id column to tracks if not exists
ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS tracks_church_idx ON public.tracks(church_id);

-- Users can view tracks from their church
CREATE POLICY "Users can view church tracks"
  ON public.tracks FOR SELECT
  USING (
    church_id = public.get_user_church_id()
    OR church_id IS NULL -- Allow viewing tracks without church (legacy data)
  );

-- Users can create tracks in their church
CREATE POLICY "Users can create church tracks"
  ON public.tracks FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id()
    OR church_id IS NULL
  );

-- Users can update their church's tracks
CREATE POLICY "Users can update church tracks"
  ON public.tracks FOR UPDATE
  USING (church_id = public.get_user_church_id())
  WITH CHECK (church_id = public.get_user_church_id());

-- Users can delete their church's tracks
CREATE POLICY "Users can delete church tracks"
  ON public.tracks FOR DELETE
  USING (church_id = public.get_user_church_id());

-- =====================================================
-- 8. EVENTS POLICIES (Eventos isolados por igreja)
-- =====================================================
-- Add church_id column to events if not exists
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS events_church_idx ON public.events(church_id);

-- Users can view events from their church
CREATE POLICY "Users can view church events"
  ON public.events FOR SELECT
  USING (
    church_id = public.get_user_church_id()
    OR church_id IS NULL -- Allow viewing events without church (legacy data)
  );

-- Users can create events in their church
CREATE POLICY "Users can create church events"
  ON public.events FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id()
    OR church_id IS NULL
  );

-- Users can update their church's events
CREATE POLICY "Users can update church events"
  ON public.events FOR UPDATE
  USING (church_id = public.get_user_church_id())
  WITH CHECK (church_id = public.get_user_church_id());

-- Users can delete their church's events
CREATE POLICY "Users can delete church events"
  ON public.events FOR DELETE
  USING (church_id = public.get_user_church_id());

-- =====================================================
-- 9. EVENT_TRACKS POLICIES
-- =====================================================
-- Users can view event tracks from their church events
CREATE POLICY "Users can view church event tracks"
  ON public.event_tracks FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE church_id = public.get_user_church_id()
    )
  );

-- Users can add tracks to their church events
CREATE POLICY "Users can add tracks to church events"
  ON public.event_tracks FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events WHERE church_id = public.get_user_church_id()
    )
  );

-- Users can update their church event tracks
CREATE POLICY "Users can update church event tracks"
  ON public.event_tracks FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE church_id = public.get_user_church_id()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events WHERE church_id = public.get_user_church_id()
    )
  );

-- Users can delete their church event tracks
CREATE POLICY "Users can delete church event tracks"
  ON public.event_tracks FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE church_id = public.get_user_church_id()
    )
  );

-- =====================================================
-- 10. MIGRATION: Set church_id for existing data
-- =====================================================
-- Update existing tracks with church_id from user
UPDATE public.tracks t
SET church_id = (
  SELECT ua.church_id
  FROM public.users_app ua
  WHERE ua.auth_user_id = t.user_id
  LIMIT 1
)
WHERE t.church_id IS NULL AND t.user_id IS NOT NULL;

-- Update existing events with church_id from created_by user
UPDATE public.events e
SET church_id = (
  SELECT ua.church_id
  FROM public.users_app ua
  WHERE ua.auth_user_id = e.created_by
  LIMIT 1
)
WHERE e.church_id IS NULL AND e.created_by IS NOT NULL;

-- =====================================================
-- 11. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON FUNCTION public.get_user_church_id() IS 'Returns the church_id of the currently authenticated user';
COMMENT ON COLUMN public.tracks.church_id IS 'Links track to a specific church for multi-tenancy';
COMMENT ON COLUMN public.events.church_id IS 'Links event to a specific church for multi-tenancy';
