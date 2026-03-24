-- ============================================================
-- JAM — Tablas: comunidad_miembros + notificaciones_jams
-- Ejecutar en el SQL Editor de Supabase (Dashboard → SQL → New query)
-- Requiere extensión pgcrypto para gen_random_uuid() (habilitada por defecto en Supabase)
-- ============================================================

-- ------------------------------------------------------------
-- 1) Miembros de comunidades (sin duplicar usuario + comunidad)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comunidad_miembros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidad_id TEXT NOT NULL,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_union TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT comunidad_miembros_unique_miembro UNIQUE (comunidad_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_comunidad_miembros_comunidad_id
  ON public.comunidad_miembros (comunidad_id);

CREATE INDEX IF NOT EXISTS idx_comunidad_miembros_usuario_id
  ON public.comunidad_miembros (usuario_id);

ALTER TABLE public.comunidad_miembros ENABLE ROW LEVEL SECURITY;

-- Lectura: el usuario ve sus propias filas y puede ver quién está en una comunidad (usuarios autenticados)
CREATE POLICY "comunidad_miembros_select"
  ON public.comunidad_miembros
  FOR SELECT
  TO authenticated
  USING (true);

-- Alta: solo puedo apuntarme yo mismo como miembro
CREATE POLICY "comunidad_miembros_insert_own"
  ON public.comunidad_miembros
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- Baja: solo puedo salir yo mismo
CREATE POLICY "comunidad_miembros_delete_own"
  ON public.comunidad_miembros
  FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

-- (Opcional) Actualizar fecha_union solo el propio usuario — poco habitual; omitido

COMMENT ON TABLE public.comunidad_miembros IS 'Relación usuario ↔ comunidad (texto id de comunidad en la app)';

-- ------------------------------------------------------------
-- 2) Notificaciones tipo solicitud JAM entre músicos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notificaciones_jams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receptor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aceptado', 'rechazado')),
  fecha_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notificaciones_jams_distinct_users CHECK (emisor_id <> receptor_id)
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_jams_receptor
  ON public.notificaciones_jams (receptor_id, estado);

CREATE INDEX IF NOT EXISTS idx_notificaciones_jams_emisor
  ON public.notificaciones_jams (emisor_id);

ALTER TABLE public.notificaciones_jams ENABLE ROW LEVEL SECURITY;

-- Ver filas donde soy emisor o receptor
CREATE POLICY "notificaciones_jams_select_participants"
  ON public.notificaciones_jams
  FOR SELECT
  TO authenticated
  USING (auth.uid() = emisor_id OR auth.uid() = receptor_id);

-- Crear solicitud solo como emisor
CREATE POLICY "notificaciones_jams_insert_as_emisor"
  ON public.notificaciones_jams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = emisor_id);

-- Actualizar estado solo como receptor (aceptar / rechazar)
CREATE POLICY "notificaciones_jams_update_as_receptor"
  ON public.notificaciones_jams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receptor_id)
  WITH CHECK (auth.uid() = receptor_id);

-- El emisor puede cancelar borrando su envío (opcional)
CREATE POLICY "notificaciones_jams_delete_emisor_or_receptor"
  ON public.notificaciones_jams
  FOR DELETE
  TO authenticated
  USING (auth.uid() = emisor_id OR auth.uid() = receptor_id);

COMMENT ON TABLE public.notificaciones_jams IS 'Solicitudes JAM entre usuarios (pendiente / aceptado / rechazado)';
