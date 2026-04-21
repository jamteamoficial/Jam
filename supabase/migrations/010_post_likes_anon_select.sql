-- Conteo de likes en el feed para visitantes sin sesión (SELECT; insert/delete siguen autenticados).
DROP POLICY IF EXISTS "post_likes_select_anon_read" ON public.post_likes;
CREATE POLICY "post_likes_select_anon_read"
  ON public.post_likes FOR SELECT
  TO anon
  USING (true);
