'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            🎸 Feed de Músicos
          </h1>
          <p className="text-xl text-gray-600">
            Conecta con músicos de Santiago y encuentra tu próxima banda
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-colors"
          >
            Inicio
          </Link>
          {isAuthenticated ? (
            <>
              <span className="px-4 py-2 text-gray-700 font-semibold">
                Hola, {user?.username || 'Usuario'}
              </span>
              <Link 
                href="/profile"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Mi Perfil
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-semibold"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
  