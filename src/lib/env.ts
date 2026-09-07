/**
 * Die vier Umgebungsvariablen aus .env.example, typisiert und beim Start
 * geprüft. Fehlt eine, bricht die App sofort mit einer klaren Meldung ab –
 * besser als ein stiller Fehlschlag beim ersten Supabase-Aufruf. Geprüft wird
 * alles auf einmal, damit nicht bei jedem Start nur die nächste Lücke auftaucht.
 */

const PFLICHT = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_APP_URL',
  'VITE_ALLOWED_EMAIL',
] as const

type PflichtName = (typeof PFLICHT)[number]

function lies(): Record<PflichtName, string> {
  const werte = {} as Record<PflichtName, string>
  const fehlend: string[] = []
  for (const name of PFLICHT) {
    const wert = import.meta.env[name]
    if (typeof wert !== 'string' || wert.trim() === '') fehlend.push(name)
    else werte[name] = wert.trim()
  }
  if (fehlend.length > 0) {
    throw new Error(
      `Umgebungsvariable${fehlend.length > 1 ? 'n' : ''} ${fehlend.join(', ')} ` +
        `fehlt. Lege .env.local nach dem Muster von .env.example an und starte ` +
        `den Entwicklungsserver neu.`,
    )
  }
  return werte
}

const roh = lies()

export const env = {
  supabaseUrl: roh.VITE_SUPABASE_URL,
  supabasePublishableKey: roh.VITE_SUPABASE_PUBLISHABLE_KEY,
  appUrl: roh.VITE_APP_URL,
  allowedEmail: roh.VITE_ALLOWED_EMAIL,
} as const
