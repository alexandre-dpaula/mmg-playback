-- Adiciona coluna para habilitar/desabilitar notificações no perfil do usuário
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- Cria índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_notifications_enabled ON profiles(notifications_enabled);

-- Comentário
COMMENT ON COLUMN profiles.notifications_enabled IS 'Indica se o usuário deseja receber notificações';
