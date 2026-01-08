'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/src/supabaseClient'

interface Message {
  id: string
  text: string
  sender: 'user' | 'other'
  timestamp: string
  created_at?: string
  sender_id?: string
}

interface ConversationData {
  usuario: string
  avatar: string
  otherUserId: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const conversationId = params?.id as string

  console.log("params:", params)
  console.log("conversationId:", conversationId)

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [exists, setExists] = useState<boolean | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [chatData, setChatData] = useState<ConversationData | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  // Obtener el ID del usuario actual
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        setCurrentUserId(supabaseUser.id)
      }
    }
    getUserId()
  }, [])

  // 1) Validar que la conversación exista en Supabase
  useEffect(() => {
    if (!conversationId) return

    const checkConversation = async () => {
      setLoading(true)
      setErrorMsg(null)

      console.log("Consultando conversations con id:", conversationId)

      const { data, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .single()

      console.log("Respuesta conversations:", { data, error })

      if (error) {
        // Muy común: RLS o permisos
        setErrorMsg(error.message)
        setExists(false)
        setLoading(false)
        return
      }

      if (!data) {
        setExists(false)
        setLoading(false)
        return
      }

      setExists(true)
      // Inicializar chatData con valores por defecto para que el render pueda proceder
      setChatData({
        usuario: 'Usuario',
        avatar: '🎸',
        otherUserId: ''
      })
      setLoading(false)
    }

    checkConversation()
  }, [conversationId])

  // 2) Cargar mensajes al abrir el chat
  useEffect(() => {
    if (!conversationId || exists !== true) return

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.log('Error cargando mensajes:', error)
        return
      }

      setMessages(data ?? [])

      // Cargar información del otro participante (opcional, para UI)
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        if (supabaseUser) {
          const userId = supabaseUser.id
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)

          const otherParticipant = participants?.find(p => p.user_id !== userId)
          if (otherParticipant) {
            let otherUserName = 'Usuario'
            let otherUserAvatar = '🎸'

            try {
              const { data: otherUser } = await supabase
                .from('profiles')
                .select('username, avatar')
                .eq('id', otherParticipant.user_id)
                .single()

              if (otherUser) {
                otherUserName = otherUser.username || 'Usuario'
                otherUserAvatar = otherUser.avatar || '🎸'
              }
            } catch (error) {
              // Usar valores por defecto si no hay perfil
            }

            setChatData({
              usuario: otherUserName,
              avatar: otherUserAvatar,
              otherUserId: otherParticipant.user_id
            })
          }
        }
      } catch (error) {
        // Mantener valores por defecto
      }
    }

    loadMessages()
  }, [conversationId, exists])

  // 3) Realtime – recibir mensajes nuevos
  useEffect(() => {
    if (!conversationId || exists !== true) return

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, exists])

  // Scroll automático al agregar mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 4) Enviar mensaje
  const sendMessage = async () => {
    const content = text.trim()
    if (!content || !conversationId) return

    // Obtener el ID del usuario desde Supabase Auth
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    const senderId = supabaseUser?.id ?? 'demo-user'

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })

    if (error) {
      console.log('Error enviando mensaje:', error)
      return
    }

    setText('')
    // Focus en el input después de enviar
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      input?.focus()
    }, 100)
  }

  // Render: loading y error
  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Cargando conversación…</h2>
        {errorMsg && <p style={{ color: "red" }}>Error: {errorMsg}</p>}
      </div>
    )
  }

  if (exists === false) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Chat no encontrado</h2>
        {errorMsg && <p style={{ color: "red" }}>Error: {errorMsg}</p>}
      </div>
    )
  }

  // Si existe, renderiza chat (mantener UI existente)
  // chatData se inicializa con valores por defecto cuando exists === true
  // y se actualiza con datos reales cuando están disponibles
  if (!chatData) {
    // Fallback: si por alguna razón chatData es null, mostrar loading
    return (
      <div style={{ padding: 24 }}>
        <h2>Cargando datos del chat…</h2>
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
            {chatData.avatar}
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">{chatData.usuario}</h2>
            <p className="text-sm text-gray-500">En línea</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-3xl mb-4">
              {chatData.avatar}
            </div>
            <p className="text-gray-600">Inicia la conversación con {chatData.usuario}</p>
          </div>
        ) : (
          messages.map((message) => {
            // Determinar si el mensaje es del usuario actual
            const isUser = message.sender_id === currentUserId
            
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
              placeholder="Escribe un mensaje..."
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
