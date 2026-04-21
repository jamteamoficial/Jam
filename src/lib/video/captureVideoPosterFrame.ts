/**
 * Extrae un fotograma del video (archivo local) como JPEG para usar como portada.
 */
export function captureVideoPosterFrame(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    const objectUrl = URL.createObjectURL(videoFile)
    video.src = objectUrl

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
      video.removeAttribute('src')
      video.load()
    }

    const fail = (err: Error) => {
      cleanup()
      reject(err)
    }

    video.onerror = () => fail(new Error('No se pudo leer el video para generar la portada'))

    video.onloadedmetadata = () => {
      try {
        const d = video.duration
        const t =
          Number.isFinite(d) && d > 0 ? Math.min(0.12, Math.max(0.02, d * 0.02)) : 0.08
        video.currentTime = t
      } catch {
        video.currentTime = 0.08
      }
    }

    video.onseeked = () => {
      try {
        const w = video.videoWidth
        const h = video.videoHeight
        if (!w || !h) {
          fail(new Error('Dimensiones de video inválidas'))
          return
        }
        const canvas = document.createElement('canvas')
        const maxW = 1280
        const scale = w > maxW ? maxW / w : 1
        canvas.width = Math.round(w * scale)
        canvas.height = Math.round(h * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          fail(new Error('Canvas no disponible'))
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            cleanup()
            if (blob) resolve(blob)
            else fail(new Error('No se pudo generar la imagen de portada'))
          },
          'image/jpeg',
          0.88
        )
      } catch (e) {
        fail(e instanceof Error ? e : new Error('Error al capturar fotograma'))
      }
    }
  })
}
