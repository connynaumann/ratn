import { supabase } from './supabase'
import { env } from './env'

/**
 * Anmeldung per Magic Link (US-01).
 *
 * Die Registrierung ist geschlossen. Die Datenbank setzt das durch (Trigger
 * enforce_allowed_email auf auth.users, Migration 0001); im Client prüfen wir
 * zusätzlich gegen VITE_ALLOWED_EMAIL, damit E-04 erscheint, *bevor* eine Mail
 * angefordert wird (Brief Abschnitt 6).
 */

/** Grobe Formprüfung: genau ein @, davor und danach etwas, kein Leerzeichen. */
export function istEmailForm(eingabe: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eingabe.trim())
}

/**
 * Ist die Adresse freigegeben? Vergleich ohne Rücksicht auf Groß- und
 * Kleinschreibung und umschließende Leerzeichen – so wie es der Trigger in der
 * Datenbank mit lower() ebenfalls tut.
 */
export function istFreigegebeneEmail(eingabe: string): boolean {
  const adresse = eingabe.trim().toLowerCase()
  if (adresse === '') return false
  if (!istEmailForm(adresse)) return false
  return adresse === env.allowedEmail.trim().toLowerCase()
}

export type MagicLinkErgebnis =
  | { ok: true }
  | { ok: false; grund: 'nicht-freigegeben' | 'versand-fehlgeschlagen' }

/**
 * Fordert einen Anmelde-Link an. Gibt bei nicht freigegebener Adresse
 * 'nicht-freigegeben' zurück, ohne Supabase zu kontaktieren (E-04: „kein
 * Versand“).
 */
export async function sendeMagicLink(
  eingabe: string,
): Promise<MagicLinkErgebnis> {
  if (!istFreigegebeneEmail(eingabe)) {
    return { ok: false, grund: 'nicht-freigegeben' }
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: eingabe.trim(),
    options: { emailRedirectTo: env.appUrl, shouldCreateUser: true },
  })
  if (error) return { ok: false, grund: 'versand-fehlgeschlagen' }
  return { ok: true }
}

/** Welcher Hinweis gehört zu einem Fehler, der beim Rücksprung ankommt? */
export type AnmeldeFehler = 'abgelaufen' | 'nicht-freigegeben' | 'allgemein'

/**
 * Supabase hängt Fehler beim Rücksprung an die Adresse – je nach Fall als
 * Query- oder als Hash-Parameter. Beides wird gelesen (Brief A-52).
 *
 * Bekannte Codes: otp_expired und access_denied stehen für einen abgelaufenen
 * oder bereits benutzten Link (E-05). Die Meldung des Datenbank-Triggers
 * enthält „nicht freigegeben“ (E-04).
 */
export function leseAnmeldeFehler(adresse: string): AnmeldeFehler | null {
  const url = new URL(adresse)
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
  const hole = (name: string) =>
    url.searchParams.get(name) ?? hash.get(name) ?? ''

  const code = hole('error_code')
  const fehler = hole('error')
  const beschreibung = hole('error_description')
  if (code === '' && fehler === '' && beschreibung === '') return null

  if (/nicht freigegeben/i.test(beschreibung)) return 'nicht-freigegeben'
  if (code === 'otp_expired' || fehler === 'access_denied') return 'abgelaufen'
  return 'allgemein'
}

/** Entfernt Auth-Parameter aus der Adresse, ohne die Seite neu zu laden. */
export function raeumeAdresseAuf(): void {
  const url = new URL(window.location.href)
  const namen = [
    'error',
    'error_code',
    'error_description',
    'code',
    'token_hash',
    'type',
  ]
  let veraendert = false
  for (const name of namen) {
    if (url.searchParams.has(name)) {
      url.searchParams.delete(name)
      veraendert = true
    }
  }
  if (url.hash !== '' && /access_token|error|type=/.test(url.hash)) {
    url.hash = ''
    veraendert = true
  }
  if (veraendert) {
    window.history.replaceState({}, '', url.pathname + url.search + url.hash)
  }
}

export async function meldeAb(): Promise<void> {
  await supabase.auth.signOut()
}
