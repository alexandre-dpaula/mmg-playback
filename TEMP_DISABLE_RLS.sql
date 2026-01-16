-- ============================================
-- DESABILITAR RLS TEMPORARIAMENTE (APENAS PARA TESTE)
-- Execute no SQL Editor do Supabase
-- ATENÇÃO: Isto remove toda a segurança RLS!
-- Use apenas para testar se o badge funciona
-- ============================================

-- Desabilitar RLS em todas as tabelas problemáticas
ALTER TABLE public.users_app DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi desabilitado
SELECT
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users_app', 'profiles', 'events', 'notifications');

-- Resultado esperado: rls_ativo = false para todas
