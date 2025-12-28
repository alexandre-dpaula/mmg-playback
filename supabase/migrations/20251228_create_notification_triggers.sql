-- ============================================
-- TRIGGERS DE NOTIFICAÇÕES AUTOMÁTICAS
-- ============================================

-- Função auxiliar para criar notificações
CREATE OR REPLACE FUNCTION create_notification(
  p_church_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_created_by UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (church_id, type, title, message, metadata, created_by)
  VALUES (p_church_id, p_type, p_title, p_message, p_metadata, p_created_by);
END;
$$;

-- ============================================
-- 1. NOTIFICAÇÃO: NOVA PLAYLIST CRIADA
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_playlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_name TEXT;
  v_creator_name TEXT;
BEGIN
  -- Busca o nome do evento
  SELECT title INTO v_event_name
  FROM events
  WHERE id = NEW.event_id;

  -- Busca o nome do criador
  SELECT COALESCE(name, full_name, email) INTO v_creator_name
  FROM profiles
  WHERE id = NEW.created_by;

  -- Busca a igreja do evento
  PERFORM create_notification(
    (SELECT church_id FROM events WHERE id = NEW.event_id),
    'new_playlist',
    'Nova Playlist Adicionada',
    format('Nova playlist "%s" criada para o evento "%s" por %s',
      NEW.name,
      COALESCE(v_event_name, 'evento'),
      COALESCE(v_creator_name, 'um membro')
    ),
    jsonb_build_object(
      'playlist_id', NEW.id,
      'playlist_name', NEW.name,
      'event_id', NEW.event_id,
      'event_name', v_event_name,
      'creator_name', v_creator_name
    ),
    NEW.created_by
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_playlist
AFTER INSERT ON playlists
FOR EACH ROW
EXECUTE FUNCTION notify_new_playlist();

-- ============================================
-- 2. NOTIFICAÇÃO: NOVA MÚSICA ADICIONADA À PLAYLIST
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_track()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_playlist_name TEXT;
  v_event_id UUID;
  v_church_id UUID;
  v_creator_name TEXT;
BEGIN
  -- Busca o nome da playlist e event_id
  SELECT p.name, p.event_id INTO v_playlist_name, v_event_id
  FROM playlists p
  WHERE p.id = NEW.playlist_id;

  -- Busca church_id do evento
  SELECT church_id INTO v_church_id
  FROM events
  WHERE id = v_event_id;

  -- Busca o nome do criador
  SELECT COALESCE(name, full_name, email) INTO v_creator_name
  FROM profiles
  WHERE id = NEW.created_by;

  -- Cria notificação
  PERFORM create_notification(
    v_church_id,
    'new_track',
    'Nova Música Adicionada',
    format('"%s" foi adicionada à playlist "%s" por %s',
      NEW.title,
      COALESCE(v_playlist_name, 'playlist'),
      COALESCE(v_creator_name, 'um membro')
    ),
    jsonb_build_object(
      'track_id', NEW.id,
      'track_title', NEW.title,
      'track_artist', NEW.artist,
      'track_key', NEW.key,
      'playlist_id', NEW.playlist_id,
      'playlist_name', v_playlist_name,
      'creator_name', v_creator_name
    ),
    NEW.created_by
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_track
AFTER INSERT ON tracks
FOR EACH ROW
EXECUTE FUNCTION notify_new_track();

-- ============================================
-- 3. NOTIFICAÇÃO: CIFRA DA MÚSICA ATUALIZADA
-- ============================================
CREATE OR REPLACE FUNCTION notify_track_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_playlist_name TEXT;
  v_event_id UUID;
  v_church_id UUID;
  v_updater_name TEXT;
  v_changes TEXT[];
BEGIN
  -- Ignora se for a primeira vez que a cifra está sendo salva
  IF OLD.cifra IS NULL AND NEW.cifra IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Detecta mudanças importantes
  IF OLD.cifra IS DISTINCT FROM NEW.cifra THEN
    v_changes := array_append(v_changes, 'cifra');
  END IF;

  IF OLD.key IS DISTINCT FROM NEW.key THEN
    v_changes := array_append(v_changes, format('tom (%s → %s)', OLD.key, NEW.key));
  END IF;

  -- Se não houver mudanças relevantes, não notifica
  IF array_length(v_changes, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  -- Busca dados relacionados
  SELECT p.name, p.event_id INTO v_playlist_name, v_event_id
  FROM playlists p
  WHERE p.id = NEW.playlist_id;

  SELECT church_id INTO v_church_id
  FROM events
  WHERE id = v_event_id;

  SELECT COALESCE(name, full_name, email) INTO v_updater_name
  FROM profiles
  WHERE id = NEW.updated_by;

  -- Cria notificação
  PERFORM create_notification(
    v_church_id,
    'updated_track',
    'Música Atualizada',
    format('"%s" foi atualizada por %s (%s)',
      NEW.title,
      COALESCE(v_updater_name, 'um membro'),
      array_to_string(v_changes, ', ')
    ),
    jsonb_build_object(
      'track_id', NEW.id,
      'track_title', NEW.title,
      'track_artist', NEW.artist,
      'track_key', NEW.key,
      'playlist_id', NEW.playlist_id,
      'playlist_name', v_playlist_name,
      'changes', v_changes,
      'updater_name', v_updater_name
    ),
    NEW.updated_by
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_track_updated
AFTER UPDATE ON tracks
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION notify_track_updated();

-- ============================================
-- 4. NOTIFICAÇÃO: NOVO MEMBRO ADICIONADO À EQUIPE
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_name TEXT;
  v_role_label TEXT;
BEGIN
  -- Ignora role 'pending'
  IF NEW.role = 'pending' THEN
    RETURN NEW;
  END IF;

  -- Busca o nome do novo membro
  SELECT COALESCE(name, full_name, email) INTO v_member_name
  FROM profiles
  WHERE id = NEW.auth_user_id;

  -- Traduz o role para português
  v_role_label := CASE NEW.role
    WHEN 'lider' THEN 'Líder'
    WHEN 'vocal' THEN 'Vocal'
    WHEN 'instrumental' THEN 'Instrumental'
    WHEN 'multimidia' THEN 'Multimídia'
    ELSE 'Membro'
  END;

  -- Cria notificação
  PERFORM create_notification(
    NEW.church_id,
    'new_member',
    'Novo Membro na Equipe',
    format('Bem-vindo(a) %s! Agora faz parte da equipe como %s',
      COALESCE(v_member_name, 'novo membro'),
      v_role_label
    ),
    jsonb_build_object(
      'user_id', NEW.auth_user_id,
      'member_name', v_member_name,
      'role', NEW.role,
      'role_label', v_role_label
    ),
    NULL -- Sistema cria esta notificação
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_member
AFTER INSERT ON users_app
FOR EACH ROW
EXECUTE FUNCTION notify_new_member();

-- ============================================
-- 5. NOTIFICAÇÃO: NOVO EVENTO CRIADO
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_creator_name TEXT;
  v_event_date TEXT;
BEGIN
  -- Busca o nome do criador
  SELECT COALESCE(name, full_name, email) INTO v_creator_name
  FROM profiles
  WHERE id = NEW.created_by;

  -- Formata a data do evento
  v_event_date := to_char(NEW.date, 'DD/MM/YYYY');

  -- Cria notificação
  PERFORM create_notification(
    NEW.church_id,
    'new_event',
    'Novo Evento Criado',
    format('Evento "%s" agendado para %s por %s',
      NEW.title,
      v_event_date,
      COALESCE(v_creator_name, 'um membro')
    ),
    jsonb_build_object(
      'event_id', NEW.id,
      'event_title', NEW.title,
      'event_date', NEW.date,
      'event_description', NEW.description,
      'creator_name', v_creator_name
    ),
    NEW.created_by
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_event
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION notify_new_event();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION create_notification IS 'Função auxiliar para criar notificações de forma consistente';
COMMENT ON FUNCTION notify_new_playlist IS 'Cria notificação quando uma nova playlist é criada';
COMMENT ON FUNCTION notify_new_track IS 'Cria notificação quando uma nova música é adicionada';
COMMENT ON FUNCTION notify_track_updated IS 'Cria notificação quando uma música é atualizada';
COMMENT ON FUNCTION notify_new_member IS 'Cria notificação quando um novo membro entra na equipe';
COMMENT ON FUNCTION notify_new_event IS 'Cria notificação quando um novo evento é criado';
