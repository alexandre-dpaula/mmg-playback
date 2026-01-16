-- ============================================
-- DIAGNÓSTICO COMPLETO: PROFILE E BADGE
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR USUÁRIO E CHURCH_ID
-- ============================================
SELECT
  'Dados do usuário autenticado' as tipo,
  auth.uid() as auth_uid,
  (SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()) as church_id,
  (SELECT full_name FROM public.users_app WHERE auth_user_id = auth.uid()) as full_name;


-- 2. VERIFICAR NOTIFICAÇÕES PARA ESTE CHURCH_ID
-- ============================================
SELECT
  'Notificações não lidas para minha igreja' as tipo,
  COUNT(*) as total
FROM public.notifications
WHERE church_id = (SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid())
AND read = false;


-- 3. LISTAR TODAS AS NOTIFICAÇÕES
-- ============================================
SELECT
  id,
  title,
  message,
  read,
  church_id,
  created_at
FROM public.notifications
WHERE church_id = (SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid())
ORDER BY created_at DESC;


-- 4. VERIFICAR SE RLS ESTÁ BLOQUEANDO
-- ============================================
-- Ver políticas ativas
SELECT
  tablename,
  policyname,
  cmd as comando,
  qual as condicao_using
FROM pg_policies
WHERE tablename IN ('notifications', 'users_app')
ORDER BY tablename, cmd;


-- 5. TESTAR QUERY EXATA DO HOOK (COM HEAD COUNT)
-- ============================================
-- Esta é a query exata que o useUnreadNotifications.ts executa
-- Copie o church_id do resultado da query 1 e cole abaixo:

-- Substitua 'SEU_CHURCH_ID_AQUI' pelo valor real:
SELECT COUNT(*)
FROM public.notifications
WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81'
AND read = false;


-- 6. VERIFICAR SE O PERFIL TEM CHURCH_ID
-- ============================================
SELECT
  'Verificação de profile completo' as tipo,
  p.id as profile_id,
  p.email,
  p.full_name,
  ua.church_id,
  ua.role,
  c.name as church_name
FROM public.profiles p
LEFT JOIN public.users_app ua ON ua.auth_user_id = p.id
LEFT JOIN public.churches c ON c.id = ua.church_id
WHERE p.id = auth.uid();
