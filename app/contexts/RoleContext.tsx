'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type Role = 'Mahasiswa' | 'Dosen'

interface RoleCtx {
  role: Role
  setRole: (r: Role) => void
}

const RoleContext = createContext<RoleCtx>({ role: 'Mahasiswa', setRole: () => {} })

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Mahasiswa')
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export const useRole = () => useContext(RoleContext)
