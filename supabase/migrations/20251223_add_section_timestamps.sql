-- Adiciona coluna para armazenar timestamps das seções da cifra
-- Formato JSON: { "I": 0, "V1": 15, "C": 45, "V2": 75, "C2": 105 }
-- Onde as chaves são IDs de seções e valores são timestamps em segundos

ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN tracks.section_timestamps IS 'Timestamps das seções da música para auto-scroll sincronizado com áudio. Formato: {"I": 0, "V1": 15, "C": 45}';
