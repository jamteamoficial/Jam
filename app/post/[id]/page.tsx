'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { useAuth } from '../../context/AuthContext'

interface PostData {
  id: string
  name: string
  username: string
  avatar: string
  content: string
  likes: number
  comments: number
  commentPreview?: string
  commenter?: string
}

interface Comment {
  id: string
  username: string
  name: string
  avatar: string
  content: string
  timestamp: number
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const postId = params.id as string
  const [post, setPost] = useState<PostData | null>(null)
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPosts = localStorage.getItem('posts')
      if (savedPosts) {
        try {
          const allPosts: PostData[] = JSON.parse(savedPosts)
          const foundPost = allPosts.find(p => p.id === postId)
          if (foundPost) {
            setPost(foundPost)
            setLikes(foundPost.likes || 0)
            
            // Verificar si el usuario ya dio like
            const likedPosts = localStorage.getItem('likedPosts')
            if (likedPosts) {
              try {
                const liked: string[] = JSON.parse(likedPosts)
                setLiked(liked.includes(postId))
              } catch (error) {
                console.error('Error al leer likes:', error)
              }
            }
          }
        } catch (error) {
          console.error('Error al cargar post:', error)
        }
      }

      // Cargar comentarios
      const savedComments = localStorage.getItem(`comments_${postId}`)
      if (savedComments) {
        try {
          const parsedComments: Comment[] = JSON.parse(savedComments)
          setComments(parsedComments)
        } catch (error) {
          console.error('Error al cargar comentarios:', error)
        }
      }

      setLoading(false)
    }
  }, [postId])

  const handleLike = () => {
    if (!post) return

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
      // Quitar like
      setLiked(false)
      setLikes(likes - 1)
      const updatedLiked = likedList.filter(id => id !== postId)
      localStorage.setItem('likedPosts', JSON.stringify(updatedLiked))
    } else {
      // Agregar like
      setLiked(true)
      setLikes(likes + 1)
      if (!likedList.includes(postId)) {
        likedList.push(postId)
        localStorage.setItem('likedPosts', JSON.stringify(likedList))
      }
    }

    // Actualizar likes en el post
    const savedPosts = localStorage.getItem('posts')
    if (savedPosts) {
      try {
        const allPosts: PostData[] = JSON.parse(savedPosts)
        const postIndex = allPosts.findIndex(p => p.id === postId)
        if (postIndex >= 0) {
          allPosts[postIndex].likes = liked ? likes - 1 : likes + 1
          localStorage.setItem('posts', JSON.stringify(allPosts))
        }
      } catch (error) {
        console.error('Error al actualizar likes:', error)
      }
    }
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user || !post) return

    const comment: Comment = {
      id: Date.now().toString(),
      username: user.username,
      name: user.nombreCompleto,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
      content: newComment,
      timestamp: Date.now()
    }

    const updatedComments = [comment, ...comments]
    setComments(updatedComments)
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments))

    // Actualizar contador de comentarios en el post
    const savedPosts = localStorage.getItem('posts')
    if (savedPosts) {
      try {
        const allPosts: PostData[] = JSON.parse(savedPosts)
        const postIndex = allPosts.findIndex(p => p.id === postId)
        if (postIndex >= 0) {
          allPosts[postIndex].comments = updatedComments.length
          localStorage.setItem('posts', JSON.stringify(allPosts))
        }
      } catch (error) {
        console.error('Error al actualizar comentarios:', error)
      }
    }

    setNewComment('')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Cargando post...</p>
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
        <Header />
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post no encontrado</h1>
            <Link 
              href="/"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Header />
      
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <Link 
            href={`/user/${post.username}`}
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold"
          >
            <span>←</span>
            <span>Volver al perfil</span>
          </Link>
        </div>

        {/* Post completo */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
          <div className="flex items-start space-x-4 mb-6">
            <Link href={`/user/${post.username}`}>
              <img 
                src={post.avatar} 
                alt={post.name} 
                className="w-16 h-16 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <div className="flex-1">
              <Link href={`/user/${post.username}`} className="hover:opacity-80 transition-opacity">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{post.name}</h2>
                <p className="text-gray-600">@{post.username}</p>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xl text-gray-800 leading-relaxed">{post.content}</p>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-6 border-t border-gray-200 pt-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 font-semibold transition-colors ${
                liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <span className="text-2xl">{liked ? '❤️' : '🤍'}</span>
              <span>{likes}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 font-semibold transition-colors"
            >
              <span className="text-2xl">💬</span>
              <span>{comments.length}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 font-semibold transition-colors">
              <span className="text-2xl">🔗</span>
              <span>Compartir</span>
            </button>
          </div>
        </div>

        {/* Sección de comentarios */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Comentarios ({comments.length})</h3>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              {showComments ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {/* Formulario de comentario */}
          {user && (
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex items-start space-x-3">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" 
                  alt={user.nombreCompleto}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </form>
          )}

          {!user && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Inicia sesión para comentar</p>
              <Link 
                href="/login"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Iniciar sesión
              </Link>
            </div>
          )}

          {/* Lista de comentarios */}
          {showComments && (
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Link href={`/user/${comment.username}`}>
                      <img 
                        src={comment.avatar} 
                        alt={comment.name}
                        className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link href={`/user/${comment.username}`} className="hover:opacity-80 transition-opacity">
                          <span className="font-semibold text-gray-900">{comment.name}</span>
                        </Link>
                        <span className="text-sm text-gray-500">@{comment.username}</span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

