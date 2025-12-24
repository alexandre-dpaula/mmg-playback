-- =====================================================
-- MIGRAÇÃO: Adicionar coluna section_timestamps
-- =====================================================
-- Copie e cole este SQL no SQL Editor do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz/editor

-- 1. Adiciona a coluna section_timestamps (se não existir)
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN tracks.section_timestamps IS 'Timestamps das seções da música para auto-scroll sincronizado com áudio. Formato: {"I": 0, "V1": 15, "C": 45}';

-- 2. Verificar se a coluna foi criada
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'section_timestamps';

-- =====================================================
-- EXEMPLO DE TESTE: Adicionar timestamps em uma música
-- =====================================================
-- Substitua 'TRACK_ID_AQUI' pelo ID de uma música de teste
-- Por exemplo, a música "Sublime" que você está vendo na tela

-- Exemplo de timestamps para uma música típica:
-- {
--   "I": 0,      -- Intro começa em 0s
--   "V1": 15,    -- Verso 1 começa em 15s
--   "PR": 45,    -- Pré-Refrão começa em 45s
--   "R1": 60,    -- Refrão 1 começa em 1m
--   "V2": 90,    -- Verso 2 começa em 1m30s
--   "R2": 120,   -- Refrão 2 começa em 2m
--   "S": 150,    -- Solo começa em 2m30s
--   "PO": 180,   -- Ponte começa em 3m
--   "R3": 210,   -- Refrão 3 começa em 3m30s
--   "O": 240     -- Outro começa em 4m
-- }
--
-- SEÇÕES DISPONÍVEIS:
-- I    = Intro          | V1, V2 = Versos      | PR = Pré-Refrão
-- R    = Refrão         | R1, R2 = Refrões     | S  = Solo
-- PO   = Ponte          | B      = Bridge      | IS = Instrumental
-- O    = Outro          | TA     = Turnaround  | TG = Tag
-- IT   = Interlúdio     | RF     = Refrão Final

/*
UPDATE tracks
SET section_timestamps = '{
  "I": 0,
  "V1": 15,
  "PR": 45,
  "R1": 60,
  "V2": 90,
  "R2": 120,
  "S": 150,
  "PO": 180,
  "R3": 210,
  "O": 240
}'::jsonb
WHERE id = 'TRACK_ID_AQUI';
*/

-- Para encontrar o ID de uma música específica:
SELECT id, titulo, versao
FROM tracks
WHERE titulo ILIKE '%sublime%'
LIMIT 5;
