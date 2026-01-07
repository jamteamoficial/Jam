'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Users, GraduationCap } from 'lucide-react'

export default function FeedTabs() {
  const pathname = usePathname()
  
  const tabs = [
    { id: 'general', label: 'General', icon: Home, href: '/' },
    { id: 'descubrir', label: 'Descubrir', icon: Search, href: '/feed/descubrir' },
    { id: 'conectar', label: 'Conectar', icon: Users, href: '/feed/conectar' },
    { id: 'aprender', label: 'Aprender', icon: GraduationCap, href: '/feed/aprender' }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b-2 border-purple-200 shadow-sm">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.href)
            
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ${
                  active
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs font-semibold ${active ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}


