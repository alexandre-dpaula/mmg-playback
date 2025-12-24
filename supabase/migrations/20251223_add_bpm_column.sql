-- =====================================================
-- MIGRAÇÃO: Adicionar coluna bpm
-- =====================================================
-- Adiciona a coluna bpm na tabela tracks para armazenar o tempo da música

ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS bpm INTEGER DEFAULT 120;

COMMENT ON COLUMN tracks.bpm IS 'BPM (Batidas Por Minuto) da música para uso no metrônomo. Valor padrão: 120 BPM';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'bpm';
