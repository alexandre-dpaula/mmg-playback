-- =====================================================
-- DIAGNÓSTICO: Eventos Pessoais
-- =====================================================
-- Execute este arquivo no Supabase SQL Editor para identificar o problema
-- =====================================================

\echo '═══════════════════════════════════════════════════════'
\echo '🔍 DIAGNÓSTICO: Eventos Pessoais'
\echo '═══════════════════════════════════════════════════════'
\echo ''

-- 1. Verificar se igreja "Sem igreja" existe
\echo '1️⃣ Verificando igreja especial "Sem igreja"...'
\echo ''

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM churches
      WHERE id = '00000000-0000-0000-0000-000000000000'
    ) THEN '✅ Igreja "Sem igreja" EXISTE'
    ELSE '❌ Igreja "Sem igreja" NÃO EXISTE - EXECUTAR APLICAR_EVENTOS_PESSOAIS_COMPLETO.sql'
  END as status;

\echo ''

-- 2. Ver dados da igreja especial
\echo '2️⃣ Dados da igreja especial:'
\echo ''

SELECT
  id,
  name,
  owner_user_id,
  created_at
FROM churches
WHERE id = '00000000-0000-0000-0000-000000000000';

\echo ''

-- 3. Verificar RLS policies de events
\echo '3️⃣ Verificando políticas RLS de events...'
\echo ''

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

\echo ''

-- 4. Contar políticas (deve ser 4)
\echo '4️⃣ Total de políticas (deve ser 4):'
\echo ''

SELECT
  COUNT(*) as total_politicas,
  CASE
    WHEN COUNT(*) = 4 THEN '✅ Correto (4 políticas)'
    ELSE '❌ ERRO: Esperado 4, encontrado ' || COUNT(*)::text
  END as status
FROM pg_policies
WHERE tablename = 'events';

\echo ''

-- 5. Verificar usuário dpaulax@gmail.com
\echo '5️⃣ Verificando usuário dpaulax@gmail.com...'
\echo ''

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

\echo ''

-- 6. Ver função get_user_church_id (deve existir)
\echo '6️⃣ Verificando função get_user_church_id...'
\echo ''

SELECT
  routine_name as funcao,
  routine_type as tipo,
  '✅ Função existe' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_church_id';

\echo ''

-- 7. Ver todos os eventos do usuário dpaulax@gmail.com
\echo '7️⃣ Eventos criados por dpaulax@gmail.com:'
\echo ''

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

\echo ''

-- 8. Testar se RLS está ativo
\echo '8️⃣ Status do RLS:'
\echo ''

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

\echo ''
\echo '═══════════════════════════════════════════════════════'
\echo '✅ DIAGNÓSTICO COMPLETO'
\echo '═══════════════════════════════════════════════════════'
\echo ''
\echo '📋 CHECKLIST:'
\echo '  □ Igreja "Sem igreja" existe?'
\echo '  □ 4 políticas RLS em events?'
\echo '  □ Usuário dpaulax@gmail.com sem church_id?'
\echo '  □ Função get_user_church_id existe?'
\echo '  □ RLS está ativo em events?'
\echo ''
\echo 'Se TODOS forem ✅, o problema está no código frontend!'
\echo 'Se ALGUM for ❌, execute APLICAR_EVENTOS_PESSOAIS_COMPLETO.sql'
\echo ''
\echo '═══════════════════════════════════════════════════════'
