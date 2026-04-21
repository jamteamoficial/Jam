-- Columna `color` en comunidades (idempotente por si la tabla existía sin esta columna).
-- Si PostgREST sigue sin ver la columna: Supabase Dashboard → Project Settings → API → "Reload schema".

ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS color text;

COMMENT ON COLUMN public.communities.color IS 'Token de tema UI (p. ej. purple = marca naranja).';
