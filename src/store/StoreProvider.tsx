import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as aktionen from '@/lib/aktionen'
import { ladeAlles, sendeVorgaenge } from '@/lib/daten'
import type { QuellenFehler } from '@/lib/abhaengigkeiten'
import { LEERER_FILTER } from '@/lib/filter'
import type { Filter } from '@/lib/filter'
import { LEERE_DATEN } from '@/lib/model'
import type { Daten, KartenRef } from '@/lib/model'
import { berechneAlles } from '@/lib/status'
import { supabase } from '@/lib/supabase'
import { Schreiber } from '@/lib/warteschlange'
import type { SpeicherZustand } from '@/lib/warteschlange'
import { StoreContext } from './StoreContext'
import type { LadeStatus, Store } from './StoreContext'

/**
 * Hält die Daten, die Auswahl und das automatische Speichern zusammen.
 *
 * Geschrieben wird optimistisch: der Zustand ändert sich sofort, die
 * Warteschlange schickt gebündelt mit 500 ms Verzögerung nach (US-22). Die
 * IDs erzeugt der Client, deshalb passt ein späteres Ändern immer zur selben
 * Zeile.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [ladeStatus, setLadeStatus] = useState<LadeStatus>('laedt')
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const [daten, setDaten] = useState<Daten>(LEERE_DATEN)
  const [auswahl, setAuswahl] = useState<KartenRef | null>(null)
  const [speicherZustand, setSpeicherZustand] =
    useState<SpeicherZustand>('ruhig')

  const schreiber = useRef<Schreiber | null>(null)
  if (schreiber.current == null) {
    schreiber.current = new Schreiber({
      senden: (vorgaenge) => sendeVorgaenge(supabase, vorgaenge),
      onZustand: setSpeicherZustand,
    })
  }

  useEffect(() => {
    const s = schreiber.current
    return () => s?.beenden()
  }, [])

  const laden = useCallback(async () => {
    setLadeStatus('laedt')
    setLadeFehler(null)
    const ergebnis = await ladeAlles(supabase)
    if (!ergebnis.ok) {
      setLadeFehler(ergebnis.meldung)
      setLadeStatus('fehler')
      return
    }
    setDaten(ergebnis.daten)
    setLadeStatus('bereit')
  }, [])

  useEffect(() => {
    void laden()
  }, [laden])

  /** Nimmt das Ergebnis einer Aktion an: Zustand setzen, Vorgänge melden. */
  const uebernimm = useCallback((ergebnis: aktionen.Ergebnis) => {
    setDaten(ergebnis.daten)
    for (const vorgang of ergebnis.vorgaenge) schreiber.current?.melde(vorgang)
  }, [])

  /**
   * Aktionen greifen auf den jeweils neuesten Zustand zu. Über eine Referenz
   * statt über `daten` in der Abhängigkeitsliste, damit zwei Änderungen kurz
   * hintereinander nicht auf demselben alten Stand aufsetzen.
   */
  const datenRef = useRef(daten)
  useEffect(() => {
    datenRef.current = daten
  }, [daten])

  const berechnet = useMemo(() => berechneAlles(daten), [daten])

  const aktiveVision = useMemo(() => {
    const gewuenscht = daten.settings?.active_vision_id
    return (
      daten.vision.find((v) => v.id === gewuenscht) ?? daten.vision[0] ?? null
    )
  }, [daten.settings?.active_vision_id, daten.vision])

  const waehleVision = useCallback(
    (id: string) => {
      uebernimm(
        aktionen.einstellungAendern(datenRef.current, { active_vision_id: id }),
      )
      setAuswahl(null)
    },
    [uebernimm],
  )

  const visionAnlegen = useCallback(
    (titel: string) => {
      const ergebnis = aktionen.visionAnlegen(datenRef.current, titel)
      uebernimm(ergebnis)
      // Neue Vision wird gleich die aktive – sonst bliebe sie unsichtbar.
      uebernimm(
        aktionen.einstellungAendern(ergebnis.daten, {
          active_vision_id: ergebnis.id,
        }),
      )
      return ergebnis.id
    },
    [uebernimm],
  )

  const zielAnlegen = useCallback(
    (visionId: string, titel: string) => {
      const ergebnis = aktionen.zielAnlegen(datenRef.current, visionId, titel)
      uebernimm(ergebnis)
      return ergebnis.id
    },
    [uebernimm],
  )

  const initiativeAnlegen = useCallback(
    (goalId: string, titel: string) => {
      const ergebnis = aktionen.initiativeAnlegen(
        datenRef.current,
        goalId,
        titel,
      )
      uebernimm(ergebnis)
      return ergebnis.id
    },
    [uebernimm],
  )

  const metrikAnlegen = useCallback(
    (initiativeId: string, titel: string) => {
      const ergebnis = aktionen.metrikAnlegen(
        datenRef.current,
        initiativeId,
        titel,
      )
      uebernimm(ergebnis)
      return ergebnis.id
    },
    [uebernimm],
  )

  const karteAendern = useCallback(
    (ref: KartenRef, felder: Record<string, unknown>) => {
      uebernimm(aktionen.karteAendern(datenRef.current, ref, felder))
    },
    [uebernimm],
  )

  const karteLoeschen = useCallback(
    (ref: KartenRef) => {
      uebernimm(aktionen.karteLoeschen(datenRef.current, ref))
      setAuswahl((aktuell) =>
        aktuell?.id === ref.id && aktuell.typ === ref.typ ? null : aktuell,
      )
    },
    [uebernimm],
  )

  const zielVisionZuordnen = useCallback(
    (goalId: string, visionId: string, an: boolean) => {
      const ergebnis = aktionen.zielVisionZuordnen(
        datenRef.current,
        goalId,
        visionId,
        an,
      )
      if (aktionen.istZuordnungsFehler(ergebnis)) return false
      uebernimm(ergebnis)
      return true
    },
    [uebernimm],
  )

  const abhaengigkeitAnlegen = useCallback(
    (
      quelle: { typ: 'goal' | 'initiative'; id: string },
      zielId: string,
    ): QuellenFehler | null => {
      const ergebnis = aktionen.abhaengigkeitAnlegen(
        datenRef.current,
        quelle,
        zielId,
      )
      if (aktionen.istAbhaengigkeitsFehler(ergebnis)) return ergebnis.fehler
      uebernimm(ergebnis)
      return null
    },
    [uebernimm],
  )

  const abhaengigkeitLoeschen = useCallback(
    (id: string) => {
      uebernimm(aktionen.abhaengigkeitLoeschen(datenRef.current, id))
    },
    [uebernimm],
  )

  /**
   * Der Filter steht in den Einstellungen und gilt damit auf allen Geräten
   * (Brief A-25).
   */
  const filter = useMemo<Filter>(
    () => ({
      status: daten.settings?.filter_status ?? LEERER_FILTER.status,
      zielIds: daten.settings?.filter_goal_ids ?? LEERER_FILTER.zielIds,
    }),
    [daten.settings?.filter_status, daten.settings?.filter_goal_ids],
  )

  const setzeFilter = useCallback(
    (neu: Filter) => {
      uebernimm(
        aktionen.einstellungAendern(datenRef.current, {
          filter_status: neu.status,
          filter_goal_ids: neu.zielIds,
        }),
      )
    },
    [uebernimm],
  )

  const wert: Store = useMemo(
    () => ({
      ladeStatus,
      ladeFehler,
      neuLaden: () => void laden(),
      daten,
      berechnet,
      speicherZustand,
      aktiveVision,
      waehleVision,
      auswahl,
      waehleKarte: setAuswahl,
      visionAnlegen,
      zielAnlegen,
      initiativeAnlegen,
      metrikAnlegen,
      karteAendern,
      karteLoeschen,
      zielVisionZuordnen,
      abhaengigkeitAnlegen,
      abhaengigkeitLoeschen,
      filter,
      setzeFilter,
    }),
    [
      ladeStatus,
      ladeFehler,
      laden,
      daten,
      berechnet,
      speicherZustand,
      aktiveVision,
      waehleVision,
      auswahl,
      visionAnlegen,
      zielAnlegen,
      initiativeAnlegen,
      metrikAnlegen,
      karteAendern,
      karteLoeschen,
      zielVisionZuordnen,
      abhaengigkeitAnlegen,
      abhaengigkeitLoeschen,
      filter,
      setzeFilter,
    ],
  )

  return <StoreContext.Provider value={wert}>{children}</StoreContext.Provider>
}
