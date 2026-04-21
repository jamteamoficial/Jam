import type { SupabaseClient } from '@supabase/supabase-js'

/** Post del feed con perfil embebido (relación FK user_id → profiles) */
export type FeedPostRow = {
  id: string
  user_id: string
  video_url: string
  thumbnail_url?: string | null
  description: string | null
  created_at: string
  /** Agregado opcional desde `post_likes(count)` en el mismo SELECT que el post. */
  post_likes?: { count: number }[] | null
  profiles: {
    id: string
    username: string | null
    full_name: string | null
    ciudad: string | null
    avatar_url: string | null
    bio: string | null
    instrumentos: string[] | null
  } | null
}

export type PostCommentRow = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

export type JamStatus = 'pending' | 'accepted' | 'rejected'

export type JamRow = {
  id: string
  sender_id: string
  receiver_id: string
  post_id: string | null
  status: JamStatus
  created_at: string
  sender?: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  receiver?: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

/**
 * Feed: posts + autor + conteo de likes en una sola petición.
 * Relaciones explícitas para evitar PGRST201 (varias FK entre `posts` y `profiles` / `post_likes`).
 * Si renombraste constraints en Postgres, ajusta los nombres tras el `!`.
 */
export const POSTS_FEED_SELECT = `
  *,
  profiles!posts_user_id_fkey(*),
  post_likes!post_likes_post_id_fkey(count)
`

export async function getFeed(
  supabase: SupabaseClient,
  options?: { limit?: number }
) {
  const limit = options?.limit ?? 30

  // `*` en posts evita error 400 si aún no existe la columna `thumbnail_url` en la BD.
  // `post_likes(count)` trae el total de likes en la misma respuesta (no bloquea multimedia si falla el conteo).
  return supabase.from('posts').select(POSTS_FEED_SELECT).order('created_at', { ascending: false }).limit(limit)
}

export async function getFeedByUserIds(
  supabase: SupabaseClient,
  input: { userIds: string[]; limit?: number }
) {
  if (input.userIds.length === 0) {
    return { data: [], error: null }
  }
  const limit = input.limit ?? 50
  return supabase
    .from('posts')
    .select(POSTS_FEED_SELECT)
    .in('user_id', input.userIds)
    .order('created_at', { ascending: false })
    .limit(limit)
}

/**
 * Crea un post con video (URL pública, p. ej. Storage de Supabase).
 */
export async function createPost(
  supabase: SupabaseClient,
  input: { video_url: string; description?: string | null; thumbnail_url?: string | null }
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
      thumbnail_url: input.thumbnail_url ?? null,
    })
    .select(POSTS_FEED_SELECT)
    .single()
}

/**
 * Edita la descripción de un post propio.
 */
export async function updatePostDescription(
  supabase: SupabaseClient,
  input: { postId: string; userId: string; description: string | null }
) {
  return supabase
    .from('posts')
    .update({
      description: input.description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.postId)
    .eq('user_id', input.userId)
    .select()
    .single()
}

/**
 * Elimina un post propio.
 */
export async function deletePost(
  supabase: SupabaseClient,
  input: { postId: string; userId: string }
) {
  return supabase
    .from('posts')
    .delete()
    .eq('id', input.postId)
    .eq('user_id', input.userId)
}

/**
 * Obtiene comentarios recientes de un post.
 */
export async function getCommentsByPost(
  supabase: SupabaseClient,
  postId: string,
  options?: { limit?: number }
) {
  const limit = options?.limit ?? 50
  return supabase
    .from('comments')
    .select(
      `
      id,
      post_id,
      user_id,
      content,
      created_at,
      profiles!comments_user_id_fkey (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .limit(limit)
}

/**
 * Crea un comentario asociado al usuario autenticado.
 */
export async function createComment(
  supabase: SupabaseClient,
  input: { postId: string; content: string }
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Debes iniciar sesión para comentar') }
  }

  const trimmed = input.content.trim()
  if (!trimmed) {
    return { data: null, error: new Error('El comentario está vacío') }
  }

  return supabase
    .from('comments')
    .insert({
      post_id: input.postId,
      user_id: user.id,
      content: trimmed,
    })
    .select()
    .single()
}

/**
 * Elimina comentario propio.
 */
export async function deleteComment(
  supabase: SupabaseClient,
  input: { commentId: string; userId: string }
) {
  return supabase
    .from('comments')
    .delete()
    .eq('id', input.commentId)
    .eq('user_id', input.userId)
}

/**
 * Edita un comentario propio.
 */
export async function updateComment(
  supabase: SupabaseClient,
  input: { commentId: string; userId: string; content: string }
) {
  const trimmed = input.content.trim()
  if (!trimmed) {
    return { data: null, error: new Error('El comentario está vacío') }
  }

  return supabase
    .from('comments')
    .update({
      content: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.commentId)
    .eq('user_id', input.userId)
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
 * Mensaje directo 1:1 usando `public.direct_messages`.
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

export async function sendJamRequest(
  supabase: SupabaseClient,
  input: { postId: string; receiverId?: string | null }
): Promise<{ data: JamRow | null; error: Error | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Debes iniciar sesión para mandar un JAM') }
  }

  if (!input.postId) {
    return { data: null, error: new Error('Post inválido para enviar JAM') }
  }

  const { count: pendingCount, error: pendingErr } = await supabase
    .from('jams')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', user.id)
    .eq('status', 'pending')

  if (pendingErr) {
    return { data: null, error: new Error(pendingErr.message) }
  }

  if ((pendingCount ?? 0) >= 10) {
    return {
      data: null,
      error: new Error(
        'Límite de 10 solicitudes pendientes alcanzado. Espera a que alguien responda para mandar más.'
      ),
    }
  }

  let receiverId = input.receiverId ?? null
  if (!receiverId) {
    const { data: postRow, error: postErr } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', input.postId)
      .maybeSingle()
    if (postErr || !postRow?.user_id) {
      return { data: null, error: new Error(postErr?.message || 'No se pudo identificar al receptor del JAM') }
    }
    receiverId = String(postRow.user_id)
  }

  if (receiverId === user.id) {
    return { data: null, error: new Error('No puedes enviarte un JAM a ti mismo') }
  }

  // Evitamos `upsert` porque en algunos esquemas RLS fuerza ruta UPDATE y falla con
  // "violates row-level security policy (USING expression)".
  const { data: existing, error: existingErr } = await supabase
    .from('jams')
    .select(
      `
      id,
      sender_id,
      receiver_id,
      post_id,
      status,
      created_at
      `
    )
    .eq('sender_id', user.id)
    .eq('post_id', input.postId)
    .maybeSingle()

  if (existingErr) {
    return { data: null, error: new Error(existingErr.message) }
  }

  if (existing) {
    return { data: existing as JamRow, error: null }
  }

  const { data, error } = await supabase
    .from('jams')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      post_id: input.postId,
      status: 'pending',
    })
    .select(
      `
      id,
      sender_id,
      receiver_id,
      post_id,
      status,
      created_at
      `
    )
    .single()

  // Si otro cliente insertó justo antes, tratamos como ya enviado.
  if (error && typeof error.message === 'string' && error.message.toLowerCase().includes('duplicate')) {
    const { data: duplicated } = await supabase
      .from('jams')
      .select(
        `
        id,
        sender_id,
        receiver_id,
        post_id,
        status,
        created_at
        `
      )
      .eq('sender_id', user.id)
      .eq('post_id', input.postId)
      .maybeSingle()
    return { data: (duplicated as JamRow | null) ?? null, error: null }
  }

  return { data: (data as JamRow | null) ?? null, error: error ? new Error(error.message) : null }
}

export async function countMyPendingJams(
  supabase: SupabaseClient
): Promise<{ count: number; error: Error | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { count: 0, error: null }
  }

  const { count, error } = await supabase
    .from('jams')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', user.id)
    .eq('status', 'pending')

  return { count: count ?? 0, error: error ? new Error(error.message) : null }
}

export async function getMyJamStatusesByPostIds(
  supabase: SupabaseClient,
  postIds: string[]
): Promise<{ data: Record<string, JamStatus>; error: Error | null; pendingCount: number }> {
  const uniqueIds = [...new Set(postIds.filter(Boolean))]
  if (uniqueIds.length === 0) return { data: {}, error: null, pendingCount: 0 }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: {}, error: null, pendingCount: 0 }
  }

  const { data, error } = await supabase
    .from('jams')
    .select('post_id, status')
    .eq('sender_id', user.id)
    .in('post_id', uniqueIds)

  if (error) return { data: {}, error: new Error(error.message), pendingCount: 0 }

  const map: Record<string, JamStatus> = {}
  let pendingCount = 0
  for (const row of data ?? []) {
    const postId = String(row.post_id || '')
    const status = row.status as JamStatus
    if (!postId) continue
    map[postId] = status
    if (status === 'pending') pendingCount += 1
  }
  return { data: map, error: null, pendingCount }
}

export async function hasAcceptedJamBetweenUsers(
  supabase: SupabaseClient,
  input: { otherUserId: string }
): Promise<{ data: boolean; error: Error | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: false, error: null }
  }

  const { data, error } = await supabase
    .from('jams')
    .select('id')
    .eq('status', 'accepted')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${input.otherUserId}),and(sender_id.eq.${input.otherUserId},receiver_id.eq.${user.id})`
    )
    .maybeSingle()

  return { data: Boolean(data), error: error ? new Error(error.message) : null }
}

export async function listReceivedJams(
  supabase: SupabaseClient,
  options?: { status?: JamStatus; limit?: number }
): Promise<{ data: JamRow[]; error: Error | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: [], error: new Error('Debes iniciar sesión') }
  }

  const limit = options?.limit ?? 100
  const status = options?.status

  let query = supabase
    .from('jams')
    .select(
      `
      id,
      sender_id,
      receiver_id,
      post_id,
      status,
      created_at,
      sender:profiles!sender_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      receiver:profiles!receiver_id (
        id,
        username,
        full_name,
        avatar_url
      )
      `
    )
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  return { data: (data as JamRow[] | null) ?? [], error: error ? new Error(error.message) : null }
}

export async function updateJamStatus(
  supabase: SupabaseClient,
  input: { jamId: string; status: Extract<JamStatus, 'accepted' | 'rejected'> }
): Promise<{ data: JamRow | null; error: Error | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Debes iniciar sesión') }
  }

  const { data, error } = await supabase
    .from('jams')
    .update({ status: input.status })
    .eq('id', input.jamId)
    .eq('receiver_id', user.id)
    .select(
      `
      id,
      sender_id,
      receiver_id,
      post_id,
      status,
      created_at,
      sender:profiles!sender_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      receiver:profiles!receiver_id (
        id,
        username,
        full_name,
        avatar_url
      )
      `
    )
    .single()

  return { data: (data as JamRow | null) ?? null, error: error ? new Error(error.message) : null }
}

export async function listDirectMessagesThread(
  supabase: SupabaseClient,
  input: { otherUserId: string; limit?: number }
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: [], error: new Error('Debes iniciar sesión') }
  }

  const limit = input.limit ?? 200

  const { data, error } = await supabase
    .from('direct_messages')
    .select('id, sender_id, receiver_id, content, created_at')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${input.otherUserId}),and(sender_id.eq.${input.otherUserId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })
    .limit(limit)

  return { data: data ?? [], error: error ? new Error(error.message) : null }
}

export async function getPostLikeCount(supabase: SupabaseClient, postId: string) {
  const { count, error } = await supabase
    .from('post_likes')
    .select('post_id', { count: 'exact', head: true })
    .eq('post_id', postId)

  return { count: count ?? 0, error: error ? new Error(error.message) : null }
}

export async function getPostLikedByMe(supabase: SupabaseClient, postId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { liked: false, error: null }
  }

  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return { liked: false, error: new Error(error.message) }
  }

  return { liked: Boolean(data), error: null }
}

export async function togglePostLike(
  supabase: SupabaseClient,
  postId: string
): Promise<{ liked: boolean; error: Error | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { liked: false, error: new Error('Debes iniciar sesión') }
  }

  const { data: existing, error: readError } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (readError) {
    return { liked: false, error: new Error(readError.message) }
  }

  if (existing) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    return { liked: false, error: error ? new Error(error.message) : null }
  }

  const { error } = await supabase.from('post_likes').insert({
    post_id: postId,
    user_id: user.id,
  })

  return { liked: true, error: error ? new Error(error.message) : null }
}

/**
 * Conteo real de filas en `post_likes` por cada `post_id`.
 * Usa `count: 'exact'` por post (no depende del límite de filas devueltas por `.select()`).
 * Válido para sesión autenticada o `anon` (si RLS permite SELECT).
 */
export async function countLikesForPosts(supabase: SupabaseClient, postIds: string[]) {
  const unique = [...new Set(postIds.filter(Boolean))]
  if (unique.length === 0) {
    return { data: {} as Record<string, number>, error: null }
  }

  const results = await Promise.all(
    unique.map(async (id) => {
      const { count, error } = await getPostLikeCount(supabase, id)
      return { id, count, error }
    })
  )

  const data: Record<string, number> = {}
  let firstError: Error | null = null
  for (const r of results) {
    if (r.error) {
      firstError = firstError ?? r.error
      data[r.id] = 0
    } else {
      data[r.id] = r.count
    }
  }

  return { data, error: firstError }
}

export async function countFollowers(supabase: SupabaseClient, userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('follower_id', { count: 'exact', head: true })
    .eq('following_id', userId)

  return { count: count ?? 0, error: error ? new Error(error.message) : null }
}

export async function countFollowing(supabase: SupabaseClient, userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('following_id', { count: 'exact', head: true })
    .eq('follower_id', userId)

  return { count: count ?? 0, error: error ? new Error(error.message) : null }
}
