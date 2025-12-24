-- =====================================================
-- ADICIONAR TIMESTAMPS NA MÚSICA SUBLIME
-- =====================================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Primeiro, vamos encontrar a música Sublime
SELECT id, titulo, versao, referencia
FROM tracks
WHERE id = 'dfeb98a9-a1ed-476d-957f-2052489181f2';

-- 2. Adicionar timestamps na música Sublime
-- IMPORTANTE: Você precisa ajustar estes valores para corresponder
-- aos tempos reais da música no YouTube!
--
-- Ouça a música e anote quando cada seção começa:
-- - I (Intro)
-- - V1 (Verso 1)
-- - R1 (Refrão 1)
-- - V2 (Verso 2)
-- - R2 (Refrão 2)
-- - PO (Ponte)
-- - R3 (Refrão 3)

-- Exemplo com estrutura completa de uma música típica
-- Ajuste os tempos conforme a música real no YouTube!
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
WHERE id = 'dfeb98a9-a1ed-476d-957f-2052489181f2';

-- =====================================================
-- LEGENDA DAS SEÇÕES DISPONÍVEIS:
-- =====================================================
-- I    = Intro (Introdução)
-- V1   = Verse 1 (Verso 1)
-- V2   = Verse 2 (Verso 2)
-- PR   = Pré-Refrão
-- R    = Refrão (sem variação)
-- R1   = Refrão 1 (com variação)
-- R2   = Refrão 2 (com variação)
-- S    = Solo
-- PO   = Ponte
-- B    = Bridge
-- IS   = Instrumental
-- O    = Outro (Final)
-- TA   = Turnaround
-- TG   = Tag
-- IT   = Interlúdio
-- RF   = Refrão Final

-- 3. Verificar se foi aplicado corretamente
SELECT id, titulo, versao, section_timestamps
FROM tracks
WHERE id = 'dfeb98a9-a1ed-476d-957f-2052489181f2';

-- =====================================================
-- EXPLICAÇÃO DAS CORES QUE APARECERÃO:
-- =====================================================
-- I (Intro): Azul (#4A90E2)
-- V1, V2 (Versos): Roxo (#9B59B6)
-- R1, R2, R3 (Refrão): Verde (#1DB954)
-- PO (Ponte): Vermelho (#E74C3C)
--
-- A barra de progresso mudará de cor automaticamente
-- conforme a música tocar!
