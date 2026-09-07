import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthZustand } from './AuthContext'

export function useAuth(): AuthZustand {
  const wert = useContext(AuthContext)
  if (wert == null) {
    throw new Error('useAuth muss innerhalb von <AuthProvider> stehen')
  }
  return wert
}
