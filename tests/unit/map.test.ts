import { describe, expect, it } from 'vitest'
import {
  KARTEN_MASSE,
  SPALTEN_ABSTAND,
  ZOOM_MAX,
  ZOOM_MIN,
} from '@/features/map/masse'
import { neuePosition } from '@/features/map/positionen'
import {
  KANTEN_BREITE,
  baueKanten,
  baueKarten,
  baueKartenIds,
} from '@/features/map/knoten'
import { berechneAlles } from '@/lib/status'
import {
  daten,
  dependency,
  goal,
  initiative,
  metric,
  verknuepfe,
  vision,
} from './hilfen'

/** Scheibe 3: welche Karten und Kanten entstehen, und wo liegt Neues. */

describe('Maße und Grenzen (Brief Abschnitt 4, US-13)', () => {
  it('hält die Kartengrößen aus A-17 ein', () => {
    expect(KARTEN_MASSE.vision).toEqual({ breite: 280, hoehe: 120 })
    expect(KARTEN_MASSE.goal).toEqual({ breite: 240, hoehe: 100 })
    expect(KARTEN_MASSE.initiative).toEqual({ breite: 220, hoehe: 84 })
    expect(KARTEN_MASSE.metric).toEqual({ breite: 200, hoehe: 40 })
  })

  it('zoomt zwischen 10 % und 200 %', () => {
    expect(ZOOM_MIN).toBe(0.1)
    expect(ZOOM_MAX).toBe(2)
  })
})

describe('Position neuer Karten (Brief Abschnitt 7)', () => {
  it('legt ein Ziel rechts neben die Vision', () => {
    const pos = neuePosition({ typ: 'vision', pos: { x: 0, y: 0 } }, 'goal', 0)
    expect(pos.x).toBe(KARTEN_MASSE.vision.breite + SPALTEN_ABSTAND)
  })

  it('setzt ein einzelnes Kind mittig zur Elternkarte', () => {
    const pos = neuePosition({ typ: 'vision', pos: { x: 0, y: 0 } }, 'goal', 0)
    // Mitte der Vision (60) minus halbe Zielhöhe (50)
    expect(pos.y).toBe(10)
  })

  it('stapelt Geschwister ohne Überlappung untereinander', () => {
    const eltern = { typ: 'vision' as const, pos: { x: 0, y: 0 } }
    const eins = neuePosition(eltern, 'goal', 0)
    const zwei = neuePosition(eltern, 'goal', 1)
    const drei = neuePosition(eltern, 'goal', 2)
    expect(zwei.y - eins.y).toBeGreaterThanOrEqual(KARTEN_MASSE.goal.hoehe)
    expect(drei.y - zwei.y).toBeGreaterThanOrEqual(KARTEN_MASSE.goal.hoehe)
    expect(eins.x).toBe(zwei.x)
  })

  it('rechnet von der Position der Elternkarte aus, nicht vom Ursprung', () => {
    const pos = neuePosition(
      { typ: 'goal', pos: { x: -500, y: 300 } },
      'initiative',
      0,
    )
    expect(pos.x).toBe(-500 + KARTEN_MASSE.goal.breite + SPALTEN_ABSTAND)
    expect(pos.y).toBeGreaterThan(300)
  })
})

describe('Karten der aktiven Vision (D-09)', () => {
  const v1 = vision()
  const v2 = vision()
  const geteilt = goal({ color: 'line-1' })
  const nurV2 = goal({ color: 'line-2' })
  const i1 = initiative({ goal_id: geteilt.id })
  const m1 = metric({ initiative_id: i1.id })
  const basis = daten({
    vision: [v1, v2],
    goal: [geteilt, nurV2],
    goal_vision: [
      ...verknuepfe(v1.id, [geteilt]),
      ...verknuepfe(v2.id, [geteilt, nurV2]),
    ],
    initiative: [i1],
    metric: [m1],
  })
  const berechnet = berechneAlles(basis)

  it('zeigt nur die Vision, ihre Ziele, deren Initiativen und Metriken', () => {
    const karten = baueKarten(basis, berechnet, v1.id)
    expect(karten.map((k) => k.id)).toEqual([v1.id, geteilt.id, i1.id, m1.id])
    expect(karten.map((k) => k.type)).toEqual([
      'vision',
      'goal',
      'initiative',
      'metric',
    ])
  })

  it('zeigt in der zweiten Vision auch deren eigenes Ziel', () => {
    const ids = baueKartenIds(basis, v2.id)
    expect(ids).toContain(nurV2.id)
    expect(ids).toContain(geteilt.id)
  })

  it('A-49: ein geteiltes Ziel liegt in beiden Visionen an derselben Stelle', () => {
    const inV1 = baueKarten(basis, berechnet, v1.id).find(
      (k) => k.id === geteilt.id,
    )
    const inV2 = baueKarten(basis, berechnet, v2.id).find(
      (k) => k.id === geteilt.id,
    )
    expect(inV1?.position).toEqual(inV2?.position)
  })

  it('gibt ohne aktive Vision nichts zurück', () => {
    expect(baueKarten(basis, berechnet, null)).toEqual([])
    expect(baueKarten(basis, berechnet, 'gibtsnicht')).toEqual([])
  })

  it('reicht Zielfarbe, Status und Fortschritt an die Karte durch', () => {
    const karten = baueKarten(basis, berechnet, v1.id)
    const zielKarte = karten.find((k) => k.id === geteilt.id)
    expect(zielKarte?.data.farbe).toBe('line-1')
    expect(zielKarte?.data.status).toBe('in_planung')
    // Initiative und Metrik erben die Farbe ihres Ziels
    expect(karten.find((k) => k.id === i1.id)?.data.farbe).toBe('line-1')
    expect(karten.find((k) => k.id === m1.id)?.data.farbe).toBe('line-1')
    // Die Vision hat keine Zielfarbe
    expect(karten.find((k) => k.id === v1.id)?.data.farbe).toBeNull()
  })

  it('nimmt die Positionen aus der Datenbank', () => {
    const gezogen = goal({ pos_x: 123, pos_y: -45 })
    const d = daten({
      vision: [v1],
      goal: [gezogen],
      goal_vision: verknuepfe(v1.id, [gezogen]),
    })
    const karte = baueKarten(d, berechneAlles(d), v1.id).find(
      (k) => k.id === gezogen.id,
    )
    expect(karte?.position).toEqual({ x: 123, y: -45 })
  })
})

describe('Kanten (A-18)', () => {
  const v = vision()
  const zielA = goal({ color: 'line-3' })
  const zielB = goal({ color: 'line-4' })
  const i = initiative({ goal_id: zielA.id })
  const m = metric({ initiative_id: i.id })
  const basis = daten({
    vision: [v],
    goal: [zielA, zielB],
    goal_vision: verknuepfe(v.id, [zielA, zielB]),
    initiative: [i],
    metric: [m],
    dependency: [
      dependency({
        source_type: 'goal',
        source_id: zielA.id,
        target_goal_id: zielB.id,
      }),
    ],
  })

  const kanten = baueKanten(basis, v.id)

  it('verbindet Vision → Ziel → Initiative → Metrik', () => {
    const paare = kanten.map((k) => `${k.source}→${k.target}`)
    expect(paare).toContain(`${v.id}→${zielA.id}`)
    expect(paare).toContain(`${zielA.id}→${i.id}`)
    expect(paare).toContain(`${i.id}→${m.id}`)
  })

  it('zeichnet Hierarchiekanten 6 px in der Zielfarbe', () => {
    const kante = kanten.find((k) => k.target === zielA.id)
    expect(kante?.style?.strokeWidth).toBe(KANTEN_BREITE.hierarchie)
    expect(kante?.style?.stroke).toBe('var(--line-3)')
  })

  it('zeichnet Metrik-Kanten mit 3 px', () => {
    const kante = kanten.find((k) => k.target === m.id)
    expect(kante?.style?.strokeWidth).toBe(KANTEN_BREITE.metrik)
  })

  it('zeichnet Blockaden gestrichelt in --danger mit Pfeilspitze', () => {
    const kante = kanten.find((k) => k.className === 'kante-blockade')
    expect(kante?.style?.stroke).toBe('var(--danger)')
    expect(kante?.style?.strokeWidth).toBe(KANTEN_BREITE.blockade)
    expect(kante?.markerEnd).toMatchObject({ type: 'arrowclosed' })
    expect(kante?.source).toBe(zielA.id)
    expect(kante?.target).toBe(zielB.id)
  })

  it('lässt Kanten weg, deren Karten nicht zur aktiven Vision gehören', () => {
    const andere = vision()
    const d = daten({ ...basis, vision: [v, andere] })
    expect(baueKanten(d, andere.id)).toEqual([])
  })

  it('vergibt eindeutige IDs', () => {
    const ids = kanten.map((k) => k.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
