-- ============================================
-- SIMPLIFICAR RLS PARA TODAS AS TABELAS
-- Execute no SQL Editor do Supabase
-- ATENÇÃO: Isto torna as políticas mais permissivas para debug
-- ============================================

-- 1. TABELA users_app - PERMISSIVA
-- ============================================
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users_app;
CREATE POLICY "Enable read access for authenticated users"
ON public.users_app FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own record" ON public.users_app;
CREATE POLICY "Users can update own record"
ON public.users_app FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own record" ON public.users_app;
CREATE POLICY "Users can insert own record"
ON public.users_app FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());


-- 2. TABELA profiles - PERMISSIVA
-- ============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Enable read access for authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());


-- 3. TABELA notifications - PERMISSIVA
-- ============================================
DROP POLICY IF EXISTS "Users can view notifications from their church" ON public.notifications;
CREATE POLICY "Enable read access for authenticated users"
ON public.notifications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update notifications"
ON public.notifications FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Leaders can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications"
ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Leaders can delete notifications" ON public.notifications;
CREATE POLICY "Users can delete notifications"
ON public.notifications FOR DELETE TO authenticated USING (true);


-- 4. TABELA events - PERMISSIVA
-- ============================================
DROP POLICY IF EXISTS "Users can view events from their church" ON public.events;
CREATE POLICY "Enable read access for authenticated users"
ON public.events FOR SELECT TO authenticated USING (true);


-- 5. VERIFICAR SE FUNCIONOU
-- ============================================
-- Teste 1: Ver seu perfil
SELECT * FROM public.users_app WHERE auth_user_id = auth.uid();

-- Teste 2: Ver notificações
SELECT COUNT(*) as total FROM public.notifications;

-- Teste 3: Ver notificações não lidas
SELECT COUNT(*) as total_nao_lidas
FROM public.notifications
WHERE church_id = (SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid())
AND read = false;
