-- ============================================
-- FIX BADGE PARA IGREJA "GRAÇA E PAZ"
-- church_id: 6cb2a139-a860-4fc0-9c98-3dabc3888f81
-- ============================================

-- 1. VER NOTIFICAÇÕES EXISTENTES
-- ============================================
SELECT
  id,
  title,
  message,
  read,
  created_at
FROM public.notifications
WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81'
ORDER BY created_at DESC;


-- 2. CONTAR NÃO LIDAS
-- ============================================
SELECT
  COUNT(*) as total_nao_lidas
FROM public.notifications
WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81'
AND read = false;


-- 3. MARCAR TODAS COMO NÃO LIDAS
-- ============================================
UPDATE public.notifications
SET read = false
WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81';


-- 4. VERIFICAR APÓS UPDATE
-- ============================================
SELECT
  'Notificações não lidas após update:' as info,
  COUNT(*) as total
FROM public.notifications
WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81'
AND read = false;


-- 5. SE NÃO HOUVER NOTIFICAÇÕES, CRIAR ALGUMAS DE TESTE
-- ============================================
-- Descomente para criar:
/*
INSERT INTO public.notifications (church_id, title, message, type, read, metadata)
VALUES
  ('6cb2a139-a860-4fc0-9c98-3dabc3888f81', '🎉 Sistema de Notificações Ativado!', 'O badge vermelho deve aparecer agora no sino!', 'success', false, '{"test": true}'),
  ('6cb2a139-a860-4fc0-9c98-3dabc3888f81', '🎵 Nova Música Adicionada', 'Canção "Graça" foi adicionada ao repertório', 'info', false, '{"track_id": "test"}'),
  ('6cb2a139-a860-4fc0-9c98-3dabc3888f81', '📅 Ensaio Amanhã', 'Não esqueça: ensaio amanhã às 19h', 'warning', false, '{"event_id": "test"}');
*/


-- 6. VERIFICAR RESULTADO FINAL
-- ============================================
SELECT
  id,
  title,
  read,
  created_at
FROM public.notifications
WHERE church_id = '6cb2a139-a860-4fc0-9c98-3dabc3888f81'
ORDER BY created_at DESC;
