-- Adiciona coluna artist_photo na tabela tracks
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS artist_photo TEXT;

-- Comentário descritivo
COMMENT ON COLUMN tracks.artist_photo IS 'URL da foto do artista extraída do CifraClub';
