'use client'

import { useState } from 'react'
import { X, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleLogin = async () => {
    setLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast({
          title: "¡Bienvenido de nuevo!",
          description: "Has iniciado sesión correctamente.",
        })
        onClose()
        router.push('/')
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: "Credenciales incorrectas o usuario no encontrado.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar iniciar sesión.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-purple-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Iniciar Sesión
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg"
              >
                {loading ? 'Iniciando...' : 'Entrar a JAM'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                ¿No tienes cuenta? <Link href="/registro" className="text-purple-600 hover:underline" onClick={onClose}>Regístrate</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


