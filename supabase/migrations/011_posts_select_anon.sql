-- Feed público: visitantes (rol anon) pueden leer publicaciones (solo SELECT).
-- Insert/update/delete siguen restringidos a autenticados (políticas existentes).
DROP POLICY IF EXISTS "posts_select_anon_read" ON public.posts;
CREATE POLICY "posts_select_anon_read"
  ON public.posts FOR SELECT
  TO anon
  USING (true);
