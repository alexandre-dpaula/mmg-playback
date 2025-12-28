-- =====================================================
-- CRIAR IGREJA ESPECIAL "SEM IGREJA"
-- =====================================================
-- Esta igreja permite criar eventos sem vínculo a uma igreja específica
-- ID fixo: 00000000-0000-0000-0000-000000000000
-- =====================================================

-- Inserir igreja "Sem igreja" se não existir
INSERT INTO public.churches (
  id,
  name,
  owner_user_id,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Sem igreja',
  (SELECT id FROM auth.users LIMIT 1), -- Usar primeiro usuário como owner temporário
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Comentário
COMMENT ON TABLE public.churches IS
  'Tabela de igrejas. ID 00000000-0000-0000-0000-000000000000 é reservado para eventos sem igreja específica';

-- Verificar
SELECT id, name, owner_user_id
FROM public.churches
WHERE id = '00000000-0000-0000-0000-000000000000';
