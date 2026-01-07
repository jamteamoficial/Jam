'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'

interface Message {
  id: string
  text: string
  sender: 'user' | 'other'
  timestamp: string
}

const mockChats: { [key: string]: { usuario: string; avatar: string; initialMessages: Message[] } } = {
  '1': {
    usuario: 'Sembrador',
    avatar: '🎸',
    initialMessages: [
      {
        id: '1',
        text: 'Hola! ¿Tocamos juntos?',
        sender: 'other',
        timestamp: '10:30'
      },
      {
        id: '2',
        text: 'Me encantaría! ¿Qué instrumento tocas?',
        sender: 'user',
        timestamp: '10:32'
      }
    ]
  },
  '2': {
    usuario: 'Carlos Rock',
    avatar: '🎸',
    initialMessages: [
      {
        id: '1',
        text: 'Perfecto, nos vemos mañana',
        sender: 'other',
        timestamp: '09:15'
      }
    ]
  }
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const chatId = params.id as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatData = mockChats[chatId]

  // Cargar mensajes desde localStorage o mensajes iniciales
  useEffect(() => {
    if (chatData && typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem(`chat_${chatId}`)
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages)
          setMessages(parsed)
        } catch (error) {
          console.error('Error al cargar mensajes:', error)
          setMessages(chatData.initialMessages)
        }
      } else {
        setMessages(chatData.initialMessages)
      }
    }
  }, [chatId, chatData])

  // Scroll automático al agregar mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages))
    }
  }, [messages, chatId])

  const handleSend = () => {
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, message])
    setNewMessage('')
    
    // Focus en el input después de enviar
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      input?.focus()
    }, 100)
  }

  if (!chatData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-4xl mb-4 mx-auto">
            💬
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat no encontrado</h2>
          <p className="text-gray-600 mb-4">El chat que buscas no existe</p>
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
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white text-gray-900 border-2 border-purple-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
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
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              autoFocus
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim()}
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

