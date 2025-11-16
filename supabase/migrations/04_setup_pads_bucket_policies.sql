-- Configurar políticas de acesso ao bucket 'pads'

-- Deletar políticas existentes se houver
DROP POLICY IF EXISTS "Allow public read access on pads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to pads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to pads" ON storage.objects;

-- Permitir leitura pública de todos os arquivos
CREATE POLICY "Allow public read access on pads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pads');

-- Permitir upload de arquivos (necessário para o script de upload)
CREATE POLICY "Allow authenticated uploads to pads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'pads');

-- Permitir atualização de arquivos (para upsert)
CREATE POLICY "Allow authenticated updates to pads"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'pads')
WITH CHECK (bucket_id = 'pads');

-- Tornar o bucket público
UPDATE storage.buckets
SET public = true
WHERE id = 'pads';
