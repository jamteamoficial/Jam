'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/src/lib/supabase/client'
import { joinCommunity, listCommunityMemberIds } from '@/src/lib/services/communities'
import { getCommunityIconGradientClass } from '@/src/lib/communities/colors'

type CommunityRow = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

export default function ComunidadDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const communityId = String(params.id ?? '')

  const [loading, setLoading] = useState(true)
  const [community, setCommunity] = useState<CommunityRow | null>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [isMember, setIsMember] = useState(false)

  const colorClass = useMemo(() => getCommunityIconGradientClass(community?.color), [community?.color])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!communityId) {
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('communities')
        .select('id, name, description, icon, color')
        .eq('id', communityId)
        .maybeSingle()

      if (cancelled) return

      if (error || !data) {
        setCommunity(null)
        setMemberCount(0)
        setIsMember(false)
        setLoading(false)
        return
      }

      setCommunity(data as CommunityRow)

      const { data: members, error: membersError } = await listCommunityMemberIds(supabase, communityId)
      if (!membersError) {
        setMemberCount(members?.length ?? 0)
        setIsMember(Boolean(user?.id && members?.includes(user.id)))
      } else {
        setMemberCount(0)
        setIsMember(false)
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
    if (!error) {
      setIsMember(true)
      setMemberCount((c) => c + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <p className="text-gray-600">Cargando comunidad…</p>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-6">
        <div className="max-w-lg text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Comunidad no encontrada</h2>
          <p className="mb-6 text-sm text-gray-600">No existe en Supabase (o aún no aplicaste las migraciones).</p>
          <Button onClick={() => router.push('/')} className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <Link href="/comunidades" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Volver a comunidades
        </Link>

        <div className="overflow-hidden rounded-3xl border border-rolex/20 bg-white shadow-xl">
          <div className={`h-28 bg-gradient-to-br ${colorClass}`} />
          <div className="p-8">
            <div className="-mt-16 mb-5 flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-lg ring-2 ring-white">
                {community.icon || '🎵'}
              </div>
              <div className="pb-1">
                <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-rolex" />
                  <span>
                    {memberCount} miembro{memberCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-700">{community.description || 'Sin descripción.'}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!isMember ? (
                <Button onClick={() => void handleJoin()} className="font-bold text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
                  Unirme
                </Button>
              ) : null}
              <Link
                href={`/comunidad/${community.id}/chat`}
                className="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-bold hover:bg-gray-50"
                style={{ borderColor: 'var(--rolex)', color: 'var(--rolex)' }}
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            </div>

            {!user ? <p className="mt-4 text-xs text-gray-500">Inicia sesión para unirte y participar en el chat.</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
