-- ============================================
-- DIAGNÓSTICO COMPLETO DO BADGE DE NOTIFICAÇÕES
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR ESTRUTURA DA TABELA
-- ============================================
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY ordinal_position;


-- 2. VER TODAS AS NOTIFICAÇÕES COM TODOS OS CAMPOS
-- ============================================
SELECT
  id,
  church_id,
  title,
  message,
  type,
  read,
  created_at,
  metadata
FROM public.notifications
ORDER BY created_at DESC;


-- 3. BUSCAR SEU CHURCH_ID
-- ============================================
SELECT
  u.id as user_id,
  u.email,
  u.church_id,
  u.role,
  c.name as church_name
FROM public.users_app u
LEFT JOIN public.churches c ON u.church_id = c.id
WHERE u.auth_user_id = auth.uid();


-- 4. CONTAR NOTIFICAÇÕES POR CHURCH_ID E STATUS DE LEITURA
-- ============================================
SELECT
  church_id,
  read,
  COUNT(*) as quantidade
FROM public.notifications
GROUP BY church_id, read
ORDER BY church_id, read;


-- 5. VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'notifications';


-- 6. TESTAR A QUERY EXATA QUE O APP USA
-- ============================================
-- Esta é a mesma query que o useUnreadNotifications.ts usa
SELECT COUNT(*) as unread_count
FROM public.notifications
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
)
AND read = false;


-- 7. SE O RESULTADO ACIMA FOR 0, MARCAR TODAS COMO NÃO LIDAS
-- ============================================
-- Descomente para executar:
/*
UPDATE public.notifications
SET read = false
WHERE church_id = (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
);
*/


-- 8. VERIFICAR SE HÁ NOTIFICAÇÕES PARA SEU CHURCH_ID
-- ============================================
SELECT
  n.id,
  n.title,
  n.read,
  n.created_at,
  n.church_id,
  u.church_id as my_church_id,
  CASE
    WHEN n.church_id = u.church_id THEN '✅ MATCH'
    ELSE '❌ NÃO MATCH'
  END as status
FROM public.notifications n
CROSS JOIN (
  SELECT church_id FROM public.users_app
  WHERE auth_user_id = auth.uid()
) u
ORDER BY n.created_at DESC;
