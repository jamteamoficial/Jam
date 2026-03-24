import type { MockPost } from '@/app/data/mockPosts'

function matchesInstrument(post: MockPost, filter: string): boolean {
  if (filter === 'Todos') return true
  const a = post.instrumento.toLowerCase()
  const b = filter.toLowerCase()
  if (b === 'producción') return a.includes('productor') || a.includes('producción') || a.includes('dj')
  if (b === 'voces') return a.includes('cant') || a.includes('voz') || a.includes('vocal')
  if (b === 'batería') return a.includes('bater')
  if (b === 'guitarra') return a.includes('guitar')
  if (b === 'bajo') return a.includes('baj')
  if (b === 'piano') return a.includes('piano') || a.includes('teclad') || a.includes('pian')
  if (b === 'banda') return a.includes('banda')
  return a.includes(b) || b.includes(a)
}

function matchesEstado(post: MockPost, filter: string): boolean {
  if (filter === 'Todos') return true
  if (!post.estado) return true
  return post.estado === filter
}

function matchesCiudad(post: MockPost, ciudad: string): boolean {
  const q = ciudad.trim().toLowerCase()
  if (!q) return true
  return post.ciudad.toLowerCase().includes(q)
}

function matchesSearch(post: MockPost, search: string): boolean {
  const q = search.trim().toLowerCase()
  if (!q) return true
  return (
    post.usuario.toLowerCase().includes(q) ||
    post.texto.toLowerCase().includes(q) ||
    post.ciudad.toLowerCase().includes(q) ||
    post.instrumento.toLowerCase().includes(q) ||
    (post.estado?.toLowerCase().includes(q) ?? false)
  )
}

export function filterFeedPosts(
  posts: MockPost[],
  opts: {
    searchQuery: string
    instrument: string
    ciudad: string
    estado: string
  }
): MockPost[] {
  return posts.filter(
    (p) =>
      matchesSearch(p, opts.searchQuery) &&
      matchesInstrument(p, opts.instrument) &&
      matchesCiudad(p, opts.ciudad) &&
      matchesEstado(p, opts.estado)
  )
}
