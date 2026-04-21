import type { SupabaseClient } from '@supabase/supabase-js'

import { resolveCommunityColorToken } from '@/src/lib/communities/colors'

export type CommunityRow = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

export async function listCommunities(supabase: SupabaseClient) {
  return supabase
    .from('communities')
    .select('id, name, description, icon, color')
    .order('name', { ascending: true })
}

export async function createCommunity(
  supabase: SupabaseClient,
  input: {
    id: string
    name: string
    description: string
    icon?: string | null
    /** Si falta o no es un token válido, se usa Marca (naranja) → `purple`. */
    color?: string | null
  }
) {
  const color = resolveCommunityColorToken(input.color)
  const icon = input.icon?.trim() ? input.icon.trim() : null
  return supabase
    .from('communities')
    .insert({
      id: input.id,
      name: input.name,
      description: input.description,
      icon,
      color,
    })
    .select('id, name, description, icon, color')
    .single()
}

export async function joinCommunity(
  supabase: SupabaseClient,
  input: { communityId: string; userId: string }
) {
  return supabase.from('community_members').upsert(
    {
      community_id: input.communityId,
      user_id: input.userId,
    },
    { onConflict: 'community_id,user_id' }
  )
}

export async function listMyCommunityMembershipIds(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', userId)
  return {
    data: (data ?? []).map((row) => row.community_id as string),
    error,
  }
}

export async function listCommunityMemberIds(
  supabase: SupabaseClient,
  communityId: string
) {
  const { data, error } = await supabase
    .from('community_members')
    .select('user_id')
    .eq('community_id', communityId)
  return {
    data: (data ?? []).map((row) => row.user_id as string),
    error,
  }
}

export async function getCommunityMemberCountMap(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('community_members').select('community_id')
  if (error) {
    return { data: null, error }
  }
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const id = row.community_id as string
    counts[id] = (counts[id] ?? 0) + 1
  }
  return { data: counts, error: null }
}
