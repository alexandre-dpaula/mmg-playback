# 🎵 Como Gerar Todos os 156 Acordes

## Problema

O script TypeScript está sendo bloqueado pelo RLS (Row Level Security) porque você não tem a `SUPABASE_SERVICE_ROLE_KEY` no `.env`.

## ✅ Solução: Usar SQL Editor

Execute o script SQL diretamente no Supabase SQL Editor (contorna o RLS automaticamente).

### Passos:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione o projeto: **MMG - Ensaio Vocal**

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query**

3. **Cole e Execute o SQL Abaixo**

```sql
-- =============================================
-- GERAR TODOS OS 156 ACORDES
-- =============================================

DO $$
DECLARE
  v_roots TEXT[] := ARRAY['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  v_chromatic TEXT[] := ARRAY['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  v_root TEXT;
  v_count INT := 0;

  TYPE chord_type IS RECORD (
    suffix TEXT,
    full_name TEXT,
    quality TEXT,
    intervals INT[]
  );

  v_chords chord_type[] := ARRAY[
    ROW('', 'Major', 'major', ARRAY[0, 4, 7])::chord_type,
    ROW('m', 'minor', 'minor', ARRAY[0, 3, 7])::chord_type,
    ROW('7', 'Dominant 7th', 'dominant7', ARRAY[0, 4, 7, 10])::chord_type,
    ROW('maj7', 'Major 7th', 'major7', ARRAY[0, 4, 7, 11])::chord_type,
    ROW('m7', 'minor 7th', 'minor7', ARRAY[0, 3, 7, 10])::chord_type,
    ROW('dim', 'Diminished', 'diminished', ARRAY[0, 3, 6])::chord_type,
    ROW('aug', 'Augmented', 'augmented', ARRAY[0, 4, 8])::chord_type,
    ROW('sus2', 'Suspended 2nd', 'sus2', ARRAY[0, 2, 7])::chord_type,
    ROW('sus4', 'Suspended 4th', 'sus4', ARRAY[0, 5, 7])::chord_type,
    ROW('6', 'Major 6th', 'major', ARRAY[0, 4, 7, 9])::chord_type,
    ROW('m6', 'minor 6th', 'minor', ARRAY[0, 3, 7, 9])::chord_type,
    ROW('9', 'Dominant 9th', 'dominant7', ARRAY[0, 4, 7, 10, 14])::chord_type,
    ROW('add9', 'Major add 9', 'major', ARRAY[0, 2, 4, 7])::chord_type
  ];

  v_chord chord_type;
  v_chord_name TEXT;
  v_notes TEXT[];
  v_base_fret INT;
  v_root_idx INT;

BEGIN
  RAISE NOTICE '🎵 Gerando todos os 156 acordes...';

  -- Para cada tom
  FOREACH v_root IN ARRAY v_roots LOOP
    v_root_idx := array_position(v_chromatic, v_root);
    v_base_fret := LEAST(GREATEST(v_root_idx - 1, 0), 7);

    -- Para cada tipo de acorde
    FOREACH v_chord IN ARRAY v_chords LOOP
      v_chord_name := v_root || v_chord.suffix;

      -- Calcula as notas do acorde
      v_notes := ARRAY[]::TEXT[];
      FOR i IN 1..array_length(v_chord.intervals, 1) LOOP
        v_notes := array_append(
          v_notes,
          v_chromatic[((v_root_idx - 1 + v_chord.intervals[i]) % 12) + 1]
        );
      END LOOP;

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
        v_root || ' ' || v_chord.full_name,
        v_chord.quality,
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
```

4. **Clique em Run** (ou Ctrl/Cmd + Enter)

5. **Aguarde** - Deve levar ~5 segundos

6. **Verifique o resultado**:
   - Deve mostrar: `✅ Total de acordes gerados: 156`
   - A segunda query mostrará 156 acordes
   - A terceira query mostrará os primeiros 25 acordes

## 🎯 Resultado Esperado

```
🎵 Gerando todos os 156 acordes...
✅ 20 acordes gerados...
✅ 40 acordes gerados...
✅ 60 acordes gerados...
✅ 80 acordes gerados...
✅ 100 acordes gerados...
✅ 120 acordes gerados...
✅ 140 acordes gerados...

==================================================
✨ Processo concluído!
✅ Total de acordes gerados: 156
==================================================
```

## ✅ Depois de Executar

Agora você pode:

1. **Testar a Biblioteca de Acordes**
   - Abra a aplicação
   - Vá em Estudos → Biblioteca de Acordes
   - Selecione um tom (ex: C)
   - Clique em qualquer variação (ex: C, Cm, C7)
   - **O diagrama aparecerá INSTANTANEAMENTE** (sem loading!)

2. **Verificar no banco**:
   ```sql
   -- Ver acordes de C
   SELECT chord_name, full_name
   FROM chord_diagrams
   WHERE root_note = 'C'
   ORDER BY chord_name;

   -- Ver todos os acordes menores
   SELECT chord_name, full_name
   FROM chord_diagrams
   WHERE quality = 'minor'
   ORDER BY root_note, chord_name;
   ```

## 🔄 Regenerar (se necessário)

Se quiser regenerar todos os acordes (por exemplo, após atualizar a lógica):

```sql
-- 1. Limpar tabela
DELETE FROM chord_diagrams;

-- 2. Executar novamente o SQL de geração acima
```

---

**Sistema de Acordes - Pronto para Uso! 🎵**
