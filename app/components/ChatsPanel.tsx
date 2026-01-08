'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/src/supabaseClient'
import { getLocalUserId } from '@/src/lib/localUser'

interface Chat {
  id: string
  usuario: string
  avatar: string
  ultimoMensaje: string
  timestamp: string
  mensajesNoLeidos: number
}

export default function ChatsPanel() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState<string | null>(null)

  // Obtener el ID del usuario (Supabase Auth o localStorage)
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        setMyUserId(supabaseUser.id)
      } else {
        setMyUserId(getLocalUserId())
      }
    }
    getUserId()
  }, [user])

  useEffect(() => {
    const loadChats = async () => {
      if (!myUserId) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // 1) Obtener conversaciones donde participa el usuario
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', myUserId)

        if (participantsError) {
          console.log('Error cargando participantes:', participantsError)
          setLoading(false)
          return
        }

        if (!participants || participants.length === 0) {
          setChats([])
          setLoading(false)
          return
        }

        const conversationIds = participants.map(p => p.conversation_id)

        // 2) Para cada conversación, obtener el último mensaje y el otro participante
        const chatsData = await Promise.all(
          conversationIds.map(async (conversationId) => {
            // Obtener el último mensaje
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            // Obtener el otro participante
            const { data: otherParticipants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conversationId)
              .neq('user_id', myUserId)

            const otherParticipant = otherParticipants?.[0]
            let usuario = 'Usuario'
            let avatar = '🎸'

            // Intentar obtener información del otro usuario desde profiles
            if (otherParticipant) {
              try {
                const { data: otherUser } = await supabase
                  .from('profiles')
                  .select('username, avatar')
                  .eq('id', otherParticipant.user_id)
                  .single()

                if (otherUser) {
                  usuario = otherUser.username || 'Usuario'
                  avatar = otherUser.avatar || '🎸'
                }
              } catch (error) {
                // Usar valores por defecto si no hay perfil
              }
            }

            return {
              id: conversationId,
              usuario,
              avatar,
              ultimoMensaje: lastMessage?.content || 'Sin mensajes',
              timestamp: lastMessage?.created_at
                ? new Date(lastMessage.created_at).toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '',
              mensajesNoLeidos: 0, // Por ahora, no implementamos contador de no leídos
              lastMessageDate: lastMessage?.created_at || new Date(0).toISOString() // Para ordenar
            }
          })
        )

        // Ordenar por fecha del último mensaje (más reciente primero)
        chatsData.sort((a, b) => {
          const dateA = new Date(a.lastMessageDate).getTime()
          const dateB = new Date(b.lastMessageDate).getTime()
          return dateB - dateA
        })

        // Remover lastMessageDate antes de setear (no es parte de la interfaz Chat)
        const finalChats = chatsData.map(({ lastMessageDate, ...chat }) => chat)

        setChats(finalChats)
      } catch (error) {
        console.log('Error cargando chats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [myUserId])

  return (
    <div className="h-full bg-white border-r-2 border-purple-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Chats
            </h2>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Disparar evento para ocultar el panel desde el componente padre
              window.dispatchEvent(new CustomEvent('toggleChatsPanel'))
            }}
            className="p-1 rounded-full hover:bg-purple-100 transition-colors text-purple-600"
            aria-label="Ocultar chats"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando chats…</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aún no tienes chats</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="block p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors border-2 border-transparent hover:border-purple-200 active:scale-95"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-2xl">
                      {chat.avatar}
                    </div>
                    {chat.mensajesNoLeidos > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {chat.mensajesNoLeidos}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{chat.usuario}</h3>
                      {chat.timestamp && (
                        <span className="text-xs text-gray-500">{chat.timestamp}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.ultimoMensaje}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
