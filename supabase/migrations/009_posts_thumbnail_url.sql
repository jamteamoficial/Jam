-- Miniatura / foto obligatoria para posts solo texto; portada opcional para video.
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

COMMENT ON COLUMN public.posts.thumbnail_url IS 'URL pública de miniatura (feed). Texto+solo imagen: obligatoria. Video: opcional o primer frame.';
