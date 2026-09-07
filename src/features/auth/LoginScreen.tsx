import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Panel, PanelBody } from '@/components/ui'
import { E, TX, UI } from '@/content/texte'
import { sendeMagicLink } from '@/lib/auth'
import { useAuth } from './useAuth'

/**
 * S-01 Anmeldung (US-01).
 *
 * Die Adresse wird vor dem Absenden gegen VITE_ALLOWED_EMAIL geprüft: bei
 * einer fremden Adresse erscheint E-04 und es geht keine Anfrage an Supabase
 * („kein Versand“, Brief Abschnitt 10). Die Datenbank sperrt zusätzlich.
 */
export function LoginScreen() {
  const { anmeldeFehler, setzeAnmeldeFehler } = useAuth()
  const [email, setEmail] = useState('')
  const [feldFehler, setFeldFehler] = useState<string | null>(null)
  const [hinweis, setHinweis] = useState<string | null>(null)
  const [sendet, setSendet] = useState(false)

  // E-05 nach abgelaufenem Link, E-04 wenn der Trigger die Adresse ablehnt,
  // E-12 bei abgelaufener Sitzung.
  const rueckkehrFehler =
    anmeldeFehler === 'abgelaufen'
      ? E['E-05']
      : anmeldeFehler === 'nicht-freigegeben'
        ? E['E-04']
        : anmeldeFehler === 'allgemein'
          ? E['E-12']
          : null

  async function absenden(ereignis: FormEvent) {
    ereignis.preventDefault()
    setHinweis(null)
    setFeldFehler(null)
    setzeAnmeldeFehler(null)
    setSendet(true)
    const ergebnis = await sendeMagicLink(email)
    setSendet(false)
    if (ergebnis.ok) {
      setHinweis(TX['TX-01'])
      return
    }
    setFeldFehler(
      ergebnis.grund === 'nicht-freigegeben' ? E['E-04'] : E['E-02'],
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Panel className="max-w-full">
        <PanelBody className="pt-6">
          <h1 className="t-h3 mb-1">{UI.login.titel}</h1>
          {rueckkehrFehler != null && feldFehler == null && (
            <p className="field-error" role="alert">
              {rueckkehrFehler}
            </p>
          )}
          <form onSubmit={absenden} noValidate>
            <Field
              label={UI.login.feld}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoFocus
              value={email}
              fehler={feldFehler}
              onChange={(e) => {
                setEmail(e.target.value)
                setFeldFehler(null)
              }}
            />
            <div className="mt-4">
              <Button
                variante="primary"
                type="submit"
                disabled={sendet || email.trim() === ''}
              >
                {UI.login.button}
              </Button>
            </div>
          </form>
          {hinweis != null && (
            <p className="t-label mt-3" role="status">
              {hinweis}
            </p>
          )}
        </PanelBody>
      </Panel>
    </main>
  )
}
