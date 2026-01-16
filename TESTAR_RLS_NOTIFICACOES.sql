-- ============================================
-- TESTAR POLÍTICAS RLS DE NOTIFICAÇÕES
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR SE RLS ESTÁ ATIVADO
-- ============================================
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'notifications';
-- Resultado esperado: rowsecurity = true


-- 2. VER TODAS AS POLÍTICAS
-- ============================================
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'notifications';


-- 3. TESTAR A QUERY QUE O APP USA (COM SEU USUÁRIO)
-- ============================================
-- Esta é exatamente a query que o useUnreadNotifications.ts executa
SELECT COUNT(*) as total_nao_lidas
FROM public.notifications
WHERE church_id = (
  SELECT church_id
  FROM public.users_app
  WHERE auth_user_id = auth.uid()
)
AND read = false;
-- Se retornar 0, significa que as políticas RLS estão bloqueando


-- 4. VERIFICAR SE CONSEGUE VER AS NOTIFICAÇÕES SEM FILTRO
-- ============================================
SELECT
  id,
  church_id,
  title,
  read
FROM public.notifications
LIMIT 5;
-- Se retornar vazio, significa que RLS está bloqueando tudo


-- 5. TESTAR SEM RLS (TEMPORARIAMENTE - APENAS PARA DEBUG)
-- ============================================
-- CUIDADO: Isso desabilita a segurança. Execute apenas para teste!
/*
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Teste novamente:
SELECT COUNT(*) FROM public.notifications WHERE read = false;

-- IMPORTANTE: Reabilite depois!
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
*/


-- 6. VERIFICAR SE O auth.uid() FUNCIONA
-- ============================================
SELECT
  auth.uid() as meu_auth_uid,
  (SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()) as meu_church_id;
-- Deve retornar seu auth_uid e church_id


-- 7. COMPARAR COM AS NOTIFICAÇÕES
-- ============================================
SELECT
  'Meu church_id' as tipo,
  (SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()) as church_id
UNION ALL
SELECT
  'Church_id das notificações' as tipo,
  DISTINCT church_id
FROM public.notifications;
