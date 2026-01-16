-- ============================================
-- BACKUP DAS POLÍTICAS RLS ATUAIS
-- Este script SALVA as políticas atuais
-- Execute ANTES de aplicar RLS_SEGURO_FINAL.sql
-- ============================================

-- INSTRUÇÕES:
-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Copie TODA a saída e salve em um arquivo .txt
-- 3. Se algo der errado, você pode recriar as políticas antigas

-- GERAR SCRIPT DE RESTORE AUTOMÁTICO
SELECT
  'DROP POLICY IF EXISTS "' || policyname || '" ON ' || schemaname || '.' || tablename || ';' || E'\n' ||
  CASE cmd
    WHEN 'SELECT' THEN 'CREATE POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename || ' FOR SELECT TO ' ||
                       COALESCE(roles::text, 'public') || ' USING (' || qual::text || ');'
    WHEN 'INSERT' THEN 'CREATE POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename || ' FOR INSERT TO ' ||
                       COALESCE(roles::text, 'public') ||
                       CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check::text || ')' ELSE '' END || ';'
    WHEN 'UPDATE' THEN 'CREATE POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename || ' FOR UPDATE TO ' ||
                       COALESCE(roles::text, 'public') ||
                       ' USING (' || qual::text || ')' ||
                       CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check::text || ')' ELSE '' END || ';'
    WHEN 'DELETE' THEN 'CREATE POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename || ' FOR DELETE TO ' ||
                       COALESCE(roles::text, 'public') || ' USING (' || qual::text || ');'
    ELSE '-- Unknown command: ' || cmd::text
  END as restore_script
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users_app', 'profiles', 'events', 'event_members', 'event_tracks', 'notifications', 'churches', 'tracks')
ORDER BY tablename, cmd;


-- VERIFICAÇÃO VISUAL DAS POLÍTICAS ATUAIS
SELECT
  tablename,
  policyname,
  cmd::text as operacao,
  qual::text as condicao
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users_app', 'profiles', 'events', 'event_members', 'event_tracks', 'notifications', 'churches', 'tracks')
ORDER BY tablename, cmd;
