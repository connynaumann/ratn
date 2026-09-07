import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { AnmeldeFehler } from '@/lib/auth'

export type AuthZustand = {
  /** true, solange die gespeicherte Sitzung geprüft wird */
  laedt: boolean
  session: Session | null
  /** Fehler aus dem Rücksprung des Magic Links (E-05, E-04, E-12) */
  anmeldeFehler: AnmeldeFehler | null
  setzeAnmeldeFehler: (fehler: AnmeldeFehler | null) => void
}

export const AuthContext = createContext<AuthZustand | null>(null)
