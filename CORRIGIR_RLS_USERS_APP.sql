-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA users_app
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. VER POLÍTICAS ATUAIS
-- ============================================
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users_app';


-- 2. RECRIAR POLÍTICA DE SELECT MAIS PERMISSIVA
-- ============================================
-- Remove política antiga
DROP POLICY IF EXISTS "Users can view their own data" ON public.users_app;
DROP POLICY IF EXISTS "Users can view own record" ON public.users_app;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users_app;

-- Cria nova política permissiva
CREATE POLICY "Enable read access for authenticated users"
ON public.users_app
FOR SELECT
TO authenticated
USING (true);  -- Permite que qualquer usuário autenticado leia


-- 3. POLÍTICA DE UPDATE
-- ============================================
DROP POLICY IF EXISTS "Users can update own record" ON public.users_app;

CREATE POLICY "Users can update own record"
ON public.users_app
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());


-- 4. POLÍTICA DE INSERT
-- ============================================
DROP POLICY IF EXISTS "Users can insert own record" ON public.users_app;

CREATE POLICY "Users can insert own record"
ON public.users_app
FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid());


-- 5. VERIFICAR SE FUNCIONOU
-- ============================================
SELECT
  id,
  auth_user_id,
  full_name,
  email,
  church_id,
  role
FROM public.users_app
WHERE auth_user_id = auth.uid();
-- Deve retornar seus dados


-- 6. TESTAR A QUERY DE NOTIFICAÇÕES
-- ============================================
SELECT COUNT(*) as total_nao_lidas
FROM public.notifications
WHERE church_id = (
  SELECT church_id
  FROM public.users_app
  WHERE auth_user_id = auth.uid()
)
AND read = false;
-- Deve retornar o número de notificações não lidas
