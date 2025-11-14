-- Habilitar extensão UUID (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de relacionamento evento-faixas
CREATE TABLE IF NOT EXISTS event_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, track_id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_event_tracks_event_id ON event_tracks(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tracks_track_id ON event_tracks(track_id);

-- Comentários descritivos
COMMENT ON TABLE events IS 'Tabela de eventos (cultos, ensaios, etc)';
COMMENT ON TABLE event_tracks IS 'Relacionamento muitos-para-muitos entre eventos e faixas';
COMMENT ON COLUMN events.name IS 'Nome do evento';
COMMENT ON COLUMN events.date IS 'Data do evento';
COMMENT ON COLUMN event_tracks.order_index IS 'Ordem da faixa dentro do evento';
