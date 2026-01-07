'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useToast } from '@/hooks/use-toast'
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
      'bg-gradient-to-br from-purple-100 to-pink-100',
      'bg-gradient-to-br from-blue-100 to-cyan-100',
      'bg-gradient-to-br from-green-100 to-emerald-100',
      'bg-gradient-to-br from-yellow-100 to-orange-100',
      'bg-gradient-to-br from-indigo-100 to-purple-100',
      'bg-gradient-to-br from-pink-100 to-rose-100',
      'bg-gradient-to-br from-amber-100 to-yellow-100',
      'bg-gradient-to-br from-teal-100 to-green-100'
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Tabs móvil - Solo visible en pantallas pequeñas */}
      <div className="md:hidden sticky top-16 z-40 bg-white border-b-2 border-purple-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 text-center font-semibold transition-all ${
              activeTab === 'chats'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-center font-semibold transition-all ${
              activeTab === 'feed'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveTab('comunidad')}
            className={`flex-1 py-3 text-center font-semibold transition-all ${
              activeTab === 'comunidad'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
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
        <div className="w-1/4 bg-white border-r-2 border-purple-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="font-bold mb-4 text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">CHATS</h2>
            <div className="space-y-2">
              <div className="p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-2xl">
                    🎸
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Sembrador</h3>
                      <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">2</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-2xl">
                    🎸
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Carlos Rock</h3>
                      <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEED centro 50% */}
        <div className="w-1/2 overflow-y-auto bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex flex-col">
          {/* Barra de Tabs */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b-2 border-purple-200">
            <div className="flex">
              <button
                onClick={() => setActiveFeed('general')}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeFeed === 'general'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveFeed('descubrir')}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeFeed === 'descubrir'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Descubrir
              </button>
              <button
                onClick={() => setActiveFeed('conectar')}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeFeed === 'conectar'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Conectar
              </button>
              <button
                onClick={() => setActiveFeed('aprender')}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeFeed === 'aprender'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
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
              <Music className="w-20 h-20 text-purple-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay publicaciones aún</h2>
              <p className="text-gray-600 mb-6">Sé el primero en compartir</p>
            </div>
          ) : (
            currentPosts.map((post, index) => (
              <div
                key={post.id}
                className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center mb-4">
                  <Link href={`/usuario/${post.usuario}`} className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-3xl mr-4 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer">
                    {post.avatar}
                  </Link>
                  <div>
                    <Link href={`/usuario/${post.usuario}`} className="hover:underline">
                      <h3 className="font-bold text-xl text-gray-900">{post.usuario}</h3>
                    </Link>
                    <p className="text-purple-600 font-semibold">{post.instrumento}</p>
                  </div>
                </div>
                <p className="mt-2 text-gray-600 mb-4">{post.texto}</p>
                
                {/* Botones de interacción */}
                <div className="mb-4">
                  <PostActions postId={post.id} usuario={post.usuario} />
                </div>

                <Button
                  onClick={() => handleJam(post.id, post.usuario)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl"
                >
                  <Music className="w-4 h-4 mr-2" />
                  JAM
                </Button>
              </div>
            ))
          )}
          </div>
        </div>

        {/* COMUNIDAD derecha 25% */}
        <div className="w-1/4">
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
          <div className="h-[calc(100vh-8rem)] overflow-y-auto bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
            {currentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Music className="w-20 h-20 text-purple-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay publicaciones aún</h2>
                <p className="text-gray-600 mb-6">Sé el primero en compartir</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Link href={`/usuario/${post.usuario}`} className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-3xl flex-shrink-0 hover:scale-110 transition-transform cursor-pointer">
                        {post.avatar}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/usuario/${post.usuario}`} className="hover:underline">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {post.usuario}
                          </h3>
                        </Link>
                        <p className="text-sm text-purple-600 font-semibold">
                          {post.instrumento}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed line-clamp-3">
                        {post.texto}
                      </p>
                    </div>

                    {/* Botones de interacción */}
                    <div className="mb-4">
                      <PostActions postId={post.id} usuario={post.usuario} />
                    </div>

                    <Button
                      onClick={() => handleJam(post.id, post.usuario)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:scale-105"
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
        className="fixed bottom-8 right-8 w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-4xl font-bold transition-all duration-300 hover:scale-110 active:scale-95 z-50"
        aria-label="Crear publicación"
      >
        +
      </button>
    </div>
  )
}
