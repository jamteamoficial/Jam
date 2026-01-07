// Mock data para todos los feeds

export interface MockPost {
  id: string
  usuario: string
  instrumento: string
  estilo: string
  ciudad: string
  texto: string
  avatar: string
  tipo?: string
  feedType?: 'general' | 'descubrir' | 'conectar' | 'aprender'
}

// Feed GENERAL - Todos los videos y publicaciones
export const GENERAL_POSTS: MockPost[] = [
  {
    id: 'g1',
    usuario: 'Sebamendez17',
    instrumento: 'Músico',
    estilo: 'Varios',
    ciudad: 'Santiago',
    texto: 'Mira mi nuevo video cover de "Entre Caníbales" 🎸',
    avatar: '🎵',
    tipo: 'video',
    feedType: 'general'
  },
  {
    id: 'g2',
    usuario: 'Carlos Rock',
    instrumento: 'Guitarrista',
    estilo: 'Rock',
    ciudad: 'Santiago',
    texto: 'Nuevo video tocando "Stairway to Heaven" en vivo 🎸',
    avatar: '🎸',
    tipo: 'video',
    feedType: 'general'
  },
  {
    id: 'g3',
    usuario: 'María Jazz',
    instrumento: 'Pianista',
    estilo: 'Jazz',
    ciudad: 'Providencia',
    texto: 'Comparto mi última composición de jazz en video 🎹',
    avatar: '🎹',
    tipo: 'video',
    feedType: 'general'
  },
  {
    id: 'g4',
    usuario: 'Diego Beats',
    instrumento: 'Productor',
    estilo: 'Electrónica',
    ciudad: 'Las Condes',
    texto: 'Video del proceso de producción de mi último track 🎧',
    avatar: '🎧',
    tipo: 'video',
    feedType: 'general'
  },
  {
    id: 'g5',
    usuario: 'Ana Funk',
    instrumento: 'Bajista',
    estilo: 'Funk',
    ciudad: 'Ñuñoa',
    texto: 'Video jamming con mi bajo, disfruten el groove! 🎸',
    avatar: '🎸',
    tipo: 'video',
    feedType: 'general'
  },
  {
    id: 'g6',
    usuario: 'Sofía Pop',
    instrumento: 'Cantante',
    estilo: 'Pop',
    ciudad: 'Viña del Mar',
    texto: 'Video acústico de mi nueva canción original 🎤',
    avatar: '🎤',
    tipo: 'video',
    feedType: 'general'
  }
]

// Feed DESCUBRIR - Descubrir bandas, artistas, DJs
export const DESCUBRIR_POSTS: MockPost[] = [
  {
    id: 'd1',
    usuario: 'The Rockers',
    instrumento: 'Banda',
    estilo: 'Rock',
    ciudad: 'Santiago',
    texto: 'Banda de rock alternativo buscando nuevos miembros. Tenemos material original y shows programados.',
    avatar: '🎸',
    tipo: 'banda',
    feedType: 'descubrir'
  },
  {
    id: 'd2',
    usuario: 'DJ Luna',
    instrumento: 'DJ',
    estilo: 'Electrónica',
    ciudad: 'Providencia',
    texto: 'DJ de música electrónica buscando colaboraciones. Especializado en house y techno.',
    avatar: '🎧',
    tipo: 'dj',
    feedType: 'descubrir'
  },
  {
    id: 'd3',
    usuario: 'Solo Artist',
    instrumento: 'Artista',
    estilo: 'Indie',
    ciudad: 'Las Condes',
    texto: 'Artista solista con estilo indie único. Busco productor para mi próximo EP.',
    avatar: '🎤',
    tipo: 'artista',
    feedType: 'descubrir'
  },
  {
    id: 'd4',
    usuario: 'Funk Squad',
    instrumento: 'Banda',
    estilo: 'Funk',
    ciudad: 'Ñuñoa',
    texto: 'Banda de funk establecida con shows confirmados. Buscamos trompetista para completar el sonido.',
    avatar: '🎸',
    tipo: 'banda',
    feedType: 'descubrir'
  },
  {
    id: 'd5',
    usuario: 'Jazz Collective',
    instrumento: 'Banda',
    estilo: 'Jazz',
    ciudad: 'Valparaíso',
    texto: 'Colectivo de jazz con material original. Tocamos en vivo regularmente en bares y eventos.',
    avatar: '🎹',
    tipo: 'banda',
    feedType: 'descubrir'
  },
  {
    id: 'd6',
    usuario: 'Metal Warriors',
    instrumento: 'Banda',
    estilo: 'Metal',
    ciudad: 'Santiago',
    texto: 'Banda de metal buscando vocalista y guitarrista. Tenemos demos grabados y material listo.',
    avatar: '🎸',
    tipo: 'banda',
    feedType: 'descubrir'
  }
]

// Feed CONECTAR - Covers, mezclas, colaboraciones
export const CONECTAR_POSTS: MockPost[] = [
  {
    id: 'c1',
    usuario: 'Roberto Blues',
    instrumento: 'Guitarrista',
    estilo: 'Blues',
    ciudad: 'Santiago',
    texto: 'Comparto mi cover de "Sweet Child O Mine". ¿Qué opinan?',
    avatar: '🎸',
    tipo: 'cover',
    feedType: 'conectar'
  },
  {
    id: 'c2',
    usuario: 'Cover Band',
    instrumento: 'Banda',
    estilo: 'Rock',
    ciudad: 'Providencia',
    texto: 'Nueva mezcla de nuestro cover de "Bohemian Rhapsody". Feedback bienvenido!',
    avatar: '🎤',
    tipo: 'cover',
    feedType: 'conectar'
  },
  {
    id: 'c3',
    usuario: 'DJ Mix Master',
    instrumento: 'DJ',
    estilo: 'Electrónica',
    ciudad: 'Las Condes',
    texto: 'Nueva mezcla de 30 minutos con los mejores tracks de house. Disfruten!',
    avatar: '🎧',
    tipo: 'mezcla',
    feedType: 'conectar'
  },
  {
    id: 'c4',
    usuario: 'Jam Session',
    instrumento: 'Organizador',
    estilo: 'Jazz',
    ciudad: 'Ñuñoa',
    texto: 'Video de nuestra última jam session. Todos los viernes en el bar La Nota.',
    avatar: '🥁',
    tipo: 'jam',
    feedType: 'conectar'
  },
  {
    id: 'c5',
    usuario: 'Cover Project',
    instrumento: 'Banda',
    estilo: 'Pop',
    ciudad: 'Valparaíso',
    texto: 'Cover acústico de "Shape of You". Versión propia con arreglos únicos.',
    avatar: '🎤',
    tipo: 'cover',
    feedType: 'conectar'
  },
  {
    id: 'c6',
    usuario: 'Producer Collab',
    instrumento: 'Productor',
    estilo: 'Hip-Hop',
    ciudad: 'Santiago',
    texto: 'Mezcla de beats para colaboración. Busco rapero o cantante interesado.',
    avatar: '🎧',
    tipo: 'colaboracion',
    feedType: 'conectar'
  }
]

// Feed APRENDER - Profesores enseñando
export const APRENDER_POSTS: MockPost[] = [
  {
    id: 'a1',
    usuario: 'Prof. María',
    instrumento: 'Pianista',
    estilo: 'Clásica',
    ciudad: 'Santiago',
    texto: 'Clases de piano para principiantes. Método personalizado y horarios flexibles. También enseño teoría musical.',
    avatar: '🎹',
    tipo: 'clase',
    feedType: 'aprender'
  },
  {
    id: 'a2',
    usuario: 'Guitar Master',
    instrumento: 'Guitarrista',
    estilo: 'Rock',
    ciudad: 'Providencia',
    texto: 'Enseño guitarra eléctrica y acústica. Todos los niveles. Aprende tus canciones favoritas y desarrolla técnica.',
    avatar: '🎸',
    tipo: 'clase',
    feedType: 'aprender'
  },
  {
    id: 'a3',
    usuario: 'Drum School',
    instrumento: 'Baterista',
    estilo: 'Rock',
    ciudad: 'Las Condes',
    texto: 'Clases de batería para todos los niveles. Enfoque en técnica, ritmo y groove. Estudio completamente equipado.',
    avatar: '🥁',
    tipo: 'clase',
    feedType: 'aprender'
  },
  {
    id: 'a4',
    usuario: 'Vocal Coach',
    instrumento: 'Cantante',
    estilo: 'Pop',
    ciudad: 'Ñuñoa',
    texto: 'Enseño canto y técnica vocal. Trabajamos respiración, proyección y estilo. Preparación para audiciones.',
    avatar: '🎤',
    tipo: 'clase',
    feedType: 'aprender'
  },
  {
    id: 'a5',
    usuario: 'Music Theory',
    instrumento: 'Profesor',
    estilo: 'Teoría',
    ciudad: 'Valparaíso',
    texto: 'Clases de teoría musical y composición. Aprende armonía, escalas y cómo escribir tus propias canciones.',
    avatar: '📚',
    tipo: 'clase',
    feedType: 'aprender'
  },
  {
    id: 'a6',
    usuario: 'Bass Teacher',
    instrumento: 'Bajista',
    estilo: 'Funk',
    ciudad: 'Santiago',
    texto: 'Enseño bajo eléctrico con enfoque en groove y técnica. Todos los niveles, desde principiantes hasta avanzados.',
    avatar: '🎸',
    tipo: 'clase',
    feedType: 'aprender'
  }
]


