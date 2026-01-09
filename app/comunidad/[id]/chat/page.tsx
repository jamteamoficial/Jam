'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_avatar: string
  created_at: string
}

// Datos de comunidades con mensajes iniciales
const mockComunidadesChats: { [key: string]: { nombre: string; icono: string; descripcion: string; miembros: number; initialMessages: Message[] } } = {
  'audiciones': {
    nombre: 'Audiciones',
    icono: '🎤',
    descripcion: 'Encuentra audiciones y oportunidades para músicos',
    miembros: 1200,
    initialMessages: [
      {
        id: '1',
        content: '¡Bienvenidos a la comunidad de Audiciones! Compartan oportunidades y proyectos 🎵',
        sender_id: 'mod',
        sender_name: 'Moderador',
        sender_avatar: '🎤',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: '2',
        content: 'Busco vocalista para proyecto de pop rock en Santiago',
        sender_id: 'user1',
        sender_name: 'Carlos Producer',
        sender_avatar: '🎸',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        content: 'Necesitamos baterista urgente para concierto este viernes',
        sender_id: 'user2',
        sender_name: 'Rock Band',
        sender_avatar: '🥁',
        created_at: new Date(Date.now() - 43200000).toISOString()
      }
    ]
  },
  'clases': {
    nombre: 'Aprender Música',
    icono: '🎓',
    descripcion: 'Clases, tutoriales y aprendizaje musical',
    miembros: 2500,
    initialMessages: [
      {
        id: '1',
        content: '¡Bienvenidos a Aprender Música! Compartamos conocimientos y recursos 🎓',
        sender_id: 'mod',
        sender_name: 'Moderador',
        sender_avatar: '🎓',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: '2',
        content: 'Hola! ¿Alguien tiene recursos para aprender teoría musical?',
        sender_id: 'user1',
        sender_name: 'Estudiante Nuevo',
        sender_avatar: '🎹',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        content: 'Tengo un curso completo en YouTube, lo comparto pronto!',
        sender_id: 'user2',
        sender_name: 'Prof. María',
        sender_avatar: '🎓',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  },
  'rock': {
    nombre: 'Rock & Bandas',
    icono: '🎸',
    descripcion: 'Para bandas de rock y músicos del género',
    miembros: 3100,
    initialMessages: [
      {
        id: '1',
        content: '¿Alguien quiere hacer un cover de Nirvana? Busco banda!',
        sender_id: 'user1',
        sender_name: 'Guitar Hero',
        sender_avatar: '🎸',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '2',
        content: 'Yo me apunto! Toco bajo y canto',
        sender_id: 'user2',
        sender_name: 'Bass Player',
        sender_avatar: '🎸',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        content: '¡Perfecto! Tenemos un jam el viernes, ¿vienen?',
        sender_id: 'user3',
        sender_name: 'Rock Collective',
        sender_avatar: '🎸',
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  },
  'emergentes': {
    nombre: 'Bandas Emergentes',
    icono: '🚀',
    descripcion: 'Bandas nuevas buscando crecer y conectar',
    miembros: 1800,
    initialMessages: [
      {
        id: '1',
        content: 'Somos una banda nueva buscando nuestro primer concierto. ¿Consejos?',
        sender_id: 'user1',
        sender_name: 'Nueva Banda',
        sender_avatar: '🚀',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        content: '¡Sigan adelante! Compartan su música en redes y busquen bares pequeños para empezar',
        sender_id: 'user2',
        sender_name: 'Experto Musical',
        sender_avatar: '🎤',
        created_at: new Date(Date.now() - 43200000).toISOString()
      }
    ]
  },
  'productores': {
    nombre: 'Productores & Beats',
    icono: '🎧',
    descripcion: 'Productores y creadores de beats',
    miembros: 2200,
    initialMessages: [
      {
        id: '1',
        content: 'Acabo de terminar un nuevo beat, ¿quieren escucharlo?',
        sender_id: 'user1',
        sender_name: 'Beat Maker',
        sender_avatar: '🎧',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        content: '¡Sí! Compártelo en el feed principal',
        sender_id: 'user2',
        sender_name: 'Producer Pro',
        sender_avatar: '🎛️',
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  },
  'jams': {
    nombre: 'Jams & Sesiones',
    icono: '🥁',
    descripcion: 'Jams en vivo y sesiones improvisadas',
    miembros: 1500,
    initialMessages: [
      {
        id: '1',
        content: 'Jam session este sábado en el centro, ¿quiénes se apuntan?',
        sender_id: 'user1',
        sender_name: 'Jam Master',
        sender_avatar: '🥁',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        content: 'Yo voy! Llevo mi guitarra',
        sender_id: 'user2',
        sender_name: 'Guitar Jammer',
        sender_avatar: '🎸',
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ]
  },
  'jazz': {
    nombre: 'Jazz & Blues',
    icono: '🎹',
    descripcion: 'Comunidad de jazz, blues y música clásica',
    miembros: 890,
    initialMessages: [
      {
        id: '1',
        content: 'Buscamos saxofonista para nuestro cuarteto de jazz',
        sender_id: 'user1',
        sender_name: 'Jazz Quartet',
        sender_avatar: '🎷',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },
  'electronica': {
    nombre: 'Música Electrónica',
    icono: '⚡',
    descripcion: 'DJs, productores y amantes de la electrónica',
    miembros: 1900,
    initialMessages: [
      {
        id: '1',
        content: 'Nueva pista de techno subida al feed! Déjenme saber qué opinan',
        sender_id: 'user1',
        sender_name: 'DJ Techno',
        sender_avatar: '⚡',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  },
  'folk': {
    nombre: 'Folk & Acústico',
    icono: '🎻',
    descripcion: 'Música acústica, folk y sonidos orgánicos',
    miembros: 1100,
    initialMessages: [
      {
        id: '1',
        content: 'Compartí un nuevo cover acústico de Radiohead, disfruten!',
        sender_id: 'user1',
        sender_name: 'Acoustic Lover',
        sender_avatar: '🎻',
        created_at: new Date(Date.now() - 43200000).toISOString()
      }
    ]
  },
  'hiphop': {
    nombre: 'Hip-Hop & Rap',
    icono: '🎤',
    descripcion: 'Rappers, MCs y productores de hip-hop',
    miembros: 2300,
    initialMessages: [
      {
        id: '1',
        content: '¿Alguien quiere hacer un featuring? Tengo un beat listo',
        sender_id: 'user1',
        sender_name: 'Rapper MC',
        sender_avatar: '🎤',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '2',
        content: 'Yo me apunto! Tengo algunas letras',
        sender_id: 'user2',
        sender_name: 'Hip-Hop Artist',
        sender_avatar: '🎤',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  }
}

export default function ComunidadChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const comunidadId = params?.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [isJoined, setIsJoined] = useState(false)

  const comunidadData = comunidadId ? mockComunidadesChats[comunidadId] : null

  // Verificar si el usuario está unido a la comunidad
  useEffect(() => {
    if (typeof window !== 'undefined' && comunidadId) {
      const joinedCommunities = JSON.parse(localStorage.getItem('joinedCommunities') || '[]')
      setIsJoined(joinedCommunities.includes(comunidadId))
    }
  }, [comunidadId])

  // Cargar mensajes desde localStorage o usar iniciales
  useEffect(() => {
    if (comunidadData && typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem(`comunidad_chat_${comunidadId}`)
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages)
          setMessages(parsed)
        } catch (error) {
          console.error('Error al cargar mensajes:', error)
          setMessages(comunidadData.initialMessages)
        }
      } else {
        setMessages(comunidadData.initialMessages)
      }
      setLoading(false)
    } else if (!comunidadData) {
      setLoading(false)
    }
  }, [comunidadId, comunidadData])

  // Scroll automático al agregar mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (comunidadId && messages.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(`comunidad_chat_${comunidadId}`, JSON.stringify(messages))
    }
  }, [messages, comunidadId])

  const sendMessage = () => {
    const content = text.trim()
    if (!content || !user || !comunidadData) return

    const userName = user.username || user.email?.split('@')[0] || 'Usuario'
    const userAvatar = '🎸' // Avatar por defecto

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender_id: 'user',
      sender_name: userName,
      sender_avatar: userAvatar,
      created_at: new Date().toISOString()
    }

    setMessages((prev) => [...prev, newMessage])
    setText('')

    // Focus en el input después de enviar
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      input?.focus()
    }, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <p className="text-gray-600">Cargando chat...</p>
      </div>
    )
  }

  // Verificar si el usuario está unido
  if (!isJoined && comunidadData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border-2 border-purple-200">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-4xl mb-4 mx-auto">
            {comunidadData.icono}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso restringido</h2>
          <p className="text-gray-600 mb-6">
            Debes unirte a <strong>{comunidadData.nombre}</strong> para acceder al chat comunitario
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push(`/comunidad/${comunidadId}`)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Ver Comunidad
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!comunidadData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-4xl mb-4 mx-auto">
            💬
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Comunidad no encontrada</h2>
          <p className="text-gray-600 mb-4">El chat de esta comunidad no existe</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b-2 border-purple-200 p-4 bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-2xl">
            {comunidadData.icono}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl text-gray-900">{comunidadData.nombre}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{comunidadData.miembros.toLocaleString('es-CL')} miembros</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-3xl mb-4">
              {comunidadData.icono}
            </div>
            <p className="text-gray-600">Inicia la conversación en {comunidadData.nombre}</p>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.sender_id === 'user'
            
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white text-gray-900 border-2 border-purple-200'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{message.sender_avatar}</span>
                      <span className="font-semibold text-sm text-gray-700">{message.sender_name}</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${isUser ? 'text-purple-100' : 'text-gray-500'}`}>
                    {new Date(message.created_at).toLocaleTimeString('es-CL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t-2 border-purple-200 p-4 bg-white">
        {!user ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">Inicia sesión para enviar mensajes</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Iniciar Sesión
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder={`Escribe un mensaje en ${comunidadData.nombre}...`}
              className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              autoFocus
            />
            <Button
              onClick={sendMessage}
              disabled={!text.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

