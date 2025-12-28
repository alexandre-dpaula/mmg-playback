-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_playlist', 'new_track', 'updated_track', 'new_member', 'track_updated'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_church_id ON notifications(church_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Membros podem ver notificações da sua igreja
CREATE POLICY "Membros podem ver notificações da igreja"
  ON notifications FOR SELECT
  USING (
    church_id IN (
      SELECT church_id
      FROM user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Líderes podem criar notificações
CREATE POLICY "Líderes podem criar notificações"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND church_id = notifications.church_id
      AND role = 'lider'
    )
  );

-- Membros podem marcar suas notificações como lidas
CREATE POLICY "Membros podem atualizar notificações"
  ON notifications FOR UPDATE
  USING (
    church_id IN (
      SELECT church_id
      FROM user_roles
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    church_id IN (
      SELECT church_id
      FROM user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Líderes podem deletar notificações
CREATE POLICY "Líderes podem deletar notificações"
  ON notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND church_id = notifications.church_id
      AND role = 'lider'
    )
  );

-- Comentário na tabela
COMMENT ON TABLE notifications IS 'Notificações em tempo real para membros da equipe da igreja';
