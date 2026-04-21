/**
 * Shape usado por el feed principal (map desde `posts` + `profiles`)
 * y por componentes como `FeedVideoCard`.
 */
export type FeedDisplayPost = {
  id: string
  usuario: string
  username?: string
  full_name?: string
  avatar_url?: string | null
  profile_id?: string
  user_id?: string
  instrumento: string
  estilo: string
  ciudad: string
  texto: string
  avatar: string
  tipo?: string
  feedType?: 'general' | 'descubrir' | 'conectar' | 'aprender'
  video_url?: string
  thumbnail_url?: string
  estado?: string
  created_at?: string
  /** Conteo desde la query del feed (`post_likes(count)`); evita segunda petición que pueda fallar para anon. */
  likeCount?: number
}
