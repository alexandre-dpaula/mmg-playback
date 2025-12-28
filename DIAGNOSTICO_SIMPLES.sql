-- =====================================================
-- DIAGNÓSTICO SIMPLIFICADO: Eventos Pessoais
-- =====================================================
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se igreja "Sem igreja" existe
SELECT '1️⃣ Igreja Sem Igreja' as diagnostico;
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM churches
      WHERE id = '00000000-0000-0000-0000-000000000000'
    ) THEN '✅ Igreja "Sem igreja" EXISTE'
    ELSE '❌ Igreja "Sem igreja" NÃO EXISTE - EXECUTAR APLICAR_EVENTOS_PESSOAIS_COMPLETO.sql'
  END as status;

-- 2. Ver dados da igreja especial
SELECT '2️⃣ Dados da Igreja Especial' as diagnostico;
SELECT
  id,
  name,
  owner_user_id,
  created_at
FROM churches
WHERE id = '00000000-0000-0000-0000-000000000000';

-- 3. Verificar RLS policies de events
SELECT '3️⃣ Políticas RLS de Events' as diagnostico;
SELECT
  policyname as politica,
  cmd as operacao,
  CASE
    WHEN policyname = 'events_insert' THEN '✅ Permite criar eventos'
    WHEN policyname = 'events_select' THEN '✅ Permite ver eventos'
    WHEN policyname = 'events_update' THEN '✅ Permite editar eventos'
    WHEN policyname = 'events_delete' THEN '✅ Permite deletar eventos'
    ELSE 'Desconhecida'
  END as descricao
FROM pg_policies
WHERE tablename = 'events'
ORDER BY policyname;

-- 4. Contar políticas (deve ser 4)
SELECT '4️⃣ Total de Políticas' as diagnostico;
SELECT
  COUNT(*) as total_politicas,
  CASE
    WHEN COUNT(*) = 4 THEN '✅ Correto (4 políticas)'
    ELSE '❌ ERRO: Esperado 4, encontrado ' || COUNT(*)::text
  END as status
FROM pg_policies
WHERE tablename = 'events';

-- 5. Verificar usuário dpaulax@gmail.com
SELECT '5️⃣ Usuário dpaulax@gmail.com' as diagnostico;
SELECT
  email,
  church_id,
  role,
  full_name,
  CASE
    WHEN church_id IS NULL THEN '✅ SEM IGREJA (pode criar eventos pessoais)'
    WHEN church_id = '00000000-0000-0000-0000-000000000000' THEN '✅ SEM IGREJA (eventos pessoais)'
    ELSE '⚠️ TEM IGREJA: ' || church_id::text
  END as status_igreja,
  auth_user_id
FROM users_app
WHERE email = 'dpaulax@gmail.com';

-- 6. Ver função get_user_church_id (deve existir)
SELECT '6️⃣ Função get_user_church_id' as diagnostico;
SELECT
  routine_name as funcao,
  routine_type as tipo,
  '✅ Função existe' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_church_id';

-- 7. Ver todos os eventos do usuário dpaulax@gmail.com
SELECT '7️⃣ Eventos de dpaulax@gmail.com' as diagnostico;
SELECT
  e.id,
  e.name,
  e.date,
  e.church_id,
  e.created_by,
  ua.email as email_criador,
  CASE
    WHEN e.church_id = '00000000-0000-0000-0000-000000000000' THEN '✅ Evento PESSOAL'
    ELSE '⚠️ Evento de IGREJA'
  END as tipo_evento
FROM events e
JOIN users_app ua ON ua.auth_user_id = e.created_by
WHERE ua.email = 'dpaulax@gmail.com'
ORDER BY e.created_at DESC;

-- 8. Testar se RLS está ativo
SELECT '8️⃣ Status do RLS' as diagnostico;
SELECT
  tablename as tabela,
  rowsecurity as rls_ativo,
  CASE
    WHEN rowsecurity THEN '✅ RLS ATIVO'
    ELSE '❌ RLS DESATIVADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('events', 'users_app', 'churches')
ORDER BY tablename;

-- =====================================================
-- CHECKLIST FINAL
-- =====================================================
SELECT '✅ CHECKLIST FINAL' as diagnostico;
SELECT
  (SELECT COUNT(*) = 1 FROM churches WHERE id = '00000000-0000-0000-0000-000000000000') as igreja_existe,
  (SELECT COUNT(*) = 4 FROM pg_policies WHERE tablename = 'events') as tem_4_policies,
  (SELECT church_id IS NULL FROM users_app WHERE email = 'dpaulax@gmail.com') as usuario_sem_igreja,
  (SELECT COUNT(*) = 1 FROM information_schema.routines WHERE routine_name = 'get_user_church_id') as funcao_existe,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'events' AND schemaname = 'public') as rls_ativo;

-- =====================================================
-- RESULTADO
-- =====================================================
-- Se TODOS forem TRUE: problema está no frontend
-- Se ALGUM for FALSE: execute APLICAR_EVENTOS_PESSOAIS_COMPLETO.sql
-- =====================================================
