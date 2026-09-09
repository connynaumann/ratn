import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as aktionen from '@/lib/aktionen'
import { LEERER_FILTER } from '@/lib/filter'
import type { Filter } from '@/lib/filter'
import type { Daten, KartenRef } from '@/lib/model'
import { berechneAlles } from '@/lib/status'
import { StoreContext } from '@/store/StoreContext'
import type { Store } from '@/store/StoreContext'
import type { SpeicherZustand, Vorgang } from '@/lib/warteschlange'

/**
 * Store für Tests: dieselben reinen Aktionen wie im Betrieb, aber ohne Netz.
 *
 * Zwei Abnehmer teilen ihn sich – die Komponententests unter tests/unit und
 * die Playwright-Vorrichtung unter tests/fixture. Deshalb liegt er hier und
 * nicht bei einem von beiden, und deshalb bringt er keine Testbibliothek mit:
 * er muss auch im Browser laufen.
 *
 * Die gemeldeten Vorgänge lassen sich mitschreiben; so kann ein Test prüfen,
 * *was* gespeichert würde.
 */
export function TestStore({
  start,
  vorgaenge,
  speicherZustand = 'ruhig',
  onDaten,
  children,
}: {
  start: Daten
  vorgaenge?: Vorgang[]
  speicherZustand?: SpeicherZustand
  /** Wird nach jeder Änderung gerufen – die Vorrichtung sichert damit. */
  onDaten?: (daten: Daten) => void
  children: ReactNode
}) {
  const [daten, setDaten] = useState(start)
  const [auswahl, setAuswahl] = useState<KartenRef | null>(null)

  const uebernimm = useCallback(
    (e: aktionen.Ergebnis) => {
      setDaten(e.daten)
      vorgaenge?.push(...e.vorgaenge)
      onDaten?.(e.daten)
    },
    [vorgaenge, onDaten],
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
    abhaengigkeitAnlegen: (quelle, zielId) => {
      const e = aktionen.abhaengigkeitAnlegen(daten, quelle, zielId)
      if (aktionen.istAbhaengigkeitsFehler(e)) return e.fehler
      uebernimm(e)
      return null
    },
    abhaengigkeitLoeschen: (id) =>
      uebernimm(aktionen.abhaengigkeitLoeschen(daten, id)),
    filter: {
      status: daten.settings?.filter_status ?? LEERER_FILTER.status,
      zielIds: daten.settings?.filter_goal_ids ?? LEERER_FILTER.zielIds,
    } satisfies Filter,
    setzeFilter: (neu) =>
      uebernimm(
        aktionen.einstellungAendern(daten, {
          filter_status: neu.status,
          filter_goal_ids: neu.zielIds,
        }),
      ),
  }

  return <StoreContext.Provider value={wert}>{children}</StoreContext.Provider>
}
