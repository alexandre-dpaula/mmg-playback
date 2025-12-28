-- =====================================================
-- FIX DEFINITIVO: Forçar desabilitar e reconfigurar RLS
-- =====================================================

-- 1. Reabilitar RLS primeiro (para poder dropar policies)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tracks ENABLE ROW LEVEL SECURITY;

-- 2. Dropar TODAS as policies
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

DROP POLICY IF EXISTS "event_tracks_select" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_insert" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_update" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_delete" ON public.event_tracks;

-- 3. DESABILITAR RLS completamente
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tracks DISABLE ROW LEVEL SECURITY;

-- 4. Verificar
SELECT
  tablename,
  rowsecurity,
  CASE
    WHEN rowsecurity THEN '❌ AINDA ATIVO'
    ELSE '✅ DESABILITADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('events', 'event_tracks')
ORDER BY tablename;

-- 5. Verificar policies (deve retornar vazio)
SELECT
  'Policies restantes (deve estar vazio):' as info,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('events', 'event_tracks');

-- =====================================================
-- Agora tente criar o evento
-- Se funcionar, vamos recriar RLS do zero corretamente
-- =====================================================
