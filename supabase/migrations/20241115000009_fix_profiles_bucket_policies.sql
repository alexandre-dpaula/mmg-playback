-- Atualizar políticas do bucket profiles para permitir upload durante registro

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Política de SELECT: Permitir leitura pública
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profiles');

-- Nova política de INSERT: Permitir upload público no bucket profiles (temporário para debug)
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'profiles');

-- Nova política de UPDATE: Permitir update público no bucket profiles (temporário para debug)
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'profiles')
  WITH CHECK (bucket_id = 'profiles');

-- Nova política de DELETE: Permitir delete para autenticados
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'profiles');
