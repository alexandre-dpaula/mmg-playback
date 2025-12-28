-- =====================================================
-- Reabilitar RLS após teste
-- =====================================================

-- Reabilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tracks ENABLE ROW LEVEL SECURITY;

-- Verificar
SELECT
  tablename,
  rowsecurity as rls_ativo,
  CASE
    WHEN rowsecurity THEN '✅ RLS ATIVO'
    ELSE '❌ RLS DESATIVADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('events', 'event_tracks');
