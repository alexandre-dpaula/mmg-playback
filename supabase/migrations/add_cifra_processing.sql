-- Adicionar coluna para armazenar conteúdo extraído da cifra
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS cifra_content TEXT;

-- Comentário explicativo
COMMENT ON COLUMN tracks.cifra_content IS 'Conteúdo extraído automaticamente de URLs do CifraClub';

-- Criar função que chama a Edge Function para processar cifras do CifraClub
CREATE OR REPLACE FUNCTION process_cifraclub_url()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  payload JSON;
BEGIN
  -- Verificar se cifra_url contém 'cifraclub.com'
  IF NEW.cifra_url IS NOT NULL AND NEW.cifra_url LIKE '%cifraclub.com%' THEN

    -- Construir URL da Edge Function
    -- Nota: Substitua YOUR_PROJECT_REF pelo ref do seu projeto Supabase
    function_url := current_setting('app.settings.supabase_url', true) ||
                    '/functions/v1/process-cifraclub';

    -- Preparar payload
    payload := json_build_object(
      'trackId', NEW.id,
      'cifraUrl', NEW.cifra_url
    );

    -- Chamar Edge Function de forma assíncrona usando pg_net
    -- (requer extensão pg_net habilitada)
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := payload::jsonb
      );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa após INSERT ou UPDATE
CREATE TRIGGER trigger_process_cifraclub
  AFTER INSERT OR UPDATE OF cifra_url ON tracks
  FOR EACH ROW
  WHEN (NEW.cifra_url IS NOT NULL AND NEW.cifra_url LIKE '%cifraclub.com%')
  EXECUTE FUNCTION process_cifraclub_url();

-- Comentário no trigger
COMMENT ON TRIGGER trigger_process_cifraclub ON tracks IS
  'Trigger que chama Edge Function para processar URLs do CifraClub automaticamente';
