-- =============================================================================
-- JAM — Tabla public.profiles + RLS + trigger (equivalente migraciones 001 + 002)
-- Copiar y pegar en: Supabase → SQL Editor → Run
-- Requisito: proyecto con auth.users (Supabase Auth activo)
-- =============================================================================

-- Tabla principal (todas las columnas que usa el código: búsqueda, chats, Mi perfil)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  bio text,
  ciudad text,
  instrumentos text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfil público por usuario; id = auth.users.id';
COMMENT ON COLUMN public.profiles.username IS 'Identificador legible único (búsqueda)';
COMMENT ON COLUMN public.profiles.instrumentos IS 'Lista de instrumentos (tags)';

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Quitar políticas previas si re-ejecutas el script
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;

-- Lectura: cualquier usuario logueado puede ver perfiles (necesario para el buscador y /usuario/[id])
CREATE POLICY "Authenticated can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo el dueño puede insertar su fila
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Solo el dueño puede actualizar
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Opcional: permitir borrar el propio perfil (cascada desde auth en general)
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Sincronizar fila al registrarse (Google / email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
