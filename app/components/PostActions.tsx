'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface PostActionsProps {
  postId: string
  usuario: string
}

export default function PostActions({ postId, usuario }: PostActionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cargar contador global de likes (siempre visible)
      const savedPostLikes = localStorage.getItem('postLikes_global')
      if (savedPostLikes) {
        try {
          const postLikes: { [key: string]: number } = JSON.parse(savedPostLikes)
          setLikeCount(postLikes[postId] || 0)
        } catch (error) {
          console.error('Error al cargar contadores:', error)
        }
      }
      
      // Solo cargar estado de "me gusta" si hay usuario en sesión
      if (user) {
        const userId = user.email || user.username || 'default'
        const savedLikes = localStorage.getItem(`likedPosts_${userId}`)
        
        if (savedLikes) {
          try {
            const liked: string[] = JSON.parse(savedLikes)
            setIsLiked(liked.includes(postId))
          } catch (error) {
            console.error('Error al cargar likes:', error)
          }
        }
      } else {
        // Si no hay usuario, resetear estado de "me gusta"
        setIsLiked(false)
      }
    }
  }, [postId, user])

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para dar like",
        variant: "destructive"
      })
      return
    }

    const userId = user.email || user.username || 'default'
    const newIsLiked = !isLiked
    const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1)
    
    setIsLiked(newIsLiked)
    setLikeCount(newLikeCount)

    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      // Guardar estado de "me gusta" del usuario
      const savedLikes = localStorage.getItem(`likedPosts_${userId}`)
      let liked: string[] = []
      
      if (savedLikes) {
        try {
          liked = JSON.parse(savedLikes)
        } catch (error) {
          console.error('Error al leer likes:', error)
        }
      }

      if (newIsLiked) {
        if (!liked.includes(postId)) {
          liked.push(postId)
        }
      } else {
        liked = liked.filter(id => id !== postId)
      }
      
      localStorage.setItem(`likedPosts_${userId}`, JSON.stringify(liked))
      
      // Guardar contador global de likes (suma de todos los usuarios)
      const savedPostLikes = localStorage.getItem('postLikes_global')
      let postLikes: { [key: string]: number } = {}
      
      if (savedPostLikes) {
        try {
          postLikes = JSON.parse(savedPostLikes)
        } catch (error) {
          console.error('Error al leer contadores globales:', error)
        }
      }
      
      postLikes[postId] = newLikeCount
      localStorage.setItem('postLikes_global', JSON.stringify(postLikes))
    }
  }

  const handleComment = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para comentar",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Comentarios",
      description: `Funcionalidad de comentarios próximamente para ${usuario}`,
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          isLiked
            ? 'bg-red-50 text-red-600 border-2 border-red-200'
            : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
        }`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        <span className="font-semibold">{likeCount}</span>
      </button>
      <button
        onClick={handleComment}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100 transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-semibold">Comentar</span>
      </button>
    </div>
  )
}

