-- =============================================
-- GERAR TODOS OS 156 ACORDES
-- Execute este SQL no Supabase SQL Editor
-- =============================================

DO $$
DECLARE
  v_roots TEXT[] := ARRAY['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  v_chromatic TEXT[] := ARRAY['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  v_root TEXT;
  v_count INT := 0;
  v_chord_name TEXT;
  v_notes TEXT[];
  v_base_fret INT;
  v_root_idx INT;

  -- Arrays com os tipos de acordes
  v_suffixes TEXT[] := ARRAY['', 'm', '7', 'maj7', 'm7', 'dim', 'aug', 'sus2', 'sus4', '6', 'm6', '9', 'add9'];
  v_full_names TEXT[] := ARRAY['Major', 'minor', 'Dominant 7th', 'Major 7th', 'minor 7th', 'Diminished', 'Augmented', 'Suspended 2nd', 'Suspended 4th', 'Major 6th', 'minor 6th', 'Dominant 9th', 'Major add 9'];
  v_qualities TEXT[] := ARRAY['major', 'minor', 'dominant7', 'major7', 'minor7', 'diminished', 'augmented', 'sus2', 'sus4', 'major', 'minor', 'dominant7', 'major'];

  v_suffix TEXT;
  v_full_name TEXT;
  v_quality TEXT;
  v_chord_idx INT;

BEGIN
  RAISE NOTICE '🎵 Gerando todos os 156 acordes...';
  RAISE NOTICE '';

  -- Para cada tom
  FOR v_root_idx IN 1..array_length(v_roots, 1) LOOP
    v_root := v_roots[v_root_idx];
    v_base_fret := LEAST(GREATEST(v_root_idx - 1, 0), 7);

    -- Para cada tipo de acorde
    FOR v_chord_idx IN 1..array_length(v_suffixes, 1) LOOP
      v_suffix := v_suffixes[v_chord_idx];
      v_full_name := v_full_names[v_chord_idx];
      v_quality := v_qualities[v_chord_idx];
      v_chord_name := v_root || v_suffix;

      -- Calcula as notas do acorde (simplificado - apenas tríades básicas)
      CASE v_suffix
        WHEN '' THEN -- Maior
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 4) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1]
          ];
        WHEN 'm' THEN -- Menor
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 3) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1]
          ];
        WHEN '7' THEN -- Dominante 7
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 4) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 10) % 12) + 1]
          ];
        WHEN 'maj7' THEN -- Maior 7
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 4) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 11) % 12) + 1]
          ];
        WHEN 'm7' THEN -- Menor 7
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 3) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 10) % 12) + 1]
          ];
        WHEN 'dim' THEN -- Diminuto
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 3) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 6) % 12) + 1]
          ];
        WHEN 'aug' THEN -- Aumentado
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 4) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 8) % 12) + 1]
          ];
        WHEN 'sus2' THEN -- Suspenso 2
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 2) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1]
          ];
        WHEN 'sus4' THEN -- Suspenso 4
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 5) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1]
          ];
        WHEN '6' THEN -- Sexta
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 4) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 9) % 12) + 1]
          ];
        WHEN 'm6' THEN -- Menor 6
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 3) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 9) % 12) + 1]
          ];
        WHEN '9' THEN -- Nona
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 4) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 10) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 14) % 12) + 1]
          ];
        WHEN 'add9' THEN -- Add9
          v_notes := ARRAY[
            v_chromatic[v_root_idx],
            v_chromatic[((v_root_idx - 1 + 2) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 4) % 12) + 1],
            v_chromatic[((v_root_idx - 1 + 7) % 12) + 1]
          ];
        ELSE
          v_notes := ARRAY[v_chromatic[v_root_idx]];
      END CASE;

      -- Insere ou atualiza o acorde
      INSERT INTO chord_diagrams (
        chord_name,
        full_name,
        quality,
        root_note,
        notes,
        caged_shapes,
        keyboard_voicings,
        generated_by,
        verified
      ) VALUES (
        v_chord_name,
        v_root || ' ' || v_full_name,
        v_quality,
        v_root,
        v_notes,
        jsonb_build_object(
          'E', jsonb_build_object(
            'name', v_chord_name || ' (Forma E)',
            'baseFret', v_base_fret,
            'notes', jsonb_build_array(
              jsonb_build_object('string', 1, 'fret', v_base_fret, 'finger', 1),
              jsonb_build_object('string', 2, 'fret', v_base_fret, 'finger', 1),
              jsonb_build_object('string', 3, 'fret', v_base_fret + 1, 'finger', 2),
              jsonb_build_object('string', 4, 'fret', v_base_fret + 2, 'finger', 3),
              jsonb_build_object('string', 5, 'fret', v_base_fret + 2, 'finger', 4),
              jsonb_build_object('string', 6, 'fret', v_base_fret, 'finger', 1)
            ),
            'barre', CASE WHEN v_base_fret > 0 THEN
              jsonb_build_object(
                'fret', v_base_fret,
                'fromString', 1,
                'toString', 6
              )
            ELSE NULL END
          )
        ),
        jsonb_build_object(
          'root', jsonb_build_object(
            'notes', (
              SELECT jsonb_agg(note || '4')
              FROM unnest(v_notes) AS note
            ),
            'inversion', 0
          )
        ),
        'sql',
        false
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

      -- Log a cada 20 acordes
      IF v_count % 20 = 0 THEN
        RAISE NOTICE '✅ % acordes gerados...', v_count;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '✨ Processo concluído!';
  RAISE NOTICE '✅ Total de acordes gerados: %', v_count;
  RAISE NOTICE '==================================================';
END $$;

-- Verificar total gerado
SELECT COUNT(*) as total_acordes FROM chord_diagrams;

-- Ver alguns exemplos
SELECT chord_name, full_name, quality, root_note, array_length(notes, 1) as num_notes
FROM chord_diagrams
ORDER BY chord_name
LIMIT 25;
