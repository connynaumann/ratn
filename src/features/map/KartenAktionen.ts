import { createContext, useContext } from 'react'
import type { Kartentyp } from '@/lib/model'

/**
 * Was eine Karte auf der Map auslösen kann.
 *
 * React Flow reicht an einen Knoten nur `data` durch. Callbacks gehören nicht
 * in die Knotendaten – sie würden bei jedem Rendern neu entstehen und die
 * `memo`-Karten nutzlos machen (Brief A-43). Deshalb ein Kontext.
 */
export type KartenAktionen = {
  /** Hover-Plus: legt die Unterkarte des passenden Typs an (A-35) */
  unterkarteAnlegen: (elternTyp: Kartentyp, elternId: string) => void
  /** Metrik direkt auf der Karte abhaken (US-05) */
  metrikWechseln: (metrikId: string, an: boolean) => void
}

export const KartenAktionenContext = createContext<KartenAktionen | null>(null)

export function useKartenAktionen(): KartenAktionen {
  const wert = useContext(KartenAktionenContext)
  if (wert == null) {
    throw new Error('Karten brauchen einen KartenAktionenContext')
  }
  return wert
}
