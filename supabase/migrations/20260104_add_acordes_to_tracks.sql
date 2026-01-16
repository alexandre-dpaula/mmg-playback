-- ============================================
-- Adiciona coluna 'acordes' à tabela tracks
-- Para suportar o Modo Ensaio / Sistema CAGED
-- ============================================

-- Adiciona coluna acordes se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tracks'
    AND column_name = 'acordes'
  ) THEN
    ALTER TABLE public.tracks
    ADD COLUMN acordes TEXT;
  END IF;
END $$;

-- Comentário explicativo
COMMENT ON COLUMN public.tracks.acordes IS 'Acordes da música (formato: "C, G, Am, F" ou JSON array)';

-- Opcional: Popular acordes de músicas existentes com base nas cifras
-- (Este seria um processamento futuro via função PL/pgSQL ou job)
