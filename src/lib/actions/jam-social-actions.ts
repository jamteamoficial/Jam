'use server'

import { createClient } from '@/src/lib/supabase/server'
import {
  createPost,
  getFeed,
  sendMessage,
  toggleFollow,
} from '@/src/lib/services/jam-social'

/** Server Actions: usan cookies de sesión (usuario autenticado). */

export async function getFeedAction(limit?: number) {
  const supabase = await createClient()
  return getFeed(supabase, { limit })
}

export async function createPostAction(input: {
  video_url: string
  description?: string | null
}) {
  const supabase = await createClient()
  return createPost(supabase, input)
}

export async function toggleFollowAction(followingId: string) {
  const supabase = await createClient()
  return toggleFollow(supabase, followingId)
}

export async function sendMessageAction(input: {
  receiver_id: string
  content: string
}) {
  const supabase = await createClient()
  return sendMessage(supabase, input)
}
