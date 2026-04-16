'use client'

import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Music, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/src/lib/supabase/client'

type Thread = {
  partnerId: string
  usuario: string
  avatar: string
  ultimoMensaje: string
  timestamp: string
}

export default function ChatsPanel() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [threads, setThreads] = useState<Thread[]>([])

  const myId = user?.id ?? null

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0))
  }, [threads])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!myId) {
        setThreads([])
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data: rows, error } = await supabase
        .from('direct_messages')
        .select('id, sender_id, receiver_id, content, created_at')
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: false })
        .limit(300)

      if (cancelled) return

      if (error || !rows?.length) {
        setThreads([])
        setLoading(false)
        return
      }

      const latestByPartner = new Map<string, { content: string; created_at: string }>()
      for (const row of rows as Array<{ sender_id: string; receiver_id: string; content: string | null; created_at: string | null }>) {
        const partnerId: string = row.sender_id === myId ? row.receiver_id : row.sender_id
        if (!partnerId || partnerId === myId) continue
        if (!latestByPartner.has(partnerId)) {
          latestByPartner.set(partnerId, { content: String(row.content ?? ''), created_at: String(row.created_at ?? '') })
        }
      }

      const partnerIds = Array.from(latestByPartner.keys())
      if (partnerIds.length === 0) {
        setThreads([])
        setLoading(false)
        return
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', partnerIds)

      const profileMap = new Map<string, any>()
      for (const p of profiles ?? []) profileMap.set(p.id as string, p)

      const next: Thread[] = partnerIds.map((partnerId) => {
        const last = latestByPartner.get(partnerId)!
        const p = profileMap.get(partnerId)
        const name = (p?.full_name as string | null) || (p?.username as string | null) || 'Usuario'
        const avatarUrl = (p?.avatar_url as string | null) || ''
        const avatar = /^https?:\/\//i.test(avatarUrl) ? avatarUrl : '🎸'
        return {
          partnerId,
          usuario: name,
          avatar,
          ultimoMensaje: last.content || '—',
          timestamp: last.created_at
            ? new Date(last.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
            : '',
        }
      })

      setThreads(next)
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [myId])

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-emerald-900/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="shrink-0 border-b border-emerald-800/50 bg-slate-900/90 px-3 py-3 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/20 ring-1 ring-emerald-500/40">
              <Music className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Mensajes</h2>
              <p className="text-[10px] text-emerald-200/60">DMs reales (Supabase)</p>
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {!myId ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
            <p className="text-sm text-slate-400">Inicia sesión para ver tus mensajes</p>
          </div>
        ) : loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Cargando conversaciones…</p>
        ) : sortedThreads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-400">Aún no hay conversaciones</p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Abre el perfil de un músico y envía un mensaje (DM) para crear tu primer hilo.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {sortedThreads.map((t) => (
              <li key={t.partnerId}>
                <Link
                  href={`/chat/${t.partnerId}`}
                  className="flex gap-3 rounded-xl border border-transparent bg-slate-800/40 p-2.5 transition hover:border-emerald-700/50 hover:bg-slate-800/80"
                >
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-900/80 to-slate-800 text-xl ring-1 ring-emerald-600/30">
                      {/^https?:\/\//i.test(t.avatar) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        t.avatar
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate font-semibold text-slate-100">{t.usuario}</span>
                      {t.timestamp ? <span className="shrink-0 text-[10px] text-slate-500">{t.timestamp}</span> : null}
                    </div>
                    <p className="truncate text-xs text-slate-400">{t.ultimoMensaje}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
