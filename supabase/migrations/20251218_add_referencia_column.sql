-- Adiciona coluna 'referencia' à tabela tracks para armazenar URL do YouTube
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS referencia TEXT;

-- Comentário descritivo
COMMENT ON COLUMN tracks.referencia IS 'URL do YouTube ou outra referência de áudio/vídeo da música';
