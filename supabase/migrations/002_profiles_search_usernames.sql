-- Ejecutar en Supabase SQL Editor (o supabase db push).
-- Permite buscar perfiles entre usuarios autenticados y guardar datos extra del formulario Mi perfil.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS ciudad text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS instrumentos text[];

-- Lectura de cualquier perfil por usuarios logueados (búsqueda / ver perfil público)
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;
CREATE POLICY "Authenticated can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON COLUMN public.profiles.username IS 'Identificador único legible para búsqueda (ej. parte del email)';
