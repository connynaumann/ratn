import { useEffect } from 'react'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/useAuth'
import { LoginScreen } from '@/features/auth/LoginScreen'
import { AppShell } from '@/features/shell/AppShell'
import { StoreProvider } from '@/store/StoreProvider'
import { LadeZustand } from '@/features/shell/LadeZustand'
import { ComponentsShowcase } from '@/dev/ComponentsShowcase'
import { SeedPage } from '@/dev/SeedPage'
import { ersetzePfad, ROUTEN, usePfad } from '@/router'

/**
 * Weiche zwischen den vier Adressen.
 *
 * Ohne Anmeldung ist ausschließlich S-01 erreichbar – auch die Dev-Routen
 * liegen hinter dem Login (Brief D-13).
 */
function Routen() {
  const { laedt, session } = useAuth()
  const pfad = usePfad()
  const angemeldet = session != null

  useEffect(() => {
    if (laedt) return
    if (!angemeldet && pfad !== ROUTEN.login) {
      ersetzePfad(ROUTEN.login)
    } else if (angemeldet && pfad === ROUTEN.login) {
      ersetzePfad(ROUTEN.app)
    }
  }, [laedt, angemeldet, pfad])

  if (laedt) return <LadeZustand />
  if (!angemeldet) return <LoginScreen />

  // Der Store lädt beim Einhängen alle Tabellen; die Dev-Seiten brauchen ihn
  // nicht und sollen ihn auch nicht anstoßen.
  switch (pfad) {
    case ROUTEN.devComponents:
      return <ComponentsShowcase />
    case ROUTEN.devSeed:
      return <SeedPage />
    default:
      return (
        <StoreProvider>
          <AppShell />
        </StoreProvider>
      )
  }
}

export function App() {
  return (
    <AuthProvider>
      <Routen />
    </AuthProvider>
  )
}
