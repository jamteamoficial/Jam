'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ChatsPanel from './components/ChatsPanel'
import ComunidadPanel from './components/ComunidadPanel'
import PostActions from './components/PostActions'
import { GENERAL_POSTS, DESCUBRIR_POSTS, CONECTAR_POSTS, APRENDER_POSTS, type MockPost } from './data/mockPosts'

export default function Home() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'chats' | 'feed' | 'comunidad'>('feed')
  const [activeFeed, setActiveFeed] = useState<'general' | 'descubrir' | 'conectar' | 'aprender'>('general')
  const [currentPosts, setCurrentPosts] = useState<MockPost[]>(GENERAL_POSTS)
  const [chatsPanelVisible, setChatsPanelVisible] = useState(true)

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


  const getGradientClass = (index: number) => {
    const gradients = [
      'bg-gradient-to-br from-green-100 to-emerald-100',
      'bg-gradient-to-br from-blue-100 to-cyan-100',
      'bg-gradient-to-br from-green-100 to-emerald-100',
      'bg-gradient-to-br from-yellow-100 to-orange-100',
      'bg-gradient-to-br from-emerald-100 to-green-100',
      'bg-gradient-to-br from-pink-100 to-rose-100',
      'bg-gradient-to-br from-amber-100 to-yellow-100',
      'bg-gradient-to-br from-teal-100 to-green-100'
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
          {/* Barra de Tabs */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b-2 border-rolex/30">
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
          </div>

          {/* Contenido del Feed */}
          <div className="p-8 space-y-6 flex-1">
            {currentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <Music className="w-20 h-20 text-rolex/50 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay publicaciones aún</h2>
              <p className="text-gray-600 mb-6">Sé el primero en compartir</p>
            </div>
          ) : (
            currentPosts.map((post, index) => {
              console.log('Post renderizado:', post)
              return (
              <div
                key={post.id}
                className="bg-white border-2 border-rolex/30 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center mb-4">
                  <Link href={`/usuario/${post.usuario}`} className="w-16 h-16 rounded-full bg-rolex flex items-center justify-center text-3xl mr-4 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer">
                    {post.avatar}
                  </Link>
                  <div>
                    <Link href={`/usuario/${post.usuario}`} className="hover:underline">
                      <h3 className="font-bold text-xl text-gray-900">{post.usuario}</h3>
                    </Link>
                    <p className="text-rolex font-semibold">{post.instrumento}</p>
                  </div>
                </div>
                {post.texto && (
                  <p className="mt-2 text-gray-600 mb-4">{post.texto}</p>
                )}
                
                {/* Mostrar video si existe */}
                {(post as any).video_url && (
                  <div className="mb-4 rounded-xl overflow-hidden w-full">
                    <video
                      src={(post as any).video_url}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full rounded-xl"
                    >
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  </div>
                )}
                
                {/* Botones de interacción */}
                <div className="mb-4">
                  <PostActions postId={post.id} usuario={post.usuario} />
                </div>

                <Button
                  onClick={() => handleJam(post.id, post.usuario)}
                  className="w-full text-white font-bold py-3 rounded-xl hover:opacity-90"
                  style={{ backgroundColor: 'var(--rolex)' }}
                >
                  <Music className="w-4 h-4 mr-2" />
                  JAM
                </Button>
              </div>
              )
            })
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
          <div className="h-[calc(100vh-8rem)] overflow-y-auto bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
            {currentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Music className="w-20 h-20 text-rolex/50 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay publicaciones aún</h2>
                <p className="text-gray-600 mb-6">Sé el primero en compartir</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-rolex/20 hover:border-rolex/40 transition-all hover:shadow-xl p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Link href={`/usuario/${post.usuario}`} className="w-16 h-16 rounded-full bg-rolex flex items-center justify-center text-3xl flex-shrink-0 hover:scale-110 transition-transform cursor-pointer">
                        {post.avatar}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/usuario/${post.usuario}`} className="hover:underline">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {post.usuario}
                          </h3>
                        </Link>
                        <p className="text-sm text-rolex font-semibold">
                          {post.instrumento}
                        </p>
                      </div>
                    </div>
                    {post.texto && (
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed line-clamp-3">
                          {post.texto}
                        </p>
                      </div>
                    )}

                    {/* Mostrar video si existe (móvil) */}
                    {(post as any).video_url && (
                      <div className="mb-4 rounded-xl overflow-hidden w-full">
                        <video
                          src={(post as any).video_url}
                          controls
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full rounded-xl"
                        >
                          Tu navegador no soporta la reproducción de video.
                        </video>
                      </div>
                    )}

                    {/* Botones de interacción */}
                    <div className="mb-4">
                      <PostActions postId={post.id} usuario={post.usuario} />
                    </div>

                    <Button
                      onClick={() => handleJam(post.id, post.usuario)}
                      className="w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:scale-105 hover:opacity-90"
                      style={{ backgroundColor: 'var(--rolex)' }}
                    >
                      <Music className="w-4 h-4 mr-2" />
                      JAM
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'comunidad' && (
          <div className="h-[calc(100vh-8rem)]">
            <ComunidadPanel />
          </div>
        )}
      </div>

      {/* Botón flotante Crear Publicación */}
      <button
        onClick={() => {
          const event = new CustomEvent('openCreateModal')
          window.dispatchEvent(event)
        }}
        className="fixed bottom-8 right-8 w-20 h-20 bg-rolex hover:bg-rolex-dark text-white rounded-full shadow-2xl flex items-center justify-center text-4xl font-bold transition-all duration-300 hover:scale-110 active:scale-95 z-50"
        aria-label="Crear publicación"
      >
        +
      </button>
    </div>
  )
}
// forzando rebuild vercel
