'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Errores de OAuth (redirect desde /auth/callback)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('error')
    if (q) {
      setError(decodeURIComponent(q))
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validación básica
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    try {
      // Intentar iniciar sesión
      const success = await login(formData.email, formData.password)
      
      if (success) {
        // Redirigir al inicio después del login exitoso
        router.push('/')
      } else {
        setError('Error al iniciar sesión. Por favor intenta de nuevo.')
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r text-rolex  mb-2">
              🎸 Iniciar Sesión
            </h1>
            <p className="text-gray-600">Bienvenido de vuelta a la comunidad de músicos</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rolex"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rolex"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded focus:ring-2 focus:ring-offset-0"
                  style={{ accentColor: 'var(--rolex)' }}
                />
                <label htmlFor="remember" className="ml-2 text-sm font-semibold" style={{ color: 'var(--rolex)' }}>
                  Recordarme
                </label>
              </div>
              <Link href="#" className="text-sm text-rolex hover:text-rolex-dark font-semibold">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-lg transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: 'var(--rolex)' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-rolex hover:text-rolex-dark font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
