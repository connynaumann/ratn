import { describe, expect, it } from 'vitest'
import {
  LEERER_FILTER,
  anzahlKriterien,
  elternKette,
  istFilterAktiv,
  passtZumFilter,
  sichtbareImBaum,
} from '@/lib/filter'
import { berechneAlles } from '@/lib/status'
import { daten, goal, initiative, metric, verknuepfe, vision } from './hilfen'

/** US-19: Filter nach Status und nach Ziel (Brief A-39). */

const v = vision()
const zielA = goal({ title: 'A' })
const zielB = goal({ title: 'B' })
const offen = initiative({ goal_id: zielA.id, status: 'in_planung' })
const blockiert = initiative({ goal_id: zielB.id, status: 'blockiert' })
const m = metric({ initiative_id: offen.id })
const basis = daten({
  vision: [v],
  goal: [zielA, zielB],
  goal_vision: verknuepfe(v.id, [zielA, zielB]),
  initiative: [offen, blockiert],
  metric: [m],
})
const berechnet = berechneAlles(basis)

describe('Filterzustand', () => {
  it('ist ohne Kriterien nicht aktiv', () => {
    expect(istFilterAktiv(LEERER_FILTER)).toBe(false)
    expect(anzahlKriterien(LEERER_FILTER)).toBe(0)
  })

  it('zählt die Kriterien für das Badge am Knopf', () => {
    expect(
      anzahlKriterien({ status: ['blockiert', 'begonnen'], zielIds: [zielA.id] }),
    ).toBe(3)
  })
})

describe('Statusfilter', () => {
  const filter = { status: ['blockiert' as const], zielIds: [] }

  it('lässt nur blockierte Karten durch', () => {
    expect(
      passtZumFilter(basis, berechnet, { typ: 'initiative', id: blockiert.id }, filter),
    ).toBe(true)
    expect(
      passtZumFilter(basis, berechnet, { typ: 'initiative', id: offen.id }, filter),
    ).toBe(false)
  })

  it('lässt ein Ziel durch, dessen Status abgeleitet blockiert ist', () => {
    // zielB hat eine blockierte Initiative, ist also selbst blockiert
    expect(berechnet.status.get(zielB.id)).toBe('blockiert')
    expect(
      passtZumFilter(basis, berechnet, { typ: 'goal', id: zielB.id }, filter),
    ).toBe(true)
  })

  it('schließt Metriken aus – sie haben keinen Status', () => {
    expect(
      passtZumFilter(basis, berechnet, { typ: 'metric', id: m.id }, filter),
    ).toBe(false)
  })
})

describe('Zielfilter', () => {
  const filter = { status: [], zielIds: [zielA.id] }

  it('lässt das Ziel, seine Initiativen und deren Metriken durch', () => {
    expect(passtZumFilter(basis, berechnet, { typ: 'goal', id: zielA.id }, filter)).toBe(true)
    expect(
      passtZumFilter(basis, berechnet, { typ: 'initiative', id: offen.id }, filter),
    ).toBe(true)
    expect(passtZumFilter(basis, berechnet, { typ: 'metric', id: m.id }, filter)).toBe(true)
  })

  it('hält andere Ziele und deren Initiativen zurück', () => {
    expect(passtZumFilter(basis, berechnet, { typ: 'goal', id: zielB.id }, filter)).toBe(false)
    expect(
      passtZumFilter(basis, berechnet, { typ: 'initiative', id: blockiert.id }, filter),
    ).toBe(false)
  })

  it('schließt die Vision aus – sie gehört zu keinem Ziel', () => {
    expect(passtZumFilter(basis, berechnet, { typ: 'vision', id: v.id }, filter)).toBe(false)
  })
})

describe('Beide Kriterien zusammen', () => {
  it('eine Karte muss beiden genügen', () => {
    const filter = { status: ['blockiert' as const], zielIds: [zielA.id] }
    // blockiert liegt in Ziel B, passt also nicht zum Zielfilter
    expect(
      passtZumFilter(basis, berechnet, { typ: 'initiative', id: blockiert.id }, filter),
    ).toBe(false)
    // offen liegt in Ziel A, ist aber nicht blockiert
    expect(
      passtZumFilter(basis, berechnet, { typ: 'initiative', id: offen.id }, filter),
    ).toBe(false)
  })
})

describe('Elternkette', () => {
  it('führt von der Metrik bis zur Vision', () => {
    expect(elternKette(basis, { typ: 'metric', id: m.id })).toEqual([
      { typ: 'initiative', id: offen.id },
      { typ: 'goal', id: zielA.id },
      { typ: 'vision', id: v.id },
    ])
  })
})

describe('US-19: Sidepanel zeigt passende Karten und ihre Eltern', () => {
  it('gibt ohne Filter null zurück – dann ist alles sichtbar', () => {
    expect(sichtbareImBaum(basis, berechnet, LEERER_FILTER)).toBeNull()
  })

  it('behält die Eltern einer passenden Karte', () => {
    const sichtbar = sichtbareImBaum(basis, berechnet, {
      status: ['blockiert'],
      zielIds: [],
    })!
    expect(sichtbar.has(blockiert.id)).toBe(true)
    expect(sichtbar.has(zielB.id)).toBe(true)
    expect(sichtbar.has(v.id)).toBe(true)
    // Die nicht passenden Zweige bleiben draußen
    expect(sichtbar.has(offen.id)).toBe(false)
    expect(sichtbar.has(m.id)).toBe(false)
  })

  it('lässt Ziel A stehen, wenn nach Ziel A gefiltert wird', () => {
    const sichtbar = sichtbareImBaum(basis, berechnet, {
      status: [],
      zielIds: [zielA.id],
    })!
    expect([...sichtbar].sort()).toEqual(
      [v.id, zielA.id, offen.id, m.id].sort(),
    )
  })
})
