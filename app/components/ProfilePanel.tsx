'use client'

import { useState, useEffect } from 'react'
import { X, Heart, Video, MessageCircle, Music, MapPin, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/context/AuthContext'
import Link from 'next/link'

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
}

interface ProfileData {
  nombreCompleto: string
  ciudad: string
  pais: string
  edad: number | ''
  nivelMusical: string
  instrumentos: string[]
  estilosMusicales: string[]
  descripcion: string
  contactoWhatsapp: string
  contactoInstagram: string
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { isAuthenticated, user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  // Cargar datos del perfil desde localStorage
  useEffect(() => {
    if (isAuthenticated && user && typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem(`profile_${user.email}`)
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setProfileData(parsed)
        } catch (error) {
          console.error('Error al cargar perfil:', error)
        }
      }
    }
  }, [isAuthenticated, user, isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div className="fixed top-0 left-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mi Perfil
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isAuthenticated && user ? (
            <div className="space-y-6">
              {/* Profile Summary */}
              <div className="border-2 border-purple-200 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-5xl text-white font-bold mb-4">
                  {profileData?.nombreCompleto 
                    ? profileData.nombreCompleto[0].toUpperCase() 
                    : user.nombreCompleto 
                    ? user.nombreCompleto[0].toUpperCase() 
                    : 'U'}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {profileData?.nombreCompleto || user.nombreCompleto || user.username}
                </h3>
                <p className="text-gray-600 text-sm">@{user.username}</p>
                {profileData?.nivelMusical && (
                  <p className="text-sm text-purple-600 font-semibold mt-1">{profileData.nivelMusical}</p>
                )}

                <div className="flex justify-around w-full mt-6">
                  <div className="text-center">
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="font-bold text-lg">120</p>
                    <p className="text-sm text-gray-600">Likes</p>
                  </div>
                  <div className="text-center">
                    <Video className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="font-bold text-lg">3</p>
                    <p className="text-sm text-gray-600">Videos</p>
                  </div>
                  <div className="text-center">
                    <MessageCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="font-bold text-lg">7</p>
                    <p className="text-sm text-gray-600">JAMs</p>
                  </div>
                </div>

                {/* Botón Editar Perfil - Siempre visible */}
                <Link href="/perfil" className="w-full mt-6" onClick={onClose}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
              </div>

              {/* More profile details */}
              {profileData && (
                <div className="border-2 border-blue-200 rounded-xl shadow-lg p-6 space-y-4">
                  {profileData.instrumentos && profileData.instrumentos.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-purple-600" />
                      <p className="text-gray-700">
                        Instrumentos: <span className="font-semibold">{profileData.instrumentos.join(', ')}</span>
                      </p>
                    </div>
                  )}
                  {profileData.estilosMusicales && profileData.estilosMusicales.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-blue-600" />
                      <p className="text-gray-700">
                        Estilos: <span className="font-semibold">{profileData.estilosMusicales.join(', ')}</span>
                      </p>
                    </div>
                  )}
                  {profileData.ciudad && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <p className="text-gray-700">
                        Ciudad: <span className="font-semibold">{profileData.ciudad}{profileData.pais ? `, ${profileData.pais}` : ''}</span>
                      </p>
                    </div>
                  )}
                  {profileData.descripcion && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-gray-700 text-sm italic">{profileData.descripcion}</p>
                    </div>
                  )}
                </div>
              )}

              {!profileData && (
                <div className="border-2 border-yellow-200 rounded-xl shadow-lg p-6 bg-yellow-50 text-center">
                  <p className="text-gray-700 mb-4">Aún no has completado tu perfil</p>
                  <Link href="/perfil" onClick={onClose}>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Crear Perfil
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Inicia sesión para ver tu perfil</p>
              <Button 
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


