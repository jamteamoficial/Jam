'use client'

import { useState, useRef } from 'react'
import { X, Music, Video, Type, Upload, FileVideo, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/src/lib/hooks/use-toast'
import { useAuth } from '@/app/context/AuthContext'
import { uploadVideo, uploadPostImage, uploadPostImageBlob } from '@/src/lib/hooks/useVideoUpload'
import { createClient } from '@/src/lib/supabase/client'
import { createPost } from '@/src/lib/services/jam-social'
import { isProfileIncomplete } from '@/src/lib/profile/onboarding'
import { captureVideoPosterFrame } from '@/src/lib/video/captureVideoPosterFrame'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
}

const MAX_FILE_SIZE = 30 * 1024 * 1024
const MAX_IMAGE_SIZE = 12 * 1024 * 1024

export default function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [contentType, setContentType] = useState<'mensaje' | 'video'>('mensaje')
  const [feedType, setFeedType] = useState<'descubrir' | 'conectar' | 'aprender' | null>(null)
  const [text, setText] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [textImageFile, setTextImageFile] = useState<File | null>(null)
  const [textImagePreview, setTextImagePreview] = useState<string | null>(null)
  const [videoCoverFile, setVideoCoverFile] = useState<File | null>(null)
  const [videoCoverPreview, setVideoCoverPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const clearVideoMedia = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setSelectedVideo(null)
    setVideoPreview(null)
    setVideoCoverFile(null)
    if (videoCoverPreview) URL.revokeObjectURL(videoCoverPreview)
    setVideoCoverPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const clearTextImageMedia = () => {
    if (textImagePreview) URL.revokeObjectURL(textImagePreview)
    setTextImageFile(null)
    setTextImagePreview(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Archivo muy grande',
        description: `El video no puede superar ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        variant: 'destructive',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Tipo de archivo inválido',
        description: 'Selecciona un archivo de video.',
        variant: 'destructive',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedVideo(file)
    const videoUrl = URL.createObjectURL(file)
    setVideoPreview(videoUrl)
    toast({ title: 'Video seleccionado', description: `${file.name}` })
  }

  const handleTextImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: 'Imagen muy grande',
        description: `Máximo ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`,
        variant: 'destructive',
      })
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Sube una imagen (JPG, PNG o WebP).',
        variant: 'destructive',
      })
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }

    if (textImagePreview) URL.revokeObjectURL(textImagePreview)
    setTextImageFile(file)
    setTextImagePreview(URL.createObjectURL(file))
  }

  const handleVideoCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: 'Imagen muy grande',
        description: `Máximo ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`,
        variant: 'destructive',
      })
      if (coverInputRef.current) coverInputRef.current.value = ''
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Sube una imagen para la portada.',
        variant: 'destructive',
      })
      if (coverInputRef.current) coverInputRef.current.value = ''
      return
    }

    if (videoCoverPreview) URL.revokeObjectURL(videoCoverPreview)
    setVideoCoverFile(file)
    setVideoCoverPreview(URL.createObjectURL(file))
  }

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setSelectedVideo(null)
    setVideoPreview(null)
    if (videoCoverPreview) URL.revokeObjectURL(videoCoverPreview)
    setVideoCoverFile(null)
    setVideoCoverPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const handleRemoveTextImage = () => {
    if (textImagePreview) URL.revokeObjectURL(textImagePreview)
    setTextImageFile(null)
    setTextImagePreview(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleRemoveVideoCover = () => {
    if (videoCoverPreview) URL.revokeObjectURL(videoCoverPreview)
    setVideoCoverFile(null)
    setVideoCoverPreview(null)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas iniciar sesión para publicar',
        variant: 'destructive',
      })
      return
    }

    if (contentType === 'mensaje') {
      if (!text.trim()) {
        toast({ title: 'Campo vacío', description: 'Escribe algo para publicar.', variant: 'destructive' })
        return
      }
      if (!textImageFile) {
        toast({
          title: 'Foto obligatoria',
          description: 'Para un post solo de texto debes subir una imagen.',
          variant: 'destructive',
        })
        return
      }
    }

    if (contentType === 'video' && !selectedVideo) {
      toast({ title: 'Video requerido', description: 'Selecciona un video.', variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser?.id) {
        setLoading(false)
        toast({
          title: 'Sesion requerida',
          description: 'Debes iniciar sesion para publicar.',
          variant: 'destructive',
        })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, ciudad, instrumentos')
        .eq('id', authUser.id)
        .maybeSingle()

      if (isProfileIncomplete(profile)) {
        setLoading(false)
        toast({
          title: 'Completa tu perfil',
          description: 'Antes de publicar debes completar el onboarding.',
          variant: 'destructive',
        })
        onClose()
        window.location.href = '/bienvenida'
        return
      }

      const userId = authUser.id
      let finalVideoUrl = ''
      let thumbnailUrl: string | null = null

      if (contentType === 'mensaje' && textImageFile) {
        toast({ title: 'Subiendo imagen…', description: 'Un momento' })
        thumbnailUrl = await uploadPostImage(textImageFile, userId)
        finalVideoUrl = ''
      }

      if (contentType === 'video' && selectedVideo) {
        toast({ title: 'Subiendo video…', description: 'Por favor espera' })
        finalVideoUrl = await uploadVideo(selectedVideo, userId)
        toast({ title: 'Video subido', description: 'Procesando portada…' })

        if (videoCoverFile) {
          thumbnailUrl = await uploadPostImage(videoCoverFile, userId)
        } else {
          try {
            const frameBlob = await captureVideoPosterFrame(selectedVideo)
            thumbnailUrl = await uploadPostImageBlob(frameBlob, userId)
          } catch (capErr) {
            console.warn('[CreateModal] Sin portada automática:', capErr)
            thumbnailUrl = null
          }
        }
      }

      const description = text.trim() || null
      const { error } = await createPost(supabase, {
        video_url: finalVideoUrl,
        description,
        thumbnail_url: thumbnailUrl,
      })

      if (error) throw error

      toast({
        title: '¡Publicación creada!',
        description:
          contentType === 'video' ? 'Tu video está en el feed general.' : 'Tu publicación está en el feed general.',
      })

      setText('')
      setSelectedVideo(null)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      setVideoPreview(null)
      handleRemoveTextImage()
      handleRemoveVideoCover()
      if (fileInputRef.current) fileInputRef.current.value = ''
      setLoading(false)
      onClose()
      window.dispatchEvent(new CustomEvent('newPostCreated'))
    } catch (error: unknown) {
      console.error('Error al guardar publicación:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo publicar',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    if (textImagePreview) URL.revokeObjectURL(textImagePreview)
    if (videoCoverPreview) URL.revokeObjectURL(videoCoverPreview)
    setSelectedVideo(null)
    setVideoPreview(null)
    setTextImageFile(null)
    setTextImagePreview(null)
    setVideoCoverFile(null)
    setVideoCoverPreview(null)
    setText('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (coverInputRef.current) coverInputRef.current.value = ''
    onClose()
  }

  const submitDisabled =
    loading ||
    (contentType === 'mensaje' && (!text.trim() || !textImageFile)) ||
    (contentType === 'video' && !selectedVideo)

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-rolex/30 bg-white shadow-2xl">
          <div className="relative max-h-[90vh] overflow-y-auto p-6">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="mb-6 bg-rolex bg-clip-text text-2xl font-bold text-transparent">Crear Contenido</h2>

            <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  clearVideoMedia()
                  setContentType('mensaje')
                }}
                className={`flex-1 rounded-xl px-4 py-3 font-medium transition-all ${
                  contentType === 'mensaje'
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={contentType === 'mensaje' ? { backgroundColor: 'var(--rolex)' } : undefined}
              >
                <Type className="mx-auto mb-1 h-5 w-5" />
                Mensaje
              </button>
              <button
                type="button"
                onClick={() => {
                  clearTextImageMedia()
                  setContentType('video')
                }}
                className={`flex-1 rounded-xl px-4 py-3 font-medium transition-all ${
                  contentType === 'video'
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={contentType === 'video' ? { backgroundColor: 'var(--rolex)' } : undefined}
              >
                <Video className="mx-auto mb-1 h-5 w-5" />
                Video
              </button>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Publicar también en:{' '}
                <span className="text-xs font-normal text-gray-500">(opcional, siempre en General)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['descubrir', 'conectar', 'aprender'] as const).map((ft) => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setFeedType(feedType === ft ? null : ft)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      feedType === ft ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={feedType === ft ? { backgroundColor: 'var(--rolex)' } : undefined}
                  >
                    {ft[0].toUpperCase() + ft.slice(1)}
                  </button>
                ))}
              </div>
              {feedType ? (
                <p className="mt-2 text-xs text-rolex">
                  ✓ También en el feed{' '}
                  {feedType === 'descubrir' ? 'Descubrir' : feedType === 'conectar' ? 'Conectar' : 'Aprender'}
                </p>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {contentType === 'mensaje' ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Escribe tu mensaje</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full rounded-xl border-2 border-rolex/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rolex"
                      rows={5}
                      placeholder="¿Qué quieres compartir?"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Foto obligatoria <span className="font-normal text-red-600">*</span>
                    </label>
                    <p className="mb-2 text-xs text-gray-500">
                      Se mostrará en el feed como portada de tu publicación de texto.
                    </p>
                    {textImagePreview ? (
                      <div className="rounded-xl border-2 border-rolex/40 p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={textImagePreview} alt="" className="max-h-48 w-full rounded-lg object-contain" />
                        <div className="mt-2 flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                            Cambiar foto
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={handleRemoveTextImage}>
                            Quitar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-rolex/40 py-8 text-gray-600 hover:border-rolex/60"
                      >
                        <ImageIcon className="mb-2 h-10 w-10 text-rolex/70" />
                        <span className="text-sm font-medium">Subir imagen</span>
                        <span className="mt-1 text-xs text-gray-500">JPG, PNG o WebP · máx. 12MB</span>
                      </button>
                    )}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleTextImageSelect}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Sube tu video</label>
                    {selectedVideo ? (
                      <div className="rounded-xl border-2 border-rolex/40 bg-rolex/10 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileVideo className="h-8 w-8 text-rolex" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{selectedVideo.name}</p>
                              <p className="text-xs text-gray-600">
                                {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                        {videoPreview ? (
                          <video src={videoPreview} controls className="max-h-48 w-full rounded-lg object-contain" />
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 w-full border-2"
                          style={{ borderColor: 'var(--rolex)', color: 'var(--rolex)' }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Cambiar video
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-rolex/40 p-8 text-center hover:border-rolex/50">
                        <Video className="mx-auto mb-3 h-12 w-12 text-rolex/70" />
                        <p className="mb-2 text-gray-600">Selecciona un video</p>
                        <p className="mb-4 text-sm text-gray-500">MP4, MOV… hasta 30MB</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          id="video-upload"
                          onChange={handleVideoSelect}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer border-2"
                          style={{ borderColor: 'var(--rolex)', color: 'var(--rolex)' }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Seleccionar video
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Portada en el feed <span className="font-normal text-gray-500">(opcional)</span>
                    </label>
                    <p className="mb-2 text-xs text-gray-500">
                      Si no subes imagen, usamos el primer fotograma del video. Si no se puede generar, el video se
                      muestra sin miniatura personalizada.
                    </p>
                    {videoCoverPreview ? (
                      <div className="rounded-xl border border-gray-200 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={videoCoverPreview} alt="" className="max-h-32 w-full rounded object-contain" />
                        <div className="mt-2 flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => coverInputRef.current?.click()}>
                            Cambiar portada
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={handleRemoveVideoCover}>
                            Quitar (usar fotograma)
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-dashed"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Subir imagen de portada (opcional)
                      </Button>
                    )}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleVideoCoverSelect}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Descripción (opcional)</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full rounded-xl border-2 border-rolex/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rolex"
                      rows={3}
                      placeholder="Añade un texto a tu publicación…"
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={submitDisabled}
                className="w-full py-6 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: 'var(--rolex)' }}
              >
                <Music className="mr-2 h-4 w-4" />
                {loading ? 'Publicando…' : contentType === 'video' ? 'Publicar video' : 'Publicar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
