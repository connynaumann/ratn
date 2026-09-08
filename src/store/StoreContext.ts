import { createContext } from 'react'
import type { Daten, KartenRef, Vision } from '@/lib/model'
import type { StatusUndFortschritt } from '@/lib/status'
import type { SpeicherZustand } from '@/lib/warteschlange'

export type LadeStatus = 'laedt' | 'bereit' | 'fehler'

export type Store = {
  ladeStatus: LadeStatus
  ladeFehler: string | null
  neuLaden: () => void

  daten: Daten
  berechnet: StatusUndFortschritt
  speicherZustand: SpeicherZustand

  /** Aktive Vision (settings.active_vision_id), sonst die erste. */
  aktiveVision: Vision | null
  waehleVision: (id: string) => void

  auswahl: KartenRef | null
  waehleKarte: (ref: KartenRef | null) => void

  visionAnlegen: (titel: string) => string
  zielAnlegen: (visionId: string, titel: string) => string
  initiativeAnlegen: (goalId: string, titel: string) => string
  metrikAnlegen: (initiativeId: string, titel: string) => string
  karteAendern: (ref: KartenRef, felder: Record<string, unknown>) => void
  karteLoeschen: (ref: KartenRef) => void
  /** false = letzte Vision, Verknüpfung bleibt bestehen (E-14) */
  zielVisionZuordnen: (goalId: string, visionId: string, an: boolean) => boolean
}

export const StoreContext = createContext<Store | null>(null)
