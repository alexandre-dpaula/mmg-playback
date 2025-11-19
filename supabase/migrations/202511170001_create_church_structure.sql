-- Tabelas de suporte para o fluxo de igrejas/equipes/users_app
set check_function_bodies = off;

create extension if not exists "pgcrypto";

create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  primary_color text,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.users_app (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  email text,
  church_id uuid references public.churches(id) on delete set null,
  role text not null default 'leader',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists users_app_auth_unique on public.users_app(auth_user_id);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.user_team (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public.users_app(id) on delete cascade,
  church_id uuid references public.churches(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz default now()
);

create index if not exists user_team_user_idx on public.user_team(user_id);
create index if not exists user_team_team_idx on public.user_team(team_id);
create index if not exists teams_church_idx on public.teams(church_id);
