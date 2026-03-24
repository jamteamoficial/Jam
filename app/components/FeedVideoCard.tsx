'use client'

import Link from 'next/link'
import { Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PostActions from '@/app/components/PostActions'
import LazyVideo from '@/app/components/LazyVideo'
import type { MockPost } from '@/app/data/mockPosts'

interface FeedVideoCardProps {
  post: MockPost
  onJam: (postId: string, usuario: string) => void
}

export default function FeedVideoCard({ post, onJam }: FeedVideoCardProps) {
  const videoUrl = post.video_url
  const thumb = post.thumbnail_url

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-rolex/20 bg-white shadow-sm transition-all hover:border-rolex/40 hover:shadow-lg">
      {/* Cabecera usuario */}
      <div className="flex items-start gap-3 p-4 pb-0 md:gap-4 md:p-5">
        <Link
          href={`/usuario/${encodeURIComponent(post.usuario)}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ring-2 ring-rolex/20 transition hover:scale-105 hover:ring-rolex/40 md:h-14 md:w-14 md:text-3xl"
          style={{ backgroundColor: 'var(--rolex-20)' }}
        >
          {post.avatar}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/usuario/${encodeURIComponent(post.usuario)}`} className="block truncate">
            <h3 className="text-lg font-bold text-gray-900 hover:underline md:text-xl">{post.usuario}</h3>
          </Link>
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
        <PostActions postId={post.id} usuario={post.usuario} />
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
