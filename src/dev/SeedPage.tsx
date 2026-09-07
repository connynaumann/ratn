import { useState } from 'react'
import { Button, Panel, PanelBody, PanelHead } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { wendeSeedAn } from '@/lib/seed'
import type { SeedErgebnis } from '@/lib/seed'
import { navigiere, ROUTEN } from '@/router'
import { testdaten, testdatenMeta } from './testdaten'

/**
 * /dev/seed – Testdaten einspielen (Brief D-12, D-13).
 *
 * Nur hinter dem Login erreichbar und nirgends verlinkt. Schreibt ausschließlich
 * in eine leere Datenbank; ist bereits eine Vision vorhanden, passiert nichts.
 */
export function SeedPage() {
  const [laeuft, setLaeuft] = useState(false)
  const [ergebnis, setErgebnis] = useState<SeedErgebnis | null>(null)

  async function starten() {
    setLaeuft(true)
    setErgebnis(null)
    try {
      setErgebnis(await wendeSeedAn(supabase, testdaten))
    } catch (fehler) {
      setErgebnis({
        art: 'fehler',
        meldung: fehler instanceof Error ? fehler.message : String(fehler),
      })
    } finally {
      setLaeuft(false)
    }
  }

  const erwartet = {
    vision: testdaten.vision.length,
    goal: testdaten.goal.length,
    goal_vision: testdaten.goal_vision.length,
    initiative: testdaten.initiative.length,
    metric: testdaten.metric.length,
    dependency: testdaten.dependency.length,
    settings: 1,
  }

  return (
    <main className="flex min-h-dvh items-start justify-center p-6">
      <Panel style={{ width: 520, maxWidth: '100%' }}>
        <PanelHead
          titel="Testdaten einspielen"
          onSchliessen={() => navigiere(ROUTEN.app)}
          schliessenLabel="Zur App"
        />
        <PanelBody className="pt-4">
          <p className="t-label">
            Quelle: docs/testdaten.json · {testdatenMeta.quelle_titel}
          </p>
          <p className="t-label">
            Der Seed schreibt nur, wenn noch keine Vision besteht. Er löscht und
            ersetzt nichts.
          </p>

          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <caption className="sr-only">Zeilen je Tabelle</caption>
            <thead>
              <tr>
                <th className="t-label" style={{ textAlign: 'left' }}>
                  Tabelle
                </th>
                <th className="t-label" style={{ textAlign: 'right' }}>
                  erwartet
                </th>
                <th className="t-label" style={{ textAlign: 'right' }}>
                  geschrieben
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(erwartet).map(([tabelle, anzahl]) => {
                const geschrieben =
                  ergebnis?.art === 'geschrieben'
                    ? ergebnis.zeilen[tabelle as keyof typeof ergebnis.zeilen]
                    : null
                return (
                  <tr key={tabelle}>
                    <td className="t-mono" style={{ padding: '3px 0' }}>
                      {tabelle}
                    </td>
                    <td
                      className="t-mono"
                      data-numeric
                      style={{ textAlign: 'right' }}
                    >
                      {anzahl}
                    </td>
                    <td
                      className="t-mono"
                      data-numeric
                      style={{
                        textAlign: 'right',
                        color:
                          geschrieben == null
                            ? undefined
                            : geschrieben === anzahl
                              ? 'var(--success)'
                              : 'var(--danger)',
                      }}
                    >
                      {geschrieben ?? '–'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="mt-2 flex items-center gap-3">
            <Button variante="primary" onClick={starten} disabled={laeuft}>
              {laeuft ? 'Wird geschrieben …' : 'Testdaten einspielen'}
            </Button>
          </div>

          {ergebnis?.art === 'uebersprungen' && (
            <p className="t-label" role="status" style={{ color: 'var(--warning)' }}>
              Es sind bereits {ergebnis.visionen} Vision(en) vorhanden. Es wurde
              nichts geschrieben.
            </p>
          )}
          {ergebnis?.art === 'fehler' && (
            <p className="field-error" role="alert">
              {ergebnis.meldung}
            </p>
          )}
          {ergebnis?.art === 'geschrieben' && (
            <p className="t-label" role="status" style={{ color: 'var(--success)' }}>
              Fertig. Die Zahlen oben zeigen den Lauf.
            </p>
          )}
        </PanelBody>
      </Panel>
    </main>
  )
}
