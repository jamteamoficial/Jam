/**
 * Obtiene un ID de usuario persistente desde localStorage
 * Si no existe, genera uno nuevo y lo guarda
 */
export function getLocalUserId(): string {
  const STORAGE_KEY = 'jam_local_user_id'
  
  if (typeof window === 'undefined') {
    // Server-side: retornar un ID temporal
    return 'temp-user-' + Date.now()
  }

  let userId = localStorage.getItem(STORAGE_KEY)

  if (!userId) {
    // Generar un nuevo ID único
    userId = 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
    localStorage.setItem(STORAGE_KEY, userId)
  }

  return userId
}

