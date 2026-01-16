-- ============================================
-- MODO ENSAIO / ESTUDOS - Tabelas e RLS
-- ============================================

-- 1. Tabela de shapes de acordes (violão e teclado)
CREATE TABLE IF NOT EXISTS public.chord_shapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chord_name TEXT NOT NULL, -- Ex: "C", "Am7", "G/B"
  instrument TEXT NOT NULL CHECK (instrument IN ('guitar', 'keyboard')),
  variation_name TEXT NOT NULL, -- Ex: "Aberta", "Barre 3ª casa"
  shape_data JSONB NOT NULL, -- Dados do shape (frets, notes, etc)
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chord_shapes_chord_name ON public.chord_shapes(chord_name);
CREATE INDEX idx_chord_shapes_church_id ON public.chord_shapes(church_id);
CREATE INDEX idx_chord_shapes_instrument ON public.chord_shapes(instrument);


-- 2. Tabela de acordes usados em músicas
CREATE TABLE IF NOT EXISTS public.song_chords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  chord_name TEXT NOT NULL,
  position INTEGER NOT NULL, -- Ordem de aparição
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_song_chords_song_id ON public.song_chords(song_id);
CREATE INDEX idx_song_chords_church_id ON public.song_chords(church_id);


-- 3. Tabela de relações harmônicas (reharmonização)
CREATE TABLE IF NOT EXISTS public.chord_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chord_from TEXT NOT NULL,
  chord_to TEXT NOT NULL,
  relation_type TEXT NOT NULL CHECK (
    relation_type IN ('substitute', 'parallel', 'relative', 'dominant', 'altered_bass')
  ),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chord_relations_chord_from ON public.chord_relations(chord_from);
CREATE INDEX idx_chord_relations_church_id ON public.chord_relations(church_id);


-- ============================================
-- RLS POLICIES
-- ============================================

-- Ativar RLS
ALTER TABLE public.chord_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_chords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chord_relations ENABLE ROW LEVEL SECURITY;


-- chord_shapes - Isolamento por igreja
CREATE POLICY "chord_shapes_select_policy"
ON public.chord_shapes FOR SELECT TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "chord_shapes_insert_policy"
ON public.chord_shapes FOR INSERT TO authenticated
WITH CHECK (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "chord_shapes_update_policy"
ON public.chord_shapes FOR UPDATE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "chord_shapes_delete_policy"
ON public.chord_shapes FOR DELETE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);


-- song_chords - Isolamento por igreja
CREATE POLICY "song_chords_select_policy"
ON public.song_chords FOR SELECT TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "song_chords_insert_policy"
ON public.song_chords FOR INSERT TO authenticated
WITH CHECK (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "song_chords_update_policy"
ON public.song_chords FOR UPDATE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "song_chords_delete_policy"
ON public.song_chords FOR DELETE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);


-- chord_relations - Isolamento por igreja
CREATE POLICY "chord_relations_select_policy"
ON public.chord_relations FOR SELECT TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "chord_relations_insert_policy"
ON public.chord_relations FOR INSERT TO authenticated
WITH CHECK (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "chord_relations_update_policy"
ON public.chord_relations FOR UPDATE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "chord_relations_delete_policy"
ON public.chord_relations FOR DELETE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);


-- ============================================
-- SEED DATA: Shapes básicos de violão
-- ============================================

-- Inserir shapes básicos de acordes populares
-- Estes serão compartilhados por todas as igrejas (church_id pode ser null para shapes globais)

-- C maior (posição aberta)
INSERT INTO public.chord_shapes (chord_name, instrument, variation_name, shape_data, church_id)
VALUES (
  'C',
  'guitar',
  'Posição Aberta',
  '{"frets": ["x", 3, 2, 0, 1, 0], "base_fret": 1, "fingers": [null, 3, 2, null, 1, null]}'::jsonb,
  NULL
);

-- G maior (posição aberta)
INSERT INTO public.chord_shapes (chord_name, instrument, variation_name, shape_data, church_id)
VALUES (
  'G',
  'guitar',
  'Posição Aberta',
  '{"frets": [3, 2, 0, 0, 0, 3], "base_fret": 1, "fingers": [2, 1, null, null, null, 3]}'::jsonb,
  NULL
);

-- Am (posição aberta)
INSERT INTO public.chord_shapes (chord_name, instrument, variation_name, shape_data, church_id)
VALUES (
  'Am',
  'guitar',
  'Posição Aberta',
  '{"frets": ["x", 0, 2, 2, 1, 0], "base_fret": 1, "fingers": [null, null, 2, 3, 1, null]}'::jsonb,
  NULL
);

-- F maior (barre)
INSERT INTO public.chord_shapes (chord_name, instrument, variation_name, shape_data, church_id)
VALUES (
  'F',
  'guitar',
  'Barre 1ª Casa',
  '{"frets": [1, 3, 3, 2, 1, 1], "base_fret": 1, "fingers": [1, 3, 4, 2, 1, 1], "barres": [{"fret": 1, "fromString": 0, "toString": 5}]}'::jsonb,
  NULL
);

-- D maior (posição aberta)
INSERT INTO public.chord_shapes (chord_name, instrument, variation_name, shape_data, church_id)
VALUES (
  'D',
  'guitar',
  'Posição Aberta',
  '{"frets": ["x", "x", 0, 2, 3, 2], "base_fret": 1, "fingers": [null, null, null, 1, 3, 2]}'::jsonb,
  NULL
);

-- ============================================
-- SEED DATA: Relações harmônicas comuns
-- ============================================

-- C → Am (relativa menor)
INSERT INTO public.chord_relations (chord_from, chord_to, relation_type, church_id)
VALUES ('C', 'Am', 'relative', NULL);

-- C → C/E (baixo alternativo)
INSERT INTO public.chord_relations (chord_from, chord_to, relation_type, church_id)
VALUES ('C', 'C/E', 'altered_bass', NULL);

-- G → G7 (dominante)
INSERT INTO public.chord_relations (chord_from, chord_to, relation_type, church_id)
VALUES ('G', 'G7', 'dominant', NULL);

-- Am → C (relativa maior)
INSERT INTO public.chord_relations (chord_from, chord_to, relation_type, church_id)
VALUES ('Am', 'C', 'relative', NULL);

-- F → Dm (substituta)
INSERT INTO public.chord_relations (chord_from, chord_to, relation_type, church_id)
VALUES ('F', 'Dm', 'substitute', NULL);


-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE public.chord_shapes IS 'Armazena shapes de acordes para violão e teclado';
COMMENT ON TABLE public.song_chords IS 'Acordes usados em cada música';
COMMENT ON TABLE public.chord_relations IS 'Relações harmônicas para sugestões de reharmonização';
