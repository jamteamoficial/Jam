'use client'

import Link from 'next/link'
import { Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PostActions from '@/app/components/PostActions'
import LazyVideo from '@/app/components/LazyVideo'
import type { FeedDisplayPost } from '@/src/lib/feedDisplayPost'
import { getDisplayName, getHandle, getInitials } from '@/src/lib/userDisplay'

interface FeedVideoCardProps {
  post: FeedDisplayPost
  onJam: (postId: string, usuario: string) => void
  canManage?: boolean
  onEditPost?: (post: FeedDisplayPost) => void
  onDeletePost?: (post: FeedDisplayPost) => void
}

export default function FeedVideoCard({
  post,
  onJam,
  canManage = false,
  onEditPost,
  onDeletePost,
}: FeedVideoCardProps) {
  const videoUrl = post.video_url
  const thumb = post.thumbnail_url
  const displayName = getDisplayName(post.full_name, post.username || post.usuario)
  const handle = getHandle(post.username || post.usuario)
  const avatarText = getInitials(displayName)
  const profileTarget = post.profile_id || post.user_id || post.usuario

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-rolex/20 bg-white shadow-sm transition-all hover:border-rolex/40 hover:shadow-lg">
      {/* Cabecera usuario */}
      <div className="flex items-start gap-3 p-4 pb-0 md:gap-4 md:p-5">
        <Link
          href={`/usuario/${encodeURIComponent(profileTarget)}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ring-2 ring-rolex/20 transition hover:scale-105 hover:ring-rolex/40 md:h-14 md:w-14"
          style={{ backgroundColor: 'var(--rolex-20)' }}
        >
          {post.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.avatar_url} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-700">{avatarText}</span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/usuario/${encodeURIComponent(profileTarget)}`} className="block truncate">
            <h3 className="truncate text-lg font-bold text-gray-900 hover:underline md:text-xl">{displayName}</h3>
          </Link>
          <p className="truncate text-xs text-gray-500">{handle}</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--rolex)' }}>
            {post.instrumento}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {post.ciudad}
            {post.estado && (
              <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                {post.estado}
              </span>
            )}
          </p>
        </div>
      </div>

      {post.texto && (
        <div className="px-4 pt-3 md:px-5">
          <p className="text-gray-700 leading-relaxed line-clamp-4 md:line-clamp-none">{post.texto}</p>
        </div>
      )}

      {/* Video 16:9 o placeholder si no hay URL */}
      <div className="p-4 pt-3 md:p-5 md:pt-4">
        {videoUrl ? (
          <LazyVideo src={videoUrl} poster={thumb} title={post.texto || post.usuario} />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br from-emerald-900/10 to-teal-900/10">
            <div className="text-center px-4">
              <Music className="mx-auto mb-2 h-10 w-10 opacity-40" style={{ color: 'var(--rolex)' }} />
              <p className="text-sm text-gray-500">Sin video adjunto · publicación de texto</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-gray-100 px-4 py-4 md:px-5">
        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-rolex/40 text-rolex hover:bg-rolex/10"
              onClick={() => onEditPost?.(post)}
            >
              Editar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => onDeletePost?.(post)}
            >
              Eliminar
            </Button>
          </div>
        )}
        <PostActions
          postId={post.id}
          usuario={displayName}
          postOwnerId={post.user_id ?? post.profile_id ?? null}
          ownerFullName={post.full_name || null}
          ownerUsername={post.username || null}
          ownerAvatarUrl={post.avatar_url || null}
        />
        <Button
          type="button"
          onClick={() => onJam(post.id, post.usuario)}
          className="w-full rounded-xl py-3 font-bold text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--rolex)' }}
        >
          <Music className="mr-2 h-4 w-4" />
          JAM
        </Button>
      </div>
    </article>
  )
}
