'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { User, USERS } from '@/lib/db'

interface AuthCtx {
  currentUser: User
  setCurrentUser: (user: User) => void
}

const AuthContext = createContext<AuthCtx>({
  currentUser: USERS[0], // Zunaira as default
  setCurrentUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0])
  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
