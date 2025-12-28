-- ============================================
-- MIGRAÇÕES DE NOTIFICAÇÕES - VERSÃO LIMPA
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "enable_read_for_authenticated_users" ON notifications;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON notifications;
DROP POLICY IF EXISTS "enable_update_for_authenticated_users" ON notifications;
DROP POLICY IF EXISTS "enable_delete_for_authenticated_users" ON notifications;
DROP POLICY IF EXISTS "Membros podem ver notificações da igreja" ON notifications;
DROP POLICY IF EXISTS "Líderes podem criar notificações" ON notifications;
DROP POLICY IF EXISTS "Membros podem atualizar notificações" ON notifications;
DROP POLICY IF EXISTS "Líderes podem deletar notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários podem ver notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários podem criar notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários podem atualizar notificações" ON notifications;
DROP POLICY IF EXISTS "Criador pode deletar notificação" ON notifications;

-- 2. Criar tabela de notificações (se não existir)
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

-- 3. Criar índices (se não existirem)
CREATE INDEX IF NOT EXISTS idx_notifications_church_id ON notifications(church_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- 4. Adicionar coluna notifications_enabled na tabela profiles (se não existir)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- 5. Criar índice para notifications_enabled (se não existir)
CREATE INDEX IF NOT EXISTS idx_profiles_notifications_enabled ON profiles(notifications_enabled);

-- 6. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 7. Criar novas políticas RLS
CREATE POLICY "enable_read_for_authenticated_users" ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "enable_insert_for_authenticated_users" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "enable_update_for_authenticated_users" ON notifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "enable_delete_for_authenticated_users" ON notifications
  FOR DELETE
  TO authenticated
  USING (true);

-- 8. Adicionar comentários
COMMENT ON TABLE notifications IS 'Notificações em tempo real para membros da equipe da igreja';
COMMENT ON COLUMN profiles.notifications_enabled IS 'Indica se o usuário deseja receber notificações';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
