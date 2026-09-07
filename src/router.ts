import { useCallback, useEffect, useSyncExternalStore } from 'react'

/**
 * Kleiner eigener Router statt react-router (Brief A-52).
 *
 * Die App hat vier Adressen. Alles, was ein Router hier leisten muss, sind
 * Pfadwechsel ohne Neuladen und ein Horchen auf die Zurück-Taste.
 *
 * Wichtig für die Rückkehr vom Magic Link: geroutet wird ausschließlich über
 * `pathname`. Query- und Hash-Parameter (?code=…, #error=…) bleiben unberührt,
 * damit supabase-js sie auswerten kann; aufgeräumt werden sie danach von
 * raeumeAdresseAuf() in src/lib/auth.ts.
 */

export const ROUTEN = {
  login: '/login',
  app: '/',
  devComponents: '/dev/components',
  devSeed: '/dev/seed',
} as const

export type Route = (typeof ROUTEN)[keyof typeof ROUTEN]

const horcher = new Set<() => void>()

function melde(): void {
  for (const h of horcher) h()
}

function abonniere(rueckruf: () => void): () => void {
  horcher.add(rueckruf)
  window.addEventListener('popstate', rueckruf)
  return () => {
    horcher.delete(rueckruf)
    window.removeEventListener('popstate', rueckruf)
  }
}

function lesePfad(): string {
  return normalisiere(window.location.pathname)
}

/** Schlusstrich entfernen, damit /dev/seed/ und /dev/seed gleich sind. */
function normalisiere(pfad: string): string {
  if (pfad.length > 1 && pfad.endsWith('/')) return pfad.slice(0, -1)
  return pfad === '' ? '/' : pfad
}

/** Aktueller Pfad; löst ein Rendern aus, wenn er sich ändert. */
export function usePfad(): string {
  return useSyncExternalStore(abonniere, lesePfad, () => '/')
}

/** Wechselt den Pfad ohne Neuladen. Query und Hash werden verworfen. */
export function navigiere(ziel: string): void {
  const pfad = normalisiere(ziel)
  if (pfad === lesePfad()) return
  window.history.pushState({}, '', pfad)
  melde()
}

/** Ersetzt den Pfad, ohne einen Eintrag in der Verlaufsliste anzulegen. */
export function ersetzePfad(ziel: string): void {
  const pfad = normalisiere(ziel)
  window.history.replaceState({}, '', pfad)
  melde()
}

/**
 * Leitet auf `ziel` um, solange `wenn` zutrifft. Wird für die Anmeldesperre
 * der Dev-Routen und die Weiche zwischen /login und / gebraucht.
 */
export function useUmleitung(wenn: boolean, ziel: string): void {
  useEffect(() => {
    if (wenn) ersetzePfad(ziel)
  }, [wenn, ziel])
}

/** Klickbarer Verweis innerhalb der App. */
export function useNavigation(): (ziel: string) => void {
  return useCallback((ziel: string) => navigiere(ziel), [])
}
