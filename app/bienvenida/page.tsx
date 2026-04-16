'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/src/lib/supabase/client'
import { isProfileIncomplete } from '@/src/lib/profile/onboarding'

const INSTRUMENTS = [
  'Guitarra',
  'Bajo',
  'Bateria',
  'Piano',
  'Voz',
  'Teclado',
  'Violin',
  'Saxofon',
  'Trompeta',
  'DJ',
  'Produccion',
] as const

type WelcomeForm = {
  full_name: string
  username: string
  ciudad: string
  instrumentos: string[]
}

export default function BienvenidaPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<WelcomeForm>({
    full_name: '',
    username: '',
    ciudad: '',
    instrumentos: [],
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, ciudad, instrumentos')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return
      if (profile && !isProfileIncomplete(profile)) {
        router.replace('/')
        return
      }

      setForm({
        full_name: profile?.full_name?.trim() || '',
        username: profile?.username?.replace(/_[a-f0-9]{8,}$/i, '') || '',
        ciudad: profile?.ciudad?.trim() || '',
        instrumentos: Array.isArray(profile?.instrumentos) ? profile.instrumentos.filter(Boolean) : [],
      })
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [router, supabase])

  const toggleInstrument = (instrument: string) => {
    setForm((prev) => ({
      ...prev,
      instrumentos: prev.instrumentos.includes(instrument)
        ? prev.instrumentos.filter((value) => value !== instrument)
        : [...prev.instrumentos, instrument],
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const fullName = form.full_name.trim()
    const city = form.ciudad.trim()
    const username = form.username
      .trim()
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 40)

    if (!fullName || !username || !city || form.instrumentos.length === 0) {
      setError('Completa nombre, username, ciudad y al menos un instrumento.')
      return
    }

    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      router.replace('/login')
      return
    }

    const { data: used, error: usernameErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .maybeSingle()

    if (usernameErr) {
      setSaving(false)
      setError(usernameErr.message)
      return
    }
    if (used) {
      setSaving(false)
      setError('Ese username ya existe. Prueba con otro.')
      return
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: fullName,
        username,
        ciudad: city,
        instrumentos: form.instrumentos,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    setSaving(false)
    if (updateErr) {
      setError(updateErr.message)
      return
    }

    router.replace('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Cargando bienvenida...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-rolex/20 bg-white p-6 shadow-xl md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rolex/80">Bienvenido a JAM</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Completa tu perfil para continuar</h1>
        <p className="mt-2 text-sm text-gray-600">
          Este paso es obligatorio una sola vez. Te tomara menos de un minuto.
        </p>

        <form onSubmit={handleSave} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nombre y apellido</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-rolex focus:ring-2 focus:ring-rolex/20"
              placeholder="Seba Mendez"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nombre de usuario</label>
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-rolex focus:ring-2 focus:ring-rolex/20"
              placeholder="sebamendez"
              autoComplete="username"
            />
            <p className="mt-1 text-xs text-gray-500">Sin espacios. Te encontraran por @username.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Ciudad</label>
            <input
              value={form.ciudad}
              onChange={(e) => setForm((prev) => ({ ...prev, ciudad: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-rolex focus:ring-2 focus:ring-rolex/20"
              placeholder="Santiago"
              autoComplete="address-level2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Instrumentos</label>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map((instrument) => {
                const selected = form.instrumentos.includes(instrument)
                return (
                  <button
                    key={instrument}
                    type="button"
                    onClick={() => toggleInstrument(instrument)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? 'border-rolex bg-rolex text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-rolex/40'
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                    {instrument}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: 'var(--rolex)' }}
          >
            {saving ? 'Guardando...' : 'Guardar y entrar al feed'}
          </Button>
        </form>
      </div>
    </div>
  )
}
