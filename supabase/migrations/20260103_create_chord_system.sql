-- =============================================
-- SISTEMA DE ACORDES PARA MODO ENSAIO
-- =============================================

-- 1. Tabela de shapes de violão
-- Armazena posições de acordes no braço do violão
CREATE TABLE IF NOT EXISTS chord_shapes_guitar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  chord_name TEXT NOT NULL, -- Ex: "C", "Am7", "Gmaj7"
  chord_quality TEXT NOT NULL, -- Ex: "major", "minor", "dominant7", "diminished"
  position INTEGER NOT NULL DEFAULT 1, -- Posição no braço (1 = open position)
  frets JSONB NOT NULL, -- Array de 6 números: [-1, 3, 2, 0, 1, 0] (-1 = não toca, 0 = corda solta)
  fingers JSONB, -- Array de 6 números indicando dedos [0, 3, 2, 0, 1, 0]
  base_fret INTEGER DEFAULT 0, -- Casa base para posições altas
  difficulty TEXT DEFAULT 'intermediate', -- "beginner", "intermediate", "advanced"
  is_custom BOOLEAN DEFAULT false, -- true = customizado pela igreja
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chord_shapes_guitar_difficulty_check CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- 2. Tabela de shapes de teclado
-- Armazena voicings de acordes para piano/teclado
CREATE TABLE IF NOT EXISTS chord_shapes_keyboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  chord_name TEXT NOT NULL,
  chord_quality TEXT NOT NULL,
  voicing_type TEXT NOT NULL, -- "close", "open", "rootless", "shell"
  notes JSONB NOT NULL, -- Array de notas: ["C4", "E4", "G4"]
  inversion INTEGER DEFAULT 0, -- 0 = fundamental, 1 = primeira inversão, etc
  hand TEXT DEFAULT 'right', -- "left", "right", "both"
  difficulty TEXT DEFAULT 'intermediate',
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chord_shapes_keyboard_hand_check CHECK (hand IN ('left', 'right', 'both')),
  CONSTRAINT chord_shapes_keyboard_difficulty_check CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- 3. Tabela de relações harmônicas
-- Armazena sugestões de reharmonização
CREATE TABLE IF NOT EXISTS chord_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  source_chord TEXT NOT NULL, -- Acorde original (ex: "C")
  related_chord TEXT NOT NULL, -- Acorde relacionado (ex: "Am7")
  relation_type TEXT NOT NULL, -- "substitution", "extension", "slash", "parallel"
  quality_match INTEGER DEFAULT 0, -- Score de compatibilidade (0-100)
  common_notes JSONB, -- Notas em comum: ["C", "E"]
  description TEXT, -- Descrição da relação (ex: "Relativo menor")
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chord_relations_type_check CHECK (relation_type IN ('substitution', 'extension', 'slash', 'parallel', 'dominant'))
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_chord_shapes_guitar_church ON chord_shapes_guitar(church_id);
CREATE INDEX IF NOT EXISTS idx_chord_shapes_guitar_name ON chord_shapes_guitar(chord_name);
CREATE INDEX IF NOT EXISTS idx_chord_shapes_guitar_quality ON chord_shapes_guitar(chord_quality);

CREATE INDEX IF NOT EXISTS idx_chord_shapes_keyboard_church ON chord_shapes_keyboard(church_id);
CREATE INDEX IF NOT EXISTS idx_chord_shapes_keyboard_name ON chord_shapes_keyboard(chord_name);

CREATE INDEX IF NOT EXISTS idx_chord_relations_church ON chord_relations(church_id);
CREATE INDEX IF NOT EXISTS idx_chord_relations_source ON chord_relations(source_chord);

-- 5. RLS (Row Level Security)
ALTER TABLE chord_shapes_guitar ENABLE ROW LEVEL SECURITY;
ALTER TABLE chord_shapes_keyboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE chord_relations ENABLE ROW LEVEL SECURITY;

-- Políticas para chord_shapes_guitar
DROP POLICY IF EXISTS "Users can view guitar shapes from their church" ON chord_shapes_guitar;
CREATE POLICY "Users can view guitar shapes from their church"
  ON chord_shapes_guitar FOR SELECT
  USING (
    church_id IN (
      SELECT church_id FROM users WHERE id = auth.uid()
    )
    OR church_id IS NULL -- Shapes globais (seed data)
  );

DROP POLICY IF EXISTS "Leaders can insert custom guitar shapes" ON chord_shapes_guitar;
CREATE POLICY "Leaders can insert custom guitar shapes"
  ON chord_shapes_guitar FOR INSERT
  WITH CHECK (
    church_id IN (
      SELECT church_id FROM users WHERE id = auth.uid() AND role = 'lider'
    )
    AND is_custom = true
  );

-- Políticas para chord_shapes_keyboard
DROP POLICY IF EXISTS "Users can view keyboard shapes from their church" ON chord_shapes_keyboard;
CREATE POLICY "Users can view keyboard shapes from their church"
  ON chord_shapes_keyboard FOR SELECT
  USING (
    church_id IN (
      SELECT church_id FROM users WHERE id = auth.uid()
    )
    OR church_id IS NULL
  );

DROP POLICY IF EXISTS "Leaders can insert custom keyboard shapes" ON chord_shapes_keyboard;
CREATE POLICY "Leaders can insert custom keyboard shapes"
  ON chord_shapes_keyboard FOR INSERT
  WITH CHECK (
    church_id IN (
      SELECT church_id FROM users WHERE id = auth.uid() AND role = 'lider'
    )
    AND is_custom = true
  );

-- Políticas para chord_relations
DROP POLICY IF EXISTS "Users can view chord relations from their church" ON chord_relations;
CREATE POLICY "Users can view chord relations from their church"
  ON chord_relations FOR SELECT
  USING (
    church_id IN (
      SELECT church_id FROM users WHERE id = auth.uid()
    )
    OR church_id IS NULL
  );

-- 6. Seed data - Acordes básicos de violão (Global)
INSERT INTO chord_shapes_guitar (church_id, chord_name, chord_quality, position, frets, fingers, base_fret, difficulty, is_custom) VALUES
  -- Acordes maiores abertos
  (NULL, 'C', 'major', 1, '[-1, 3, 2, 0, 1, 0]'::jsonb, '[0, 3, 2, 0, 1, 0]'::jsonb, 0, 'beginner', false),
  (NULL, 'D', 'major', 1, '[-1, -1, 0, 2, 3, 2]'::jsonb, '[0, 0, 0, 1, 3, 2]'::jsonb, 0, 'beginner', false),
  (NULL, 'E', 'major', 1, '[0, 2, 2, 1, 0, 0]'::jsonb, '[0, 2, 3, 1, 0, 0]'::jsonb, 0, 'beginner', false),
  (NULL, 'G', 'major', 1, '[3, 2, 0, 0, 0, 3]'::jsonb, '[3, 2, 0, 0, 0, 4]'::jsonb, 0, 'beginner', false),
  (NULL, 'A', 'major', 1, '[-1, 0, 2, 2, 2, 0]'::jsonb, '[0, 0, 2, 3, 4, 0]'::jsonb, 0, 'beginner', false),

  -- Acordes menores abertos
  (NULL, 'Am', 'minor', 1, '[-1, 0, 2, 2, 1, 0]'::jsonb, '[0, 0, 2, 3, 1, 0]'::jsonb, 0, 'beginner', false),
  (NULL, 'Dm', 'minor', 1, '[-1, -1, 0, 2, 3, 1]'::jsonb, '[0, 0, 0, 2, 3, 1]'::jsonb, 0, 'beginner', false),
  (NULL, 'Em', 'minor', 1, '[0, 2, 2, 0, 0, 0]'::jsonb, '[0, 2, 3, 0, 0, 0]'::jsonb, 0, 'beginner', false),

  -- Acordes com sétima
  (NULL, 'G7', 'dominant7', 1, '[3, 2, 0, 0, 0, 1]'::jsonb, '[3, 2, 0, 0, 0, 1]'::jsonb, 0, 'intermediate', false),
  (NULL, 'D7', 'dominant7', 1, '[-1, -1, 0, 2, 1, 2]'::jsonb, '[0, 0, 0, 2, 1, 3]'::jsonb, 0, 'intermediate', false),
  (NULL, 'E7', 'dominant7', 1, '[0, 2, 0, 1, 0, 0]'::jsonb, '[0, 2, 0, 1, 0, 0]'::jsonb, 0, 'intermediate', false)
ON CONFLICT DO NOTHING;

-- 7. Seed data - Acordes de teclado (Global)
INSERT INTO chord_shapes_keyboard (church_id, chord_name, chord_quality, voicing_type, notes, inversion, hand, difficulty, is_custom) VALUES
  -- Tríades maiores
  (NULL, 'C', 'major', 'close', '["C4", "E4", "G4"]'::jsonb, 0, 'right', 'beginner', false),
  (NULL, 'D', 'major', 'close', '["D4", "F#4", "A4"]'::jsonb, 0, 'right', 'beginner', false),
  (NULL, 'E', 'major', 'close', '["E4", "G#4", "B4"]'::jsonb, 0, 'right', 'beginner', false),
  (NULL, 'G', 'major', 'close', '["G4", "B4", "D5"]'::jsonb, 0, 'right', 'beginner', false),

  -- Tríades menores
  (NULL, 'Am', 'minor', 'close', '["A3", "C4", "E4"]'::jsonb, 0, 'right', 'beginner', false),
  (NULL, 'Dm', 'minor', 'close', '["D4", "F4", "A4"]'::jsonb, 0, 'right', 'beginner', false),
  (NULL, 'Em', 'minor', 'close', '["E4", "G4", "B4"]'::jsonb, 0, 'right', 'beginner', false),

  -- Tétrades
  (NULL, 'Cmaj7', 'major7', 'close', '["C4", "E4", "G4", "B4"]'::jsonb, 0, 'right', 'intermediate', false),
  (NULL, 'G7', 'dominant7', 'close', '["G3", "B3", "D4", "F4"]'::jsonb, 0, 'right', 'intermediate', false)
ON CONFLICT DO NOTHING;

-- 8. Seed data - Relações harmônicas (Global)
INSERT INTO chord_relations (church_id, source_chord, related_chord, relation_type, quality_match, common_notes, description) VALUES
  -- Relativos maiores/menores
  (NULL, 'C', 'Am', 'parallel', 85, '["C", "E"]'::jsonb, 'Relativo menor'),
  (NULL, 'G', 'Em', 'parallel', 85, '["G", "B"]'::jsonb, 'Relativo menor'),
  (NULL, 'D', 'Bm', 'parallel', 85, '["D", "F#"]'::jsonb, 'Relativo menor'),

  -- Substituições por slash chords
  (NULL, 'C', 'C/E', 'slash', 90, '["C", "E", "G"]'::jsonb, 'Baixo alternativo (1ª inversão)'),
  (NULL, 'G', 'G/B', 'slash', 90, '["G", "B", "D"]'::jsonb, 'Baixo alternativo (1ª inversão)'),

  -- Extensões
  (NULL, 'C', 'Cmaj7', 'extension', 95, '["C", "E", "G"]'::jsonb, 'Adiciona sétima maior'),
  (NULL, 'Am', 'Am7', 'extension', 95, '["A", "C", "E"]'::jsonb, 'Adiciona sétima menor'),
  (NULL, 'G', 'G7', 'extension', 90, '["G", "B", "D"]'::jsonb, 'Adiciona sétima dominante'),

  -- Substituições de dominante
  (NULL, 'G7', 'Db7', 'substitution', 60, '["F"]'::jsonb, 'Trítono substituto'),
  (NULL, 'D7', 'Ab7', 'substitution', 60, '["C"]'::jsonb, 'Trítono substituto')
ON CONFLICT DO NOTHING;

-- 9. Função para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_chord_shapes_guitar_updated_at ON chord_shapes_guitar;
CREATE TRIGGER update_chord_shapes_guitar_updated_at
  BEFORE UPDATE ON chord_shapes_guitar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chord_shapes_keyboard_updated_at ON chord_shapes_keyboard;
CREATE TRIGGER update_chord_shapes_keyboard_updated_at
  BEFORE UPDATE ON chord_shapes_keyboard
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE chord_shapes_guitar IS 'Armazena posições de acordes para violão/guitarra';
COMMENT ON TABLE chord_shapes_keyboard IS 'Armazena voicings de acordes para piano/teclado';
COMMENT ON TABLE chord_relations IS 'Armazena relações harmônicas para sugestões de reharmonização';
