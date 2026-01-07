'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Music, MessageCircle, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FeedTabs from '@/app/components/FeedTabs'
import { CONECTAR_POSTS, type MockPost } from '@/app/data/mockPosts'

export default function ConectarFeed() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentPosts, setCurrentPosts] = useState<MockPost[]>(CONECTAR_POSTS)

  // Cargar publicaciones del usuario desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
      // Filtrar solo posts del feed conectar
      const conectarUserPosts = userPosts.filter((post: MockPost) => 
        post.feedType === 'conectar'
      )
      if (conectarUserPosts.length > 0) {
        // Combinar posts del usuario con los mock posts
        setCurrentPosts([...conectarUserPosts, ...CONECTAR_POSTS])
      }
    }

    // Escuchar eventos de nueva publicación
    const handleNewPost = () => {
      const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
      // Filtrar solo posts del feed conectar
      const conectarUserPosts = userPosts.filter((post: MockPost) => 
        post.feedType === 'conectar'
      )
      setCurrentPosts([...conectarUserPosts, ...CONECTAR_POSTS])
    }

    window.addEventListener('newPostCreated', handleNewPost)
    return () => {
      window.removeEventListener('newPostCreated', handleNewPost)
    }
  }, [])

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
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8">
      {/* Tabs de Feed */}
      <FeedTabs />

      {/* Feed */}
      <div className="max-w-4xl mx-auto px-4">
        {currentPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Music className="w-20 h-20 text-purple-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay publicaciones aún</h2>
            <p className="text-gray-600 mb-6">Sé el primero en compartir</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {currentPosts.map((post, index) => (
              <div
                key={post.id}
                className="relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl"
              >
                <div className={`absolute top-0 left-0 right-0 h-32 ${getGradientClass(index)}`} />

                <div className="relative p-6 pt-20">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-4xl shadow-lg border-2 border-white -mt-12">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {post.usuario}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-purple-100 rounded-full font-semibold text-purple-700">
                          🎸 {post.instrumento}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 rounded-full font-semibold text-blue-700">
                          🎵 {post.estilo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{post.ciudad}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed line-clamp-4">
                      {post.texto}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleJam(post.id, post.usuario)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                      <Music className="w-4 h-4 mr-2" />
                      JAM
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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


