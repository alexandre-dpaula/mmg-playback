-- Adiciona colunas original_key e version na tabela tracks
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS original_key TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS version TEXT;

-- Comentários descritivos
COMMENT ON COLUMN tracks.original_key IS 'Tom original extraído do CifraClub';
COMMENT ON COLUMN tracks.version IS 'Versão/intérprete extraído do CifraClub';
