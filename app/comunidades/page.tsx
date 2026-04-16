'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/src/lib/supabase/client'
import {
  getCommunityMemberCountMap,
  joinCommunity,
  listCommunities,
  type CommunityRow,
} from '@/src/lib/services/communities'
import { useAuth } from '@/app/context/AuthContext'

const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    purple: 'from-rolex to-rolex-light',
    blue: 'from-rolex to-rolex-light',
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-400 to-yellow-500',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-600 to-indigo-700',
    pink: 'from-rolex to-rolex-light',
    teal: 'from-teal-500 to-teal-600'
  }
  return colors[color] || 'from-rolex to-rolex-light'
}

export default function ComunidadesPage() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState<
    { id: string; nombre: string; icono: string; descripcion: string; color: string; miembros: string }[]
  >([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const [{ data }, { data: countMap }] = await Promise.all([
        listCommunities(supabase),
        getCommunityMemberCountMap(supabase),
      ])
      if (cancelled) return
      setCommunities(
        ((data ?? []) as CommunityRow[]).map((c) => ({
          id: c.id,
          nombre: c.name,
          icono: c.icon || '🎵',
          descripcion: c.description || 'Comunidad musical',
          color: c.color || 'purple',
          miembros: String(countMap?.[c.id] ?? 0),
        }))
      )
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleJoin = async (communityId: string) => {
    if (!user?.id) return
    const supabase = createClient()
    await joinCommunity(supabase, { communityId, userId: user.id })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 hover:opacity-80" style={{ color: 'var(--rolex)' }}>
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rolex to-rolex-light bg-clip-text text-transparent">
            Comunidades
          </h1>
        </div>

        {/* Grid de Comunidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-rolex/25 bg-white/70 p-10 text-center">
              <p className="text-sm text-gray-700">Aún no hay comunidades</p>
              <p className="mt-2 text-xs text-gray-500">Crea una desde el panel lateral en el home, o ejecuta las migraciones en Supabase.</p>
            </div>
          ) : null}
          {communities.map((comunidad) => (
            <div 
              key={comunidad.id}
              className="border-2 border-rolex/30 hover:border-rolex transition-all duration-300 hover:shadow-xl cursor-pointer group rounded-xl bg-white p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColorClasses(comunidad.color)} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {comunidad.icono}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {comunidad.nombre}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {comunidad.descripcion}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      👥 {comunidad.miembros} miembros
                    </span>
                    <Button 
                      onClick={() => void handleJoin(comunidad.id)}
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: 'var(--rolex)' }}
                    >
                      Unirme
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}




