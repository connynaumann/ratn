import type { Goal, Zielfarbe } from './model'

/**
 * Zielfarben nach Brief A-13: acht Farben, automatisch in dieser Reihenfolge
 * vergeben, im Detailpanel änderbar. Ab dem neunten Ziel beginnt die Reihe von
 * vorn (US-03).
 */
export const ZIELFARBEN: readonly Zielfarbe[] = [
  'line-1',
  'line-2',
  'line-3',
  'line-4',
  'line-5',
  'line-6',
  'line-7',
  'line-8',
]

export function istZielfarbe(wert: string): wert is Zielfarbe {
  return (ZIELFARBEN as readonly string[]).includes(wert)
}

/**
 * Nächste freie Zielfarbe.
 *
 * „Frei“ heißt: von keinem bestehenden Ziel benutzt. Sind alle acht vergeben,
 * beginnt die Reihe von vorn – dann gewinnt die Farbe, die am seltensten
 * vorkommt, bei Gleichstand die frühere in der Reihenfolge. Für das neunte
 * Ziel ergibt das `line-1`, wie US-03 es verlangt.
 */
export function naechsteZielfarbe(bestehende: Goal[]): Zielfarbe {
  const anzahl = new Map<Zielfarbe, number>(ZIELFARBEN.map((f) => [f, 0]))
  for (const ziel of bestehende) {
    if (istZielfarbe(ziel.color)) {
      anzahl.set(ziel.color, (anzahl.get(ziel.color) ?? 0) + 1)
    }
  }
  let beste: Zielfarbe = ZIELFARBEN[0]!
  let kleinste = Number.POSITIVE_INFINITY
  for (const farbe of ZIELFARBEN) {
    const n = anzahl.get(farbe) ?? 0
    if (n < kleinste) {
      kleinste = n
      beste = farbe
    }
  }
  return beste
}
