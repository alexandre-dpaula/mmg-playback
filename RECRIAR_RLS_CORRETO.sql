-- =====================================================
-- RECRIAR RLS COM POLICIES CORRETAS
-- =====================================================
-- Agora que funcionou sem RLS, vamos reativar com policies
-- super permissivas que definitivamente vão funcionar
-- =====================================================

-- 1. Reabilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tracks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES PARA EVENTS (super permissivas)
-- =====================================================

-- SELECT: Ver todos os eventos (por enquanto)
CREATE POLICY "events_select_all"
  ON public.events
  FOR SELECT
  USING (true);

-- INSERT: Qualquer user autenticado pode criar
CREATE POLICY "events_insert_authenticated"
  ON public.events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- UPDATE: Owner pode editar
CREATE POLICY "events_update_owner"
  ON public.events
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR updated_by = auth.uid()
  );

-- DELETE: Owner pode deletar
CREATE POLICY "events_delete_owner"
  ON public.events
  FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- =====================================================
-- POLICIES PARA EVENT_TRACKS (super permissivas)
-- =====================================================

-- SELECT: Ver todos
CREATE POLICY "event_tracks_select_all"
  ON public.event_tracks
  FOR SELECT
  USING (true);

-- INSERT: Qualquer user autenticado
CREATE POLICY "event_tracks_insert_authenticated"
  ON public.event_tracks
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- UPDATE: Qualquer user autenticado
CREATE POLICY "event_tracks_update_authenticated"
  ON public.event_tracks
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
  );

-- DELETE: Qualquer user autenticado
CREATE POLICY "event_tracks_delete_authenticated"
  ON public.event_tracks
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
  );

-- =====================================================
-- Verificar
-- =====================================================

SELECT
  'RLS reativado com sucesso!' as status;

SELECT
  tablename,
  rowsecurity as rls_ativo,
  CASE
    WHEN rowsecurity THEN '✅ RLS ATIVO'
    ELSE '❌ RLS DESATIVADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('events', 'event_tracks')
ORDER BY tablename;

SELECT
  'Policies criadas:' as info,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('events', 'event_tracks')
ORDER BY tablename, cmd;

-- =====================================================
-- PRÓXIMO PASSO:
-- Depois de testar e confirmar que funciona,
-- podemos refinar as policies para segurança correta
-- =====================================================
