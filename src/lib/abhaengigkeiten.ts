import type { Daten, Dependency, Kartentyp } from './model'

/**
 * Abhängigkeiten: „Ein Ziel kann gesperrt werden in Abhängigkeit zu einer
 * Initiative, die beendet sein muss“ und „Ein nicht erreichtes Ziel kann das
 * Erreichen eines anderen Zieles blockieren“ (Brief Abschnitt 5).
 *
 * Reine Funktionen; die Statuswirkung steht in status.ts.
 */

export type Quelle = {
  typ: Extract<Kartentyp, 'goal' | 'initiative'>
  id: string
  titel: string
  /** Bei Initiativen der Titel ihres Ziels, zur Unterscheidung im Dialog */
  zielTitel?: string
}

/**
 * Würde `quelle → zielId` einen Kreis erzeugen? (E-08)
 *
 * Geprüft wird nur über Ziel-zu-Ziel-Kanten. Eine Initiative kann nur Quelle
 * sein, nie Ziel – über sie führt kein Weg zurück, und A-24 erlaubt
 * ausdrücklich, dass eine Initiative ihr eigenes Ziel blockiert. Ein Kreis
 * kann also allein zwischen Zielen entstehen.
 */
export function wuerdeKreisErzeugen(
  daten: Daten,
  quelle: { typ: 'goal' | 'initiative'; id: string },
  zielId: string,
): boolean {
  if (quelle.typ !== 'goal') return false
  if (quelle.id === zielId) return true

  // Von zielId aus rückwärts: erreicht das blockierte Ziel die neue Quelle
  // bereits als Blockierer, schlösse die neue Kante den Kreis.
  const gesehen = new Set<string>()
  const offen = [zielId]
  while (offen.length > 0) {
    const aktuell = offen.pop()!
    if (aktuell === quelle.id) return true
    if (gesehen.has(aktuell)) continue
    gesehen.add(aktuell)
    for (const d of daten.dependency) {
      if (d.source_type !== 'goal') continue
      if (d.source_id !== aktuell) continue
      offen.push(d.target_goal_id)
    }
  }
  return false
}

/** Besteht die Abhängigkeit schon? (DB-Constraint dependency_unique) */
export function existiertBereits(
  daten: Daten,
  quelle: { typ: 'goal' | 'initiative'; id: string },
  zielId: string,
): boolean {
  return daten.dependency.some(
    (d) =>
      d.source_type === quelle.typ &&
      d.source_id === quelle.id &&
      d.target_goal_id === zielId,
  )
}

export type QuellenFehler = 'kreis' | 'schon-vorhanden' | 'selbst'

/** Warum lässt sich diese Quelle nicht wählen? null = sie lässt sich wählen. */
export function pruefeQuelle(
  daten: Daten,
  quelle: { typ: 'goal' | 'initiative'; id: string },
  zielId: string,
): QuellenFehler | null {
  if (quelle.typ === 'goal' && quelle.id === zielId) return 'selbst'
  if (existiertBereits(daten, quelle, zielId)) return 'schon-vorhanden'
  if (wuerdeKreisErzeugen(daten, quelle, zielId)) return 'kreis'
  return null
}

/**
 * Alle Karten, die als Blockierer für `zielId` infrage kommen: die Ziele der
 * aktiven Vision außer dem blockierten selbst, und alle ihre Initiativen.
 */
export function moeglicheQuellen(
  daten: Daten,
  aktiveVisionId: string | null,
  zielId: string,
): Quelle[] {
  const zielIds = daten.goal_vision
    .filter((gv) => gv.vision_id === aktiveVisionId)
    .map((gv) => gv.goal_id)
  const ziele = daten.goal.filter((g) => zielIds.includes(g.id))

  const quellen: Quelle[] = ziele
    .filter((g) => g.id !== zielId)
    .map((g) => ({ typ: 'goal' as const, id: g.id, titel: g.title }))

  for (const initiative of daten.initiative) {
    const ziel = ziele.find((g) => g.id === initiative.goal_id)
    if (ziel == null) continue
    quellen.push({
      typ: 'initiative',
      id: initiative.id,
      titel: initiative.title,
      zielTitel: ziel.title,
    })
  }

  return quellen
}

/** Die Blockierer eines Ziels, mit Titel für die Anzeige. */
export function blockierer(
  daten: Daten,
  zielId: string,
): Array<Dependency & { titel: string }> {
  return daten.dependency
    .filter((d) => d.target_goal_id === zielId)
    .map((d) => {
      const titel =
        d.source_type === 'goal'
          ? (daten.goal.find((g) => g.id === d.source_id)?.title ?? '')
          : (daten.initiative.find((i) => i.id === d.source_id)?.title ?? '')
      return { ...d, titel }
    })
    .filter((d) => d.titel !== '')
}
