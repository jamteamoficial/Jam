'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Music } from 'lucide-react'
import Header from '../../components/Header'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import type { UserProfile } from '../../context/AuthContext'

interface PostData {
  id: string
  name: string
  username: string
  avatar: string
  content: string
  likes: number
  comments: number
}

// Componente para la tarjeta de post con likes interactivos
function PostCard({ post }: { post: PostData }) {
  const [likes, setLikes] = useState(post.likes)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    // Verificar si el usuario ya dio like
    const likedPosts = localStorage.getItem('likedPosts')
    if (likedPosts) {
      try {
        const likedList: string[] = JSON.parse(likedPosts)
        setLiked(likedList.includes(post.id))
      } catch (error) {
        console.error('Error al leer likes:', error)
      }
    }
  }, [post.id])

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const likedPosts = localStorage.getItem('likedPosts')
    let likedList: string[] = []
    
    if (likedPosts) {
      try {
        likedList = JSON.parse(likedPosts)
      } catch (error) {
        console.error('Error al leer likes:', error)
      }
    }

    if (liked) {
      setLiked(false)
      setLikes(likes - 1)
      const updatedLiked = likedList.filter(id => id !== post.id)
      localStorage.setItem('likedPosts', JSON.stringify(updatedLiked))
    } else {
      setLiked(true)
      setLikes(likes + 1)
      if (!likedList.includes(post.id)) {
        likedList.push(post.id)
        localStorage.setItem('likedPosts', JSON.stringify(likedList))
      }
    }

    // Actualizar likes en el post
    const savedPosts = localStorage.getItem('posts')
    if (savedPosts) {
      try {
        const allPosts: PostData[] = JSON.parse(savedPosts)
        const postIndex = allPosts.findIndex(p => p.id === post.id)
        if (postIndex >= 0) {
          allPosts[postIndex].likes = liked ? likes - 1 : likes + 1
          localStorage.setItem('posts', JSON.stringify(allPosts))
        }
      } catch (error) {
        console.error('Error al actualizar likes:', error)
      }
    }
  }

  return (
    <Link
      href={`/post/${post.id}`}
      className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all cursor-pointer block"
    >
      <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-3 flex items-center justify-center p-4">
        <p className="text-gray-600 text-sm text-center line-clamp-3">{post.content}</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${
            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{likes}</span>
        </button>
        <div className="flex items-center space-x-2 text-gray-500">
          <span>💬</span>
          <span>{post.comments}</span>
        </div>
      </div>
    </Link>
  )
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, getUserProfile, followUser, unfollowUser, isFollowing } = useAuth()
  const { toast } = useToast()
  const username = params.username as string
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userPosts, setUserPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cargar posts del usuario primero para obtener avatar
      const savedPosts = localStorage.getItem('posts')
      let avatarFromPost = ''
      
      if (savedPosts) {
        try {
          const allPosts: PostData[] = JSON.parse(savedPosts)
          const filteredPosts = allPosts.filter(post => post.username === username)
          setUserPosts(filteredPosts)
          
          // Obtener avatar del primer post si existe
          if (filteredPosts.length > 0 && filteredPosts[0].avatar) {
            avatarFromPost = filteredPosts[0].avatar
          }
        } catch (error) {
          console.error('Error al cargar posts:', error)
        }
      }

      // Cargar perfil del usuario
      const profile = getUserProfile(username)
      if (profile) {
        // Si no tiene avatar pero hay uno en los posts, usarlo
        if (!profile.avatar && avatarFromPost) {
          profile.avatar = avatarFromPost
        }
        setUserProfile(profile)
      }

      setLoading(false)
    }
  }, [username, getUserProfile])

  const [following, setFollowing] = useState(false)

  useEffect(() => {
    setFollowing(isFollowing(username))
  }, [username, isFollowing])

  const handleFollow = () => {
    if (following) {
      unfollowUser(username)
      setFollowing(false)
    } else {
      followUser(username)
      setFollowing(true)
    }
  }

  const handleJam = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para enviar un JAM",
        variant: "destructive"
      })
      return
    }
    window.dispatchEvent(new CustomEvent('showJamAnimation'))
    toast({
      title: "¡JAM enviado!",
      description: `Tu solicitud fue enviada a ${userProfile?.name || username}`,
    })
  }

  const isOwnProfile = user?.username === username

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Cargando perfil...</p>
        </div>
      </main>
    )
  }

  if (!userProfile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <Header />
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h1>
            <p className="text-gray-600 mb-6">El usuario @{username} no existe.</p>
            <Link 
              href="/"
              className="inline-block px-6 py-2 bg-rolex text-white rounded-lg hover:bg-rolex-light transition-colors font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Header />
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Header del perfil estilo TikTok */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Foto de perfil grande */}
            <div className="flex-shrink-0">
              <img 
                src={userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'} 
                alt={userProfile.name}
                className="w-32 h-32 rounded-full border-4 border-rolex object-cover"
              />
            </div>

            {/* Información del perfil */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{userProfile.name}</h1>
                  <p className="text-lg text-gray-600">@{userProfile.username}</p>
                </div>
                {!isOwnProfile && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors hover:opacity-90 ${
                        following ? 'border-2' : 'text-white'
                      }`}
                      style={following 
                        ? { borderColor: 'var(--rolex)', color: 'var(--rolex)' } 
                        : { backgroundColor: 'var(--rolex)' }
                      }
                    >
                      {following ? 'Siguiendo' : 'Seguir'}
                    </button>
                    <button
                      onClick={handleJam}
                      className="px-6 py-2 rounded-lg font-bold text-white transition-colors flex items-center gap-2 hover:opacity-90"
                      style={{ backgroundColor: 'var(--rolex)' }}
                    >
                      <Music className="w-4 h-4" />
                      JAM
                    </button>
                  </div>
                )}
                {isOwnProfile && (
                  <Link
                    href="/perfil"
                    className="px-6 py-2 text-white rounded-lg transition-colors font-semibold hover:opacity-90"
                    style={{ backgroundColor: 'var(--rolex)' }}
                  >
                    Editar Perfil
                  </Link>
                )}
              </div>

              {/* Estadísticas */}
              <div className="flex space-x-6 mb-4">
                <div>
                  <span className="font-bold text-gray-900">{userPosts.length}</span>
                  <span className="text-gray-600 ml-1">posts</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{userProfile.followers || 0}</span>
                  <span className="text-gray-600 ml-1">seguidores</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{userProfile.following || 0}</span>
                  <span className="text-gray-600 ml-1">siguiendo</span>
                </div>
              </div>

              {/* Descripción/Bio */}
              {userProfile.bio && (
                <p className="text-gray-700 mb-4">{userProfile.bio}</p>
              )}

              {/* Información adicional del perfil */}
              {userProfile.profileData && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Rol: </span>
                    <span className="font-semibold text-gray-900">{userProfile.profileData.rol}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nivel: </span>
                    <span className="font-semibold text-gray-900">{userProfile.profileData.nivelMusical}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Instrumentos: </span>
                    <span className="font-semibold text-gray-900">
                      {userProfile.profileData.instrumentos}
                      {userProfile.profileData.canta && ' • Canta'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ubicación: </span>
                    <span className="font-semibold text-gray-900">
                      {userProfile.profileData.comuna}, {userProfile.profileData.ciudad}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de posts estilo TikTok/Instagram */}
        {userPosts.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <p className="text-gray-600 text-lg">Este usuario aún no ha publicado ningún post.</p>
          </div>
        )}
      </div>
    </main>
  )
}

