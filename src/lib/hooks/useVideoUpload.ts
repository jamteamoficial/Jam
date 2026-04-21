'use client'

import { supabase } from '@/src/lib/supabase/client'

/** Bucket con lectura pública: `getPublicUrl` → URLs https sin JWT (Vercel / incógnito). */
const BUCKET = 'Videos JAM'

export async function uploadVideo(file: File, userId: string) {
  if (typeof window === 'undefined') return ''

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`

  const { data, error } = await supabase.storage.from(BUCKET).upload(`${userId}/${fileName}`, file, {
    contentType: file.type || 'video/mp4',
  })

  if (error) {
    console.error('Error en Supabase:', error.message)
    throw error
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path)

  return publicUrl
}

/** Imagen de post (texto + foto o portada opcional de video). */
export async function uploadPostImage(file: File, userId: string) {
  if (typeof window === 'undefined') return ''

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = /^jpe?g|png|webp|gif$/i.test(ext) ? ext : 'jpg'
  const fileName = `img-${Date.now()}-${crypto.randomUUID()}.${safeExt}`
  const path = `${userId}/thumbs/${fileName}`
  const contentType = file.type || (safeExt === 'png' ? 'image/png' : 'image/jpeg')

  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType })

  if (error) {
    console.error('Error subiendo imagen:', error.message)
    throw error
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path)

  return publicUrl
}

/** JPEG generado en cliente (p. ej. primer frame del video). */
export async function uploadPostImageBlob(blob: Blob, userId: string) {
  if (typeof window === 'undefined') return ''

  const fileName = `thumb-${Date.now()}-${crypto.randomUUID()}.jpg`
  const path = `${userId}/thumbs/${fileName}`

  const { data, error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
  })

  if (error) {
    console.error('Error subiendo miniatura:', error.message)
    throw error
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path)

  return publicUrl
}

