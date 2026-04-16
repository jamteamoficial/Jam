import { createClient } from '@/src/lib/supabase/client'

type PerfilFormLike = {
  nombreCompleto: string
  ciudad: string
  descripcion: string
  instrumentos: string[]
}

/**
 * Sincroniza el formulario "Mi perfil" con public.profiles para que otros usuarios puedan encontrarte.
 */
export async function syncProfileToSupabase(
  userId: string,
  email: string | undefined,
  formData: PerfilFormLike,
  emailLocalUsername: string
): Promise<{ error: Error | null }> {
  const supabase = createClient()
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle()

  const base = (email?.split('@')[0] || emailLocalUsername || 'usuario')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 40)
  const username = (existingProfile?.username as string | null) || base || `user${userId.slice(0, 6)}`

  const row = {
    id: userId,
    email: email ?? null,
    full_name: formData.nombreCompleto.trim(),
    username,
    ciudad: formData.ciudad.trim() || null,
    bio: formData.descripcion.trim() || null,
    instrumentos:
      formData.instrumentos.length > 0 ? formData.instrumentos : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })

  if (error) {
    return { error: new Error(error.message) }
  }
  return { error: null }
}
