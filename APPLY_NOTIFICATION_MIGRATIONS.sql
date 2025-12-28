-- ============================================
-- SCRIPT PARA APLICAR MIGRAÇÕES DE NOTIFICAÇÕES
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_notifications_church_id ON notifications(church_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- 3. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Membros podem ver notificações da igreja" ON notifications;
DROP POLICY IF EXISTS "Líderes podem criar notificações" ON notifications;
DROP POLICY IF EXISTS "Membros podem atualizar notificações" ON notifications;
DROP POLICY IF EXISTS "Líderes podem deletar notificações" ON notifications;

-- 5. Criar políticas RLS
CREATE POLICY "Membros podem ver notificações da igreja"
  ON notifications FOR SELECT
  USING (
    church_id IN (
      SELECT church_id
      FROM user_roles
      WHERE user_id = auth.uid()
    )
  );

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

-- 6. Adicionar coluna notifications_enabled na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- 7. Criar índice para notifications_enabled
CREATE INDEX IF NOT EXISTS idx_profiles_notifications_enabled ON profiles(notifications_enabled);

-- 8. Adicionar comentários
COMMENT ON TABLE notifications IS 'Notificações em tempo real para membros da equipe da igreja';
COMMENT ON COLUMN profiles.notifications_enabled IS 'Indica se o usuário deseja receber notificações';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
