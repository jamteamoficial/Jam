-- Permitir búsqueda de perfiles aunque no tengan publicaciones.
-- Esto habilita lectura pública (anon + authenticated) en public.profiles.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can read all profiles" ON public.profiles;

CREATE POLICY "Public can read all profiles"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);
