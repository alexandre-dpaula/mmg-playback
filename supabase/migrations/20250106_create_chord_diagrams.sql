-- =============================================
-- TABELA: chord_diagrams
-- Armazena diagramas de acordes gerados por IA
-- =============================================

CREATE TABLE IF NOT EXISTS chord_diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação do acorde
  chord_name TEXT NOT NULL UNIQUE, -- "C", "Am7", "Bb9", etc.
  full_name TEXT NOT NULL, -- "C Major", "A minor 7th", etc.
  quality TEXT NOT NULL, -- "major", "minor", "dominant7", etc.
  root_note TEXT NOT NULL, -- "C", "A", "Bb", etc.

  -- Dados do diagrama de violão (CAGED shapes)
  caged_shapes JSONB NOT NULL DEFAULT '{}', -- { "C": {...}, "A": {...}, ... }

  -- Dados do diagrama de teclado
  keyboard_voicings JSONB NOT NULL DEFAULT '{}', -- { "root": {...}, "firstInversion": {...}, ... }

  -- Metadados
  notes TEXT[] NOT NULL, -- ["C", "E", "G"]
  reharmonizations JSONB DEFAULT '{}',

  -- Controle
  generated_by TEXT DEFAULT 'ai', -- "ai", "manual", "template"
  verified BOOLEAN DEFAULT false, -- Se foi verificado por humano
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_chord_diagrams_chord_name ON chord_diagrams(chord_name);
CREATE INDEX IF NOT EXISTS idx_chord_diagrams_quality ON chord_diagrams(quality);
CREATE INDEX IF NOT EXISTS idx_chord_diagrams_root_note ON chord_diagrams(root_note);

-- RLS Policies (público para leitura, admin para escrita)
ALTER TABLE chord_diagrams ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa autenticada pode ler
CREATE POLICY "Chord diagrams are viewable by authenticated users"
  ON chord_diagrams FOR SELECT
  TO authenticated
  USING (true);

-- Apenas líderes podem inserir/atualizar
CREATE POLICY "Chord diagrams are insertable by leaders"
  ON chord_diagrams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'lider'
    )
  );

CREATE POLICY "Chord diagrams are updatable by leaders"
  ON chord_diagrams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'lider'
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_chord_diagrams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chord_diagrams_updated_at
  BEFORE UPDATE ON chord_diagrams
  FOR EACH ROW
  EXECUTE FUNCTION update_chord_diagrams_updated_at();

-- Comentários
COMMENT ON TABLE chord_diagrams IS 'Armazena diagramas de acordes gerados por IA ou manualmente';
COMMENT ON COLUMN chord_diagrams.chord_name IS 'Nome do acorde (ex: C, Am7, Bb9)';
COMMENT ON COLUMN chord_diagrams.caged_shapes IS 'Formas CAGED do acorde para violão';
COMMENT ON COLUMN chord_diagrams.keyboard_voicings IS 'Voicings do acorde para teclado';
COMMENT ON COLUMN chord_diagrams.generated_by IS 'Origem do diagrama: ai, manual ou template';
COMMENT ON COLUMN chord_diagrams.verified IS 'Se o diagrama foi verificado por humano';
