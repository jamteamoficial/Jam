import type { FeedDisplayPost } from '@/src/lib/feedDisplayPost'
import { parsePostLikeCountFromRow } from '@/src/lib/feed/postLikeCount'
import type { FeedPostRow } from '@/src/lib/services/jam-social'

export function mapFeedPostRowToDisplayPost(
  row: FeedPostRow | (FeedPostRow & { profiles: FeedPostRow['profiles'][] }),
  feedType: FeedDisplayPost['feedType']
): FeedDisplayPost {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles

  return {
    id: row.id,
    user_id: row.user_id,
    created_at: row.created_at,
    usuario: profile?.full_name || profile?.username || (row.user_id ? row.user_id.slice(0, 8) : '—'),
    full_name: profile?.full_name || undefined,
    username: profile?.username || undefined,
    avatar_url: profile?.avatar_url || null,
    profile_id: row.user_id,
    instrumento: profile?.instrumentos?.[0] || 'Músico',
    estilo: profile?.bio || 'Varios',
    ciudad: profile?.ciudad?.trim() ? profile.ciudad.trim() : '—',
    texto: row.description || '',
    avatar: '🎵',
    tipo: 'video',
    feedType,
    video_url: row.video_url,
    thumbnail_url: row.thumbnail_url ?? undefined,
    estado: 'Todos',
    likeCount: parsePostLikeCountFromRow(row),
  }
}
