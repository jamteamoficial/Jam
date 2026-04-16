'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { createClient } from '@/src/lib/supabase/client'
import { joinCommunity, listCommunityMemberIds } from '@/src/lib/services/communities'
import { getDisplayName, getInitials } from '@/src/lib/userDisplay'

type CommunityRow = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

type CommunityMessageRow = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { full_name: string | null; username: string | null; avatar_url: string | null } | null
}

function normalizeCommunityMessageRow(row: any): CommunityMessageRow {
  const profiles = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles
  return { ...row, profiles } as CommunityMessageRow
}

export default function ComunidadChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const communityId = String(params.id ?? '')

  const [loading, setLoading] = useState(true)
  const [community, setCommunity] = useState<CommunityRow | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [messages, setMessages] = useState<CommunityMessageRow[]>([])
  const [text, setText] = useState('')

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const title = useMemo(() => community?.name ?? 'Comunidad', [community?.name])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!communityId) {
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data: comm, error: commErr } = await supabase
        .from('communities')
        .select('id, name, description, icon, color')
        .eq('id', communityId)
        .maybeSingle()

      if (cancelled) return
      if (commErr || !comm) {
        setCommunity(null)
        setIsMember(false)
        setMessages([])
        setLoading(false)
        return
      }

      setCommunity(comm as CommunityRow)

      if (!user?.id) {
        setIsMember(false)
        setMessages([])
        setLoading(false)
        return
      }

      const { data: members } = await listCommunityMemberIds(supabase, communityId)
      const member = Boolean(members?.includes(user.id))
      setIsMember(member)

      if (!member) {
        setMessages([])
        setLoading(false)
        return
      }

      const { data: msgs, error: msgErr } = await supabase
        .from('community_messages')
        .select(
          `
          id,
          user_id,
          content,
          created_at,
          profiles (
            full_name,
            username,
            avatar_url
          )
        `
        )
        .eq('community_id', communityId)
        .order('created_at', { ascending: true })
        .limit(200)

      if (cancelled) return
      if (msgErr) {
        console.error('[comunidad/chat] Error cargando mensajes', msgErr)
        setMessages([])
      } else {
        setMessages(((msgs ?? []) as any[]).map(normalizeCommunityMessageRow))
      }

      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [communityId, user?.id])

  const handleJoin = async () => {
    if (!user?.id) {
      router.push('/login')
      return
    }
    const supabase = createClient()
    const { error } = await joinCommunity(supabase, { communityId, userId: user.id })
    if (error) {
      toast({
        title: 'No se pudo unir',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    setIsMember(true)
    toast({ title: 'Listo', description: 'Te uniste a la comunidad.' })
  }

  const send = async () => {
    const content = text.trim()
    if (!content) return
    if (!user?.id) {
      router.push('/login')
      return
    }
    if (!isMember) {
      toast({
        title: 'Debes unirte',
        description: 'Únete a la comunidad para escribir en el chat.',
        variant: 'destructive',
      })
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('community_messages')
      .insert({
        community_id: communityId,
        user_id: user.id,
        content,
      })
      .select(
        `
        id,
        user_id,
        content,
        created_at,
        profiles (
          full_name,
          username,
          avatar_url
        )
      `
      )
      .single()

    if (error) {
      toast({
        title: 'No se pudo enviar',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    setText('')
    setMessages((prev) => [...prev, normalizeCommunityMessageRow(data)])
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <p className="text-gray-600">Cargando chat…</p>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-6">
        <div className="max-w-lg text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Comunidad no encontrada</h2>
          <Button onClick={() => router.push('/comunidades')} className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href={`/comunidad/${community.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            {community.icon ? <span>{community.icon}</span> : null}
            <span className="truncate">{title}</span>
          </Link>
          {!isMember ? (
            <Button onClick={() => void handleJoin()} className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
              Unirme
            </Button>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-rolex/20 bg-white shadow-xl">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-600">Aún no hay mensajes</div>
            ) : (
              messages.map((m) => {
                const mine = Boolean(user?.id && m.user_id === user.id)
                const name = getDisplayName(m.profiles?.full_name, m.profiles?.username || 'usuario')
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-[var(--rolex)] text-white' : 'bg-gray-100 text-gray-900'}`}>
                      {!mine ? (
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-gray-600">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-700 ring-1 ring-gray-200">
                            {m.profiles?.avatar_url && /^https?:\/\//i.test(m.profiles.avatar_url) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.profiles.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                              getInitials(name)
                            )}
                          </span>
                          <span className="truncate">{name}</span>
                        </div>
                      ) : null}
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                      <div className={`mt-1 text-[10px] ${mine ? 'text-white/80' : 'text-gray-500'}`}>
                        {new Date(m.created_at).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-rolex/10 p-3">
            {!user ? (
              <p className="text-center text-xs text-gray-600">Inicia sesión para participar.</p>
            ) : !isMember ? (
              <p className="text-center text-xs text-gray-600">Únete a la comunidad para escribir.</p>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe un mensaje…"
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rolex"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void send()
                  }}
                />
                <Button onClick={() => void send()} className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
