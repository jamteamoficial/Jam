/**
 * Lee el agregado `post_likes(count)` que devuelve PostgREST en el select anidado del post.
 */
export function parsePostLikeCountFromRow(row: { post_likes?: unknown }): number {
  const raw = row.post_likes
  if (!raw || !Array.isArray(raw) || raw.length === 0) return 0
  const first = raw[0] as { count?: number }
  const c = first?.count
  return typeof c === 'number' && Number.isFinite(c) ? c : 0
}
