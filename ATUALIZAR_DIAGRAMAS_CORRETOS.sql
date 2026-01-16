-- =============================================
-- ATUALIZAR DIAGRAMAS COM POSIÇÕES CORRETAS
-- Execute este SQL para corrigir os diagramas
-- =============================================

-- Primeiro, vamos limpar todos os acordes
DELETE FROM chord_diagrams;

-- Agora vamos inserir acordes com diagramas corretos
-- Começando com os acordes de C (como exemplo)

INSERT INTO chord_diagrams (chord_name, full_name, quality, root_note, notes, caged_shapes, keyboard_voicings, generated_by, verified)
VALUES
-- C Maior (forma C aberta)
('C', 'C Major', 'major', 'C', ARRAY['C', 'E', 'G'],
  jsonb_build_object(
    'C', jsonb_build_object(
      'name', 'C (Forma C)',
      'baseFret', 1,
      'notes', jsonb_build_array(
        jsonb_build_object('string', 1, 'fret', 0, 'label', 'E'),
        jsonb_build_object('string', 2, 'fret', 1, 'finger', 1, 'label', 'C'),
        jsonb_build_object('string', 3, 'fret', 0, 'label', 'G'),
        jsonb_build_object('string', 4, 'fret', 2, 'finger', 2, 'label', 'E'),
        jsonb_build_object('string', 5, 'fret', 3, 'finger', 3, 'label', 'C'),
        jsonb_build_object('string', 6, 'fret', -1)
      )
    )
  ),
  jsonb_build_object('root', jsonb_build_object('notes', jsonb_build_array('C4', 'E4', 'G4'), 'inversion', 0)),
  'sql', true
),

-- C Menor
('Cm', 'C minor', 'minor', 'C', ARRAY['C', 'D#', 'G'],
  jsonb_build_object(
    'E', jsonb_build_object(
      'name', 'Cm (Forma E)',
      'baseFret', 3,
      'notes', jsonb_build_array(
        jsonb_build_object('string', 1, 'fret', 3, 'finger', 1, 'label', 'G'),
        jsonb_build_object('string', 2, 'fret', 4, 'finger', 2, 'label', 'D#'),
        jsonb_build_object('string', 3, 'fret', 5, 'finger', 4, 'label', 'C'),
        jsonb_build_object('string', 4, 'fret', 5, 'finger', 3, 'label', 'G'),
        jsonb_build_object('string', 5, 'fret', 3, 'finger', 1, 'label', 'C'),
        jsonb_build_object('string', 6, 'fret', -1)
      ),
      'barre', jsonb_build_object('fret', 3, 'fromString', 1, 'toString', 5)
    )
  ),
  jsonb_build_object('root', jsonb_build_object('notes', jsonb_build_array('C4', 'D#4', 'G4'), 'inversion', 0)),
  'sql', true
),

-- C7 (Dominante)
('C7', 'C Dominant 7th', 'dominant7', 'C', ARRAY['C', 'E', 'G', 'A#'],
  jsonb_build_object(
    'C', jsonb_build_object(
      'name', 'C7 (Forma C)',
      'baseFret', 1,
      'notes', jsonb_build_array(
        jsonb_build_object('string', 1, 'fret', 0, 'label', 'E'),
        jsonb_build_object('string', 2, 'fret', 1, 'finger', 1, 'label', 'C'),
        jsonb_build_object('string', 3, 'fret', 3, 'finger', 3, 'label', 'A#'),
        jsonb_build_object('string', 4, 'fret', 2, 'finger', 2, 'label', 'E'),
        jsonb_build_object('string', 5, 'fret', 3, 'finger', 4, 'label', 'C'),
        jsonb_build_object('string', 6, 'fret', -1)
      )
    )
  ),
  jsonb_build_object('root', jsonb_build_object('notes', jsonb_build_array('C4', 'E4', 'G4', 'A#4'), 'inversion', 0)),
  'sql', true
);

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Diagramas atualizados! Agora vamos gerar os outros tons automaticamente...';
END $$;

-- Ver resultado
SELECT chord_name, full_name FROM chord_diagrams ORDER BY chord_name;
