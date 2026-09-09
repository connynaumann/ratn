import type { Daten, KartenRef, Status } from './model'
import type { StatusUndFortschritt } from './status'

/**
 * Filter nach Status und nach Ziel (Brief Abschnitt 7, A-39).
 *
 * „In der Map werden nicht passende Karten auf 25 % Deckkraft gedimmt,
 * Positionen bleiben. In Linear-View und Sidepanel werden sie ausgeblendet“ –
 * im Sidepanel zusammen mit ihren Eltern, damit der Baum begehbar bleibt
 * (US-19).
 *
 * Zwei Kriterien wirken zusammen: eine Karte muss beiden genügen. Innerhalb
 * eines Kriteriums genügt einer der gewählten Werte. Leeres Kriterium heißt
 * „alle“.
 */
export type Filter = {
  status: Status[]
  zielIds: string[]
}

export const LEERER_FILTER: Filter = { status: [], zielIds: [] }

export function istFilterAktiv(filter: Filter): boolean {
  return filter.status.length > 0 || filter.zielIds.length > 0
}

/** Anzahl aktiver Kriterien für das Badge am Filter-Knopf (US-19). */
export function anzahlKriterien(filter: Filter): number {
  return filter.status.length + filter.zielIds.length
}

/** Zu welchem Ziel gehört eine Karte? Die Vision gehört zu keinem. */
function zielVon(daten: Daten, ref: KartenRef): string | null {
  if (ref.typ === 'goal') return ref.id
  if (ref.typ === 'initiative') {
    return daten.initiative.find((i) => i.id === ref.id)?.goal_id ?? null
  }
  if (ref.typ === 'metric') {
    const metrik = daten.metric.find((m) => m.id === ref.id)
    if (metrik == null) return null
    return (
      daten.initiative.find((i) => i.id === metrik.initiative_id)?.goal_id ??
      null
    )
  }
  return null
}

/**
 * Passt die Karte zum Filter?
 *
 * Metriken haben keinen Status; ein Statusfilter schließt sie deshalb aus.
 * Die Vision gehört zu keinem Ziel; ein Zielfilter schließt sie ebenso aus.
 * Beides folgt der Regel wörtlich – im Sidepanel bleiben sie trotzdem
 * sichtbar, solange ein Kind passt (siehe sichtbareImBaum).
 */
export function passtZumFilter(
  daten: Daten,
  berechnet: StatusUndFortschritt,
  ref: KartenRef,
  filter: Filter,
): boolean {
  if (filter.status.length > 0) {
    const status = berechnet.status.get(ref.id)
    if (status == null || !filter.status.includes(status)) return false
  }
  if (filter.zielIds.length > 0) {
    const ziel = zielVon(daten, ref)
    if (ziel == null || !filter.zielIds.includes(ziel)) return false
  }
  return true
}

/** Eltern einer Karte, von unten nach oben. */
export function elternKette(daten: Daten, ref: KartenRef): KartenRef[] {
  if (ref.typ === 'metric') {
    const metrik = daten.metric.find((m) => m.id === ref.id)
    if (metrik == null) return []
    const initiative = daten.initiative.find(
      (i) => i.id === metrik.initiative_id,
    )
    if (initiative == null) return []
    return [
      { typ: 'initiative', id: initiative.id },
      ...elternKette(daten, { typ: 'initiative', id: initiative.id }),
    ]
  }
  if (ref.typ === 'initiative') {
    const initiative = daten.initiative.find((i) => i.id === ref.id)
    if (initiative == null) return []
    return [
      { typ: 'goal', id: initiative.goal_id },
      ...elternKette(daten, { typ: 'goal', id: initiative.goal_id }),
    ]
  }
  if (ref.typ === 'goal') {
    const vision = daten.goal_vision.find((gv) => gv.goal_id === ref.id)
    return vision != null ? [{ typ: 'vision', id: vision.vision_id }] : []
  }
  return []
}

/**
 * IDs, die im Sidepanel sichtbar bleiben: alle passenden Karten und ihre
 * Eltern (US-19). Ohne aktiven Filter ist alles sichtbar – dann gibt die
 * Funktion null zurück, damit die Liste gar nicht erst filtern muss.
 */
export function sichtbareImBaum(
  daten: Daten,
  berechnet: StatusUndFortschritt,
  filter: Filter,
): Set<string> | null {
  if (!istFilterAktiv(filter)) return null

  const sichtbar = new Set<string>()
  const alle: KartenRef[] = [
    ...daten.vision.map((v) => ({ typ: 'vision' as const, id: v.id })),
    ...daten.goal.map((g) => ({ typ: 'goal' as const, id: g.id })),
    ...daten.initiative.map((i) => ({ typ: 'initiative' as const, id: i.id })),
    ...daten.metric.map((m) => ({ typ: 'metric' as const, id: m.id })),
  ]

  for (const ref of alle) {
    if (!passtZumFilter(daten, berechnet, ref, filter)) continue
    sichtbar.add(ref.id)
    for (const eltern of elternKette(daten, ref)) sichtbar.add(eltern.id)
  }

  return sichtbar
}
