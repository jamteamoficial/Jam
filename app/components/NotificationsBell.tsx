'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  type NotificationRow,
} from '@/src/lib/services/notifications'

export default function NotificationsBell() {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const refreshUnread = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setUnread(0)
      return
    }
    const { count } = await countUnreadNotifications(supabase)
    setUnread(count)
  }, [supabase])

  useEffect(() => {
    void refreshUnread()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshUnread()
    })
    const t = window.setInterval(() => void refreshUnread(), 45000)
    const onCustom = () => void refreshUnread()
    window.addEventListener('notifications-updated', onCustom)
    return () => {
      subscription.unsubscribe()
      window.clearInterval(t)
      window.removeEventListener('notifications-updated', onCustom)
    }
  }, [refreshUnread, supabase])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const handleBellClick = async () => {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setOpen(false)
      return
    }
    setLoading(true)
    const { data } = await listNotifications(supabase, { limit: 25 })
    setItems((data as NotificationRow[]) ?? [])
    await markAllNotificationsRead(supabase)
    await refreshUnread()
    setLoading(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => void handleBellClick()}
        className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[60] mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-xs font-semibold text-gray-800">Notificaciones</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-6 text-center text-xs text-gray-500">Cargando…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-gray-500">Sin alertas</p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li key={n.id} className="border-b border-gray-50 px-3 py-2.5 last:border-0">
                    <p className="text-xs font-semibold text-gray-900">{n.title || n.type}</p>
                    {n.body && <p className="mt-0.5 text-xs leading-snug text-gray-600">{n.body}</p>}
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(n.created_at).toLocaleString('es-CL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
