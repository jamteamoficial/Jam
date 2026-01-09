'use client'

import { useState, useRef } from 'react'
import { X, Music, Video, Type, Upload, FileVideo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { uploadVideo } from '@/lib/hooks/useVideoUpload'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
}

const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB en bytes

export default function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [contentType, setContentType] = useState<'mensaje' | 'video'>('mensaje')
  const [feedType, setFeedType] = useState<'descubrir' | 'conectar' | 'aprender' | null>(null)
  const [text, setText] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo muy grande",
        description: `El video no puede superar ${MAX_FILE_SIZE / (1024 * 1024)}MB. Tu archivo es ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        variant: "destructive"
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Por favor selecciona un archivo de video",
        variant: "destructive"
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setSelectedVideo(file)
    
    // Crear preview del video
    const videoUrl = URL.createObjectURL(file)
    setVideoPreview(videoUrl)

    toast({
      title: "Video seleccionado",
      description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
    })
  }

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setSelectedVideo(null)
    setVideoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para publicar",
        variant: "destructive"
      })
      return
    }

    // Validar según el tipo de contenido
    if (contentType === 'mensaje' && !text.trim()) {
      toast({
        title: "Campo vacío",
        description: "Escribe algo para publicar",
        variant: "destructive"
      })
      return
    }

    if (contentType === 'video' && !selectedVideo) {
      toast({
        title: "Video requerido",
        description: "Por favor selecciona un video para publicar",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      let videoUrl: string | null = null

      // Si el contenido es video, subir a Supabase Storage
      // Usar email como userId (o username si no hay email)
      const userId = user.email || user.username || 'anonymous'
      
      if (contentType === 'video' && selectedVideo) {
        try {
          toast({
            title: "Subiendo video...",
            description: "Por favor espera mientras se sube tu video",
          })
          
          videoUrl = await uploadVideo(selectedVideo, userId)
          
          toast({
            title: "Video subido",
            description: "El video se ha subido correctamente",
          })
        } catch (uploadError: any) {
          console.error('Error al subir video:', uploadError)
          toast({
            title: "Error al subir video",
            description: uploadError.message || "No se pudo subir el video a Supabase",
            variant: "destructive"
          })
          setLoading(false)
          return
        }
      }

      // Obtener publicaciones existentes de localStorage
      const existingPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
      
      // Crear datos base de la publicación
      const postData = {
        id: Date.now().toString(),
        usuario: user.nombreCompleto || user.username || 'Usuario',
        instrumento: 'Músico',
        estilo: 'Varios',
        ciudad: 'Santiago',
        texto: contentType === 'mensaje' ? text : `Video: ${selectedVideo?.name || 'video'}`,
        avatar: '🎵',
        tipo: contentType === 'video' ? 'video' : 'compartir',
        videoFile: contentType === 'video' && selectedVideo ? {
          name: selectedVideo.name,
          size: selectedVideo.size,
          type: selectedVideo.type,
          videoUrl: videoUrl || null,
          localUrl: videoPreview // Mantener preview local como fallback
        } : null,
        createdAt: new Date().toISOString()
      }

      // Siempre crear publicación en General
      const generalPost = {
        ...postData,
        feedType: 'general'
      }
      existingPosts.unshift(generalPost)

      // Si se seleccionó otro feed, también crear una copia para ese feed
      if (feedType) {
        const additionalPost = {
          ...postData,
          id: `${postData.id}_${feedType}`, // ID único para la copia
          feedType: feedType
        }
        existingPosts.unshift(additionalPost)
      }

      localStorage.setItem('userPosts', JSON.stringify(existingPosts))

      toast({
        title: "¡Publicación creada!",
        description: contentType === 'video' ? 'Tu video ha sido publicado' : 'Tu mensaje ha sido publicado',
      })
      
      // Limpiar formulario
      setText('')
      setSelectedVideo(null)
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
        setVideoPreview(null)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setLoading(false)
      onClose()
      
      // Disparar evento para actualizar el feed
      window.dispatchEvent(new CustomEvent('newPostCreated'))
    } catch (error: any) {
      console.error('Error al guardar publicación:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // Limpiar preview al cerrar el modal
  const handleClose = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setSelectedVideo(null)
    setVideoPreview(null)
    setText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border-2 border-purple-200 shadow-2xl">
          <div className="relative p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Crear Contenido
            </h2>
            
            {/* Selector de tipo */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setContentType('mensaje')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  contentType === 'mensaje'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Type className="w-5 h-5 mx-auto mb-1" />
                Mensaje
              </button>
              <button
                type="button"
                onClick={() => setContentType('video')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  contentType === 'video'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video className="w-5 h-5 mx-auto mb-1" />
                Video
              </button>
            </div>

            {/* Selector de Feed */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Publicar también en: <span className="text-xs font-normal text-gray-500">(opcional, siempre aparece en General)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedType(feedType === 'descubrir' ? null : 'descubrir')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                    feedType === 'descubrir'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Descubrir
                </button>
                <button
                  type="button"
                  onClick={() => setFeedType(feedType === 'conectar' ? null : 'conectar')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                    feedType === 'conectar'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Conectar
                </button>
                <button
                  type="button"
                  onClick={() => setFeedType(feedType === 'aprender' ? null : 'aprender')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                    feedType === 'aprender'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aprender
                </button>
              </div>
              {feedType && (
                <p className="text-xs text-purple-600 mt-2">
                  ✓ También aparecerá en el feed {feedType === 'descubrir' ? 'Descubrir' : feedType === 'conectar' ? 'Conectar' : 'Aprender'}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {contentType === 'mensaje' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Escribe tu mensaje
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={6}
                    placeholder="¿Qué quieres compartir con la comunidad?"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sube tu video
                  </label>
                  
                  {selectedVideo ? (
                    <div className="border-2 border-purple-300 rounded-xl p-4 bg-purple-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FileVideo className="w-8 h-8 text-purple-600" />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{selectedVideo.name}</p>
                            <p className="text-xs text-gray-600">
                              {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                      {videoPreview && (
                        <video
                          src={videoPreview}
                          controls
                          className="w-full rounded-lg max-h-48 object-cover"
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full mt-3"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Cambiar Video
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                      <Video className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">Haz clic para seleccionar un video</p>
                      <p className="text-sm text-gray-500 mb-4">MP4, MOV, AVI hasta 30MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="mt-2 cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Seleccionar Video
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={
                  loading || 
                  (contentType === 'mensaje' && !text.trim()) ||
                  (contentType === 'video' && !selectedVideo)
                }
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Music className="w-4 h-4 mr-2" />
                {loading ? 'Publicando...' : contentType === 'video' ? 'Publicar Video' : 'Publicar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

