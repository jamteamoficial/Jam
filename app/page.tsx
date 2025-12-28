'use client'

import { useState, useEffect } from 'react'
import Post from './components/Post'
import Header from './components/Header'
import Communities from './components/Communities'
import { useAuth } from './context/AuthContext'

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

// Avatares aleatorios para nuevos posts
const randomAvatars = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&round=1',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&round=1',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&round=1',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&round=1',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&round=1'
]

// Posts iniciales por defecto
const defaultPosts: PostData[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    username: 'juan_guitarrista',
    avatar: 'https://images.unsplash.com/photo-1617695988175-4c5c0b7c02d9?w=60&h=60&fit=crop&round=1',
    content: '¡Acabo de terminar mi nueva canción! 🎶 Guitarra eléctrica con delay y reverb. ¿Qué les parece? #rock #guitarra',
    likes: 23,
    comments: 5,
    commentPreview: '¡Suena brutal! 🔥',
    commenter: 'Ana R.'
  },
  {
    id: '2',
    name: 'María Drums',
    username: 'maria_drums',
    avatar: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=60&h=60&fit=crop&round=1',
    content: 'Busco bajista para banda de funk. ¡Probamos este viernes! 📍 Santiago Centro #buscobanda #funk',
    likes: 12,
    comments: 8,
    commentPreview: '¡Yo toco bajo! Me apunto 📍',
    commenter: 'Carlos B.'
  },
  {
    id: '3',
    name: 'Diego Teclados',
    username: 'diego_keys',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&round=1',
    content: '¡Clases de piano para principiantes! 🎹 Primer mes 50% off. DM para info. #clasesmusica #piano',
    likes: 45,
    comments: 12,
    commentPreview: 'Interesado! ¿Horarios?',
    commenter: 'Lucía M.'
  },
  {
    id: '4',
    name: 'La Rockera',
    username: 'la_rockera_87',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&round=1',
    content: '¡Tocata este sábado en Bar El Sótano! 🎸 Entrada $3.000. ¡Vengan! #tocata #rockchileno',
    likes: 67,
    comments: 21,
    commentPreview: '¡Ahí estaré! 🔥',
    commenter: 'Pato R.'
  }
]

export default function Home() {
  const { user } = useAuth()
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [posts, setPosts] = useState<PostData[]>([])

  // Cargar posts desde localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPosts = localStorage.getItem('posts')
      if (savedPosts) {
        try {
          const parsedPosts = JSON.parse(savedPosts)
          setPosts(parsedPosts)
        } catch (error) {
          console.error('Error al cargar posts:', error)
          // Si hay error, usar posts por defecto
          setPosts(defaultPosts)
          localStorage.setItem('posts', JSON.stringify(defaultPosts))
        }
      } else {
        // Si no hay posts guardados, usar los posts por defecto y guardarlos
        setPosts(defaultPosts)
        localStorage.setItem('posts', JSON.stringify(defaultPosts))
      }
    }
  }, [])

  // Función para guardar posts en localStorage
  const savePosts = (postsToSave: PostData[]) => {
    localStorage.setItem('posts', JSON.stringify(postsToSave))
  }

  const handlePublish = () => {
    if (!newPostContent.trim()) return

    const newPost: PostData = {
      id: Date.now().toString(),
      name: user?.nombreCompleto || 'Tú',
      username: user?.username || 'tu_usuario',
      avatar: randomAvatars[Math.floor(Math.random() * randomAvatars.length)],
      content: newPostContent,
      likes: 0,
      comments: 0
    }

    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    savePosts(updatedPosts) // Guardar en localStorage
    setNewPostContent('')
    setShowNewPost(false)
  }

  const handleCancel = () => {
    setNewPostContent('')
    setShowNewPost(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Feed de posts y videos */}
          <div className="lg:col-span-2 space-y-6">
            {posts.map((post) => (
              <Post
                key={post.id}
                postId={post.id}
                name={post.name}
                username={post.username}
                avatar={post.avatar}
                content={post.content}
                likes={post.likes}
                comments={post.comments}
                commentPreview={post.commentPreview}
                commenter={post.commenter}
              />
            ))}
          </div>

          {/* Columna derecha - Comunidades */}
          <div className="lg:col-span-1">
            <Communities />
          </div>
        </div>
      </div>

      {/* Botón flotante */}
      <button
        onClick={() => setShowNewPost(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-bold transition-all duration-300 hover:scale-110 active:scale-95 z-50"
        aria-label="Nueva publicación"
      >
        +
      </button>

      {/* Modal de nueva publicación */}
      {showNewPost && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={handleCancel}
          />
          
          {/* Modal */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transform transition-transform duration-300 ease-out animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Nueva Publicación</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="¡Qué estás tocando hoy? 🎸"
                className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-lg"
                autoFocus
              />
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!newPostContent.trim()}
                  className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </main>
  )
}

