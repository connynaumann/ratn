import type { Kartentyp } from '@/lib/model'
import { KARTEN_MASSE, SPALTEN_ABSTAND, ZEILEN_ABSTAND } from './masse'

export type Punkt = { x: number; y: number }

/**
 * Position einer neu angelegten Karte im Layout „Flexibel“:
 * „neue Karten erscheinen rechts neben der Elternkarte“ (Brief Abschnitt 7).
 *
 * Das erste Kind liegt auf halber Höhe der Elternkarte, jedes weitere darunter.
 * `geschwister` ist die Anzahl der Kinder, die es vor der neuen schon gab.
 *
 * Bewusst nicht zentriert: würde der ganze Stapel bei jedem Anlegen neu
 * ausgerichtet, müssten bereits gesetzte Karten wandern. Im Layout „Flexibel“
 * gehören die Positionen aber Conny – einmal gezogen, bleiben sie stehen.
 *
 * Deshalb gilt auch: wurde ein Geschwister von Hand woanders hingezogen, kann
 * eine neue Karte an dessen alter Stelle landen. Sie lässt sich einfach
 * wegziehen; ein automatisches Ausweichen wäre in „Flexibel“ das größere
 * Ärgernis.
 */
export function neuePosition(
  eltern: { typ: Kartentyp; pos: Punkt },
  kindTyp: Kartentyp,
  geschwister: number,
): Punkt {
  const elternMass = KARTEN_MASSE[eltern.typ]
  const kindMass = KARTEN_MASSE[kindTyp]

  const x = eltern.pos.x + elternMass.breite + SPALTEN_ABSTAND
  const erstesOben =
    eltern.pos.y + elternMass.hoehe / 2 - kindMass.hoehe / 2
  const y = erstesOben + geschwister * (kindMass.hoehe + ZEILEN_ABSTAND)

  return { x, y: Math.round(y) }
}
