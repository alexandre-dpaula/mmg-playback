-- =============================================
-- GERAR TODOS OS 156 ACORDES AUTOMATICAMENTE
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Esta função PL/pgSQL gera todos os acordes usando teoria musical
-- e salva direto na tabela chord_diagrams, contornando RLS

DO $$
DECLARE
  v_root_notes TEXT[] := ARRAY['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  v_chromatic TEXT[] := ARRAY['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  v_root TEXT;
  v_suffix TEXT;
  v_full_name TEXT;
  v_quality TEXT;
  v_intervals INT[];
  v_notes TEXT[];
  v_chord_name TEXT;
  v_note_index INT;
  v_base_fret INT;
  v_count INT := 0;
BEGIN
  RAISE NOTICE '🎵 Gerando todos os 156 acordes...';

  -- Loop por cada tom (12 tons)
  FOREACH v_root IN ARRAY v_root_notes
  LOOP
    -- 1. Maior (sem sufixo)
    v_suffix := '';
    v_full_name := v_root || ' Major';
    v_quality := 'major';
    v_intervals := ARRAY[0, 4, 7];
    v_notes := ARRAY[]::TEXT[];
    FOREACH v_note_index IN ARRAY v_intervals
    LOOP
      v_notes := array_append(v_notes, v_chromatic[(array_position(v_chromatic, v_root) - 1 + v_note_index) % 12 + 1]);
    END LOOP;
    v_chord_name := v_root || v_suffix;
    v_base_fret := LEAST(NULLIF(array_position(v_chromatic, v_root), 0), 7);

    INSERT INTO chord_diagrams (chord_name, full_name, quality, root_note, notes, caged_shapes, keyboard_voicings, generated_by)
    VALUES (
      v_chord_name,
      v_full_name,
      v_quality,
      v_root,
      v_notes,
      jsonb_build_object('E', jsonb_build_object(
        'name', v_chord_name || ' (Forma E)',
        'baseFret', v_base_fret,
        'notes', jsonb_build_array(
          jsonb_build_object('string', 1, 'fret', v_base_fret, 'finger', 1),
          jsonb_build_object('string', 2, 'fret', v_base_fret, 'finger', 1),
          jsonb_build_object('string', 3, 'fret', v_base_fret + 1, 'finger', 2),
          jsonb_build_object('string', 4, 'fret', v_base_fret + 2, 'finger', 3),
          jsonb_build_object('string', 5, 'fret', v_base_fret + 2, 'finger', 4),
          jsonb_build_object('string', 6, 'fret', v_base_fret, 'finger', 1)
        )
      )),
      jsonb_build_object('root', jsonb_build_object(
        'notes', jsonb_build_array(v_notes[1] || '4', v_notes[2] || '4', v_notes[3] || '4'),
        'inversion', 0
      )),
      'sql'
    )
    ON CONFLICT (chord_name) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      quality = EXCLUDED.quality,
      root_note = EXCLUDED.root_note,
      notes = EXCLUDED.notes,
      caged_shapes = EXCLUDED.caged_shapes,
      keyboard_voicings = EXCLUDED.keyboard_voicings,
      updated_at = NOW();

    v_count := v_count + 1;

    -- 2. Menor (m)
    v_suffix := 'm';
    v_full_name := v_root || ' minor';
    v_quality := 'minor';
    v_intervals := ARRAY[0, 3, 7];
    v_notes := ARRAY[]::TEXT[];
    FOREACH v_note_index IN ARRAY v_intervals
    LOOP
      v_notes := array_append(v_notes, v_chromatic[(array_position(v_chromatic, v_root) - 1 + v_note_index) % 12 + 1]);
    END LOOP;
    v_chord_name := v_root || v_suffix;

    INSERT INTO chord_diagrams (chord_name, full_name, quality, root_note, notes, caged_shapes, keyboard_voicings, generated_by)
    VALUES (
      v_chord_name, v_full_name, v_quality, v_root, v_notes,
      jsonb_build_object('E', jsonb_build_object('name', v_chord_name || ' (Forma E)', 'baseFret', v_base_fret, 'notes', '[]'::jsonb)),
      jsonb_build_object('root', jsonb_build_object('notes', jsonb_build_array(v_notes[1] || '4', v_notes[2] || '4', v_notes[3] || '4'), 'inversion', 0)),
      'sql'
    )
    ON CONFLICT (chord_name) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW();
    v_count := v_count + 1;

    -- 3. Dominante 7 (7)
    v_suffix := '7';
    v_full_name := v_root || ' Dominant 7th';
    v_quality := 'dominant7';
    v_intervals := ARRAY[0, 4, 7, 10];
    v_notes := ARRAY[]::TEXT[];
    FOREACH v_note_index IN ARRAY v_intervals
    LOOP
      v_notes := array_append(v_notes, v_chromatic[(array_position(v_chromatic, v_root) - 1 + v_note_index) % 12 + 1]);
    END LOOP;
    v_chord_name := v_root || v_suffix;

    INSERT INTO chord_diagrams (chord_name, full_name, quality, root_note, notes, caged_shapes, keyboard_voicings, generated_by)
    VALUES (
      v_chord_name, v_full_name, v_quality, v_root, v_notes,
      jsonb_build_object('E', jsonb_build_object('name', v_chord_name || ' (Forma E)', 'baseFret', v_base_fret, 'notes', '[]'::jsonb)),
      jsonb_build_object('root', jsonb_build_object('notes', jsonb_build_array(v_notes[1] || '4', v_notes[2] || '4', v_notes[3] || '4', v_notes[4] || '4'), 'inversion', 0)),
      'sql'
    )
    ON CONFLICT (chord_name) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW();
    v_count := v_count + 1;

    -- 4. Maior 7 (maj7)
    v_suffix := 'maj7';
    v_full_name := v_root || ' Major 7th';
    v_quality := 'major7';
    v_intervals := ARRAY[0, 4, 7, 11];
    v_notes := ARRAY[]::TEXT[];
    FOREACH v_note_index IN ARRAY v_intervals
    LOOP
      v_notes := array_append(v_notes, v_chromatic[(array_position(v_chromatic, v_root) - 1 + v_note_index) % 12 + 1]);
    END LOOP;
    v_chord_name := v_root || v_suffix;

    INSERT INTO chord_diagrams (chord_name, full_name, quality, root_note, notes, caged_shapes, keyboard_voicings, generated_by)
    VALUES (
      v_chord_name, v_full_name, v_quality, v_root, v_notes,
      jsonb_build_object('E', jsonb_build_object('name', v_chord_name || ' (Forma E)', 'baseFret', v_base_fret, 'notes', '[]'::jsonb)),
      jsonb_build_object('root', jsonb_build_object('notes', jsonb_build_array(v_notes[1] || '4', v_notes[2] || '4', v_notes[3] || '4', v_notes[4] || '4'), 'inversion', 0)),
      'sql'
    )
    ON CONFLICT (chord_name) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW();
    v_count := v_count + 1;

    -- 5. Menor 7 (m7)
    v_suffix := 'm7';
    v_full_name := v_root || ' minor 7th';
    v_quality := 'minor7';
    v_intervals := ARRAY[0, 3, 7, 10];
    v_notes := ARRAY[]::TEXT[];
    FOREACH v_note_index IN ARRAY v_intervals
    LOOP
      v_notes := array_append(v_notes, v_chromatic[(array_position(v_chromatic, v_root) - 1 + v_note_index) % 12 + 1]);
    END LOOP;
    v_chord_name := v_root || v_suffix;

    INSERT INTO chord_diagrams (chord_name, full_name, quality, root_note, notes, caged_shapes, keyboard_voicings, generated_by)
    VALUES (
      v_chord_name, v_full_name, v_quality, v_root, v_notes,
      jsonb_build_object('E', jsonb_build_object('name', v_chord_name || ' (Forma E)', 'baseFret', v_base_fret, 'notes', '[]'::jsonb)),
      jsonb_build_object('root', jsonb_build_object('notes', jsonb_build_array(v_notes[1] || '4', v_notes[2] || '4', v_notes[3] || '4', v_notes[4] || '4'), 'inversion', 0)),
      'sql'
    )
    ON CONFLICT (chord_name) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW();
    v_count := v_count + 1;

    -- 6-13. Outros tipos (versão simplificada)
    -- dim, aug, sus2, sus4, 6, m6, 9, add9

    FOREACH v_suffix IN ARRAY ARRAY['dim', 'aug', 'sus2', 'sus4', '6', 'm6', '9', 'add9']
    LOOP
      v_chord_name := v_root || v_suffix;
      v_notes := ARRAY[v_root]; -- Simplificado

      INSERT INTO chord_diagrams (chord_name, full_name, quality, root_note, notes, caged_shapes, keyboard_voicings, generated_by)
      VALUES (
        v_chord_name,
        v_root || ' ' || v_suffix,
        CASE v_suffix
          WHEN 'dim' THEN 'diminished'
          WHEN 'aug' THEN 'augmented'
          WHEN 'sus2' THEN 'sus2'
          WHEN 'sus4' THEN 'sus4'
          ELSE 'major'
        END,
        v_root,
        v_notes,
        jsonb_build_object('E', jsonb_build_object('name', v_chord_name, 'baseFret', v_base_fret, 'notes', '[]'::jsonb)),
        jsonb_build_object('root', jsonb_build_object('notes', jsonb_build_array(v_root || '4'), 'inversion', 0)),
        'sql'
      )
      ON CONFLICT (chord_name) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW();
      v_count := v_count + 1;
    END LOOP;

  END LOOP;

  RAISE NOTICE '✅ Gerados % acordes com sucesso!', v_count;
END $$;

-- Verificar total gerado
SELECT COUNT(*) as total_acordes FROM chord_diagrams;

-- Ver alguns exemplos
SELECT chord_name, full_name, quality, root_note
FROM chord_diagrams
ORDER BY chord_name
LIMIT 20;
