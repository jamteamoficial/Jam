'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { Music } from 'lucide-react'
import FeedTabs from '@/app/components/FeedTabs'
import FeedVideoCard from '@/app/components/FeedVideoCard'
import { createClient } from '@/src/lib/supabase/client'
import { getFeed } from '@/src/lib/services/jam-social'
import type { FeedPostRow } from '@/src/lib/services/jam-social'
import { mapFeedPostRowToDisplayPost } from '@/src/lib/mapFeedPost'
import type { FeedDisplayPost } from '@/src/lib/feedDisplayPost'

export default function AprenderFeed() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<FeedDisplayPost[]>([])

  const load = async () => {
    const supabase = createClient()
    const { data, error } = await getFeed(supabase, { limit: 50 })
    if (error) {
      console.error('[feed/aprender] Error cargando posts', error)
      setPosts([])
      return
    }

    const mapped = ((data ?? []) as Array<FeedPostRow | (FeedPostRow & { profiles: FeedPostRow['profiles'][] })>).map(
      (row) => mapFeedPostRowToDisplayPost(row, 'aprender')
    )
    setPosts(mapped)
  }

  useEffect(() => {
    void load()
    const onNew = () => void load()
    window.addEventListener('newPostCreated', onNew)
    return () => window.removeEventListener('newPostCreated', onNew)
  }, [])

  const handleJam = (postId: string, usuario: string) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas iniciar sesión para enviar un JAM',
        variant: 'destructive',
      })
      return
    }

    window.dispatchEvent(new CustomEvent('showJamAnimation'))
    toast({
      title: '¡JAM enviado!',
      description: `Tu solicitud fue enviada a ${usuario}`,
    })
    void postId
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
      <FeedTabs />

      <div className="mx-auto max-w-3xl px-4">
        {posts.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <Music className="mb-4 h-16 w-16 text-rolex/40" />
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Aún no hay publicaciones</h2>
            <p className="max-w-md text-sm leading-relaxed text-gray-600">
              El feed está conectado a Supabase. Cuando existan videos, se mostrarán aquí.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {posts.map((post) => (
              <FeedVideoCard key={post.id} post={post} onJam={handleJam} />
            ))}
          </div>
        )}
      </div>

      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('openCreateModal'))}
          className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 hover:opacity-90"
          style={{ backgroundColor: 'var(--rolex)' }}
          aria-label="Crear publicación"
        >
          +
        </button>
      ) : null}
    </div>
  )
}
