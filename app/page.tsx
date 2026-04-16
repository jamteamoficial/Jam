'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from './context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { Music, Video, MessageCircle, Users, Inbox, Check, XCircle, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatsPanel from './components/ChatsPanel'
import ComunidadPanel from './components/ComunidadPanel'
import FeedToolbar, { ESTADO_FILTERS, INSTRUMENT_FILTERS } from './components/FeedToolbar'
import FeedVideoCard from './components/FeedVideoCard'
import { GENERAL_POSTS, DESCUBRIR_POSTS, CONECTAR_POSTS, APRENDER_POSTS, type MockPost } from './data/mockPosts'
import { filterFeedPosts } from '@/src/lib/feedFilters'
import { createClient } from '@/src/lib/supabase/client'
import {
  deletePost,
  getFeed,
  getFeedByUserIds,
  updatePostDescription,
  type FeedPostRow,
} from '@/src/lib/services/jam-social'
import { listCommunityMemberIds } from '@/src/lib/services/communities'

type DesktopJamEstado = 'pendiente' | 'aceptado' | 'rechazado'

interface DesktopJamRequest {
  id: string
  usuario: string
  chatId: string
  estado: DesktopJamEstado
  ciudad: string
  comuna: string
  edad: number
  seguidores: number
  estilos: string[]
  bio: string
}

type AppFeedPost = MockPost & {
  user_id?: string
  created_at?: string
}

function mapFeedRowToPost(row: FeedPostRow | (FeedPostRow & { profiles: FeedPostRow['profiles'][] })): AppFeedPost {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
  return {
    id: row.id,
    user_id: row.user_id,
    created_at: row.created_at,
    usuario: profile?.full_name || profile?.username || row.user_id.slice(0, 8),
    full_name: profile?.full_name || undefined,
    username: profile?.username || undefined,
    avatar_url: profile?.avatar_url || null,
    profile_id: row.user_id,
    instrumento: profile?.instrumentos?.[0] || 'Músico',
    estilo: profile?.bio || 'Varios',
    ciudad: '—',
    texto: row.description || '',
    avatar: '🎵',
    tipo: 'video',
    feedType: 'general',
    video_url: row.video_url,
    estado: 'Disponible para tocar',
  }
}

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'chats' | 'feed' | 'comunidad'>('feed')
  const [activeFeed, setActiveFeed] = useState<'general' | 'descubrir' | 'conectar' | 'aprender'>('general')
  const [currentPosts, setCurrentPosts] = useState<AppFeedPost[]>(GENERAL_POSTS)
  const [chatsPanelVisible, setChatsPanelVisible] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterInstrument, setFilterInstrument] = useState('Todos')
  const [filterCiudad, setFilterCiudad] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [desktopSideView, setDesktopSideView] = useState<'feed' | 'mensajes' | 'comunidades' | 'jams'>('feed')
  const [selectedCommunity, setSelectedCommunity] = useState<{ id: string; nombre: string } | null>(null)

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
  }

  const openCreateModal = () => {
    window.dispatchEvent(new CustomEvent('openCreateModal'))
  }

  const [desktopJamRequests, setDesktopJamRequests] = useState<DesktopJamRequest[]>([
    {
      id: 'jam-1',
      usuario: 'Carlos Rock',
      chatId: 'mock-1',
      estado: 'pendiente' as const,
      ciudad: 'Santiago',
      comuna: 'Providencia',
      edad: 27,
      seguidores: 320,
      estilos: ['Rock', 'Funk'],
      bio: 'Baterista de sesión, disponible para shows y grabaciones.',
    },
    {
      id: 'jam-2',
      usuario: 'María Jazz',
      chatId: 'mock-2',
      estado: 'pendiente' as const,
      ciudad: 'Viña del Mar',
      comuna: 'Reñaca',
      edad: 24,
      seguidores: 198,
      estilos: ['Jazz', 'Neo Soul'],
      bio: 'Tecladista y compositora, busco proyectos originales.',
    },
    {
      id: 'jam-3',
      usuario: 'Diego Beats',
      chatId: 'mock-3',
      estado: 'aceptado' as const,
      ciudad: 'Valparaíso',
      comuna: 'Cerro Alegre',
      edad: 31,
      seguidores: 540,
      estilos: ['Funk', 'R&B', 'Pop'],
      bio: 'Bajista groove-oriented. Ensayo semanal y buena onda.',
    },
  ])
  const [openJamProfileId, setOpenJamProfileId] = useState<string | null>(null)
  const pendingDesktopJams = desktopJamRequests.filter((j) => j.estado === 'pendiente').length

  const aceptarDesktopJam = (id: string) => {
    setDesktopJamRequests((prev) =>
      prev.map((jam) => (jam.id === id ? { ...jam, estado: 'aceptado' as const } : jam))
    )
  }

  const rechazarDesktopJam = (id: string) => {
    setDesktopJamRequests((prev) =>
      prev.map((jam) => (jam.id === id ? { ...jam, estado: 'rechazado' as const } : jam))
    )
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

  const loadCurrentFeed = async () => {
    if (activeFeed === 'general') {
      const supabase = createClient()
      if (selectedCommunity?.id) {
        const { data: memberIds, error: membersError } = await listCommunityMemberIds(
          supabase,
          selectedCommunity.id
        )
        if (membersError) {
          console.error('[Home] Error cargando miembros de comunidad', membersError)
          setCurrentPosts([])
          return
        }
        const { data, error } = await getFeedByUserIds(supabase, {
          userIds: memberIds ?? [],
          limit: 50,
        })
        if (error) {
          console.error('[Home] Error cargando feed por comunidad', error)
          setCurrentPosts([])
          return
        }
        const mapped = ((data ?? []) as Array<
          FeedPostRow | (FeedPostRow & { profiles: FeedPostRow['profiles'][] })
        >).map(mapFeedRowToPost)
        setCurrentPosts(mapped)
        return
      }
      const { data, error } = await getFeed(supabase, { limit: 50 })
      if (error) {
        console.error('[Home] Error cargando posts', error)
        setCurrentPosts(GENERAL_POSTS)
        return
      }
      const mapped = ((data ?? []) as Array<FeedPostRow | (FeedPostRow & { profiles: FeedPostRow['profiles'][] })>).map(mapFeedRowToPost)
      setCurrentPosts(mapped)
      return
    }

    switch (activeFeed) {
      case 'descubrir':
        setCurrentPosts(DESCUBRIR_POSTS)
        break
      case 'conectar':
        setCurrentPosts(CONECTAR_POSTS)
        break
      case 'aprender':
        setCurrentPosts(APRENDER_POSTS)
        break
      default:
        setCurrentPosts(GENERAL_POSTS)
        break
    }
  }

  useEffect(() => {
    void loadCurrentFeed()
  }, [activeFeed, selectedCommunity?.id])

  useEffect(() => {
    const handleNewPost = () => {
      void loadCurrentFeed()
    }
    window.addEventListener('newPostCreated', handleNewPost)
    return () => {
      window.removeEventListener('newPostCreated', handleNewPost)
    }
  }, [activeFeed, selectedCommunity?.id])

  const handleJam = (postId: string, usuario: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para enviar un JAM",
        variant: "destructive"
      })
      return
    }

    // Disparar animación JAM
    window.dispatchEvent(new CustomEvent('showJamAnimation'))

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
                {pendingDesktopJams > 0 && (
                  <span className="rounded-full bg-rolex px-2 text-xs text-white">{pendingDesktopJams}</span>
                )}
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
                {filteredPosts.length === 0 ? (
                  <div className="flex h-96 flex-col items-center justify-center text-center">
                    <Music className="mb-4 h-20 w-20 text-rolex/50" />
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                      {currentPosts.length === 0 ? 'No hay publicaciones aún' : 'Nada coincide con tu búsqueda'}
                    </h2>
                    <p className="mb-6 text-gray-600">
                      {currentPosts.length === 0
                        ? 'Sé el primero en compartir'
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
            <div className="mx-auto max-w-3xl space-y-4 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900">Solicitudes JAM</h2>
              {desktopJamRequests.map((jam) => (
                <div key={jam.id} className="rounded-xl border border-rolex/20 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/usuario/${encodeURIComponent(jam.usuario)}`}
                        className="font-semibold text-gray-900 hover:underline"
                      >
                        {jam.usuario}
                      </Link>
                      <p className="text-sm text-gray-500">Estado: {jam.estado}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/usuario/${encodeURIComponent(jam.usuario)}`}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: 'var(--rolex)' }}
                      >
                        Ver perfil
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenJamProfileId((current) => (current === jam.id ? null : jam.id))
                        }
                        className="rounded-lg border border-rolex/30 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Ver resumen
                      </button>
                    </div>
                  </div>

                  {openJamProfileId === jam.id && (
                    <div className="mt-3 rounded-lg border border-rolex/15 bg-gray-50 p-3">
                      <p className="text-sm text-gray-700">{jam.bio}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <p className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-rolex/70" />
                          {jam.ciudad}
                        </p>
                        <p>Comuna: <span className="font-semibold">{jam.comuna}</span></p>
                        <p>Edad: <span className="font-semibold">{jam.edad}</span></p>
                        <p>Seguidores: <span className="font-semibold">{jam.seguidores}</span></p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {jam.estilos.map((estilo) => (
                          <span key={estilo} className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700 border border-rolex/15">
                            {estilo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {jam.estado === 'pendiente' ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => aceptarDesktopJam(jam.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: 'var(--rolex)' }}
                      >
                        <Check className="h-4 w-4" />
                        Aceptar
                      </button>
                      <button
                        type="button"
                        onClick={() => rechazarDesktopJam(jam.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Rechazar
                      </button>
                    </div>
                  ) : jam.estado === 'aceptado' ? (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 p-2">
                      <span className="text-sm font-semibold text-rolex">✓ JAM aceptado</span>
                      <Link
                        href={`/chat/${jam.chatId}`}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: 'var(--rolex)' }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Mensaje
                      </Link>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-medium text-gray-500">Solicitud rechazada.</p>
                  )}
                </div>
              ))}
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
              {filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Music className="mb-4 h-16 w-16 text-rolex/50" />
                  <p className="text-gray-600">
                    {currentPosts.length === 0
                      ? 'No hay publicaciones aún'
                      : 'Nada coincide con tu búsqueda'}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <FeedVideoCard
                    key={post.id}
                    post={post}
                    onJam={handleJam}
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
