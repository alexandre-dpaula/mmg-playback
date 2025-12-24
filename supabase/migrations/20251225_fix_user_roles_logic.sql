-- Migration: Fix User Roles Logic
-- Created: 2025-12-25
-- Description: Proper hierarchy for Igreja → Líder → Membros

-- =====================================================
-- 1. UPDATE USERS_APP TABLE - Change default role
-- =====================================================
-- Remove default 'leader' - users must explicitly choose
ALTER TABLE public.users_app
ALTER COLUMN role DROP DEFAULT;

-- Add proper role constraint
ALTER TABLE public.users_app
DROP CONSTRAINT IF EXISTS users_app_role_check;

ALTER TABLE public.users_app
ADD CONSTRAINT users_app_role_check
CHECK (role IN ('lider', 'vocal', 'instrumental', 'multimidia', 'pending'));

-- =====================================================
-- 2. ADD IS_CHURCH_OWNER COLUMN
-- =====================================================
-- Track who created/owns the church
ALTER TABLE public.users_app
ADD COLUMN IF NOT EXISTS is_church_owner BOOLEAN DEFAULT FALSE;

-- Mark current church owners
UPDATE public.users_app ua
SET is_church_owner = TRUE
WHERE ua.auth_user_id IN (
  SELECT c.owner_user_id
  FROM public.churches c
  WHERE c.id = ua.church_id
);

-- =====================================================
-- 3. CREATE INVITATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('vocal', 'instrumental', 'multimidia')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  -- Prevent duplicate invitations
  UNIQUE(church_id, email, status)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- =====================================================
-- 4. RLS FOR INVITATIONS
-- =====================================================
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Leaders can view invitations from their church
CREATE POLICY "Leaders can view church invitations"
  ON public.invitations FOR SELECT
  USING (
    church_id IN (
      SELECT church_id FROM public.users_app
      WHERE auth_user_id = auth.uid() AND role = 'lider'
    )
  );

-- Leaders can create invitations for their church
CREATE POLICY "Leaders can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    church_id IN (
      SELECT church_id FROM public.users_app
      WHERE auth_user_id = auth.uid() AND role = 'lider'
    )
  );

-- Leaders can update their church invitations
CREATE POLICY "Leaders can update invitations"
  ON public.invitations FOR UPDATE
  USING (
    church_id IN (
      SELECT church_id FROM public.users_app
      WHERE auth_user_id = auth.uid() AND role = 'lider'
    )
  );

-- Anyone can view invitations sent to their email
CREATE POLICY "Users can view own invitations"
  ON public.invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- =====================================================
-- 5. FUNCTION: Auto-expire invitations
-- =====================================================
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run daily
CREATE OR REPLACE FUNCTION create_expire_trigger()
RETURNS void AS $$
BEGIN
  -- Remove old trigger if exists
  DROP TRIGGER IF EXISTS trigger_expire_invitations ON public.invitations;

  -- Create new trigger
  CREATE TRIGGER trigger_expire_invitations
    AFTER INSERT OR UPDATE ON public.invitations
    FOR EACH STATEMENT
    EXECUTE FUNCTION expire_old_invitations();
END;
$$ LANGUAGE plpgsql;

SELECT create_expire_trigger();

-- =====================================================
-- 6. UPDATE EXISTING USERS
-- =====================================================
-- Set pending role for users without church
UPDATE public.users_app
SET role = 'pending'
WHERE church_id IS NULL AND role != 'lider';

-- Ensure church owners are 'lider'
UPDATE public.users_app ua
SET role = 'lider'
WHERE ua.auth_user_id IN (
  SELECT c.owner_user_id
  FROM public.churches c
  WHERE c.id = ua.church_id
);

-- =====================================================
-- 7. COMMENTS
-- =====================================================
COMMENT ON TABLE public.invitations IS 'Church member invitations sent by leaders';
COMMENT ON COLUMN public.users_app.is_church_owner IS 'TRUE if user created/owns the church';
COMMENT ON COLUMN public.users_app.role IS 'User role: lider (church owner), vocal, instrumental, multimidia, or pending (awaiting invitation)';
