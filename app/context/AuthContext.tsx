'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ProfileData {
  nombreCompleto: string
  comuna: string
  ciudad: string
  pais: string
  edad: string
  nivelMusical: string
  instrumentos: string
  canta: boolean
  descripcion: string
  rol: string
}

interface User {
  email: string
  username: string
  nombreCompleto: string
  profile?: ProfileData
}

export interface UserProfile {
  username: string
  name: string
  avatar: string
  bio?: string
  profileData?: ProfileData
  followers?: number
  following?: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: RegisterData) => Promise<boolean>
  updateProfile: (profileData: ProfileData) => void
  followUser: (username: string) => void
  unfollowUser: (username: string) => void
  isFollowing: (username: string) => boolean
  getUserProfile: (username: string) => UserProfile | null
}

interface RegisterData {
  nombreCompleto: string
  username: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user')
      const savedAuth = localStorage.getItem('isAuthenticated')
      
      if (savedUser && savedAuth === 'true') {
        try {
          setUser(JSON.parse(savedUser))
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Error al cargar sesión:', error)
          localStorage.removeItem('user')
          localStorage.removeItem('isAuthenticated')
        }
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulación de autenticación
    // En producción, esto haría una llamada a tu API
    
    // Buscar si existe un usuario registrado con este email
    const registeredUsers = localStorage.getItem('registeredUsers')
    let userData: User | null = null

    if (registeredUsers) {
      try {
        const users: User[] = JSON.parse(registeredUsers)
        const foundUser = users.find(u => u.email === email)
        if (foundUser) {
          userData = foundUser
        }
      } catch (error) {
        console.error('Error al leer usuarios registrados:', error)
      }
    }

    // Si no se encontró un usuario registrado, crear uno temporal desde el email
    if (!userData) {
      userData = {
        email,
        username: email.split('@')[0], // Username basado en email como fallback
        nombreCompleto: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
    }

    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')
    
    setUser(userData)
    setIsAuthenticated(true)
    
    return true
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Simulación de registro
    // En producción, esto haría una llamada a tu API
    
    const newUser: User = {
      email: userData.email,
      username: userData.username,
      nombreCompleto: userData.nombreCompleto
    }

    // Guardar en la lista de usuarios registrados
    const registeredUsers = localStorage.getItem('registeredUsers')
    let users: User[] = []
    
    if (registeredUsers) {
      try {
        users = JSON.parse(registeredUsers)
      } catch (error) {
        console.error('Error al leer usuarios registrados:', error)
        users = []
      }
    }

    // Verificar si el email ya existe
    const existingUserIndex = users.findIndex(u => u.email === userData.email)
    if (existingUserIndex >= 0) {
      // Actualizar usuario existente
      users[existingUserIndex] = newUser
    } else {
      // Agregar nuevo usuario
      users.push(newUser)
    }

    localStorage.setItem('registeredUsers', JSON.stringify(users))

    // Guardar sesión actual
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('isAuthenticated', 'true')
    
    setUser(newUser)
    setIsAuthenticated(true)
    
    return true
  }

  const updateProfile = (profileData: ProfileData) => {
    if (!user) return

    const updatedUser: User = {
      ...user,
      nombreCompleto: profileData.nombreCompleto,
      profile: profileData
    }

    // Actualizar en localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    // Actualizar en la lista de usuarios registrados
    const registeredUsers = localStorage.getItem('registeredUsers')
    if (registeredUsers) {
      try {
        const users: User[] = JSON.parse(registeredUsers)
        const userIndex = users.findIndex(u => u.email === user.email)
        if (userIndex >= 0) {
          users[userIndex] = updatedUser
          localStorage.setItem('registeredUsers', JSON.stringify(users))
        }
      } catch (error) {
        console.error('Error al actualizar perfil en usuarios registrados:', error)
      }
    }

    setUser(updatedUser)
  }

  const followUser = (username: string) => {
    if (typeof window === 'undefined') return
    
    const followingList = localStorage.getItem('followingList')
    let following: string[] = []
    
    if (followingList) {
      try {
        following = JSON.parse(followingList)
      } catch (error) {
        console.error('Error al leer lista de seguidos:', error)
      }
    }
    
    if (!following.includes(username)) {
      following.push(username)
      localStorage.setItem('followingList', JSON.stringify(following))
    }
  }

  const unfollowUser = (username: string) => {
    if (typeof window === 'undefined') return
    
    const followingList = localStorage.getItem('followingList')
    if (!followingList) return
    
    try {
      const following: string[] = JSON.parse(followingList)
      const updatedFollowing = following.filter(u => u !== username)
      localStorage.setItem('followingList', JSON.stringify(updatedFollowing))
    } catch (error) {
      console.error('Error al dejar de seguir:', error)
    }
  }

  const isFollowing = (username: string): boolean => {
    if (typeof window === 'undefined') return false
    
    const followingList = localStorage.getItem('followingList')
    if (!followingList) return false
    
    try {
      const following: string[] = JSON.parse(followingList)
      return following.includes(username)
    } catch (error) {
      return false
    }
  }

  const getUserProfile = (username: string): UserProfile | null => {
    if (typeof window === 'undefined') return null
    
    let avatarFromPost = ''
    let nameFromPost = ''
    
    // Primero buscar en posts para obtener avatar y nombre
    const posts = localStorage.getItem('posts')
    if (posts) {
      try {
        const allPosts: any[] = JSON.parse(posts)
        const userPost = allPosts.find((p: any) => p.username === username)
        if (userPost) {
          avatarFromPost = userPost.avatar || ''
          nameFromPost = userPost.name || ''
        }
      } catch (error) {
        console.error('Error al buscar en posts:', error)
      }
    }
    
    // Buscar en usuarios registrados
    const registeredUsers = localStorage.getItem('registeredUsers')
    if (registeredUsers) {
      try {
        const users: User[] = JSON.parse(registeredUsers)
        const foundUser = users.find(u => u.username === username)
        if (foundUser) {
          return {
            username: foundUser.username,
            name: foundUser.nombreCompleto,
            avatar: avatarFromPost || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
            bio: foundUser.profile?.descripcion,
            profileData: foundUser.profile,
            followers: 0,
            following: 0
          }
        }
      } catch (error) {
        console.error('Error al buscar perfil:', error)
      }
    }
    
    // Si no se encuentra en usuarios registrados pero hay post, crear perfil básico
    if (avatarFromPost || nameFromPost) {
      return {
        username: username,
        name: nameFromPost || username,
        avatar: avatarFromPost || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        bio: undefined,
        profileData: undefined,
        followers: 0,
        following: 0
      }
    }
    
    return null
  }

  const logout = () => {
    // Limpiar likes del usuario al cerrar sesión (solo el estado de "me gusta", no el contador global)
    if (user) {
      const userId = user.email || user.username || 'default'
      localStorage.removeItem(`likedPosts_${userId}`)
    }
    
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    setUser(null)
    setIsAuthenticated(false)
    
    // Forzar recarga de la página para actualizar los likes
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      register, 
      updateProfile,
      followUser,
      unfollowUser,
      isFollowing,
      getUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

