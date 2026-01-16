-- ============================================
-- POLÍTICAS RLS SEGURAS - ISOLAMENTO POR IGREJA
-- Execute no SQL Editor do Supabase
-- ============================================

-- IMPORTANTE: Este SQL implementa segurança adequada
-- garantindo que usuários só acessem dados de sua igreja


-- 1. TABELA users_app
-- ============================================
-- Qualquer usuário autenticado pode ler usuários (para convites, etc)
-- Mas só pode modificar seu próprio registro
DROP POLICY IF EXISTS "users_app_select_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_update_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_insert_policy" ON public.users_app;
DROP POLICY IF EXISTS "users_app_delete_policy" ON public.users_app;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users_app;
DROP POLICY IF EXISTS "Users can update own record" ON public.users_app;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users_app;

CREATE POLICY "users_app_select_policy"
ON public.users_app FOR SELECT TO authenticated
USING (true);

CREATE POLICY "users_app_update_policy"
ON public.users_app FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "users_app_insert_policy"
ON public.users_app FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "users_app_delete_policy"
ON public.users_app FOR DELETE TO authenticated
USING (auth_user_id = auth.uid());


-- 2. TABELA profiles
-- ============================================
-- Usuários podem ver todos os perfis (para @ mentions, etc)
-- Mas só podem modificar o próprio
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_policy"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete_policy"
ON public.profiles FOR DELETE TO authenticated
USING (id = auth.uid());


-- 3. TABELA events - ISOLAMENTO POR IGREJA
-- ============================================
-- Usuários só veem eventos de sua igreja
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.events;

-- SELECT: Ver apenas eventos da própria igreja
CREATE POLICY "events_select_policy"
ON public.events FOR SELECT TO authenticated
USING (
  church_id IN (
    SELECT church_id
    FROM public.users_app
    WHERE auth_user_id = auth.uid()
  )
);

-- INSERT: Só pode criar eventos para sua igreja
CREATE POLICY "events_insert_policy"
ON public.events FOR INSERT TO authenticated
WITH CHECK (
  church_id IN (
    SELECT church_id
    FROM public.users_app
    WHERE auth_user_id = auth.uid()
  )
);

-- UPDATE: Só pode atualizar eventos da sua igreja
CREATE POLICY "events_update_policy"
ON public.events FOR UPDATE TO authenticated
USING (
  church_id IN (
    SELECT church_id
    FROM public.users_app
    WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  church_id IN (
    SELECT church_id
    FROM public.users_app
    WHERE auth_user_id = auth.uid()
  )
);

-- DELETE: Só pode deletar eventos da sua igreja
CREATE POLICY "events_delete_policy"
ON public.events FOR DELETE TO authenticated
USING (
  church_id IN (
    SELECT church_id
    FROM public.users_app
    WHERE auth_user_id = auth.uid()
  )
);


-- 4. TABELA event_members - ISOLAMENTO POR EVENTO
-- ============================================
-- Usuários só veem membros de eventos de sua igreja
DROP POLICY IF EXISTS "event_members_select_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_insert_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_update_policy" ON public.event_members;
DROP POLICY IF EXISTS "event_members_delete_policy" ON public.event_members;

CREATE POLICY "event_members_select_policy"
ON public.event_members FOR SELECT TO authenticated
USING (
  event_id IN (
    SELECT id FROM public.events
    WHERE church_id IN (
      SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "event_members_insert_policy"
ON public.event_members FOR INSERT TO authenticated
WITH CHECK (
  event_id IN (
    SELECT id FROM public.events
    WHERE church_id IN (
      SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "event_members_update_policy"
ON public.event_members FOR UPDATE TO authenticated
USING (
  event_id IN (
    SELECT id FROM public.events
    WHERE church_id IN (
      SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "event_members_delete_policy"
ON public.event_members FOR DELETE TO authenticated
USING (
  event_id IN (
    SELECT id FROM public.events
    WHERE church_id IN (
      SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
    )
  )
);


-- 5. TABELA event_tracks - ISOLAMENTO POR EVENTO
-- ============================================
DROP POLICY IF EXISTS "event_tracks_select_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_insert_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_update_policy" ON public.event_tracks;
DROP POLICY IF EXISTS "event_tracks_delete_policy" ON public.event_tracks;

CREATE POLICY "event_tracks_select_policy"
ON public.event_tracks FOR SELECT TO authenticated
USING (
  event_id IN (
    SELECT id FROM public.events
    WHERE church_id IN (
      SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "event_tracks_insert_policy"
ON public.event_tracks FOR INSERT TO authenticated
WITH CHECK (
  event_id IN (
    SELECT id FROM public.events
    WHERE church_id IN (
      SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "event_tracks_update_policy"
ON public.event_tracks FOR UPDATE TO authenticated
USING (
  event_id IN (
    SELECT id FROM public.events
    WHERE church_id IN (
      SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "event_tracks_delete_policy"
ON public.event_tracks FOR DELETE TO authenticated
USING (
  event_id IN (
    SELECT id FROM public.events
    WHERE church_id IN (
      SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
    )
  )
);


-- 6. TABELA notifications - ISOLAMENTO POR IGREJA
-- ============================================
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.notifications;

CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "notifications_update_policy"
ON public.notifications FOR UPDATE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "notifications_insert_policy"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "notifications_delete_policy"
ON public.notifications FOR DELETE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);


-- 7. TABELA churches - ACESSO CONTROLADO
-- ============================================
-- Usuários podem ver apenas sua própria igreja
DROP POLICY IF EXISTS "churches_select_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_update_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_insert_policy" ON public.churches;
DROP POLICY IF EXISTS "churches_delete_policy" ON public.churches;

CREATE POLICY "churches_select_policy"
ON public.churches FOR SELECT TO authenticated
USING (
  id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

-- Apenas líderes podem atualizar dados da igreja
CREATE POLICY "churches_update_policy"
ON public.churches FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT church_id FROM public.users_app
    WHERE auth_user_id = auth.uid() AND role = 'lider'
  )
)
WITH CHECK (
  id IN (
    SELECT church_id FROM public.users_app
    WHERE auth_user_id = auth.uid() AND role = 'lider'
  )
);

-- Usuários podem criar igrejas (para onboarding)
CREATE POLICY "churches_insert_policy"
ON public.churches FOR INSERT TO authenticated
WITH CHECK (true);

-- Apenas líderes podem deletar igrejas
CREATE POLICY "churches_delete_policy"
ON public.churches FOR DELETE TO authenticated
USING (
  id IN (
    SELECT church_id FROM public.users_app
    WHERE auth_user_id = auth.uid() AND role = 'lider'
  )
);


-- 8. TABELA tracks - ACESSO POR IGREJA
-- ============================================
DROP POLICY IF EXISTS "tracks_select_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_insert_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_update_policy" ON public.tracks;
DROP POLICY IF EXISTS "tracks_delete_policy" ON public.tracks;

CREATE POLICY "tracks_select_policy"
ON public.tracks FOR SELECT TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "tracks_insert_policy"
ON public.tracks FOR INSERT TO authenticated
WITH CHECK (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "tracks_update_policy"
ON public.tracks FOR UPDATE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "tracks_delete_policy"
ON public.tracks FOR DELETE TO authenticated
USING (
  church_id IN (
    SELECT church_id FROM public.users_app WHERE auth_user_id = auth.uid()
  )
);


-- 9. VERIFICAÇÃO DE SEGURANÇA
-- ============================================
SELECT
  tablename,
  policyname,
  cmd::text as operacao,
  CASE
    WHEN qual::text LIKE '%church_id%' THEN '🔒 SEGURO (isolamento por igreja)'
    WHEN qual::text LIKE '%auth.uid()%' THEN '🔒 SEGURO (isolamento por usuário)'
    WHEN qual::text LIKE '%true%' THEN '⚠️  PERMISSIVO (todos autenticados)'
    ELSE '❓ REVISAR'
  END as nivel_seguranca
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users_app', 'profiles', 'events', 'event_members', 'event_tracks', 'notifications', 'churches', 'tracks')
ORDER BY tablename, cmd;
