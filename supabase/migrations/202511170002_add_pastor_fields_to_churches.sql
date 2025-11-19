alter table if exists public.churches
  add column if not exists pastor_name text,
  add column if not exists pastor_phone text;
