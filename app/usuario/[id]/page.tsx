'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Heart,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Pencil,
  Play,
  Radio,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import PostActions from '@/app/components/PostActions'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/src/lib/hooks/use-toast'
import { createClient } from '@/src/lib/supabase/client'
import { getDisplayName, getHandle, getInitials } from '@/src/lib/userDisplay'
import { mapFeedPostRowToDisplayPost } from '@/src/lib/mapFeedPost'
import type { FeedDisplayPost } from '@/src/lib/feedDisplayPost'
import { countFollowers, countFollowing, POSTS_FEED_SELECT, toggleFollow } from '@/src/lib/services/jam-social'
import { createNotification } from '@/src/lib/services/notifications'
import JamLoadingPlaceholder from '@/app/components/JamLoadingPlaceholder'

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

interface UserProfile {
  id: string
  nombre: string
  nombreArtistico: string
  username?: string
  avatar: string
  instrumento: string
  estilo: string
  ciudad: string
  bio: string
  seguidores: number
  seguidos: number
  nivelMusical: string
  instrumentos: string[]
  estilos: string[]
  influencias?: string[]
  estadoDisponibilidad?: string
  contactoWhatsapp?: string
  contactoInstagram?: string
}

function mapProfileRow(row: Record<string, unknown>): UserProfile {
  const instrumentos = Array.isArray(row.instrumentos) ? (row.instrumentos as string[]) : []
  const email = (row.email as string) || ''
  const username = (row.username as string) || email.split('@')[0] || 'usuario'
  const fullName = (row.full_name as string)?.trim()
  const displayArtistic = getDisplayName(fullName, username)
  const avatarRaw = (row.avatar_url as string) || ''

  return {
    id: row.id as string,
    nombre: fullName || displayArtistic,
    nombreArtistico: displayArtistic,
    username,
    avatar: avatarRaw,
    instrumento: instrumentos[0] || 'Músico',
    estilo: instrumentos[1] || 'Varios',
    ciudad: (row.ciudad as string)?.trim() ? String(row.ciudad).trim() : '—',
    bio: (row.bio as string) || 'Sin descripción aún.',
    seguidores: 0,
    seguidos: 0,
    nivelMusical: '—',
    instrumentos: instrumentos.length > 0 ? instrumentos : ['—'],
    estilos: [],
  }
}

export default function UsuarioProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const rawId = String(params.id ?? '')
  const uuid = useMemo(() => isUuid(rawId), [rawId])

  const [mounted, setMounted] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<FeedDisplayPost[]>([])
  const [totalLikes, setTotalLikes] = useState(0)

  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [editForm, setEditForm] = useState({ fullName: '', username: '', bio: '', instrumentos: '' })

  const isOwnProfile = Boolean(user?.id && profile && user.id === profile.id)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setProfileLoading(true)
      setProfile(null)

      const supabase = createClient()
      const { data: profileRow, error } = uuid
        ? await supabase.from('profiles').select('*').eq('id', rawId).maybeSingle()
        : await supabase.from('profiles').select('*').ilike('username', rawId).maybeSingle()

      if (cancelled) return

      if (error || !profileRow) {
        setProfile(null)
        setProfileLoading(false)
        return
      }

      const mapped = mapProfileRow(profileRow as Record<string, unknown>)

      const [{ count: followers }, { count: following }] = await Promise.all([
        countFollowers(supabase, mapped.id),
        countFollowing(supabase, mapped.id),
      ])

      mapped.seguidores = followers
      mapped.seguidos = following

      if (user?.id) {
        const { data: rel } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', user.id)
          .eq('following_id', mapped.id)
          .maybeSingle()
        if (!cancelled) setFollowing(Boolean(rel))
      } else if (!cancelled) {
        setFollowing(false)
      }

      if (!cancelled) {
        setProfile(mapped)
        setProfileLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [rawId, uuid, user?.id])

  useEffect(() => {
    let cancelled = false

    const loadPosts = async () => {
      if (!profile?.id) {
        setPosts([])
        setTotalLikes(0)
        setPostsLoading(false)
        return
      }

      setPostsLoading(true)
      const supabase = createClient()

      const { data: postRows, error: postsError } = await supabase
        .from('posts')
        .select(POSTS_FEED_SELECT)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (postsError || !postRows) {
        setPosts([])
        setTotalLikes(0)
        setPostsLoading(false)
        return
      }

      const mappedPosts = (postRows as any[]).map((row) => mapFeedPostRowToDisplayPost(row, 'general'))
      const likeTotal = mappedPosts.reduce((sum, p) => sum + (typeof p.likeCount === 'number' ? p.likeCount : 0), 0)

      setPosts(mappedPosts)
      setTotalLikes(likeTotal)
      setPostsLoading(false)
    }

    void loadPosts()
    return () => {
      cancelled = true
    }
  }, [profile?.id])

  const handleFollow = async () => {
    if (followLoading) return
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas iniciar sesión para seguir a alguien',
        variant: 'destructive',
      })
      return
    }
    if (!profile) return

    const supabase = createClient()
    setFollowLoading(true)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser?.id) {
      setFollowLoading(false)
      toast({
        title: 'Sesión',
        description: 'Inicia sesión para seguir perfiles.',
        variant: 'destructive',
      })
      return
    }

    const { following: nowFollowing, error } = await toggleFollow(supabase, profile.id)
    if (error) {
      setFollowLoading(false)
      toast({
        title: 'No se pudo actualizar',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    setFollowing(nowFollowing)

    const { count: followers } = await countFollowers(supabase, profile.id)
    setProfile((prev) => (prev ? { ...prev, seguidores: followers } : prev))

    if (nowFollowing) {
      const actorName = getDisplayName(user?.nombreCompleto, user?.username ?? 'usuario')
      const { error: notifyErr } = await createNotification(supabase, {
        userId: profile.id,
        actorId: authUser.id,
        type: 'follow',
        title: 'Nuevo seguidor',
        body: `${actorName} empezó a seguirte.`,
      })
      if (!notifyErr && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications-updated'))
      }
    }
    setFollowLoading(false)
  }

  const handleProfileJam = () => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas iniciar sesión para enviar un JAM',
        variant: 'destructive',
      })
      return
    }
    window.dispatchEvent(new CustomEvent('showJamAnimation'))
    toast({
      title: '¡JAM enviado!',
      description: `Tu solicitud fue enviada a ${profile?.nombreArtistico ?? 'este músico'}`,
    })
  }

  const handleOpenMessage = () => {
    if (!profile?.id) return
    if (!user?.id) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas una cuenta para enviar mensajes.',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }

    router.push(`/chat/${profile.id}`)
  }

  const handleJam = (postId: string, usuario: string) => {
    void postId
    void usuario
    handleProfileJam()
  }

  const openEditModal = () => {
    if (!profile) return
    setEditForm({
      fullName: profile.nombre || '',
      username: profile.username || '',
      bio: profile.bio || '',
      instrumentos: profile.instrumentos.filter((i) => i !== '—').join(', '),
    })
    setEditOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!profile || !user?.id || user.id !== profile.id) return

    const fullName = editForm.fullName.trim()
    const username = editForm.username.trim().toLowerCase().replace(/\s+/g, '')
    const bio = editForm.bio.trim()
    const instrumentos = editForm.instrumentos
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean)

    if (!username) {
      toast({
        title: 'Username requerido',
        description: 'El username no puede estar vacío.',
        variant: 'destructive',
      })
      return
    }

    const supabase = createClient()
    setSavingProfile(true)

    const { data: usernameUsed, error: usernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', profile.id)
      .maybeSingle()

    if (usernameError) {
      setSavingProfile(false)
      toast({
        title: 'No se pudo validar username',
        description: usernameError.message,
        variant: 'destructive',
      })
      return
    }

    if (usernameUsed) {
      setSavingProfile(false)
      toast({
        title: 'Username no disponible',
        description: 'Elige otro username, este ya está en uso.',
        variant: 'destructive',
      })
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        username,
        bio: bio || null,
        instrumentos,
      })
      .eq('id', profile.id)

    setSavingProfile(false)

    if (updateError) {
      toast({
        title: 'No se pudo actualizar el perfil',
        description: updateError.message,
        variant: 'destructive',
      })
      return
    }

    setProfile((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        nombre: fullName || getDisplayName(fullName, username),
        nombreArtistico: getDisplayName(fullName, username),
        username,
        bio: bio || 'Sin descripción aún.',
        instrumentos: instrumentos.length > 0 ? instrumentos : ['—'],
        instrumento: instrumentos[0] || prev.instrumento,
      }
    })
    setEditOpen(false)
    toast({
      title: 'Perfil actualizado',
      description: 'Tus cambios se guardaron correctamente.',
    })
  }

  if (!mounted || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <JamLoadingPlaceholder />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Usuario no encontrado</h2>
          <Button onClick={() => router.push('/')} className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--rolex)' }}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="sticky top-16 z-40 border-b-2 border-rolex/30 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 hover:opacity-80"
              style={{ color: 'var(--rolex)' }}
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 rounded-2xl border-2 border-rolex/30 bg-white p-8 shadow-lg">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-rolex text-6xl">
                {/^https?:\/\//i.test(profile.avatar) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {getInitials(getDisplayName(profile.nombre, profile.username || profile.nombreArtistico))}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h1 className="mb-1 text-4xl font-bold text-gray-900">
                  {getDisplayName(profile.nombre, profile.username || profile.nombreArtistico)}
                </h1>
                <p className="mb-2 text-sm text-gray-500">{getHandle(profile.username || profile.nombreArtistico)}</p>
                <p className="mb-2 text-xl font-semibold text-rolex">{profile.instrumento}</p>

                <div className="mb-4 flex flex-wrap items-center gap-2 text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.ciudad}
                  </span>
                  <span className="mx-2 hidden sm:inline">•</span>
                  <span className="text-sm font-semibold text-rolex">{profile.nivelMusical}</span>
                  <span className="mx-2 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                    <Heart className="h-3.5 w-3.5" />
                    {totalLikes} Me gusta
                  </span>
                </div>

                <p className="mb-4 text-gray-700">{profile.bio}</p>

                {profile.estadoDisponibilidad ? (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-rolex/25 bg-emerald-50/80 px-4 py-3">
                    <Radio className="mt-0.5 h-5 w-5 shrink-0 text-[var(--rolex)]" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-900/70">Estado</p>
                      <p className="font-semibold text-emerald-950">{profile.estadoDisponibilidad}</p>
                    </div>
                  </div>
                ) : null}

                {profile.influencias && profile.influencias.length > 0 ? (
                  <div className="mb-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Sparkles className="h-4 w-4 text-[var(--rolex)]" />
                      Influencias musicales
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.influencias.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-rolex/30 bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!isOwnProfile ? (
                  <div className="mb-4 flex w-full max-w-md gap-3">
                    <Button
                      onClick={() => void handleFollow()}
                      disabled={followLoading}
                      variant={following ? 'outline' : 'default'}
                      className={`h-11 flex-1 border-2 font-semibold transition ${
                        following
                          ? 'hover:opacity-90'
                          : 'text-white shadow-md shadow-rolex/25 hover:opacity-90'
                      }`}
                      style={following ? { borderColor: 'var(--rolex)', color: 'var(--rolex)' } : { backgroundColor: 'var(--rolex)' }}
                    >
                      {followLoading ? 'Guardando…' : following ? 'Siguiendo' : 'Seguir'}
                    </Button>
                    <Button
                      onClick={handleOpenMessage}
                      variant="outline"
                      className="h-11 flex-1 border-2 font-semibold hover:bg-rolex/5"
                      style={{ borderColor: 'var(--rolex)', color: 'var(--rolex)' }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Mensaje
                    </Button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <Button
                      onClick={openEditModal}
                      variant="outline"
                      className="border-2 font-semibold hover:opacity-90"
                      style={{ borderColor: 'var(--rolex)', color: 'var(--rolex)' }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Button>
                  </div>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                  {profile.instrumentos.map((inst, idx) => (
                    <span key={idx} className="rounded-full bg-rolex/20 px-3 py-1 text-sm font-semibold text-rolex">
                      {inst}
                    </span>
                  ))}
                  {profile.estilos.map((estilo, idx) => (
                    <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                      {estilo}
                    </span>
                  ))}
                </div>

                {(profile.contactoWhatsapp || profile.contactoInstagram) && (
                  <div className="flex gap-3">
                    {profile.contactoWhatsapp ? (
                      <a
                        href={`https://wa.me/${profile.contactoWhatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                      >
                        <Mail className="h-4 w-4" />
                        WhatsApp
                      </a>
                    ) : null}
                    {profile.contactoInstagram ? (
                      <a
                        href={`https://instagram.com/${profile.contactoInstagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rolex to-rolex-light px-4 py-2 text-white transition-opacity hover:opacity-90"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-rolex/30 pt-6">
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2 text-gray-600">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-gray-900">{totalLikes}</span>
                </div>
                <p className="text-sm text-gray-600">Me gusta</p>
              </div>
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2 text-gray-600">
                  <Music className="h-5 w-5 text-rolex" />
                  <span className="text-2xl font-bold text-gray-900">{posts.length}</span>
                </div>
                <p className="text-sm text-gray-600">Publicaciones</p>
              </div>
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2 text-gray-600">
                  <Users className="h-5 w-5 text-rolex" />
                  <span className="text-2xl font-bold text-gray-900">{profile.seguidores}</span>
                </div>
                <p className="text-sm text-gray-600">Seguidores</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Music className="h-6 w-6 text-rolex" />
              Portafolio
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Videos y publicaciones de {getDisplayName(profile.nombre, profile.username || profile.nombreArtistico)}
            </p>

            {postsLoading ? (
              <div className="rounded-2xl border border-rolex/15 bg-white/70 p-6">
                <JamLoadingPlaceholder className="min-h-[12rem] py-8" />
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-rolex/25 bg-white/70 p-12 text-center">
                <p className="text-sm text-gray-600">Aún no hay publicaciones</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="flex flex-col overflow-hidden rounded-2xl border-2 border-rolex/20 bg-white shadow-md transition hover:border-rolex/40 hover:shadow-lg"
                  >
                    <Link href={`/post/${post.id}`} className="relative block aspect-video bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
                      {post.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      ) : post.video_url ? (
                        <div className="flex h-full w-full items-center justify-center bg-black/40">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[var(--rolex)] shadow-lg">
                            <Play className="ml-1 h-7 w-7 fill-current" />
                          </span>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-500">
                          {post.texto?.slice(0, 80)}
                          {post.texto && post.texto.length > 80 ? '…' : ''}
                        </div>
                      )}
                      {post.video_url ? (
                        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Video
                        </span>
                      ) : null}
                    </Link>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="line-clamp-2 text-sm text-gray-800">{post.texto}</p>
                      <div className="mt-4 space-y-2">
                        <PostActions
                          postId={post.id}
                          usuario={post.usuario}
                          postOwnerId={profile.id}
                          ownerFullName={post.full_name ?? null}
                          ownerUsername={post.username ?? null}
                          initialLikeCount={typeof post.likeCount === 'number' ? post.likeCount : undefined}
                        />
                        <Button
                          onClick={() => handleJam(post.id, post.usuario)}
                          className="w-full font-bold text-white hover:opacity-90"
                          style={{ backgroundColor: 'var(--rolex)' }}
                        >
                          <Music className="mr-2 h-4 w-4" />
                          JAM
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-rolex/20 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Editar Perfil</h3>
              <button type="button" className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100" onClick={() => setEditOpen(false)} aria-label="Cerrar modal">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Nombre visible</label>
                <input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Ej: Seba Mendez"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rolex"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Username</label>
                <input
                  value={editForm.username}
                  onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="seba"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rolex"
                />
                <p className="mt-1 text-xs text-gray-500">Se validará si está disponible.</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rolex"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Instrumentos (separados por coma)</label>
                <input
                  value={editForm.instrumentos}
                  onChange={(e) => setEditForm((p) => ({ ...p, instrumentos: e.target.value }))}
                  placeholder="Guitarra, Voz"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rolex"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingProfile}>
                Cancelar
              </Button>
              <Button onClick={() => void handleSaveProfile()} disabled={savingProfile} className="text-white" style={{ backgroundColor: 'var(--rolex)' }}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
