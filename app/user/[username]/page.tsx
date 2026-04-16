'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * Ruta legacy: `/user/[username]`
 * La app Beta usa perfiles reales en `/usuario/[username]` (lookup por username en Supabase).
 */
export default function LegacyUserRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const username = String(params.username ?? '')

  useEffect(() => {
    if (!username) {
      router.replace('/')
      return
    }
    router.replace(`/usuario/${encodeURIComponent(username)}`)
  }, [router, username])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-6">
      <p className="text-sm text-gray-600">Redirigiendo al perfil…</p>
    </div>
  )
}
