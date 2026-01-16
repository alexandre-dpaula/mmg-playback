-- ============================================
-- VERIFICAR STATUS DAS NOTIFICAÇÕES
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. VER TODAS AS NOTIFICAÇÕES COM STATUS DE LEITURA
SELECT
  id,
  title,
  read,  -- ← IMPORTANTE: Verificar se está FALSE
  created_at
FROM public.notifications
ORDER BY created_at DESC;


-- 2. CONTAR QUANTAS ESTÃO LIDAS vs NÃO LIDAS
SELECT
  read,
  COUNT(*) as quantidade
FROM public.notifications
GROUP BY read;


-- 3. SE TODAS ESTIVEREM LIDAS (read = true), MARQUE COMO NÃO LIDAS
-- Descomente as linhas abaixo para executar:
/*
UPDATE public.notifications
SET read = false
WHERE read = true;
*/


-- 4. VERIFICAR SEU CHURCH_ID E COMPARAR COM AS NOTIFICAÇÕES
SELECT
  'Meu church_id:' as tipo,
  u.church_id as id
FROM public.users_app u
WHERE u.auth_user_id = auth.uid()

UNION ALL

SELECT
  'Notificações church_id:' as tipo,
  DISTINCT church_id as id
FROM public.notifications;
