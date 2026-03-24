'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  MessageCircle,
  X,
  Music,
  Check,
  XCircle,
  Inbox,
  Radio,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/src/lib/supabase/client'
import { getLocalUserId } from '@/src/lib/localUser'

type ChatTab = 'mensajes' | 'jams'

interface Chat {
  id: string
  usuario: string
  avatar: string
  ultimoMensaje: string
  timestamp: string
  mensajesNoLeidos: number
}

export interface JamSolicitud {
  id: string
  emisorNombre: string
  avatar: string
  mensaje: string
  instrumento: string
  estado: 'pendiente' | 'aceptado' | 'rechazado'
  fechaRelativa: string
}

const MOCK_DIRECT: Chat[] = [
  {
    id: 'mock-1',
    usuario: 'Sembrador',
    avatar: '🎸',
    ultimoMensaje: 'Hola! ¿Tocamos juntos?',
    timestamp: '10:30',
    mensajesNoLeidos: 2,
  },
  {
    id: 'mock-2',
    usuario: 'Carlos Rock',
    avatar: '🥁',
    ultimoMensaje: 'Perfecto, nos vemos mañana',
    timestamp: '09:15',
    mensajesNoLeidos: 1,
  },
  {
    id: 'mock-3',
    usuario: 'Mariana Luna',
    avatar: '🎤',
    ultimoMensaje: '¿Hacemos una sesión de grabación?',
    timestamp: 'Ayer',
    mensajesNoLeidos: 0,
  },
]

const INITIAL_JAMS: JamSolicitud[] = [
  {
    id: 'jam-1',
    emisorNombre: 'Alex Drums',
    avatar: '🥁',
    mensaje: '¿Te animás a un jam este viernes en Providencia?',
    instrumento: 'Batería',
    estado: 'pendiente',
    fechaRelativa: 'Hace 2 h',
  },
  {
    id: 'jam-2',
    emisorNombre: 'Nina Keys',
    avatar: '🎹',
    mensaje: 'Vi tu cover — ¿colaboramos en un tema original?',
    instrumento: 'Teclado',
    estado: 'pendiente',
    fechaRelativa: 'Ayer',
  },
  {
    id: 'jam-3',
    emisorNombre: 'Leo Bass',
    avatar: '🎸',
    mensaje: 'Estamos armando una banda de funk, ¿sumás?',
    instrumento: 'Bajo',
    estado: 'pendiente',
    fechaRelativa: 'Hace 3 d',
  },
]

export default function ChatsPanel() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ChatTab>('mensajes')
  const [chatsDb, setChatsDb] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [jamSolicitudes, setJamSolicitudes] = useState<JamSolicitud[]>(INITIAL_JAMS)

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()
      if (supabaseUser) setMyUserId(supabaseUser.id)
      else setMyUserId(getLocalUserId())
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
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', myUserId)

        if (participantsError || !participants?.length) {
          setChatsDb([])
          setLoading(false)
          return
        }

        const conversationIds = participants.map((p) => p.conversation_id)
        const chatsData = await Promise.all(
          conversationIds.map(async (conversationId) => {
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            const { data: otherParticipants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conversationId)
              .neq('user_id', myUserId)

            const otherParticipant = otherParticipants?.[0]
            let usuario = 'Usuario'
            let avatar = '🎸'

            if (otherParticipant) {
              const { data: otherUser } = await supabase
                .from('profiles')
                .select('username, avatar')
                .eq('id', otherParticipant.user_id)
                .single()

              if (otherUser) {
                usuario = otherUser.username || 'Usuario'
                avatar = otherUser.avatar || '🎸'
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
                    minute: '2-digit',
                  })
                : '',
              mensajesNoLeidos: 0,
              lastMessageDate: lastMessage?.created_at || new Date(0).toISOString(),
            }
          })
        )

        chatsData.sort(
          (a, b) =>
            new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
        )

        const finalChats = chatsData.map(({ lastMessageDate, ...chat }) => chat)
        setChatsDb(finalChats)
      } catch {
        setChatsDb([])
      } finally {
        setLoading(false)
      }
    }
    loadChats()
  }, [myUserId])

  /** Lista Mensajes: conversaciones reales primero, luego mocks de demo */
  const mensajesList = useMemo(() => {
    const seen = new Set(chatsDb.map((c) => c.id))
    const extras = MOCK_DIRECT.filter((m) => !seen.has(m.id))
    return [...chatsDb, ...extras]
  }, [chatsDb])

  const pendientesCount = jamSolicitudes.filter((j) => j.estado === 'pendiente').length

  const aceptarJam = (id: string) => {
    setJamSolicitudes((prev) =>
      prev.map((j) => (j.id === id ? { ...j, estado: 'aceptado' as const } : j))
    )
  }

  const rechazarJam = (id: string) => {
    setJamSolicitudes((prev) =>
      prev.map((j) => (j.id === id ? { ...j, estado: 'rechazado' as const } : j))
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-emerald-900/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <div className="shrink-0 border-b border-emerald-800/50 bg-slate-900/90 px-3 py-3 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/20 ring-1 ring-emerald-500/40">
              <Music className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Chats & JAMs</h2>
              <p className="text-[10px] text-emerald-200/60">Mensajes y solicitudes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('toggleChatsPanel'))
            }}
            className="rounded-full p-1.5 text-emerald-300/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Ocultar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-800/80 p-0.5 ring-1 ring-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab('mensajes')}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${
              activeTab === 'mensajes'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Mensajes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jams')}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${
              activeTab === 'jams'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            Jams recibidos
            {pendientesCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-900">
                {pendientesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {activeTab === 'mensajes' && (
          <>
            {loading && chatsDb.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">Cargando conversaciones…</p>
            ) : mensajesList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
                <Radio className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-400">No hay mensajes aún</p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {mensajesList.map((chat) => (
                  <li key={chat.id}>
                    <Link
                      href={`/chat/${chat.id}`}
                      className="flex gap-3 rounded-xl border border-transparent bg-slate-800/40 p-2.5 transition hover:border-emerald-700/50 hover:bg-slate-800/80"
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-900/80 to-slate-800 text-xl ring-1 ring-emerald-600/30">
                          {chat.avatar}
                        </div>
                        {chat.mensajesNoLeidos > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                            {chat.mensajesNoLeidos}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-semibold text-slate-100">{chat.usuario}</span>
                          {chat.timestamp ? (
                            <span className="shrink-0 text-[10px] text-slate-500">{chat.timestamp}</span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-slate-400">{chat.ultimoMensaje}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {activeTab === 'jams' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-500">
              Solicitudes de otros músicos para conectar o tocar juntos.
            </p>
            {jamSolicitudes.map((jam) => (
              <div
                key={jam.id}
                className={`rounded-xl border p-3 ${
                  jam.estado === 'pendiente'
                    ? 'border-emerald-700/40 bg-slate-800/60'
                    : jam.estado === 'aceptado'
                      ? 'border-emerald-600/30 bg-emerald-950/40'
                      : 'border-slate-700/60 bg-slate-900/40 opacity-70'
                }`}
              >
                <div className="mb-2 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-lg ring-1 ring-emerald-600/20">
                    {jam.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-100">{jam.emisorNombre}</span>
                      <span className="text-[10px] text-slate-500">{jam.fechaRelativa}</span>
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-500/90">
                      {jam.instrumento}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-slate-300">{jam.mensaje}</p>
                  </div>
                </div>

                {jam.estado === 'pendiente' ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => aceptarJam(jam.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500"
                    >
                      <Check className="h-4 w-4" />
                      Aceptar
                    </button>
                    <button
                      type="button"
                      onClick={() => rechazarJam(jam.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {jam.estado === 'aceptado' ? '✓ Aceptado' : '✕ Rechazado'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
