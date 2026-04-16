-- Comunidades + membresía + chat público (dentro de la comunidad)

CREATE TABLE IF NOT EXISTS public.communities (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_members (
  community_id text NOT NULL REFERENCES public.communities (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members (user_id);

CREATE TABLE IF NOT EXISTS public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id text NOT NULL REFERENCES public.communities (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_messages_community_created
  ON public.community_messages (community_id, created_at DESC);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Communities: lectura para usuarios autenticados
DROP POLICY IF EXISTS "communities_select_authenticated" ON public.communities;
CREATE POLICY "communities_select_authenticated"
  ON public.communities FOR SELECT
  TO authenticated
  USING (true);

-- Crear comunidad: cualquier usuario autenticado (Beta)
DROP POLICY IF EXISTS "communities_insert_authenticated" ON public.communities;
CREATE POLICY "communities_insert_authenticated"
  ON public.communities FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Members: lectura pública autenticada
DROP POLICY IF EXISTS "community_members_select_authenticated" ON public.community_members;
CREATE POLICY "community_members_select_authenticated"
  ON public.community_members FOR SELECT
  TO authenticated
  USING (true);

-- Unirse: solo puedes insertar tu propio user_id
DROP POLICY IF EXISTS "community_members_insert_self" ON public.community_members;
CREATE POLICY "community_members_insert_self"
  ON public.community_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Salirse: solo puedes borrar tu propia membresía
DROP POLICY IF EXISTS "community_members_delete_self" ON public.community_members;
CREATE POLICY "community_members_delete_self"
  ON public.community_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Mensajes: solo miembros pueden leer/escribir
DROP POLICY IF EXISTS "community_messages_select_members" ON public.community_messages;
CREATE POLICY "community_messages_select_members"
  ON public.community_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.community_members cm
      WHERE cm.community_id = community_messages.community_id
        AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "community_messages_insert_members" ON public.community_messages;
CREATE POLICY "community_messages_insert_members"
  ON public.community_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.community_members cm
      WHERE cm.community_id = community_messages.community_id
        AND cm.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.community_messages IS 'Chat de comunidad (no es DM 1:1).';
