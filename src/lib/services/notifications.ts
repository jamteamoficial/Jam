import type { SupabaseClient } from '@supabase/supabase-js'

export type NotificationRow = {
  id: string
  user_id: string
  actor_id: string | null
  type: string
  title: string | null
  body: string | null
  is_read: boolean
  created_at: string
}

/**
 * Crea una notificación para otro usuario (p. ej. comentario o nuevo seguidor).
 * Tabla esperada: public.notifications (user_id, actor_id, type, title, body, is_read).
 */
export async function createNotification(
  supabase: SupabaseClient,
  input: {
    userId: string
    actorId: string
    type: string
    title: string
    body: string
  }
) {
  if (input.userId === input.actorId) {
    return { data: null, error: null }
  }
  return supabase.from('notifications').insert({
    user_id: input.userId,
    actor_id: input.actorId,
    type: input.type,
    title: input.title,
    body: input.body,
    is_read: false,
  })
}

export async function listNotifications(
  supabase: SupabaseClient,
  options?: { limit?: number }
) {
  const limit = options?.limit ?? 30
  return supabase
    .from('notifications')
    .select('id, user_id, actor_id, type, title, body, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function countUnreadNotifications(supabase: SupabaseClient) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)
  return { count: count ?? 0, error }
}

export async function markAllNotificationsRead(supabase: SupabaseClient) {
  return supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
}
