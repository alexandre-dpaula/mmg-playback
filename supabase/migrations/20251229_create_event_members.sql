-- Cria tabela para membros da equipe de eventos
CREATE TABLE IF NOT EXISTS public.event_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('vocal', 'instrumental', 'multimedia')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, profile_id, role)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON public.event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_profile_id ON public.event_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_event_members_role ON public.event_members(role);

-- Habilita RLS (Row Level Security)
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver membros de eventos da sua igreja
CREATE POLICY "Users can view event members from their church"
  ON public.event_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
      AND (
        e.church_id IN (
          SELECT church_id FROM public.users_app
          WHERE auth_user_id = auth.uid()
        )
        OR e.church_id IS NULL
      )
    )
  );

-- Política: Líderes e admins podem adicionar membros aos eventos da sua igreja
CREATE POLICY "Leaders can insert event members"
  ON public.event_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.users_app u ON u.auth_user_id = auth.uid()
      WHERE e.id = event_id
      AND (
        e.church_id = u.church_id
        OR e.church_id IS NULL
      )
      AND u.role IN ('leader', 'admin')
    )
  );

-- Política: Líderes e admins podem remover membros dos eventos da sua igreja
CREATE POLICY "Leaders can delete event members"
  ON public.event_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.users_app u ON u.auth_user_id = auth.uid()
      WHERE e.id = event_id
      AND (
        e.church_id = u.church_id
        OR e.church_id IS NULL
      )
      AND u.role IN ('leader', 'admin')
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.event_members IS 'Membros da equipe escalada para cada evento';
COMMENT ON COLUMN public.event_members.role IS 'Papel do membro: vocal, instrumental ou multimedia';
