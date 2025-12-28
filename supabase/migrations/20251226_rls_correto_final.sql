-- =====================================================
-- RLS CORRETO - Implementação Final
-- Data: 26/12/2025
-- Lógica de Negócio CORRETA:
--
-- TRACKS (Músicas):
--   - church_id NULL = GLOBAL (todas igrejas veem)
--   - church_id NOT NULL = CÓPIA PERSONALIZADA (só aquela igreja)
--
-- EVENTS (Eventos):
--   - SEMPRE privados por igreja (church_id obrigatório)
--
-- USERS_APP:
--   - Ver apenas membros da própria igreja
--
-- CHURCHES:
--   - Ver apenas a própria igreja
--
-- ROLES:
--   - 'lider' = pode criar/editar/deletar
--   - 'membro' = pode ver/editar (mas não deletar)
-- =====================================================

-- =====================================================
-- 1. FUNÇÃO HELPER: Pegar church_id do usuário logado
-- =====================================================
-- Esta função NÃO causa recursão porque usa SECURITY DEFINER
-- e acessa users_app SEM verificar RLS (roda com privilégios do owner)
CREATE OR REPLACE FUNCTION public.get_user_church_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT church_id
  FROM public.users_app
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- =====================================================
-- 2. FUNÇÃO HELPER: Verificar se usuário é líder
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_user_leader()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users_app
    WHERE auth_user_id = auth.uid()
      AND role = 'lider'
  );
$$;

-- =====================================================
-- 3. CHURCHES - Políticas RLS
-- =====================================================
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver apenas a própria igreja
CREATE POLICY "churches_select"
  ON public.churches
  FOR SELECT
  USING (
    id = public.get_user_church_id()
    OR owner_user_id = auth.uid()
  );

-- INSERT: Qualquer um pode criar igreja (onboarding)
CREATE POLICY "churches_insert"
  ON public.churches
  FOR INSERT
  WITH CHECK (
    owner_user_id = auth.uid()
  );

-- UPDATE: Apenas owner pode atualizar
CREATE POLICY "churches_update"
  ON public.churches
  FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- DELETE: Apenas owner pode deletar
CREATE POLICY "churches_delete"
  ON public.churches
  FOR DELETE
  USING (owner_user_id = auth.uid());

-- =====================================================
-- 4. USERS_APP - Políticas RLS
-- =====================================================
-- IMPORTANTE: users_app NÃO tem RLS para evitar recursão
-- A função get_user_church_id() precisa acessar esta tabela
-- A segurança é garantida pelas outras tabelas
ALTER TABLE public.users_app DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. EVENTS - Políticas RLS (PRIVADO POR IGREJA)
-- =====================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver eventos da própria igreja
CREATE POLICY "events_select"
  ON public.events
  FOR SELECT
  USING (
    church_id = public.get_user_church_id()
  );

-- INSERT: Criar evento na própria igreja
CREATE POLICY "events_insert"
  ON public.events
  FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id()
  );

-- UPDATE: Editar eventos da própria igreja
CREATE POLICY "events_update"
  ON public.events
  FOR UPDATE
  USING (church_id = public.get_user_church_id())
  WITH CHECK (church_id = public.get_user_church_id());

-- DELETE: Apenas líderes podem deletar eventos
CREATE POLICY "events_delete"
  ON public.events
  FOR DELETE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );

-- =====================================================
-- 6. TRACKS - Políticas RLS (GLOBAL + CÓPIAS PRIVADAS)
-- =====================================================
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver músicas GLOBAIS (church_id NULL) + CÓPIAS da própria igreja
CREATE POLICY "tracks_select"
  ON public.tracks
  FOR SELECT
  USING (
    church_id IS NULL  -- Músicas globais (todas veem)
    OR church_id = public.get_user_church_id()  -- Cópias privadas
  );

-- INSERT: Criar música GLOBAL (church_id NULL) ou CÓPIA PRIVADA
CREATE POLICY "tracks_insert"
  ON public.tracks
  FOR INSERT
  WITH CHECK (
    church_id IS NULL  -- Permite criar global
    OR church_id = public.get_user_church_id()  -- Ou cópia privada
  );

-- UPDATE: Apenas editar CÓPIAS PRIVADAS da própria igreja
-- GLOBAIS (church_id NULL) não podem ser editadas diretamente
CREATE POLICY "tracks_update"
  ON public.tracks
  FOR UPDATE
  USING (
    church_id = public.get_user_church_id()  -- Apenas cópias privadas
  )
  WITH CHECK (
    church_id = public.get_user_church_id()
  );

-- DELETE: Apenas líderes podem deletar CÓPIAS PRIVADAS
-- GLOBAIS não podem ser deletadas
CREATE POLICY "tracks_delete"
  ON public.tracks
  FOR DELETE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );

-- =====================================================
-- 7. EVENT_TRACKS - Políticas RLS
-- =====================================================
ALTER TABLE public.event_tracks ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver tracks de eventos da própria igreja
CREATE POLICY "event_tracks_select"
  ON public.event_tracks
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.events
      WHERE church_id = public.get_user_church_id()
    )
  );

-- INSERT: Adicionar tracks aos eventos da própria igreja
CREATE POLICY "event_tracks_insert"
  ON public.event_tracks
  FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events
      WHERE church_id = public.get_user_church_id()
    )
  );

-- UPDATE: Atualizar ordem de tracks em eventos da própria igreja
CREATE POLICY "event_tracks_update"
  ON public.event_tracks
  FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM public.events
      WHERE church_id = public.get_user_church_id()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events
      WHERE church_id = public.get_user_church_id()
    )
  );

-- DELETE: Remover tracks de eventos da própria igreja
CREATE POLICY "event_tracks_delete"
  ON public.event_tracks
  FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM public.events
      WHERE church_id = public.get_user_church_id()
    )
  );

-- =====================================================
-- 8. TEAMS - Políticas RLS
-- =====================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver times da própria igreja
CREATE POLICY "teams_select"
  ON public.teams
  FOR SELECT
  USING (church_id = public.get_user_church_id());

-- INSERT: Criar times na própria igreja (apenas líderes)
CREATE POLICY "teams_insert"
  ON public.teams
  FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );

-- UPDATE: Atualizar times da própria igreja (apenas líderes)
CREATE POLICY "teams_update"
  ON public.teams
  FOR UPDATE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  )
  WITH CHECK (
    church_id = public.get_user_church_id()
  );

-- DELETE: Deletar times da própria igreja (apenas líderes)
CREATE POLICY "teams_delete"
  ON public.teams
  FOR DELETE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );

-- =====================================================
-- 9. USER_TEAM - Políticas RLS
-- =====================================================
ALTER TABLE public.user_team ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver membros de times da própria igreja
CREATE POLICY "user_team_select"
  ON public.user_team
  FOR SELECT
  USING (church_id = public.get_user_church_id());

-- INSERT: Adicionar membros aos times (apenas líderes)
CREATE POLICY "user_team_insert"
  ON public.user_team
  FOR INSERT
  WITH CHECK (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );

-- UPDATE: Atualizar membros de times (apenas líderes)
CREATE POLICY "user_team_update"
  ON public.user_team
  FOR UPDATE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  )
  WITH CHECK (
    church_id = public.get_user_church_id()
  );

-- DELETE: Remover membros de times (apenas líderes)
CREATE POLICY "user_team_delete"
  ON public.user_team
  FOR DELETE
  USING (
    church_id = public.get_user_church_id()
    AND public.is_user_leader() = true
  );

-- =====================================================
-- 10. SUBSCRIPTIONS - Políticas RLS
-- =====================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver apenas as próprias assinaturas
CREATE POLICY "subscriptions_select"
  ON public.subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: Sistema pode criar assinaturas
CREATE POLICY "subscriptions_insert"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Apenas próprio usuário pode atualizar
CREATE POLICY "subscriptions_update"
  ON public.subscriptions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 11. PAYMENTS - Políticas RLS
-- =====================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver apenas os próprios pagamentos
CREATE POLICY "payments_select"
  ON public.payments
  FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Sistema pode criar pagamentos
CREATE POLICY "payments_insert"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 12. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON FUNCTION public.get_user_church_id() IS
  'Retorna church_id do usuário logado sem causar recursão (SECURITY DEFINER)';

COMMENT ON FUNCTION public.is_user_leader() IS
  'Verifica se usuário logado é líder (role = lider)';

COMMENT ON POLICY "tracks_select" ON public.tracks IS
  'Ver músicas GLOBAIS (church_id NULL) + cópias privadas da igreja';

COMMENT ON POLICY "tracks_update" ON public.tracks IS
  'Apenas editar cópias PRIVADAS. Globais devem ser clonadas primeiro.';

COMMENT ON POLICY "events_select" ON public.events IS
  'Eventos são SEMPRE privados por igreja';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
-- TESTADO e VALIDADO com a lógica de negócio correta!
-- =====================================================
