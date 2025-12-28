'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

interface PostProps {
  name: string
  username: string
  avatar: string
  content: string
  likes: number
  comments: number
  commentPreview?: string
  commenter?: string
  postId?: string
}

export default function Post({ name, username, avatar, content, likes: initialLikes, comments, commentPreview, commenter, postId }: PostProps) {
  const { user, isFollowing, followUser, unfollowUser } = useAuth()
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const following = isFollowing(username)
  const isOwnPost = user?.username === username

  useEffect(() => {
    if (postId) {
      const likedPosts = localStorage.getItem('likedPosts')
      if (likedPosts) {
        try {
          const likedList: string[] = JSON.parse(likedPosts)
          setLiked(likedList.includes(postId))
        } catch (error) {
          console.error('Error al leer likes:', error)
        }
      }
    }
  }, [postId])

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (following) {
      unfollowUser(username)
    } else {
      followUser(username)
    }
  }

  const handleLike = () => {
    if (!postId) {
      // Si no hay postId, solo incrementar localmente
      setLikes(likes + 1)
      return
    }

    const likedPosts = localStorage.getItem('likedPosts')
    let likedList: string[] = []
    
    if (likedPosts) {
      try {
        likedList = JSON.parse(likedPosts)
      } catch (error) {
        console.error('Error al leer likes:', error)
      }
    }

    if (liked) {
      setLiked(false)
      setLikes(likes - 1)
      const updatedLiked = likedList.filter(id => id !== postId)
      localStorage.setItem('likedPosts', JSON.stringify(updatedLiked))
    } else {
      setLiked(true)
      setLikes(likes + 1)
      if (!likedList.includes(postId)) {
        likedList.push(postId)
        localStorage.setItem('likedPosts', JSON.stringify(likedList))
      }
    }

    // Actualizar likes en el post
    const savedPosts = localStorage.getItem('posts')
    if (savedPosts) {
      try {
        const allPosts: any[] = JSON.parse(savedPosts)
        const postIndex = allPosts.findIndex((p: any) => p.id === postId)
        if (postIndex >= 0) {
          allPosts[postIndex].likes = liked ? likes - 1 : likes + 1
          localStorage.setItem('posts', JSON.stringify(allPosts))
        }
      } catch (error) {
        console.error('Error al actualizar likes:', error)
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <Link href={`/user/${username}`} className="flex items-start space-x-4 flex-1 hover:opacity-80 transition-opacity">
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full cursor-pointer" />
          <div>
            <h3 className="font-bold text-gray-900 cursor-pointer">{name}</h3>
            <p className="text-sm text-gray-500">@{username}</p>
          </div>
        </Link>
        {!isOwnPost && (
          <button
            onClick={handleFollow}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              following
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {following ? 'Siguiendo' : '+'}
          </button>
        )}
      </div>
      <p className="text-lg mb-6">{content}</p>
      <div className="flex space-x-6 text-gray-500 mb-4">
        <button 
          onClick={handleLike}
          className={`font-bold transition-colors cursor-pointer ${
            liked ? 'text-red-500' : 'hover:text-red-500'
          }`}
        >
          {liked ? '❤️' : '🤍'} {likes}
        </button>
        <Link
          href={postId ? `/post/${postId}` : '#'}
          className="hover:text-blue-500 font-bold transition-colors cursor-pointer"
        >
          💬 {comments}
        </Link>
        <button className="hover:text-gray-700 transition-colors cursor-pointer">🔗 Compartir</button>
      </div>
      
      {showComments && commentPreview && (
        <div className="ml-16 mt-4 space-y-2">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&round=1" className="w-8 h-8 rounded-full mt-1" />
            <div>
              <p className="font-semibold text-sm">{commenter}</p>
              <p className="text-sm">{commentPreview}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
