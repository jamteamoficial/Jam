'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { Music } from 'lucide-react'

/**
 * Intercambio del código OAuth en el **cliente** (mismo contexto que guardó el PKCE).
 * El Route Handler en servidor suele fallar con "PKCE" / sesión si las cookies no coinciden.
 */
function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [detail, setDetail] = useState('Conectando con tu cuenta…')

  useEffect(() => {
    const oauthError = searchParams.get('error')
    const oauthDesc = searchParams.get('error_description')

    if (oauthError) {
      setStatus('error')
      setDetail(oauthDesc || oauthError)
      router.replace(
        `/login?error=${encodeURIComponent(oauthDesc || oauthError)}`
      )
      return
    }

    const code = searchParams.get('code')
    if (!code) {
      setStatus('error')
      setDetail('No se recibió el código de autorización.')
      router.replace(
        `/login?error=${encodeURIComponent('Sesión incompleta. Vuelve a intentar con Google.')}`
      )
      return
    }

    const supabase = createClient()

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error('[auth/callback]', error)
        setStatus('error')
        setDetail(error.message)
        router.replace(`/login?error=${encodeURIComponent(error.message)}`)
        return
      }
      router.replace('/')
      router.refresh()
    })
  }, [router, searchParams])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 text-center">
      <Music className="mb-4 h-12 w-12 animate-pulse text-emerald-400" />
      {status === 'loading' ? (
        <>
          <p className="text-lg font-medium text-white">{detail}</p>
          <p className="mt-2 text-sm text-emerald-200/70">Un momento…</p>
        </>
      ) : (
        <p className="text-red-300">{detail}</p>
      )}
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          Cargando…
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
