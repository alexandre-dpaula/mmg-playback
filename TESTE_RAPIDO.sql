-- =====================================================
-- TESTE RÁPIDO: Verificar Eventos Pessoais
-- =====================================================

-- 1. Igreja "Sem igreja" existe?
SELECT
  '1️⃣ Igreja Especial' as teste,
  CASE
    WHEN EXISTS (SELECT 1 FROM churches WHERE id = '00000000-0000-0000-0000-000000000000')
    THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END as resultado;

-- 2. Usuário dpaulax@gmail.com
SELECT
  '2️⃣ Usuário dpaulax' as teste,
  email,
  church_id,
  CASE
    WHEN church_id IS NULL THEN '✅ SEM IGREJA (pode criar eventos pessoais)'
    ELSE '❌ TEM IGREJA: ' || church_id::text
  END as resultado
FROM users_app
WHERE email = 'dpaulax@gmail.com';

-- 3. Função get_user_church_id existe?
SELECT
  '3️⃣ Função Helper' as teste,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines
      WHERE routine_name = 'get_user_church_id'
    )
    THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END as resultado;

-- 4. Checklist final
SELECT
  '4️⃣ CHECKLIST FINAL' as teste,
  (SELECT COUNT(*) = 1 FROM churches WHERE id = '00000000-0000-0000-0000-000000000000') as igreja_ok,
  (SELECT COUNT(*) = 4 FROM pg_policies WHERE tablename = 'events') as policies_ok,
  (SELECT church_id IS NULL FROM users_app WHERE email = 'dpaulax@gmail.com') as usuario_ok;

-- =====================================================
-- Se todos forem TRUE/✅: o problema está no FRONTEND
-- =====================================================
