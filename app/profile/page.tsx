'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import type { ProfileData } from '../context/AuthContext'

const defaultProfileData: ProfileData = {
  nombreCompleto: 'Nombre del Usuario',
  comuna: 'Providencia',
  ciudad: 'Santiago',
  pais: 'Chile',
  edad: '28',
  nivelMusical: 'intermedio',
  instrumentos: 'Guitarra, Bajo',
  canta: false,
  descripcion: 'Músico apasionado por el rock y la música en vivo. Buscando conectar con otros artistas.',
  rol: 'artista'
}

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData)

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    if (user) {
      if (user.profile) {
        // Si hay datos del perfil guardados, usarlos
        setProfileData(user.profile)
      } else if (user.nombreCompleto) {
        // Si no hay perfil pero hay nombre completo, usar datos básicos
        setProfileData({
          ...defaultProfileData,
          nombreCompleto: user.nombreCompleto
        })
      }
    }
  }, [user])

  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Guardar los datos del perfil
    updateProfile(profileData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Restaurar datos originales al cancelar
    if (user?.profile) {
      setProfileData(user.profile)
    } else if (user?.nombreCompleto) {
      setProfileData({
        ...defaultProfileData,
        nombreCompleto: user.nombreCompleto
      })
    }
    setIsEditing(false)
  }

  const getNivelMusicalLabel = (nivel: string) => {
    const niveles: { [key: string]: string } = {
      principiante: 'Principiante',
      intermedio: 'Intermedio',
      avanzado: 'Avanzado',
      profesional: 'Profesional'
    }
    return niveles[nivel] || nivel
  }

  const getRolLabel = (rol: string) => {
    const roles: { [key: string]: string } = {
      oyente: 'Oyente',
      profesor: 'Profesor',
      artista: 'Artista',
      banda: 'Banda',
      alumno: 'Alumno'
    }
    return roles[rol] || rol
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <Header />
      
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header del perfil */}
          <div className="flex items-start space-x-6 mb-8">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" 
              alt="Avatar" 
              className="w-32 h-32 rounded-full border-4 border-purple-500"
            />
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.nombreCompleto}
                  onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
                  className="text-3xl font-bold text-gray-900 mb-2 w-full border-b-2 border-purple-500 focus:outline-none"
                  placeholder="Nombre completo"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.nombreCompleto}</h1>
              )}
              <p className="text-gray-600 mb-4">@{user?.username || 'username'}</p>
              {isEditing ? (
                <textarea
                  value={profileData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  className="text-gray-700 mb-4 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Breve descripción sobre tu propósito en la app..."
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 mb-4">{profileData.descripcion}</p>
              )}
              <div className="flex space-x-6 text-sm">
                <div>
                  <span className="font-bold text-gray-900">150</span>
                  <span className="text-gray-600 ml-1">Seguidores</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">45</span>
                  <span className="text-gray-600 ml-1">Siguiendo</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">23</span>
                  <span className="text-gray-600 ml-1">Posts</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>

          {/* Información adicional */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información</h2>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Comuna</label>
                    <input
                      type="text"
                      value={profileData.comuna}
                      onChange={(e) => handleInputChange('comuna', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Providencia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={profileData.ciudad}
                      onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Santiago"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
                    <input
                      type="text"
                      value={profileData.pais}
                      onChange={(e) => handleInputChange('pais', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Chile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Edad</label>
                    <input
                      type="number"
                      value={profileData.edad}
                      onChange={(e) => handleInputChange('edad', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: 28"
                      min="1"
                      max="120"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                  <select
                    value={profileData.rol}
                    onChange={(e) => handleInputChange('rol', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="oyente">Oyente</option>
                    <option value="profesor">Profesor</option>
                    <option value="artista">Artista</option>
                    <option value="banda">Banda</option>
                    <option value="alumno">Alumno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nivel Musical</label>
                  <select
                    value={profileData.nivelMusical}
                    onChange={(e) => handleInputChange('nivelMusical', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                    <option value="profesional">Profesional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Instrumentos que tocas</label>
                  <input
                    type="text"
                    value={profileData.instrumentos}
                    onChange={(e) => handleInputChange('instrumentos', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: Guitarra, Bajo, Piano"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="canta"
                    checked={profileData.canta}
                    onChange={(e) => handleInputChange('canta', e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="canta" className="text-sm font-semibold text-gray-700">
                    También canto
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Rol</p>
                  <p className="font-semibold text-gray-900">{getRolLabel(profileData.rol)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nivel Musical</p>
                  <p className="font-semibold text-gray-900">{getNivelMusicalLabel(profileData.nivelMusical)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Instrumentos</p>
                  <p className="font-semibold text-gray-900">
                    {profileData.instrumentos}
                    {profileData.canta && ' • Canta'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ubicación</p>
                  <p className="font-semibold text-gray-900">
                    {profileData.comuna}, {profileData.ciudad}, {profileData.pais}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Edad</p>
                  <p className="font-semibold text-gray-900">{profileData.edad} años</p>
                </div>
              </div>
            )}
          </div>

          {/* Posts del usuario */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Posts</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 mb-2">¡Nueva canción en proceso! 🎸</p>
                <p className="text-sm text-gray-500">Hace 2 días</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 mb-2">Buscando baterista para proyecto nuevo</p>
                <p className="text-sm text-gray-500">Hace 1 semana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

