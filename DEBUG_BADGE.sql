-- ============================================
-- DEBUG COMPLETO DO BADGE DE NOTIFICAÇÕES
-- Execute cada seção separadamente
-- ============================================

-- PASSO 1: Ver seu church_id
-- ============================================
SELECT
  'MEU CHURCH_ID:' as info,
  auth_user_id,
  church_id,
  role
FROM public.users_app
WHERE auth_user_id = auth.uid();


-- PASSO 2: Ver TODAS as notificações no banco
-- ============================================
SELECT
  'TODAS AS NOTIFICAÇÕES:' as info,
  church_id,
  title,
  read,
  created_at
FROM public.notifications
ORDER BY created_at DESC;


-- PASSO 3: Ver notificações NÃO LIDAS para MEU church_id
-- ============================================
SELECT
  'MINHAS NOTIFICAÇÕES NÃO LIDAS:' as info,
  COUNT(*) as total
FROM public.notifications
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
)
AND read = false;


-- PASSO 4: MARCAR TODAS COMO NÃO LIDAS
-- ============================================
UPDATE public.notifications
SET read = false
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
);

-- Ver resultado
SELECT
  'APÓS MARCAR COMO NÃO LIDAS:' as info,
  COUNT(*) as total_nao_lidas
FROM public.notifications
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
)
AND read = false;


-- PASSO 5: COMPARAR church_id
-- ============================================
SELECT
  'CHURCH_ID DAS NOTIFICAÇÕES:' as tipo,
  DISTINCT church_id
FROM public.notifications

UNION ALL

SELECT
  'MEU CHURCH_ID:' as tipo,
  church_id
FROM public.users_app
WHERE auth_user_id = auth.uid();
