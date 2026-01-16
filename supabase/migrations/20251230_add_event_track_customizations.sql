-- Adiciona campos de customização por evento na tabela event_tracks
-- Isso permite que cada igreja/evento tenha suas próprias configurações
-- sem alterar a música original global

ALTER TABLE public.event_tracks
ADD COLUMN IF NOT EXISTS custom_key TEXT,
ADD COLUMN IF NOT EXISTS custom_capo INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_cifra_content TEXT,
ADD COLUMN IF NOT EXISTS custom_notes TEXT;

-- Índice para buscar customizações rapidamente
CREATE INDEX IF NOT EXISTS idx_event_tracks_custom ON public.event_tracks(event_id, track_id)
WHERE custom_key IS NOT NULL OR custom_cifra_content IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.event_tracks.custom_key IS 'Tom customizado para este evento (sobrescreve o tom global da track)';
COMMENT ON COLUMN public.event_tracks.custom_capo IS 'Capotraste customizado para este evento';
COMMENT ON COLUMN public.event_tracks.custom_cifra_content IS 'Cifra customizada para este evento (sobrescreve a cifra global)';
COMMENT ON COLUMN public.event_tracks.custom_notes IS 'Notas/observações específicas deste evento';
