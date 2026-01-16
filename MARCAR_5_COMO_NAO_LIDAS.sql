-- ============================================
-- MARCAR 5 NOTIFICAÇÕES COMO NÃO LIDAS
-- Execute no SQL Editor do Supabase
-- ============================================

-- Marcar as 5 notificações mais recentes como NÃO LIDAS
UPDATE public.notifications
SET read = false
WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81'
AND id IN (
  SELECT id
  FROM public.notifications
  WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81'
  ORDER BY created_at DESC
  LIMIT 5
);

-- Verificar quantas foram marcadas como não lidas
SELECT COUNT(*) as total_nao_lidas
FROM public.notifications
WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81'
AND read = false;
