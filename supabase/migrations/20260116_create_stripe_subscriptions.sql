-- Migration: Create Stripe Subscriptions Table
-- Description: Tabela para gerenciar assinaturas do Stripe
-- Author: SetlistGO™
-- Date: 2026-01-16

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL CHECK (status IN (
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid'
  )),

  -- Datas
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices
  CONSTRAINT unique_user_active_subscription UNIQUE NULLS NOT DISTINCT (user_id,
    CASE WHEN status IN ('active', 'trialing', 'past_due') THEN user_id ELSE NULL END
  )
);

-- Create index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (via Edge Function)
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service role can update subscriptions (webhooks)
CREATE POLICY "Service role can update subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Create a helper function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = user_id_param
      AND status IN ('active', 'trialing')
      AND current_period_end > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION has_active_subscription(UUID) TO authenticated;

-- Create a view for active subscriptions
CREATE OR REPLACE VIEW public.active_subscriptions AS
SELECT
  s.*,
  u.email as user_email
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status IN ('active', 'trialing')
  AND s.current_period_end > NOW();

-- Grant access to the view
GRANT SELECT ON public.active_subscriptions TO authenticated;

COMMENT ON TABLE public.subscriptions IS 'Gerencia assinaturas Stripe dos usuários';
COMMENT ON FUNCTION has_active_subscription IS 'Verifica se usuário tem assinatura ativa';
