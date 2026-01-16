-- ============================================
-- SCRIPT DE VERIFICAÇÃO DE SEGURANÇA
-- Execute periodicamente no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR RLS ATIVO EM TODAS AS TABELAS
-- ============================================
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_ativo,
  CASE
    WHEN rowsecurity = true THEN '✅ RLS Ativo'
    ELSE '🚨 RLS DESATIVADO - URGENTE!'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY rowsecurity, tablename;


-- 2. LISTAR POLÍTICAS POR TABELA
-- ============================================
SELECT
  tablename,
  COUNT(*) as total_policies,
  STRING_AGG(DISTINCT cmd::text, ', ') as operacoes_protegidas
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_policies DESC;


-- 3. VERIFICAR POLÍTICAS PERMISSIVAS (POTENCIALMENTE INSEGURAS)
-- ============================================
SELECT
  tablename,
  policyname,
  cmd as operacao,
  qual::text as condicao_using,
  CASE
    WHEN qual::text = 'true' THEN '⚠️  PERMISSIVO - Revisar se é intencional'
    WHEN qual::text LIKE '%church_id%' THEN '✅ SEGURO - Isolamento por igreja'
    WHEN qual::text LIKE '%auth.uid%' THEN '✅ SEGURO - Isolamento por usuário'
    ELSE '❓ REVISAR - Política desconhecida'
  END as avaliacao_seguranca
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY
  CASE
    WHEN qual::text = 'true' THEN 1
    ELSE 2
  END,
  tablename;


-- 4. VERIFICAR TABELAS SEM POLÍTICAS
-- ============================================
SELECT
  t.tablename,
  '🚨 TABELA SEM POLÍTICAS RLS!' as alerta
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public'
AND t.tablename NOT LIKE 'pg_%'
AND p.policyname IS NULL
GROUP BY t.tablename
ORDER BY t.tablename;


-- 5. VERIFICAR USUÁRIOS COM PERMISSÕES ELEVADAS
-- ============================================
SELECT
  ua.full_name,
  ua.email,
  ua.role,
  c.name as igreja,
  ua.created_at,
  CASE
    WHEN ua.role = 'lider' THEN '⚠️  Líder - Pode modificar igreja'
    ELSE '✅ Membro regular'
  END as nivel_acesso
FROM public.users_app ua
LEFT JOIN public.churches c ON c.id = ua.church_id
WHERE ua.role = 'lider'
ORDER BY ua.created_at DESC;


-- 6. AUDITORIA DE CRIAÇÃO DE REGISTROS RECENTES
-- ============================================
-- Eventos criados nas últimas 24h
SELECT
  'Eventos' as tipo,
  e.id,
  e.title as nome,
  c.name as igreja,
  e.created_at,
  ua.email as criado_por
FROM public.events e
LEFT JOIN public.churches c ON c.id = e.church_id
LEFT JOIN public.users_app ua ON ua.church_id = e.church_id
WHERE e.created_at > NOW() - INTERVAL '24 hours'
ORDER BY e.created_at DESC
LIMIT 10;


-- 7. VERIFICAR CHURCH_ID NULL (POTENCIAL PROBLEMA)
-- ============================================
-- Usuários sem igreja atribuída
SELECT
  'Usuários sem igreja' as alerta,
  COUNT(*) as total
FROM public.users_app
WHERE church_id IS NULL;

-- Eventos sem igreja (NÃO DEVE EXISTIR!)
SELECT
  'Eventos sem igreja' as alerta,
  COUNT(*) as total
FROM public.events
WHERE church_id IS NULL;

-- Tracks sem igreja
SELECT
  'Músicas sem igreja' as alerta,
  COUNT(*) as total
FROM public.tracks
WHERE church_id IS NULL;


-- 8. VERIFICAR ÍNDICES DE PERFORMANCE/SEGURANÇA
-- ============================================
-- Índices nas colunas críticas de segurança
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND (
  indexdef LIKE '%church_id%'
  OR indexdef LIKE '%auth_user_id%'
  OR indexdef LIKE '%user_id%'
)
ORDER BY tablename;


-- 9. RELATÓRIO RESUMIDO DE SEGURANÇA
-- ============================================
SELECT
  '🔐 RESUMO DE SEGURANÇA' as relatorio,
  (
    SELECT COUNT(*)
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND rowsecurity = true
  ) as tabelas_com_rls,
  (
    SELECT COUNT(*)
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND rowsecurity = false
  ) as tabelas_sem_rls,
  (
    SELECT COUNT(*)
    FROM pg_policies
    WHERE schemaname = 'public'
  ) as total_policies,
  (
    SELECT COUNT(*)
    FROM public.users_app
    WHERE role = 'lider'
  ) as total_lideres;
