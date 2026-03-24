'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { Music, Video, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatsPanel from './components/ChatsPanel'
import ComunidadPanel from './components/ComunidadPanel'
import WelcomeBanner from './components/WelcomeBanner'
import FeedToolbar from './components/FeedToolbar'
import FeedVideoCard from './components/FeedVideoCard'
import { GENERAL_POSTS, DESCUBRIR_POSTS, CONECTAR_POSTS, APRENDER_POSTS, type MockPost } from './data/mockPosts'
import { filterFeedPosts } from '@/src/lib/feedFilters'

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'chats' | 'feed' | 'comunidad'>('feed')
  const [activeFeed, setActiveFeed] = useState<'general' | 'descubrir' | 'conectar' | 'aprender'>('general')
  const [currentPosts, setCurrentPosts] = useState<MockPost[]>(GENERAL_POSTS)
  const [chatsPanelVisible, setChatsPanelVisible] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterInstrument, setFilterInstrument] = useState('Todos')
  const [filterCiudad, setFilterCiudad] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')

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

  // Actualizar posts cuando cambia el feed activo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
      
      let basePosts: MockPost[] = []
      switch (activeFeed) {
        case 'general':
          basePosts = GENERAL_POSTS
          break
        case 'descubrir':
          basePosts = DESCUBRIR_POSTS
          break
        case 'conectar':
          basePosts = CONECTAR_POSTS
          break
        case 'aprender':
          basePosts = APRENDER_POSTS
          break
      }

      // Filtrar posts del usuario según el feed activo
      const filteredUserPosts = userPosts.filter((post: MockPost) => 
        post.feedType === activeFeed || (activeFeed === 'general' && (!post.feedType || post.feedType === 'general'))
      )
      
      setCurrentPosts([...filteredUserPosts, ...basePosts])
    }
  }, [activeFeed])

  // Escuchar eventos de nueva publicación
  useEffect(() => {
    const handleNewPost = () => {
      if (typeof window !== 'undefined') {
        const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
        
        let basePosts: MockPost[] = []
        switch (activeFeed) {
          case 'general':
            basePosts = GENERAL_POSTS
            break
          case 'descubrir':
            basePosts = DESCUBRIR_POSTS
            break
          case 'conectar':
            basePosts = CONECTAR_POSTS
            break
          case 'aprender':
            basePosts = APRENDER_POSTS
            break
        }

        const filteredUserPosts = userPosts.filter((post: MockPost) => 
          post.feedType === activeFeed || (activeFeed === 'general' && (!post.feedType || post.feedType === 'general'))
        )
        
        setCurrentPosts([...filteredUserPosts, ...basePosts])
      }
    }

    window.addEventListener('newPostCreated', handleNewPost)
    return () => {
      window.removeEventListener('newPostCreated', handleNewPost)
    }
  }, [activeFeed])

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


  return (
    <>
      {!isAuthenticated && <WelcomeBanner />}
      <div
        id="feed-main"
        className="relative w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
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

      {/* Layout Desktop - 3 columnas */}
      <div className="hidden md:flex h-screen">
        {/* CHATS izquierda 25% */}
        {chatsPanelVisible && (
          <div className="w-1/4 bg-white border-r-2 border-rolex/30 overflow-y-auto relative">
            <ChatsPanel />
          </div>
        )}

        {/* Botón para mostrar chats cuando está oculto */}
        {!chatsPanelVisible && (
          <button
            onClick={() => setChatsPanelVisible(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-20 text-white p-2 rounded-r-lg transition-colors shadow-lg hover:opacity-90"
            style={{ backgroundColor: 'var(--rolex)' }}
            aria-label="Mostrar chats"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* FEED centro - ajusta ancho según si el panel está visible */}
        <div className={`overflow-y-auto bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col transition-all duration-300 ${chatsPanelVisible ? 'w-1/2' : 'w-1/3'}`}>
          <div className="sticky top-0 z-10 border-b-2 border-rolex/30 bg-white/95 shadow-sm backdrop-blur-sm">
            <div className="flex">
              <button
                onClick={() => setActiveFeed('general')}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeFeed === 'general'
                    ? 'text-rolex border-b-2 border-rolex bg-rolex/10'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveFeed('descubrir')}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeFeed === 'descubrir'
                    ? 'text-rolex border-b-2 border-rolex bg-rolex/10'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Descubrir
              </button>
              <button
                onClick={() => setActiveFeed('conectar')}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeFeed === 'conectar'
                    ? 'text-rolex border-b-2 border-rolex bg-rolex/10'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Conectar
              </button>
              <button
                onClick={() => setActiveFeed('aprender')}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeFeed === 'aprender'
                    ? 'text-rolex border-b-2 border-rolex bg-rolex/10'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aprender
              </button>
            </div>
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
            />
            {isAuthenticated && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rolex/10 px-4 py-3">
                <p className="text-sm font-medium text-gray-600">
                  <span className="font-bold" style={{ color: 'var(--rolex)' }}>
                    Nueva publicación
                  </span>{' '}
                  — comparte un video o mensaje con la comunidad.
                </p>
                <Button
                  type="button"
                  onClick={openCreateModal}
                  className="gap-2 font-bold text-white shadow-md"
                  style={{ backgroundColor: 'var(--rolex)' }}
                >
                  <Video className="h-4 w-4" />
                  Subir video / publicar
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6 p-6 md:p-8">
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
                <FeedVideoCard key={post.id} post={post} onJam={handleJam} />
              ))
            )}
          </div>
        </div>

        {/* COMUNIDAD derecha - ajusta ancho según si el panel está visible */}
        <div className={chatsPanelVisible ? 'w-1/4' : 'w-2/3'}>
          <ComunidadPanel />
        </div>
      </div>

      {/* Layout Móvil - Tabs */}
      <div className="md:hidden">
        {activeTab === 'chats' && (
          <div className="h-[calc(100vh-8rem)]">
            <ChatsPanel />
          </div>
        )}
        {activeTab === 'feed' && (
          <div className="h-[calc(100vh-8rem)] overflow-y-auto bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
              />
              {isAuthenticated && (
                <div className="flex items-center justify-between gap-2 border-t border-rolex/10 px-3 py-1.5">
                  <Button
                    type="button"
                    onClick={openCreateModal}
                    className="flex-1 gap-2 py-3 text-sm font-bold text-white"
                    style={{ backgroundColor: 'var(--rolex)' }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Nueva publicación
                  </Button>
                </div>
              )}
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
                  <FeedVideoCard key={post.id} post={post} onJam={handleJam} />
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
          className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 md:h-20 md:w-20 md:text-4xl"
          style={{ backgroundColor: 'var(--rolex)' }}
          aria-label="Crear publicación"
        >
          +
        </button>
      )}
    </div>
    </>
  )
}
