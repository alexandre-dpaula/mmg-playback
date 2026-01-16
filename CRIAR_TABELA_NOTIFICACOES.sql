-- ============================================
-- CRIAR TABELA DE NOTIFICAÇÕES
-- Copie e cole este código no SQL Editor do Supabase
-- ============================================

-- 1. CRIAR TABELA notifications
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'invite', 'event')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notifications_church_id ON public.notifications(church_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_church_read ON public.notifications(church_id, read);

-- Habilita RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver notificações da sua igreja
DROP POLICY IF EXISTS "Users can view notifications from their church" ON public.notifications;
CREATE POLICY "Users can view notifications from their church"
  ON public.notifications
  FOR SELECT
  USING (
    church_id IN (
      SELECT church_id FROM public.users_app
      WHERE auth_user_id = auth.uid()
    )
  );

-- Política: Usuários podem marcar suas notificações como lidas
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    church_id IN (
      SELECT church_id FROM public.users_app
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    church_id IN (
      SELECT church_id FROM public.users_app
      WHERE auth_user_id = auth.uid()
    )
  );

-- Política: Líderes e admins podem criar notificações
DROP POLICY IF EXISTS "Leaders can insert notifications" ON public.notifications;
CREATE POLICY "Leaders can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE auth_user_id = auth.uid()
      AND church_id = notifications.church_id
      AND role IN ('lider', 'admin')
    )
  );

-- Política: Líderes e admins podem deletar notificações
DROP POLICY IF EXISTS "Leaders can delete notifications" ON public.notifications;
CREATE POLICY "Leaders can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users_app
      WHERE auth_user_id = auth.uid()
      AND church_id = notifications.church_id
      AND role IN ('lider', 'admin')
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.notifications IS 'Notificações para usuários da igreja';
COMMENT ON COLUMN public.notifications.type IS 'Tipo da notificação: info, success, warning, error, invite, event';
COMMENT ON COLUMN public.notifications.metadata IS 'Dados adicionais em formato JSON (ex: event_id, user_id, etc)';


-- 2. INSERIR NOTIFICAÇÕES DE TESTE (OPCIONAL)
-- ============================================
-- Descomente as linhas abaixo para criar notificações de teste

-- Obter o ID da sua igreja
-- SELECT id, name FROM public.churches;

-- Depois de obter o church_id, substitua 'SEU_CHURCH_ID_AQUI' pelo UUID real

/*
INSERT INTO public.notifications (church_id, title, message, type, metadata)
VALUES
  ('SEU_CHURCH_ID_AQUI', 'Novo Convite', 'Você foi convidado para participar do ensaio de domingo!', 'invite', '{"event_id": "123"}'),
  ('SEU_CHURCH_ID_AQUI', 'Evento Atualizado', 'O horário do culto foi alterado para 19h', 'info', '{"event_id": "456"}'),
  ('SEU_CHURCH_ID_AQUI', 'Música Adicionada', 'Nova música foi adicionada ao repertório', 'success', '{"track_id": "789"}');
*/


-- 3. VERIFICAR NOTIFICAÇÕES NÃO LIDAS
-- ============================================

-- Ver todas as notificações não lidas
SELECT
  id,
  title,
  message,
  type,
  read,
  created_at
FROM public.notifications
WHERE read = false
ORDER BY created_at DESC;

-- Contar notificações não lidas por igreja
SELECT
  church_id,
  COUNT(*) as unread_count
FROM public.notifications
WHERE read = false
GROUP BY church_id;
