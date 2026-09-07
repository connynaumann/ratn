import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { leseAnmeldeFehler, raeumeAdresseAuf } from '@/lib/auth'
import type { AnmeldeFehler } from '@/lib/auth'
import { AuthContext } from './AuthContext'

/**
 * Hält die Anmeldung der Nutzerin.
 *
 * Beim Start liest supabase-js die Rückkehr vom Magic Link selbst aus der
 * Adresse (detectSessionInUrl). Kommt statt eines Codes ein Fehler zurück –
 * als Query- oder als Hash-Parameter –, wird er hier gelesen, gemerkt und die
 * Adresse aufgeräumt, damit ein Neuladen die Meldung nicht wiederholt.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [laedt, setLaedt] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [anmeldeFehler, setzeAnmeldeFehler] = useState<AnmeldeFehler | null>(
    () => leseAnmeldeFehler(window.location.href),
  )

  useEffect(() => {
    raeumeAdresseAuf()
  }, [])

  useEffect(() => {
    let aktiv = true

    supabase.auth.getSession().then(({ data }) => {
      if (!aktiv) return
      setSession(data.session)
      setLaedt(false)
    })

    const { data: abo } = supabase.auth.onAuthStateChange((ereignis, neue) => {
      if (!aktiv) return
      setSession(neue)
      setLaedt(false)
      if (ereignis === 'SIGNED_IN') setzeAnmeldeFehler(null)
      raeumeAdresseAuf()
    })

    return () => {
      aktiv = false
      abo.subscription.unsubscribe()
    }
  }, [])

  const wert = useMemo(
    () => ({ laedt, session, anmeldeFehler, setzeAnmeldeFehler }),
    [laedt, session, anmeldeFehler],
  )

  return <AuthContext.Provider value={wert}>{children}</AuthContext.Provider>
}
