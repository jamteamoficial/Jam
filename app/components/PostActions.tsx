'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { createClient } from '@/src/lib/supabase/client'
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  getPostLikeCount,
  getPostLikedByMe,
  togglePostLike,
  type PostCommentRow,
  updateComment,
} from '@/src/lib/services/jam-social'
import { createNotification } from '@/src/lib/services/notifications'
import { getDisplayName, getHandle, getInitials } from '@/src/lib/userDisplay'

function normalizePostCommentRow(row: any): PostCommentRow {
  const profiles = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles
  return {
    ...row,
    profiles,
  } as PostCommentRow
}

interface PostActionsProps {
  postId: string
  usuario: string
  /** Dueño del post (UUID perfil) para notificación in-app */
  postOwnerId?: string | null
  ownerFullName?: string | null
  ownerUsername?: string | null
  ownerAvatarUrl?: string | null
}

export default function PostActions({
  postId,
  usuario,
  postOwnerId,
  ownerFullName,
  ownerUsername,
}: PostActionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [comments, setComments] = useState<PostCommentRow[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const [{ count }, { liked }] = await Promise.all([
        getPostLikeCount(supabase, postId),
        getPostLikedByMe(supabase, postId),
      ])
      if (cancelled) return
      setLikeCount(count)
      setIsLiked(liked)
    })()
    return () => {
      cancelled = true
    }
  }, [postId, user?.id])

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para dar like",
        variant: "destructive"
      })
      return
    }

    const prevLiked = isLiked
    const prevCount = likeCount
    const nextLiked = !prevLiked
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1))

    setIsLiked(nextLiked)
    setLikeCount(nextCount)

    const supabase = createClient()
    const { liked, error } = await togglePostLike(supabase, postId)
    if (error) {
      setIsLiked(prevLiked)
      setLikeCount(prevCount)
      toast({
        title: 'No se pudo actualizar el like',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    const { count } = await getPostLikeCount(supabase, postId)
    setIsLiked(liked)
    setLikeCount(count)
  }

  const handleComment = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para comentar",
        variant: "destructive"
      })
      return
    }
    setCommentsOpen((prev) => !prev)
  }

  const loadComments = async () => {
    setCommentsLoading(true)
    const supabase = createClient()
    const { data, error } = await getCommentsByPost(supabase, postId, { limit: 50 })
    setCommentsLoading(false)

    if (error) {
      console.error('[PostActions] Error cargando comentarios', error)
      toast({
        title: 'No se pudieron cargar comentarios',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    setComments(((data ?? []) as any[]).map(normalizePostCommentRow))
  }

  useEffect(() => {
    if (commentsOpen) {
      void loadComments()
    }
  }, [commentsOpen, postId])

  useEffect(() => {
    if (!commentsOpen) return
    const interval = window.setInterval(() => {
      void loadComments()
    }, 12000)
    return () => window.clearInterval(interval)
  }, [commentsOpen, postId])

  const handleCreateComment = async () => {
    if (!user?.id) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas iniciar sesión para comentar',
        variant: 'destructive',
      })
      return
    }

    const text = commentInput.trim()
    if (!text) return

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

    if (postOwnerId && user.id !== postOwnerId) {
      const actorName = getDisplayName(user.nombreCompleto, user.username)
      const { error: notifyErr } = await createNotification(supabase, {
        userId: postOwnerId,
        actorId: user.id,
        type: 'comment',
        title: 'Nuevo comentario',
        body: `${actorName} comentó en tu publicación.`,
      })
      if (!notifyErr && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications-updated'))
      }
    }

    setCommentInput('')
    await loadComments()
  }

  const handleDeleteComment = async (commentId: string, authorId: string) => {
    if (!user?.id || user.id !== authorId) return

    const supabase = createClient()
    const { error } = await deleteComment(supabase, { commentId, userId: user.id })
    if (error) {
      toast({
        title: 'No se pudo eliminar el comentario',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    await loadComments()
  }

  const startEditingComment = (comment: PostCommentRow) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
  }

  const cancelEditingComment = () => {
    setEditingCommentId(null)
    setEditingCommentContent('')
  }

  const handleUpdateComment = async (commentId: string, authorId: string) => {
    if (!user?.id || user.id !== authorId) return
    const text = editingCommentContent.trim()
    if (!text) return

    const supabase = createClient()
    const { error } = await updateComment(supabase, {
      commentId,
      userId: user.id,
      content: text,
    })

    if (error) {
      toast({
        title: 'No se pudo editar el comentario',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    cancelEditingComment()
    await loadComments()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-90 ${
            isLiked ? 'text-white' : 'text-white'
          }`}
          style={{ backgroundColor: 'var(--rolex)', border: '2px solid var(--rolex)' }}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="font-semibold">{likeCount}</span>
        </button>
        <button
          onClick={handleComment}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--rolex)', border: '2px solid var(--rolex)' }}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">
            {commentsOpen
              ? `Ocultar comentarios (${comments.length})`
              : `Comentar (${comments.length})`}
          </span>
        </button>
      </div>

      {commentsOpen && (
        <div className="rounded-xl border border-rolex/20 bg-white p-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={`Comenta en publicación de ${getDisplayName(ownerFullName, ownerUsername || usuario)}`}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rolex"
            />
            <button
              type="button"
              onClick={() => void handleCreateComment()}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--rolex)' }}
            >
              Enviar
            </button>
          </div>

          {commentsLoading ? (
            <p className="text-sm text-gray-500">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">Sé la primera persona en comentar.</p>
          ) : (
            <ul className="space-y-2 max-h-44 overflow-y-auto">
              {comments.map((comment) => {
                const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
                const authorName = getDisplayName(profile?.full_name, profile?.username || comment.user_id)
                const authorHandle = getHandle(profile?.username || comment.user_id.slice(0, 8))
                const authorInitials = getInitials(authorName)
                const canDelete = Boolean(user?.id && user.id === comment.user_id)
                return (
                  <li
                    key={comment.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rolex/20 text-[10px] font-bold text-gray-700">
                          {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt={authorName} className="h-full w-full object-cover" />
                          ) : (
                            authorInitials
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-800">{authorName}</p>
                          <p className="truncate text-[11px] text-gray-500">{authorHandle}</p>
                        {editingCommentId === comment.id ? (
                          <div className="mt-1 space-y-2">
                            <input
                              value={editingCommentContent}
                              onChange={(e) => setEditingCommentContent(e.target.value)}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-rolex"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void handleUpdateComment(comment.id, comment.user_id)}
                                className="rounded px-2 py-1 text-xs font-semibold text-white"
                                style={{ backgroundColor: 'var(--rolex)' }}
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingComment}
                                className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-800">{comment.content}</p>
                        )}
                        </div>
                      </div>
                      {canDelete && (
                        <div className="flex items-center gap-1">
                          {editingCommentId !== comment.id && (
                            <button
                              type="button"
                              onClick={() => startEditingComment(comment)}
                              className="rounded-md p-1 text-gray-600 hover:bg-gray-200"
                              aria-label="Editar comentario"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleDeleteComment(comment.id, comment.user_id)}
                            className="rounded-md p-1 text-red-600 hover:bg-red-50"
                            aria-label="Eliminar comentario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

