-- ============================================
-- MARCAR NOTIFICAÇÕES COMO NÃO LIDAS
-- Execute no SQL Editor do Supabase
-- ============================================

-- IMPORTANTE: Use este comando para testar o badge
-- Ele marca todas as suas notificações como não lidas

UPDATE public.notifications
SET read = false
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
);

-- Verificar resultado
SELECT
  id,
  title,
  read,
  created_at
FROM public.notifications
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
)
ORDER BY created_at DESC;
