'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import Header from '@/app/components/Header'
import PostActions from '@/app/components/PostActions'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { createClient } from '@/src/lib/supabase/client'
import { createComment, getCommentsByPost, type PostCommentRow } from '@/src/lib/services/jam-social'
import { getDisplayName, getHandle, getInitials } from '@/src/lib/userDisplay'

type PostRow = {
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
  } | null
}

function normalizePostRow(row: any): PostRow {
  const profiles = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles
  return { ...row, profiles } as PostRow
}

function normalizeCommentRow(row: any): PostCommentRow {
  const profiles = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles
  return { ...row, profiles } as PostCommentRow
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const postId = String(params.id ?? '')

  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<PostRow | null>(null)
  const [comments, setComments] = useState<PostCommentRow[]>([])
  const [commentText, setCommentText] = useState('')

  const author = useMemo(() => {
    if (!post?.profiles) return null
    const name = getDisplayName(post.profiles.full_name, post.profiles.username || 'usuario')
    const handle = getHandle(post.profiles.username || 'usuario')
    return { name, handle, avatarUrl: post.profiles.avatar_url }
  }, [post])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!postId) {
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
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
            avatar_url
          )
        `
        )
        .eq('id', postId)
        .maybeSingle()

      if (cancelled) return

      if (error || !data) {
        setPost(null)
        setComments([])
        setLoading(false)
        return
      }

      setPost(normalizePostRow(data))

      const { data: commentRows, error: commentsError } = await getCommentsByPost(supabase, postId, { limit: 50 })
      if (!commentsError) {
        setComments(((commentRows ?? []) as any[]).map(normalizeCommentRow))
      } else {
        setComments([])
      }

      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [postId])

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text) return
    if (!user?.id) {
      router.push('/login')
      return
    }

    const supabase = createClient()
    const { error } = await createComment(supabase, { postId, content: text })
    if (error) {
      toast({
        title: 'No se pudo comentar',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    setCommentText('')
    const { data } = await getCommentsByPost(supabase, postId, { limit: 50 })
    setComments(((data ?? []) as any[]).map(normalizeCommentRow))
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <p className="text-xl text-gray-600">Cargando publicación…</p>
      </main>
    )
  }

  if (!post || !author) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Header />
        <div className="mx-auto mt-10 max-w-3xl px-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">Publicación no encontrada</h1>
            <Link href="/" className="inline-block rounded-lg bg-rolex px-6 py-2 font-semibold text-white hover:bg-rolex-light">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6">
          <Link href={`/usuario/${post.user_id}`} className="inline-flex items-center gap-2 font-semibold text-rolex hover:text-rolex-dark">
            <span>←</span>
            <span>Volver al perfil</span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <Link href={`/usuario/${post.user_id}`} className="shrink-0">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-rolex text-sm font-bold text-white">
                  {author.avatarUrl && /^https?:\/\//i.test(author.avatarUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(author.name)
                  )}
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-bold text-gray-900">{author.name}</h1>
                    <p className="truncate text-sm text-gray-500">{author.handle}</p>
                  </div>
                  <PostActions
                    postId={post.id}
                    usuario={author.name}
                    postOwnerId={post.user_id}
                    ownerFullName={post.profiles?.full_name ?? null}
                    ownerUsername={post.profiles?.username ?? null}
                  />
                </div>
                {post.description ? <p className="mt-4 whitespace-pre-wrap text-gray-800">{post.description}</p> : null}
              </div>
            </div>
          </div>

          <div className="bg-black">
            <video src={post.video_url} controls playsInline preload="metadata" className="max-h-[70vh] w-full">
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>

          <div className="p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Comentarios</h2>

            <form onSubmit={(e) => void submitComment(e)} className="mb-6 flex flex-col gap-2 sm:flex-row">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? 'Escribe un comentario…' : 'Inicia sesión para comentar'}
                disabled={!user}
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rolex"
              />
              <Button type="submit" disabled={!user} className="text-white" style={{ backgroundColor: 'var(--rolex)' }}>
                Comentar
              </Button>
            </form>

            {comments.length === 0 ? (
              <p className="text-sm text-gray-600">Aún no hay comentarios</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((c) => {
                  const who = getDisplayName(c.profiles?.full_name ?? null, c.profiles?.username ?? 'usuario')
                  return (
                    <li key={c.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="mb-1 text-xs font-semibold text-gray-700">{who}</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{c.content}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
