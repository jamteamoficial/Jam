import type { SupabaseClient } from '@supabase/supabase-js'

/** Post del feed con perfil embebido (relación FK user_id → profiles) */
export type FeedPostRow = {
  id: string
  user_id: string
  video_url: string
  description: string | null
  created_at: string
  profiles: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    instrumentos: string[] | null
  } | null
}

/**
 * Feed principal: posts ordenados por fecha + datos públicos del perfil.
 * Usar con cliente browser (createBrowserClient) o servidor (createServerClient).
 */
export async function getFeed(
  supabase: SupabaseClient,
  options?: { limit?: number }
) {
  const limit = options?.limit ?? 30

  return supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      video_url,
      description,
      created_at,
      profiles (
        id,
        username,
        full_name,
        avatar_url,
        bio,
        instrumentos
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit)
}

/**
 * Crea un post con video (URL pública, p. ej. Storage de Supabase).
 */
export async function createPost(
  supabase: SupabaseClient,
  input: { video_url: string; description?: string | null }
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Debes iniciar sesión para publicar') }
  }

  return supabase
    .from('posts')
    .insert({
      user_id: user.id,
      video_url: input.video_url,
      description: input.description ?? null,
    })
    .select()
    .single()
}

/**
 * Sigue o deja de seguir a un usuario (toggle).
 */
export async function toggleFollow(
  supabase: SupabaseClient,
  followingId: string
): Promise<{ following: boolean; error: Error | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { following: false, error: new Error('Debes iniciar sesión') }
  }

  if (user.id === followingId) {
    return { following: false, error: new Error('No puedes seguirte a ti mismo') }
  }

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    return { following: false, error: error ? new Error(error.message) : null }
  }

  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: followingId,
  })

  return { following: true, error: error ? new Error(error.message) : null }
}

/**
 * Mensaje directo 1:1 (tabla `direct_messages`).
 * Distinto de `messages` ligada a conversaciones por `conversation_id`.
 */
export async function sendMessage(
  supabase: SupabaseClient,
  input: { receiver_id: string; content: string }
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Debes iniciar sesión') }
  }

  const trimmed = input.content.trim()
  if (!trimmed) {
    return { data: null, error: new Error('El mensaje está vacío') }
  }

  if (user.id === input.receiver_id) {
    return { data: null, error: new Error('Destinatario inválido') }
  }

  return supabase
    .from('direct_messages')
    .insert({
      sender_id: user.id,
      receiver_id: input.receiver_id,
      content: trimmed,
    })
    .select()
    .single()
}
