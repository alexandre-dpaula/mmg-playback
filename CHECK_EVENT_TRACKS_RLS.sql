-- Verificar policies de event_tracks
SELECT
  'Policies de event_tracks' as info,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'event_tracks'
ORDER BY policyname;

-- Se não houver policies, criar permissivas
DO $$
BEGIN
  -- Dropar policies existentes
  DROP POLICY IF EXISTS "event_tracks_select" ON public.event_tracks;
  DROP POLICY IF EXISTS "event_tracks_insert" ON public.event_tracks;
  DROP POLICY IF EXISTS "event_tracks_update" ON public.event_tracks;
  DROP POLICY IF EXISTS "event_tracks_delete" ON public.event_tracks;

  -- Criar policy INSERT permissiva
  CREATE POLICY "event_tracks_insert"
    ON public.event_tracks
    FOR INSERT
    WITH CHECK (
      auth.uid() IS NOT NULL
    );

  -- Criar policy SELECT permissiva
  CREATE POLICY "event_tracks_select"
    ON public.event_tracks
    FOR SELECT
    USING (true);

  -- Criar policy UPDATE permissiva
  CREATE POLICY "event_tracks_update"
    ON public.event_tracks
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

  -- Criar policy DELETE permissiva
  CREATE POLICY "event_tracks_delete"
    ON public.event_tracks
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

  RAISE NOTICE 'Policies de event_tracks criadas!';
END $$;

-- Verificar resultado
SELECT
  'Resultado final' as info,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'event_tracks'
ORDER BY policyname;
