'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { createClient } from '@/src/lib/supabase/client'
import { listDirectMessagesThread, sendMessage } from '@/src/lib/services/jam-social'
import { getDisplayName } from '@/src/lib/userDisplay'

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

type UiMessage = {
  id: string
  text: string
  sender: 'user' | 'other'
  timestamp: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const partnerId = String(params?.id ?? '')

  const [loading, setLoading] = useState(true)
  const [exists, setExists] = useState<boolean | null>(null)
  const [peerName, setPeerName] = useState('Usuario')
  const [peerAvatar, setPeerAvatar] = useState<string>('')
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [text, setText] = useState('')

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const myId = user?.id ?? null

  const invalidPartner = useMemo(() => !partnerId || !isUuid(partnerId), [partnerId])

  useEffect(() => {
    if (myId) return
    router.replace('/login')
  }, [myId, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (invalidPartner) {
        setExists(false)
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data: peer, error: peerErr } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', partnerId)
        .maybeSingle()

      if (cancelled) return
      if (peerErr || !peer) {
        setExists(false)
        setLoading(false)
        return
      }

      setExists(true)
      setPeerName(getDisplayName(peer.full_name as string | null, peer.username as string | null))
      setPeerAvatar((peer.avatar_url as string | null) || '')

      if (!myId) {
        setMessages([])
        setLoading(false)
        return
      }

      const { data: rows, error } = await listDirectMessagesThread(supabase, { otherUserId: partnerId, limit: 300 })
      if (cancelled) return

      if (error) {
        console.error('[chat] Error cargando DMs', error)
        setMessages([])
        setLoading(false)
        return
      }

      const mapped: UiMessage[] = (rows as any[]).map((m) => ({
        id: String(m.id),
        text: String(m.content ?? ''),
        sender: m.sender_id === myId ? 'user' : 'other',
        timestamp: m.created_at
          ? new Date(m.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
          : '',
      }))

      setMessages(mapped)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [invalidPartner, partnerId, myId])

  useEffect(() => {
    if (!partnerId || !myId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`dm-${myId}-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const row = payload.new as {
            id: string
            sender_id: string
            receiver_id: string
            content: string | null
            created_at: string | null
          }
          const isThisThread =
            (row.sender_id === myId && row.receiver_id === partnerId) ||
            (row.sender_id === partnerId && row.receiver_id === myId)
          if (!isThisThread) return

          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [
              ...prev,
              {
                id: row.id,
                text: String(row.content ?? ''),
                sender: row.sender_id === myId ? 'user' : 'other',
                timestamp: row.created_at
                  ? new Date(row.created_at).toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '',
              },
            ]
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [partnerId, myId])

  const handleSend = async () => {
    const content = text.trim()
    if (!content) return

    if (!myId) {
      router.push('/login')
      return
    }

    if (invalidPartner || exists === false) return

    const supabase = createClient()
    const { data, error } = await sendMessage(supabase, { receiver_id: partnerId, content })
    if (error) {
      toast({
        title: 'No se pudo enviar',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    setText('')
    const row = data as any
    setMessages((prev) => [
      ...prev,
      {
        id: String(row.id),
        text: String(row.content ?? content),
        sender: 'user',
        timestamp: row.created_at
          ? new Date(row.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
          : '',
      },
    ])
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-6">
        <p className="text-gray-700">Cargando conversación…</p>
      </div>
    )
  }

  if (exists === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-6">
        <div className="max-w-lg text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Chat no encontrado</h2>
          <p className="mb-6 text-sm text-gray-600">El destinatario no existe o el identificador no es válido.</p>
          <Button onClick={() => router.push('/')} className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => router.back()} className="inline-flex items-center gap-2" style={{ color: 'var(--rolex)' }}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="min-w-0 text-right">
            <div className="flex items-center justify-end gap-2">
              {peerAvatar && /^https?:\/\//i.test(peerAvatar) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={peerAvatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rolex/15 text-xs font-bold text-rolex">
                  {peerName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-semibold text-gray-900">{peerName}</p>
                <p className="truncate text-xs text-gray-500">Mensaje directo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-rolex/20 bg-white shadow-xl">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-600">Aún no hay mensajes. ¡Rompe el hielo!</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.sender === 'user' ? 'bg-[var(--rolex)] text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                    {m.timestamp ? (
                      <div className={`mt-1 text-[10px] ${m.sender === 'user' ? 'text-white/80' : 'text-gray-500'}`}>{m.timestamp}</div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-rolex/10 p-3">
            <div className="flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un mensaje…"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rolex"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSend()
                }}
              />
              <Button onClick={() => void handleSend()} className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
