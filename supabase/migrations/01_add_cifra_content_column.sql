-- Migration: Adicionar coluna para armazenar conteúdo extraído da cifra
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Adicionar coluna cifra_content
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS cifra_content TEXT;

-- Adicionar comentário
COMMENT ON COLUMN tracks.cifra_content IS
  'Conteúdo da cifra extraído automaticamente de URLs do CifraClub via Edge Function';

-- Criar índice para buscas (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS idx_tracks_cifra_content
  ON tracks USING gin(to_tsvector('portuguese', cifra_content));

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tracks'
ORDER BY ordinal_position;
