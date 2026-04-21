'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from './context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { Music, Video, MessageCircle, Users, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatsPanel from '@/app/components/ChatsPanel'
import ComunidadPanel from './components/ComunidadPanel'
import FeedToolbar, { ESTADO_FILTERS, INSTRUMENT_FILTERS } from './components/FeedToolbar'
import FeedVideoCard from './components/FeedVideoCard'
import { filterFeedPosts } from '@/src/lib/feedFilters'
import type { FeedDisplayPost } from '@/src/lib/feedDisplayPost'
import { mapFeedPostRowToDisplayPost } from '@/src/lib/mapFeedPost'
import { createClient } from '@/src/lib/supabase/client'
import { searchProfiles, type ProfileSearchRow } from '@/src/lib/supabase/searchUsers'
import {
  deletePost,
  getMyJamStatusesByPostIds,
  getFeed,
  getFeedByUserIds,
  sendJamRequest,
  updatePostDescription,
  type JamStatus,
  type FeedPostRow,
} from '@/src/lib/services/jam-social'
import { listCommunityMemberIds } from '@/src/lib/services/communities'
import JamLoadingPlaceholder from '@/app/components/JamLoadingPlaceholder'

const FEED_REQUEST_TIMEOUT_MS = 5_000

type AppFeedPost = FeedDisplayPost & {
  user_id?: string
  created_at?: string
}

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [feedLoading, setFeedLoading] = useState(true)
  const [feedTimedOut, setFeedTimedOut] = useState(false)
  const [feedErrorMessage, setFeedErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'chats' | 'feed' | 'comunidad'>('feed')
  const [activeFeed, setActiveFeed] = useState<'general' | 'descubrir' | 'conectar' | 'aprender'>('general')
  const [currentPosts, setCurrentPosts] = useState<AppFeedPost[]>([])
  const [chatsPanelVisible, setChatsPanelVisible] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterInstrument, setFilterInstrument] = useState('Todos')
  const [filterCiudad, setFilterCiudad] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [desktopSideView, setDesktopSideView] = useState<'feed' | 'mensajes' | 'comunidades' | 'jams'>('feed')
  const [selectedCommunity, setSelectedCommunity] = useState<{ id: string; nombre: string } | null>(null)
  const [matchedProfiles, setMatchedProfiles] = useState<ProfileSearchRow[]>([])
  const [jamStatusByPost, setJamStatusByPost] = useState<Record<string, JamStatus>>({})
  const [pendingJamCount, setPendingJamCount] = useState(0)
  const [jammingPostId, setJammingPostId] = useState<string | null>(null)

  const withTimeout = useCallback(async <T,>(promise: Promise<T>, label: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} tardó más de 5 segundos.`))
      }, FEED_REQUEST_TIMEOUT_MS)
    })

    try {
      return await Promise.race([promise, timeoutPromise])
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const qParam = params.get('q') ?? ''
      const instrumentParam = params.get('instrument') ?? 'Todos'
      const ciudadParam = params.get('city') ?? ''
      const estadoParam = params.get('estado') ?? 'Todos'

      setSearchQuery((prev) => (prev === qParam ? prev : qParam))
      setFilterInstrument((prev) =>
        prev === instrumentParam
          ? prev
          : INSTRUMENT_FILTERS.includes(instrumentParam as (typeof INSTRUMENT_FILTERS)[number])
            ? instrumentParam
            : 'Todos'
      )
      setFilterCiudad((prev) => (prev === ciudadParam ? prev : ciudadParam))
      setFilterEstado((prev) =>
        prev === estadoParam
          ? prev
          : ESTADO_FILTERS.includes(estadoParam as (typeof ESTADO_FILTERS)[number])
            ? estadoParam
            : 'Todos'
      )
    }

    const onGlobalSearch = (ev: Event) => {
      const custom = ev as CustomEvent<{ q?: string }>
      const q = custom.detail?.q ?? ''
      setSearchQuery((prev) => (prev === q ? prev : q))
    }

    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    window.addEventListener('global-search-changed', onGlobalSearch as EventListener)
    return () => {
      window.removeEventListener('popstate', syncFromUrl)
      window.removeEventListener('global-search-changed', onGlobalSearch as EventListener)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)

    const setOrDelete = (key: string, value: string, emptyValue = '') => {
      const trimmed = value.trim()
      if (!trimmed || trimmed === emptyValue) {
        params.delete(key)
      } else {
        params.set(key, trimmed)
      }
    }

    setOrDelete('q', searchQuery)
    setOrDelete('instrument', filterInstrument, 'Todos')
    setOrDelete('city', filterCiudad)
    setOrDelete('estado', filterEstado, 'Todos')

    const next = params.toString()
    const current = window.location.search.replace(/^\?/, '')
    if (next === current) return
    const target = next ? `?${next}` : window.location.pathname
    window.history.replaceState(window.history.state, '', target)
  }, [searchQuery, filterInstrument, filterCiudad, filterEstado])

  const filteredPosts = useMemo(
    () =>
      filterFeedPosts(currentPosts, {
        searchQuery,
        instrument: filterInstrument,
        ciudad: filterCiudad,
        estado: filterEstado,
      }),
    [currentPosts, searchQuery, filterInstrument, filterCiudad, filterEstado]
  )

  const clearFilters = () => {
    setSearchQuery('')
    setFilterInstrument('Todos')
    setFilterCiudad('')
    setFilterEstado('Todos')
    setMatchedProfiles([])
  }

  const openCreateModal = () => {
    window.dispatchEvent(new CustomEvent('openCreateModal'))
  }

  // Escuchar evento para toggle del panel de chats
  useEffect(() => {
    const handleToggleChatsPanel = () => {
      setChatsPanelVisible(false)
    }

    window.addEventListener('toggleChatsPanel', handleToggleChatsPanel)
    return () => {
      window.removeEventListener('toggleChatsPanel', handleToggleChatsPanel)
    }
  }, [])

  const loadCurrentFeed = useCallback(async () => {
    setFeedLoading(true)
    setFeedTimedOut(false)
    setFeedErrorMessage(null)
    try {
      const supabase = createClient()

      if (activeFeed === 'general' && selectedCommunity?.id && user?.id) {
        const { data: memberIds, error: membersError } = await withTimeout(
          listCommunityMemberIds(supabase, selectedCommunity.id),
          'La carga de miembros de la comunidad'
        )
        if (membersError) {
          console.error('[Home] Error cargando miembros de comunidad', membersError)
          toast({
            title: 'No se pudo cargar la comunidad',
            description: membersError.message,
          })
          setCurrentPosts([])
          return
        }
        const { data, error } = await withTimeout(
          getFeedByUserIds(supabase, {
            userIds: memberIds ?? [],
            limit: 50,
          }),
          'La carga del feed de comunidad'
        )
        if (error) {
          console.error('[Home] Error cargando feed por comunidad', error)
          toast({
            title: 'No se pudo cargar el feed',
            description: error.message,
          })
          setCurrentPosts([])
          return
        }
        const mapped = ((data ?? []) as Array<
          FeedPostRow | (FeedPostRow & { profiles: FeedPostRow['profiles'][] })
        >).map((row) => mapFeedPostRowToDisplayPost(row, 'general'))
        setCurrentPosts(mapped)
        setFeedTimedOut(false)
        setFeedErrorMessage(null)
        return
      }

      const { data, error } = await withTimeout(
        getFeed(supabase, { limit: 50 }),
        'La carga del feed general'
      )
      if (error) {
        console.error('[Home] Error cargando posts', error)
        toast({
          title: 'No se pudo cargar el feed',
          description: error.message,
        })
        setCurrentPosts([])
        return
      }

      const mapped = ((data ?? []) as Array<
        FeedPostRow | (FeedPostRow & { profiles: FeedPostRow['profiles'][] })
      >).map((row) => mapFeedPostRowToDisplayPost(row, activeFeed))
      setCurrentPosts(mapped)
      setFeedTimedOut(false)
      setFeedErrorMessage(null)
    } catch (e) {
      console.error('[Home] loadCurrentFeed', e)
      setFeedErrorMessage(e instanceof Error ? e.message : 'No se pudo cargar el feed.')
      toast({
        title: 'Error al cargar publicaciones',
        description: e instanceof Error ? e.message : 'Intenta de nuevo en un momento.',
      })
      setCurrentPosts([])
    } finally {
      setFeedLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `toast` es estable; incluirlo recrea el callback cada render.
  }, [activeFeed, selectedCommunity?.id, user?.id, withTimeout])

  useEffect(() => {
    if (!feedLoading) return
    const timer = window.setTimeout(() => {
      setFeedTimedOut(true)
      setFeedErrorMessage('La carga tardó demasiado. Revisa tu conexión o intenta de nuevo.')
      setFeedLoading(false)
    }, FEED_REQUEST_TIMEOUT_MS)

    return () => window.clearTimeout(timer)
  }, [feedLoading])

  useEffect(() => {
    if (!mounted) return
    void loadCurrentFeed()
  }, [mounted, loadCurrentFeed])

  useEffect(() => {
    if (!mounted) return
    const handleNewPost = () => {
      void loadCurrentFeed()
    }
    window.addEventListener('newPostCreated', handleNewPost)
    return () => {
      window.removeEventListener('newPostCreated', handleNewPost)
    }
  }, [mounted, loadCurrentFeed])

  useEffect(() => {
    if (!mounted || !user?.id) {
      setJamStatusByPost({})
      setPendingJamCount(0)
      return
    }

    const postIds = Array.from(
      new Set(currentPosts.map((p) => p.id).filter((id): id is string => Boolean(id)))
    )
    if (postIds.length === 0) {
      setJamStatusByPost({})
      setPendingJamCount(0)
      return
    }

    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data, error, pendingCount } = await getMyJamStatusesByPostIds(supabase, postIds)
      if (cancelled) return
      if (error) {
        console.error('[Home] Error cargando estado JAM', error)
        return
      }
      setJamStatusByPost(data)
      setPendingJamCount(pendingCount)
    })()

    return () => {
      cancelled = true
    }
  }, [mounted, user?.id, currentPosts])

  const handleJam = async (postId: string, usuario: string, receiverId: string) => {
    if (!user?.id) {
      toast({
        title: 'Inicia sesión',
        description: 'Inicia sesión para enviar un JAM a este músico.',
      })
      return
    }
    if (!receiverId || receiverId === user.id) return
    if (jamStatusByPost[postId]) return
    if (pendingJamCount >= 10) {
      toast({
        title: 'Límite alcanzado',
        description:
          'Límite de 10 solicitudes pendientes alcanzado. Espera a que alguien responda para mandar más.',
        variant: 'destructive',
      })
      return
    }

    setJammingPostId(postId)
    setJamStatusByPost((prev) => ({ ...prev, [postId]: 'pending' }))
    setPendingJamCount((n) => n + 1)
    const supabase = createClient()
    const { data, error } = await sendJamRequest(supabase, { postId, receiverId })
    setJammingPostId(null)

    if (error) {
      setJamStatusByPost((prev) => {
        const next = { ...prev }
        delete next[postId]
        return next
      })
      setPendingJamCount((n) => Math.max(0, n - 1))
      toast({
        title: 'No se pudo enviar el JAM',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    // Disparar animación JAM
    window.dispatchEvent(new CustomEvent('showJamAnimation'))
    setJamStatusByPost((prev) => ({ ...prev, [postId]: data?.status ?? 'pending' }))

    toast({
      title: "¡JAM enviado!",
      description: `Tu solicitud fue enviada a ${usuario}`,
    })
  }

  const handleEditPost = async (post: AppFeedPost) => {
    if (!user?.id || post.user_id !== user.id) return
    const nextDescription = window.prompt('Edita la descripción de tu publicación', post.texto || '')
    if (nextDescription === null) return

    const supabase = createClient()
    const { error } = await updatePostDescription(supabase, {
      postId: post.id,
      userId: user.id,
      description: nextDescription.trim() || null,
    })

    if (error) {
      toast({
        title: 'No se pudo editar',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Publicación actualizada',
      description: 'Los cambios se guardaron correctamente.',
    })
    await loadCurrentFeed()
  }

  const handleDeletePost = async (post: AppFeedPost) => {
    if (!user?.id || post.user_id !== user.id) return
    const confirmed = window.confirm('¿Seguro que quieres eliminar esta publicación?')
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await deletePost(supabase, {
      postId: post.id,
      userId: user.id,
    })

    if (error) {
      toast({
        title: 'No se pudo eliminar',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Publicación eliminada',
      description: 'Tu publicación fue eliminada del feed.',
    })
    await loadCurrentFeed()
  }

  const handleRetryFeed = () => {
    void loadCurrentFeed()
  }

  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setMatchedProfiles([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      const { data, error } = await searchProfiles(q)
      if (cancelled) return
      if (error || !data) {
        setMatchedProfiles([])
        return
      }
      setMatchedProfiles(data)
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [searchQuery])

  if (!mounted) {
    return (
      <div
        id="feed-main"
        className="relative min-h-[calc(100vh-5rem)] w-full bg-gradient-to-br from-slate-50 via-zinc-100 to-gray-100"
      >
        <JamLoadingPlaceholder className="min-h-[calc(100vh-6rem)]" />
      </div>
    )
  }

  return (
    <>
      <div
        id="feed-main"
        className="relative w-full bg-gradient-to-br from-slate-50 via-zinc-100 to-gray-100"
      >
      {/* Tabs móvil - Solo visible en pantallas pequeñas */}
      <div className="md:hidden sticky top-16 z-40 bg-white border-b-2 border-rolex/30">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 text-center font-semibold transition-all ${
              activeTab === 'chats'
                ? 'text-rolex border-b-2 border-rolex bg-rolex/10'
                : 'text-gray-600'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-center font-semibold transition-all ${
              activeTab === 'feed'
                ? 'text-rolex border-b-2 border-rolex bg-rolex/10'
                : 'text-gray-600'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveTab('comunidad')}
            className={`flex-1 py-3 text-center font-semibold transition-all ${
              activeTab === 'comunidad'
                ? 'text-rolex border-b-2 border-rolex bg-rolex/10'
                : 'text-gray-600'
            }`}
          >
            Comunidad
          </button>
        </div>
      </div>

      {/* Layout Desktop - Sidebar + Feed central (estilo TikTok Web) */}
      <div className="hidden md:grid h-[calc(100vh-4rem)] grid-cols-[300px_minmax(0,1fr)]">
        {/* Sidebar izquierdo fijo/sticky */}
        <aside className="sticky top-0 h-[calc(100vh-4rem)] border-r border-rolex/20 bg-white/95 backdrop-blur-sm p-4">
          <div className="space-y-2">
            <button
              onClick={() => setDesktopSideView('feed')}
              className={`w-full rounded-xl px-3 py-2 text-left font-semibold transition ${desktopSideView === 'feed' ? 'bg-rolex/10 text-rolex' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span className="inline-flex items-center gap-2">
                <Video className="h-4 w-4" />
                Feed principal
              </span>
            </button>
            <button
              onClick={() => setDesktopSideView('comunidades')}
              className={`w-full rounded-xl px-3 py-2 text-left font-semibold transition ${desktopSideView === 'comunidades' ? 'bg-rolex/10 text-rolex' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                Comunidades
              </span>
            </button>
            <button
              onClick={() => setDesktopSideView('mensajes')}
              className={`w-full rounded-xl px-3 py-2 text-left font-semibold transition ${desktopSideView === 'mensajes' ? 'bg-rolex/10 text-rolex' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Mensajes
              </span>
            </button>
            <button
              onClick={() => setDesktopSideView('jams')}
              className={`w-full rounded-xl px-3 py-2 text-left font-semibold transition ${desktopSideView === 'jams' ? 'bg-rolex/10 text-rolex' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span className="inline-flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Solicitudes JAM
              </span>
            </button>
          </div>

          <div className="mt-6 border-t border-rolex/15 pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Categorías de Feed</p>
            <div className="space-y-1">
              {(['general', 'descubrir', 'conectar', 'aprender'] as const).map((feed) => (
                <button
                  key={feed}
                  onClick={() => {
                    setActiveFeed(feed)
                    setDesktopSideView('feed')
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    activeFeed === feed ? 'bg-rolex text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {feed[0].toUpperCase() + feed.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-rolex/15 bg-gray-50 p-3 text-xs text-gray-600">
            Selecciona una opción y se abrirá en la columna principal.
          </div>
        </aside>

        {/* FEED central - único scroll vertical */}
        <main className="overflow-y-auto bg-gradient-to-br from-slate-50 via-zinc-100 to-gray-100">
          {desktopSideView === 'feed' && (
            <>
              <div className="sticky top-0 z-10 border-b-2 border-rolex/30 bg-white/95 shadow-sm backdrop-blur-sm">
                <FeedToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  instrument={filterInstrument}
                  onInstrumentChange={setFilterInstrument}
                  ciudad={filterCiudad}
                  onCiudadChange={setFilterCiudad}
                  estado={filterEstado}
                  onEstadoChange={setFilterEstado}
                  onClearFilters={clearFilters}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
                {searchQuery.trim().length >= 2 && matchedProfiles.length > 0 && (
                  <div className="rounded-xl border border-rolex/20 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-700">Usuarios encontrados</p>
                    <div className="flex flex-wrap gap-2">
                      {matchedProfiles.map((profile) => {
                        const label = profile.full_name || profile.username || profile.email || profile.id.slice(0, 8)
                        const target = profile.username || profile.id
                        return (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => {
                              window.location.href = `/usuario/${encodeURIComponent(target)}`
                            }}
                            className="rounded-full border border-rolex/30 px-3 py-1 text-xs font-semibold text-rolex transition hover:bg-rolex/10"
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                {selectedCommunity && (
                  <div className="rounded-xl border border-rolex/20 bg-white px-4 py-3 text-sm text-gray-700">
                    Mostrando publicaciones de la comunidad{' '}
                    <span className="font-semibold text-gray-900">{selectedCommunity.nombre}</span>.
                    <button
                      type="button"
                      className="ml-2 font-semibold text-rolex underline"
                      onClick={() => setSelectedCommunity(null)}
                    >
                      Ver todo
                    </button>
                  </div>
                )}
                {feedLoading ? (
                  <JamLoadingPlaceholder className="min-h-[24rem]" />
                ) : feedTimedOut ? (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-center">
                    <p className="text-sm font-semibold text-amber-900">La carga está tardando demasiado</p>
                    <p className="mt-1 text-xs text-amber-800">
                      {feedErrorMessage ?? 'Hubo un problema temporal al cargar el feed en este entorno.'}
                    </p>
                    <Button
                      type="button"
                      onClick={handleRetryFeed}
                      className="mt-4 text-white hover:opacity-90"
                      style={{ backgroundColor: 'var(--rolex)' }}
                    >
                      Reintentar
                    </Button>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="flex h-96 flex-col items-center justify-center text-center">
                    <Music className="mb-4 h-20 w-20 text-rolex/50" />
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                      {currentPosts.length === 0 ? 'Aún no hay publicaciones' : 'Nada coincide con tu búsqueda'}
                    </h2>
                    <p className="mb-6 text-gray-600">
                      {currentPosts.length === 0
                        ? 'Cuando la comunidad publique videos, aparecerán aquí.'
                        : 'Prueba otros filtros o limpia la búsqueda'}
                    </p>
                    {currentPosts.length > 0 && filteredPosts.length === 0 && (
                      <Button variant="outline" onClick={clearFilters} style={{ borderColor: 'var(--rolex)', color: 'var(--rolex)' }}>
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <FeedVideoCard
                      key={post.id}
                      post={post}
                      onJam={handleJam}
                      jamStatus={jamStatusByPost[post.id] ?? null}
                      jamLoading={Boolean(jammingPostId === post.id)}
                      jamLimitReached={pendingJamCount >= 10 && !jamStatusByPost[post.id]}
                      disableJam={Boolean(
                        (user?.id && post.user_id && post.user_id === user.id) ||
                          (pendingJamCount >= 10 && !jamStatusByPost[post.id])
                      )}
                      canManage={Boolean(user?.id && (post as AppFeedPost).user_id === user.id)}
                      onEditPost={(p) => void handleEditPost(p as AppFeedPost)}
                      onDeletePost={(p) => void handleDeletePost(p as AppFeedPost)}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {desktopSideView === 'mensajes' && (
            <div className="mx-auto max-w-3xl p-6 md:p-8">
              <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-rolex/20">
                <ChatsPanel />
              </div>
            </div>
          )}

          {desktopSideView === 'comunidades' && (
            <div className="mx-auto max-w-4xl p-6 md:p-8">
              <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-rolex/20">
                <ComunidadPanel
                  selectedCommunityId={selectedCommunity?.id ?? null}
                  onSelectCommunity={(community) => {
                    setSelectedCommunity(community)
                    if (community) {
                      setDesktopSideView('feed')
                      setActiveFeed('general')
                    }
                  }}
                />
              </div>
            </div>
          )}

          {desktopSideView === 'jams' && (
            <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 px-6 py-24 text-center md:px-8">
              <Inbox className="h-10 w-10 text-rolex/40" />
              <h2 className="text-xl font-semibold text-gray-900">JAMs</h2>
              <p className="max-w-md text-sm leading-relaxed text-gray-600">
                En la beta, las solicitudes JAM se conectarán a datos reales. Por ahora no hay solicitudes
                pendientes.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Layout Móvil - Tabs */}
      <div className="md:hidden">
        {activeTab === 'chats' && (
          <div className="h-[calc(100vh-8rem)]">
            <ChatsPanel />
          </div>
        )}
        {activeTab === 'feed' && (
          <div className="h-[calc(100vh-8rem)] overflow-y-auto bg-gradient-to-br from-slate-50 via-zinc-100 to-gray-100">
            <div className="sticky top-0 z-10 border-b-2 border-rolex/30 bg-white/95 backdrop-blur-sm">
              <FeedToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                instrument={filterInstrument}
                onInstrumentChange={setFilterInstrument}
                ciudad={filterCiudad}
                onCiudadChange={setFilterCiudad}
                estado={filterEstado}
                onEstadoChange={setFilterEstado}
                onClearFilters={clearFilters}
                isAuthenticated={isAuthenticated}
              />
            </div>
            <div className="space-y-4 p-4">
              {searchQuery.trim().length >= 2 && matchedProfiles.length > 0 && (
                <div className="rounded-xl border border-rolex/20 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-700">Usuarios encontrados</p>
                  <div className="flex flex-wrap gap-2">
                    {matchedProfiles.map((profile) => {
                      const label = profile.full_name || profile.username || profile.email || profile.id.slice(0, 8)
                      const target = profile.username || profile.id
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => {
                            window.location.href = `/usuario/${encodeURIComponent(target)}`
                          }}
                          className="rounded-full border border-rolex/30 px-3 py-1 text-[11px] font-semibold text-rolex"
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {feedLoading ? (
                <JamLoadingPlaceholder className="min-h-[20rem]" />
              ) : feedTimedOut ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-900">La carga está tardando demasiado</p>
                  <p className="mt-1 text-xs text-amber-800">
                    {feedErrorMessage ?? 'No pudimos cargar el feed a tiempo.'}
                  </p>
                  <Button
                    type="button"
                    onClick={handleRetryFeed}
                    className="mt-3 text-white hover:opacity-90"
                    style={{ backgroundColor: 'var(--rolex)' }}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Music className="mb-4 h-16 w-16 text-rolex/50" />
                  <p className="text-gray-600">
                    {currentPosts.length === 0
                      ? 'Aún no hay publicaciones'
                      : 'Nada coincide con tu búsqueda'}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <FeedVideoCard
                    key={post.id}
                    post={post}
                    onJam={handleJam}
                    jamStatus={jamStatusByPost[post.id] ?? null}
                    jamLoading={Boolean(jammingPostId === post.id)}
                    jamLimitReached={pendingJamCount >= 10 && !jamStatusByPost[post.id]}
                    disableJam={Boolean(
                      (user?.id && post.user_id && post.user_id === user.id) ||
                        (pendingJamCount >= 10 && !jamStatusByPost[post.id])
                    )}
                    canManage={Boolean(user?.id && (post as AppFeedPost).user_id === user.id)}
                    onEditPost={(p) => void handleEditPost(p as AppFeedPost)}
                    onDeletePost={(p) => void handleDeletePost(p as AppFeedPost)}
                  />
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === 'comunidad' && (
          <div className="h-[calc(100vh-8rem)]">
            <ComunidadPanel />
          </div>
        )}
      </div>

      {isAuthenticated && (
        <button
          type="button"
          onClick={openCreateModal}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'var(--rolex)' }}
          aria-label="Publicar"
        >
          <span className="text-2xl font-bold leading-none">+</span>
          <span className="text-sm font-bold">Publicar</span>
        </button>
      )}
    </div>
    </>
  )
}
