import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import * as aktionen from '@/lib/aktionen'
import type { Daten, KartenRef } from '@/lib/model'
import { berechneAlles } from '@/lib/status'
import { StoreContext } from '@/store/StoreContext'
import type { Store } from '@/store/StoreContext'
import type { SpeicherZustand, Vorgang } from '@/lib/warteschlange'

/**
 * Store für Komponententests: dieselben reinen Aktionen wie im Betrieb, aber
 * ohne Netz. Die gemeldeten Vorgänge werden mitgeschrieben, damit ein Test
 * prüfen kann, *was* gespeichert würde.
 */
export function TestStore({
  start,
  vorgaenge,
  speicherZustand = 'ruhig',
  children,
}: {
  start: Daten
  vorgaenge?: Vorgang[]
  speicherZustand?: SpeicherZustand
  children: ReactNode
}) {
  const [daten, setDaten] = useState(start)
  const [auswahl, setAuswahl] = useState<KartenRef | null>(null)

  const uebernimm = useCallback(
    (e: aktionen.Ergebnis) => {
      setDaten(e.daten)
      vorgaenge?.push(...e.vorgaenge)
    },
    [vorgaenge],
  )

  const berechnet = useMemo(() => berechneAlles(daten), [daten])
  const aktiveVision = useMemo(
    () =>
      daten.vision.find((v) => v.id === daten.settings?.active_vision_id) ??
      daten.vision[0] ??
      null,
    [daten],
  )

  const wert: Store = {
    ladeStatus: 'bereit',
    ladeFehler: null,
    neuLaden: () => {},
    daten,
    berechnet,
    speicherZustand,
    aktiveVision,
    waehleVision: (id) =>
      uebernimm(aktionen.einstellungAendern(daten, { active_vision_id: id })),
    auswahl,
    waehleKarte: setAuswahl,
    visionAnlegen: (t) => {
      const e = aktionen.visionAnlegen(daten, t)
      uebernimm(e)
      return e.id
    },
    zielAnlegen: (v, t) => {
      const e = aktionen.zielAnlegen(daten, v, t)
      uebernimm(e)
      return e.id
    },
    initiativeAnlegen: (g, t) => {
      const e = aktionen.initiativeAnlegen(daten, g, t)
      uebernimm(e)
      return e.id
    },
    metrikAnlegen: (i, t) => {
      const e = aktionen.metrikAnlegen(daten, i, t)
      uebernimm(e)
      return e.id
    },
    karteAendern: (r, f) => uebernimm(aktionen.karteAendern(daten, r, f)),
    karteLoeschen: (r) => {
      uebernimm(aktionen.karteLoeschen(daten, r))
      setAuswahl(null)
    },
    zielVisionZuordnen: (g, v, an) => {
      const e = aktionen.zielVisionZuordnen(daten, g, v, an)
      if (aktionen.istZuordnungsFehler(e)) return false
      uebernimm(e)
      return true
    },
  }

  return <StoreContext.Provider value={wert}>{children}</StoreContext.Provider>
}

export function rendereMitStore(
  ui: ReactNode,
  start: Daten,
  optionen: { vorgaenge?: Vorgang[]; speicherZustand?: SpeicherZustand } = {},
) {
  return render(
    <TestStore
      start={start}
      vorgaenge={optionen.vorgaenge}
      speicherZustand={optionen.speicherZustand}
    >
      {ui}
    </TestStore>,
  )
}
