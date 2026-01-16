-- =====================================================
-- DIAGNÓSTICO DE SEGURANÇA - EVENTS
-- =====================================================
-- Execute estas queries no Supabase SQL Editor para diagnosticar
-- =====================================================

-- 1. VERIFICAR SE COLUNA church_id EXISTE
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'events'
  AND column_name = 'church_id';
-- ESPERADO: Retornar 1 linha com church_id | uuid | NO

-- 2. VERIFICAR EVENTOS SEM IGREJA (VULNERABILIDADE!)
SELECT COUNT(*) as eventos_sem_igreja
FROM public.events
WHERE church_id IS NULL;
-- ESPERADO: 0 (zero eventos sem igreja)

-- 3. DISTRIBUIÇÃO DE EVENTOS POR IGREJA
SELECT
  c.name as igreja,
  c.id as church_id,
  COUNT(e.id) as total_eventos
FROM public.churches c
LEFT JOIN public.events e ON e.church_id = c.id
GROUP BY c.id, c.name
ORDER BY total_eventos DESC;
-- ESPERADO: Ver quantos eventos cada igreja tem

-- 4. VERIFICAR SE RLS ESTÁ ATIVADO
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'events';
-- ESPERADO: rowsecurity = true

-- 5. LISTAR POLÍTICAS RLS ATIVAS
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'events';
-- ESPERADO: 4 políticas (select, insert, update, delete)

-- 6. VERIFICAR FUNÇÃO get_user_church_id
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'get_user_church_id';
-- ESPERADO: Retornar a função

-- 7. TESTE DE ISOLAMENTO (Execute como usuário normal)
-- Esta query deve retornar APENAS eventos da igreja do usuário logado
SELECT
  e.id,
  e.name,
  e.date,
  e.church_id,
  c.name as igreja_nome
FROM public.events e
JOIN public.churches c ON c.id = e.church_id;
-- ESPERADO: Apenas eventos da SUA igreja

-- 8. VERIFICAR USERS_APP (church_id dos usuários)
SELECT
  u.id,
  u.full_name,
  u.email,
  u.church_id,
  c.name as igreja_nome,
  u.role
FROM public.users_app u
LEFT JOIN public.churches c ON c.id = u.church_id;
-- ESPERADO: Cada usuário com seu church_id correto

-- 9. TESTE DE SEGURANÇA: Tentar ver eventos de outra igreja
-- (Esta query deve falhar ou retornar vazio se RLS estiver correto)
SELECT COUNT(*) as eventos_visiveis
FROM public.events;
-- ESPERADO: Apenas a contagem de eventos da SUA igreja

-- 10. VERIFICAR ESTRUTURA COMPLETA DA TABELA EVENTS
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'events'
ORDER BY ordinal_position;
-- ESPERADO: Ver todas as colunas incluindo church_id

-- =====================================================
-- RESUMO DO PROBLEMA IDENTIFICADO
-- =====================================================
/*
PROBLEMA:
- Tabela 'events' não tinha coluna 'church_id'
- Eventos estavam sendo compartilhados entre todas as igrejas
- Vazamento de dados entre organizações diferentes

SOLUÇÃO:
1. Adicionar coluna church_id à tabela events
2. Associar eventos existentes a uma igreja
3. Tornar church_id obrigatório (NOT NULL)
4. Recriar políticas RLS corretas
5. Testar isolamento entre igrejas

STATUS: Aguardando aplicação da correção
*/

-- =====================================================
-- APLICAR CORREÇÃO
-- =====================================================
-- Execute o arquivo: CORRECAO_URGENTE_EVENTS_CHURCH_ID.sql
-- Depois execute este diagnóstico novamente para validar
