-- ============================================
-- VERIFICAR E TESTAR NOTIFICAÇÕES
-- Execute estes comandos no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR SE A TABELA EXISTE
-- ============================================
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'notifications'
);
-- Resultado esperado: true


-- 2. BUSCAR SEU CHURCH_ID
-- ============================================
SELECT
  u.id as user_id,
  u.email,
  u.church_id,
  c.name as church_name
FROM public.users_app u
LEFT JOIN public.churches c ON u.church_id = c.id
WHERE u.auth_user_id = auth.uid();
-- Copie o church_id que aparecer


-- 3. VERIFICAR NOTIFICAÇÕES EXISTENTES
-- ============================================
-- Substitua 'SEU_CHURCH_ID_AQUI' pelo UUID copiado acima
SELECT
  id,
  title,
  message,
  type,
  read,
  created_at
FROM public.notifications
WHERE church_id = 'SEU_CHURCH_ID_AQUI'
ORDER BY created_at DESC;


-- 4. CONTAR NOTIFICAÇÕES NÃO LIDAS
-- ============================================
SELECT COUNT(*) as unread_count
FROM public.notifications
WHERE church_id = 'SEU_CHURCH_ID_AQUI'
AND read = false;


-- 5. CRIAR NOTIFICAÇÕES DE TESTE
-- ============================================
-- Substitua 'SEU_CHURCH_ID_AQUI' pelo UUID copiado acima
INSERT INTO public.notifications (church_id, title, message, type, read, metadata)
VALUES
  ('SEU_CHURCH_ID_AQUI', 'Bem-vindo ao Sistema de Notificações! 🎉', 'Esta é sua primeira notificação. O badge vermelho deve aparecer agora!', 'success', false, '{"test": true}'),
  ('SEU_CHURCH_ID_AQUI', 'Nova Música Adicionada', 'A música "Amazing Grace" foi adicionada ao repertório de domingo', 'info', false, '{"track_id": "123"}'),
  ('SEU_CHURCH_ID_AQUI', 'Ensaio Amanhã', 'Não esqueça do ensaio amanhã às 19h!', 'warning', false, '{"event_id": "456"}');


-- 6. VERIFICAR SE AS NOTIFICAÇÕES FORAM CRIADAS
-- ============================================
SELECT
  id,
  title,
  message,
  type,
  read,
  created_at
FROM public.notifications
WHERE church_id = 'SEU_CHURCH_ID_AQUI'
ORDER BY created_at DESC
LIMIT 10;


-- 7. MARCAR TODAS COMO LIDAS (OPCIONAL)
-- ============================================
-- Use este comando se quiser marcar todas como lidas
/*
UPDATE public.notifications
SET read = true
WHERE church_id = 'SEU_CHURCH_ID_AQUI'
AND read = false;
*/


-- 8. DELETAR NOTIFICAÇÕES DE TESTE (OPCIONAL)
-- ============================================
-- Use este comando se quiser deletar as notificações de teste
/*
DELETE FROM public.notifications
WHERE church_id = 'SEU_CHURCH_ID_AQUI'
AND metadata->>'test' = 'true';
*/
