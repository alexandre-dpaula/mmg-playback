-- ============================================
-- FIX COMPLETO DE TODAS AS POLÍTICAS RLS
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. TABELA users_app - REMOVER TODAS E RECRIAR
-- ============================================
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users_app;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users_app;
DROP POLICY IF EXISTS "Users can view own record" ON public.users_app;
DROP POLICY IF EXISTS "Users can update own record" ON public.users_app;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users_app;

-- SELECT: Qualquer usuário autenticado pode ler qualquer registro
CREATE POLICY "users_app_select_policy"
ON public.users_app FOR SELECT
TO authenticated
USING (true);

-- UPDATE: Usuário pode atualizar apenas seu próprio registro
CREATE POLICY "users_app_update_policy"
ON public.users_app FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- INSERT: Usuário pode inserir apenas seu próprio registro
CREATE POLICY "users_app_insert_policy"
ON public.users_app FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid());


-- 2. TABELA profiles - REMOVER TODAS E RECRIAR
-- ============================================
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- SELECT: Qualquer usuário autenticado pode ler qualquer perfil
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- UPDATE: Usuário pode atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- INSERT: Usuário pode inserir apenas seu próprio perfil
CREATE POLICY "profiles_insert_policy"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());


-- 3. TABELA events - REMOVER TODAS E RECRIAR
-- ============================================
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Users can view events from their church" ON public.events;
DROP POLICY IF EXISTS "Users can insert events" ON public.events;
DROP POLICY IF EXISTS "Users can update events" ON public.events;
DROP POLICY IF EXISTS "Users can delete events" ON public.events;

-- SELECT: Qualquer usuário autenticado pode ler eventos
CREATE POLICY "events_select_policy"
ON public.events FOR SELECT
TO authenticated
USING (true);

-- INSERT: Usuário pode criar eventos para sua igreja
CREATE POLICY "events_insert_policy"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

-- UPDATE: Usuário pode atualizar eventos de sua igreja
CREATE POLICY "events_update_policy"
ON public.events FOR UPDATE
TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

-- DELETE: Usuário pode deletar eventos de sua igreja
CREATE POLICY "events_delete_policy"
ON public.events FOR DELETE
TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);


-- 4. TABELA notifications - REMOVER TODAS E RECRIAR
-- ============================================
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.notifications;
DROP POLICY IF EXISTS "Users can view notifications from their church" ON public.notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Leaders can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Leaders can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

-- SELECT: Qualquer usuário autenticado pode ler notificações
CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT
TO authenticated
USING (true);

-- UPDATE: Usuário pode atualizar notificações de sua igreja
CREATE POLICY "notifications_update_policy"
ON public.notifications FOR UPDATE
TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

-- INSERT: Usuário pode criar notificações para sua igreja
CREATE POLICY "notifications_insert_policy"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

-- DELETE: Usuário pode deletar notificações de sua igreja
CREATE POLICY "notifications_delete_policy"
ON public.notifications FOR DELETE
TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);


-- 5. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'SEM USING'
  END as condicao_using,
  CASE
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
    ELSE 'SEM WITH CHECK'
  END as condicao_with_check
FROM pg_policies
WHERE tablename IN ('users_app', 'profiles', 'events', 'notifications')
ORDER BY tablename, cmd;


-- 6. TESTAR SE FUNCIONOU
-- ============================================
-- Teste 1: Ver seu perfil em users_app
SELECT * FROM public.users_app WHERE auth_user_id = auth.uid();

-- Teste 2: Ver seu perfil em profiles
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Teste 3: Contar notificações não lidas
SELECT COUNT(*) as total_nao_lidas
FROM public.notifications
WHERE church_id = (SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid())
AND read = false;
