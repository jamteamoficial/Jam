import type { User } from '@supabase/supabase-js'

import { createClient } from '@/src/lib/supabase/client'

/**
 * Asegura una fila en public.profiles al iniciar sesión (Google/email),
 * para que la búsqueda encuentre al usuario aunque aún no haya guardado "Mi perfil".
 */
export async function ensurePublicProfileFromAuth(user: User): Promise<void> {
  const supabase = createClient()
  const email = user.email ?? null
  const meta = user.user_metadata as Record<string, string | undefined> | undefined
  const fullName =
    meta?.full_name ||
    meta?.name ||
    meta?.given_name ||
    (email ? email.split('@')[0] : null) ||
    'Usuario'

  const avatarUrl = meta?.avatar_url || meta?.picture || null

  const local = (email?.split('@')[0] || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20)

  const username = `${local || 'user'}_${user.id.replace(/-/g, '').slice(0, 10)}`.slice(0, 40)

  const row: Record<string, unknown> = {
    id: user.id,
    email,
    full_name: fullName,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
    username,
  }

  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })

  if (error) {
    // Si faltan columnas opcionales (migración 002), reintenta solo columnas base (001)
    const minimal = {
      id: user.id,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }
    const { error: e2 } = await supabase.from('profiles').upsert(minimal, { onConflict: 'id' })
    if (e2) {
      console.warn('[ensurePublicProfile]', e2.message)
    }
  }
}
