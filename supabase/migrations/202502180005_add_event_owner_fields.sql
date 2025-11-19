alter table public.events
  add column if not exists church_id uuid references public.churches(id) on delete set null,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by_name text;

create index if not exists idx_events_church_id on public.events(church_id);
create index if not exists idx_events_created_by on public.events(created_by);
