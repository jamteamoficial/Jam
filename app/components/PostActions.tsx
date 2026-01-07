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
      const savedLikes = localStorage.getItem('likedPosts')
      const savedPostLikes = localStorage.getItem('postLikes')
      
      if (savedLikes) {
        try {
          const liked: string[] = JSON.parse(savedLikes)
          setIsLiked(liked.includes(postId))
        } catch (error) {
          console.error('Error al cargar likes:', error)
        }
      }
      
      if (savedPostLikes) {
        try {
          const postLikes: { [key: string]: number } = JSON.parse(savedPostLikes)
          setLikeCount(postLikes[postId] || 0)
        } catch (error) {
          console.error('Error al cargar contadores:', error)
        }
      }
    }
  }, [postId])

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para dar like",
        variant: "destructive"
      })
      return
    }

    const newIsLiked = !isLiked
    const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1)
    
    setIsLiked(newIsLiked)
    setLikeCount(newLikeCount)

    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem('likedPosts')
      const savedPostLikes = localStorage.getItem('postLikes')
      
      let liked: string[] = []
      let postLikes: { [key: string]: number } = {}
      
      if (savedLikes) {
        try {
          liked = JSON.parse(savedLikes)
        } catch (error) {
          console.error('Error al leer likes:', error)
        }
      }
      
      if (savedPostLikes) {
        try {
          postLikes = JSON.parse(savedPostLikes)
        } catch (error) {
          console.error('Error al leer contadores:', error)
        }
      }

      if (newIsLiked) {
        liked.push(postId)
      } else {
        liked = liked.filter(id => id !== postId)
      }
      
      postLikes[postId] = newLikeCount
      
      localStorage.setItem('likedPosts', JSON.stringify(liked))
      localStorage.setItem('postLikes', JSON.stringify(postLikes))
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

