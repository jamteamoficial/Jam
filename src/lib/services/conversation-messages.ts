import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Marca como leídos los mensajes entrantes de una conversación (no enviados por el lector).
 */
export async function markIncomingMessagesRead(
  supabase: SupabaseClient,
  input: { conversationId: string; readerId: string }
) {
  return supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', input.conversationId)
    .neq('sender_id', input.readerId)
    .eq('is_read', false)
}

/**
 * Cuenta mensajes no leídos por conversación para el usuario actual.
 */
export async function countUnreadMessagesByConversation(
  supabase: SupabaseClient,
  input: { conversationIds: string[]; readerId: string }
) {
  if (input.conversationIds.length === 0) {
    return { data: {} as Record<string, number>, error: null }
  }
  const { data, error } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', input.conversationIds)
    .eq('is_read', false)
    .neq('sender_id', input.readerId)

  if (error) {
    return { data: null, error }
  }
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const cid = row.conversation_id as string
    counts[cid] = (counts[cid] ?? 0) + 1
  }
  return { data: counts, error: null }
}
