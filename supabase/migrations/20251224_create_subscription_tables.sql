-- Migration: Create subscription and payment tables for ASAAS integration
-- Created: 2025-12-24
-- Description: Tables to manage subscriptions and payments with ASAAS

-- =====================================================
-- 1. SUBSCRIPTIONS TABLE
-- =====================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  asaas_subscription_id text unique,
  asaas_customer_id text not null,
  status text check (status in ('active', 'inactive', 'overdue', 'canceled')) default 'inactive',
  amount decimal(10,2) default 9.98 not null,
  payment_method text check (payment_method in ('PIX', 'BOLETO', 'CREDIT_CARD')),
  next_due_date timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- =====================================================
-- 2. PAYMENTS TABLE
-- =====================================================
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions(id) on delete cascade not null,
  asaas_payment_id text unique not null,
  status text not null,
  amount decimal(10,2) not null,
  payment_method text not null,
  payment_date timestamp with time zone,
  due_date timestamp with time zone not null,
  invoice_url text,
  bank_slip_url text,
  pix_qr_code text,
  pix_copy_paste text,
  created_at timestamp with time zone default now() not null
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_subscriptions_asaas_id on subscriptions(asaas_subscription_id);
create index if not exists idx_subscriptions_status on subscriptions(status);
create index if not exists idx_payments_subscription_id on payments(subscription_id);
create index if not exists idx_payments_asaas_id on payments(asaas_payment_id);
create index if not exists idx_payments_status on payments(status);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================
alter table subscriptions enable row level security;
alter table payments enable row level security;

-- Policy: Users can view their own subscriptions
create policy "Users can view own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own subscriptions (via Edge Function)
create policy "Users can create own subscriptions"
  on subscriptions for insert
  with check (auth.uid() = user_id);

-- Policy: System can update subscriptions (via Edge Function)
create policy "System can update subscriptions"
  on subscriptions for update
  using (true);

-- Policy: Users can view their own payments
create policy "Users can view own payments"
  on payments for select
  using (
    subscription_id in (
      select id from subscriptions where user_id = auth.uid()
    )
  );

-- Policy: System can insert/update payments (via Edge Function)
create policy "System can manage payments"
  on payments for all
  using (true);

-- =====================================================
-- 5. TRIGGER: AUTO UPDATE updated_at
-- =====================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================
comment on table subscriptions is 'Stores user subscription information from ASAAS';
comment on table payments is 'Stores individual payment records for subscriptions';
comment on column subscriptions.asaas_subscription_id is 'ASAAS subscription ID (external)';
comment on column subscriptions.asaas_customer_id is 'ASAAS customer ID (external)';
comment on column subscriptions.status is 'Subscription status: active, inactive, overdue, canceled';
comment on column payments.asaas_payment_id is 'ASAAS payment ID (external)';
