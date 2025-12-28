-- ============================================
-- SCRIPT PARA INSERIR NOTIFICAÇÕES DE TESTE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- IMPORTANTE: Substitua 'SEU_CHURCH_ID_AQUI' pelo ID real da sua igreja
-- Você pode encontrar o church_id executando: SELECT * FROM churches LIMIT 1;

-- Exemplo 1: Nova Playlist Adicionada
INSERT INTO notifications (church_id, type, title, message, metadata, created_at)
VALUES (
  '6cb2a139-a860-4fc0-9c98-3dabc3888f81',  -- Substitua pelo church_id real
  'new_playlist',
  'Nova Playlist Adicionada',
  'Nova playlist "Domingo à Noite" criada para o evento "Culto de Celebração" por Alexandre',
  '{"playlist_name": "Domingo à Noite", "event_name": "Culto de Celebração", "creator_name": "Alexandre"}',
  NOW()
);

-- Exemplo 2: Nova Música Adicionada
INSERT INTO notifications (church_id, type, title, message, metadata, created_at)
VALUES (
  '6cb2a139-a860-4fc0-9c98-3dabc3888f81',  -- Substitua pelo church_id real
  'new_track',
  'Nova Música Adicionada',
  '"Me Amas" foi adicionada à playlist "Domingo à Noite" por Matheus',
  '{"track_title": "Me Amas", "track_artist": "Thalles Roberto", "track_key": "C", "playlist_name": "Domingo à Noite", "creator_name": "Matheus"}',
  NOW() - INTERVAL '1 hour'
);

-- Exemplo 3: Música Atualizada
INSERT INTO notifications (church_id, type, title, message, metadata, created_at)
VALUES (
  '6cb2a139-a860-4fc0-9c98-3dabc3888f81',  -- Substitua pelo church_id real
  'updated_track',
  'Música Atualizada',
  '"Me Amas" foi atualizada por Alexandre (tom C → E)',
  '{"track_title": "Me Amas", "track_artist": "Thalles Roberto", "track_key": "E", "changes": ["tom (C → E)"], "updater_name": "Alexandre"}',
  NOW() - INTERVAL '2 hours'
);

-- Exemplo 4: Novo Membro na Equipe
INSERT INTO notifications (church_id, type, title, message, metadata, created_at)
VALUES (
  '6cb2a139-a860-4fc0-9c98-3dabc3888f81',  -- Substitua pelo church_id real
  'new_member',
  'Novo Membro na Equipe',
  'Bem-vindo(a) Matheus Dpaula! Agora faz parte da equipe como Vocal',
  '{"member_name": "Matheus Dpaula", "role": "vocal", "role_label": "Vocal"}',
  NOW() - INTERVAL '3 hours'
);

-- Exemplo 5: Novo Evento Criado
INSERT INTO notifications (church_id, type, title, message, metadata, created_at)
VALUES (
  '6cb2a139-a860-4fc0-9c98-3dabc3888f81',  -- Substitua pelo church_id real
  'new_event',
  'Novo Evento Criado',
  'Evento "Culto de Celebração" agendado para 31/12/2025 por Alexandre',
  '{"event_title": "Culto de Celebração", "event_date": "2025-12-31", "creator_name": "Alexandre"}',
  NOW() - INTERVAL '4 hours'
);

-- Exemplo 6: Atualização da Cifra
INSERT INTO notifications (church_id, type, title, message, metadata, created_at)
VALUES (
  '6cb2a139-a860-4fc0-9c98-3dabc3888f81',  -- Substitua pelo church_id real
  'updated_track',
  'Cifra Atualizada',
  'Cifra de "Eu Me Rendo" foi atualizada por Alexandre',
  '{"track_title": "Eu Me Rendo", "track_artist": "Renascer Praise", "changes": ["cifra"], "updater_name": "Alexandre"}',
  NOW() - INTERVAL '5 hours'
);

-- ============================================
-- COMO USAR ESTE SCRIPT:
-- ============================================
-- 1. Execute: SELECT id, name FROM churches;
-- 2. Copie o ID (UUID) da sua igreja
-- 3. Substitua 'SEU_CHURCH_ID_AQUI' pelo ID copiado em todas as linhas acima
-- 4. Execute este script
-- 5. Acesse a página de Notificações no app para ver as notificações de teste!
-- ============================================
