import type { Daten } from './model'
import type { StatusUndFortschritt } from './status'

/**
 * Zähler im Header: „x / y Initiativen abgeschlossen“ (US-20, TX-05).
 *
 * Gezählt werden alle Initiativen der Ziele, die mit der aktiven Vision
 * verknüpft sind. Der Zähler reagiert **nicht** auf den Filter (Brief A-40):
 * er beantwortet „wie weit bin ich insgesamt“, nicht „was sehe ich gerade“.
 * Deshalb nimmt die Funktion den Filter auch gar nicht entgegen.
 */
export type Zaehlerstand = { abgeschlossen: number; gesamt: number }

export function zaehleInitiativen(
  daten: Daten,
  berechnet: StatusUndFortschritt,
  aktiveVisionId: string | null,
): Zaehlerstand {
  if (aktiveVisionId == null) return { abgeschlossen: 0, gesamt: 0 }

  const zielIds = new Set(
    daten.goal_vision
      .filter((gv) => gv.vision_id === aktiveVisionId)
      .map((gv) => gv.goal_id),
  )
  const initiativen = daten.initiative.filter((i) => zielIds.has(i.goal_id))
  const abgeschlossen = initiativen.filter(
    (i) => berechnet.status.get(i.id) === 'abgeschlossen',
  ).length

  return { abgeschlossen, gesamt: initiativen.length }
}
