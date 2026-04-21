/** True si el post tiene una URL de video real para reproducir en el feed. */
export function hasPlayableVideoUrl(url?: string | null): boolean {
  const t = (url ?? '').trim()
  if (!t) return false
  if (t.includes('mov_bbb.mp4')) return false
  return true
}
