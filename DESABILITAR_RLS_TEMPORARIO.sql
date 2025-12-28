-- =====================================================
-- TESTE: Desabilitar RLS temporariamente
-- =====================================================
-- ATENÇÃO: Isso é APENAS para teste!
-- Depois de funcionar, vamos recriar as policies corretas
-- =====================================================

-- Desabilitar RLS em events
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em event_tracks também
ALTER TABLE public.event_tracks DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT
  tablename,
  rowsecurity as rls_ativo,
  CASE
    WHEN rowsecurity THEN '🔒 RLS ATIVO'
    ELSE '🔓 RLS DESATIVADO (TESTE)'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('events', 'event_tracks')
ORDER BY tablename;

-- =====================================================
-- Agora tente criar o evento no app
-- Se funcionar, o problema é RLS
-- Depois execute REABILITAR_RLS.sql
-- =====================================================
