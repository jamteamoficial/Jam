'use client'

import { Suspense, useState, useEffect } from 'react'
import Header from './Header'
import ProfilePanel from './ProfilePanel'
import CreateModal from './CreateModal'
import LoginModal from './LoginModal'
import JamLoadingPlaceholder from './JamLoadingPlaceholder'

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const [showProfile, setShowProfile] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const handleOpenCreateModal = () => {
      setShowCreate(true)
    }

    window.addEventListener('openCreateModal', handleOpenCreateModal)
    return () => {
      window.removeEventListener('openCreateModal', handleOpenCreateModal)
    }
  }, [])

  return (
    <>
      <Suspense
        fallback={
          <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-center border-b-2 border-rolex/30 bg-white shadow-md">
            <JamLoadingPlaceholder className="min-h-0 py-2 text-xs sm:text-sm" />
          </header>
        }
      >
        <Header 
          onProfileClick={() => setShowProfile(true)}
          onLoginClick={() => setShowLogin(true)}
        />
      </Suspense>
      <main className="pt-16">
        {children}
      </main>
      <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <CreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}


