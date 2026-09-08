import type {
  Daten,
  Dependency,
  Goal,
  Initiative,
  Metric,
  Status,
  Vision,
} from './model'

/**
 * Statuslogik und Fortschritt aus Brief Abschnitt 5.
 *
 * Reine Funktionen ohne Zustand, damit die Tabelle aus dem Brief eins zu eins
 * als Test dasteht (CLAUDE.md, Arbeitsregel 4).
 *
 * Reihenfolge der Auswertung: ist `status_override` gesetzt, gilt dieser
 * Status. Sonst wird abgeleitet.
 */

// ---------------------------------------------------------------- Status

/**
 * Status eines Ziels.
 *
 * | Blockiert | mindestens eine Abhängigkeit, deren Quelle nicht abgeschlossen
 * |           | ist, oder mindestens eine Initiative mit Status blockiert
 * | Abgeschlossen | mindestens eine Initiative und alle abgeschlossen
 * | Begonnen  | mindestens eine Initiative begonnen oder abgeschlossen
 * | In Planung| sonst
 */
export function zielStatus(
  ziel: Goal,
  initiativen: Initiative[],
  abhaengigkeiten: Dependency[],
  statusDerQuelle: (a: Dependency) => Status | null,
): Status {
  if (ziel.status_override != null) return ziel.status_override

  const eigene = initiativen.filter((i) => i.goal_id === ziel.id)
  const blockaden = abhaengigkeiten.filter((a) => a.target_goal_id === ziel.id)

  const durchAbhaengigkeit = blockaden.some((a) => {
    const status = statusDerQuelle(a)
    // Eine Quelle, die es nicht (mehr) gibt, blockiert nicht.
    return status != null && status !== 'abgeschlossen'
  })
  const durchInitiative = eigene.some((i) => i.status === 'blockiert')
  if (durchAbhaengigkeit || durchInitiative) return 'blockiert'

  if (eigene.length > 0 && eigene.every((i) => i.status === 'abgeschlossen')) {
    return 'abgeschlossen'
  }
  if (
    eigene.some((i) => i.status === 'begonnen' || i.status === 'abgeschlossen')
  ) {
    return 'begonnen'
  }
  return 'in_planung'
}

/**
 * Status einer Vision. Gezählt werden nur die über goal_vision verknüpften
 * Ziele. Eine Vision wird nie automatisch blockiert (Brief A-26).
 */
export function visionStatus(
  vision: Vision,
  zieleDerVision: Goal[],
  zielStatusVon: (ziel: Goal) => Status,
): Status {
  if (vision.status_override != null) return vision.status_override
  if (zieleDerVision.length === 0) return 'in_planung'

  const status = zieleDerVision.map(zielStatusVon)
  if (status.every((s) => s === 'abgeschlossen')) return 'abgeschlossen'
  if (
    status.some(
      (s) => s === 'begonnen' || s === 'abgeschlossen' || s === 'blockiert',
    )
  ) {
    return 'begonnen'
  }
  return 'in_planung'
}

// ------------------------------------------------------------ Fortschritt

/**
 * Fortschritt einer Metrik (Brief A-27): erledigt = 100 %, sonst ist/soll,
 * sonst 0 %. Werte über 100 % werden gekappt.
 */
export function metrikFortschritt(metrik: Metric): number {
  if (metrik.done) return 1
  const { current_value: ist, target_value: soll } = metrik
  if (ist == null || soll == null || soll === 0) return 0
  return Math.min(1, Math.max(0, ist / soll))
}

/** Gilt die Metrik als erledigt? Istwert ≥ Sollwert zählt (US-05). */
export function metrikErledigt(metrik: Metric): boolean {
  if (metrik.done) return true
  const { current_value: ist, target_value: soll } = metrik
  return ist != null && soll != null && soll > 0 && ist >= soll
}

/**
 * Fortschritt einer Initiative: Anteil erledigter Metriken. Ohne Metriken
 * zählt der Status: abgeschlossen = 100 %, begonnen = 50 %, sonst 0 %.
 */
export function initiativeFortschritt(
  initiative: Initiative,
  metriken: Metric[],
): number {
  const eigene = metriken.filter((m) => m.initiative_id === initiative.id)
  if (eigene.length === 0) {
    if (initiative.status === 'abgeschlossen') return 1
    if (initiative.status === 'begonnen') return 0.5
    return 0
  }
  const erledigt = eigene.filter(metrikErledigt).length
  return erledigt / eigene.length
}

/** Fortschritt eines Ziels: Durchschnitt seiner Initiativen, sonst 0 %. */
export function zielFortschritt(werte: number[]): number {
  if (werte.length === 0) return 0
  return werte.reduce((a, b) => a + b, 0) / werte.length
}

/** Fortschritt einer Vision: Durchschnitt ihrer verknüpften Ziele. */
export const visionFortschritt = zielFortschritt

/** 0…1 als ganze Prozentzahl für die Anzeige (TX-11). */
export function alsProzent(anteil: number): number {
  return Math.round(anteil * 100)
}

// ------------------------------------------------- Alles auf einmal

export type StatusUndFortschritt = {
  status: Map<string, Status>
  fortschritt: Map<string, number>
}

/**
 * Berechnet Status und Fortschritt für alle Karten in einem Durchgang.
 * Der Schlüssel ist die ID der Karte; IDs sind UUIDs und typübergreifend
 * eindeutig.
 */
export function berechneAlles(daten: Daten): StatusUndFortschritt {
  const status = new Map<string, Status>()
  const fortschritt = new Map<string, number>()

  // Metriken
  for (const m of daten.metric) {
    fortschritt.set(m.id, metrikFortschritt(m))
  }

  // Initiativen: Status steht in der Zeile
  for (const i of daten.initiative) {
    status.set(i.id, i.status)
    fortschritt.set(i.id, initiativeFortschritt(i, daten.metric))
  }

  // Ziele
  const statusDerQuelle = (a: Dependency): Status | null => {
    if (a.source_type === 'initiative') {
      return daten.initiative.find((i) => i.id === a.source_id)?.status ?? null
    }
    const quelle = daten.goal.find((g) => g.id === a.source_id)
    if (quelle == null) return null
    // Eine blockierende Quelle wird ohne ihre eigenen Blockaden bewertet.
    // Das genügt für die Frage „ist sie abgeschlossen?“ und kann nicht kreisen.
    return zielStatus(quelle, daten.initiative, [], () => null)
  }

  for (const g of daten.goal) {
    status.set(
      g.id,
      zielStatus(g, daten.initiative, daten.dependency, statusDerQuelle),
    )
    const eigene = daten.initiative.filter((i) => i.goal_id === g.id)
    fortschritt.set(
      g.id,
      zielFortschritt(eigene.map((i) => fortschritt.get(i.id) ?? 0)),
    )
  }

  // Visionen
  for (const v of daten.vision) {
    const zielIds = daten.goal_vision
      .filter((gv) => gv.vision_id === v.id)
      .map((gv) => gv.goal_id)
    const ziele = daten.goal.filter((g) => zielIds.includes(g.id))
    status.set(
      v.id,
      visionStatus(v, ziele, (g) => status.get(g.id) ?? 'in_planung'),
    )
    fortschritt.set(
      v.id,
      visionFortschritt(ziele.map((g) => fortschritt.get(g.id) ?? 0)),
    )
  }

  return { status, fortschritt }
}
