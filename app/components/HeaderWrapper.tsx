'use client'

import { Suspense, useState, useEffect } from 'react'
import Header from './Header'
import ProfilePanel from './ProfilePanel'
import CreateModal from './CreateModal'
import LoginModal from './LoginModal'

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
      <Suspense fallback={null}>
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


