'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Chat {
  id: string
  usuario: string
  avatar: string
  ultimoMensaje: string
  timestamp: string
  mensajesNoLeidos: number
}

const mockChats: Chat[] = [
  {
    id: '1',
    usuario: 'Sembrador',
    avatar: '🎸',
    ultimoMensaje: 'Hola! ¿Tocamos juntos?',
    timestamp: '10:30',
    mensajesNoLeidos: 2
  },
  {
    id: '2',
    usuario: 'Carlos Rock',
    avatar: '🎸',
    ultimoMensaje: 'Perfecto, nos vemos mañana',
    timestamp: '09:15',
    mensajesNoLeidos: 1
  }
]

export default function ChatsPanel() {
  return (
    <div className="h-full bg-white border-r-2 border-purple-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Chats
          </h2>
        </div>

        <div className="space-y-2">
          {mockChats.map((chat) => (
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
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.ultimoMensaje}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

