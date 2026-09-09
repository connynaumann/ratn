import { describe, expect, it } from 'vitest'
import { zaehleInitiativen } from '@/lib/zaehler'
import { berechneAlles } from '@/lib/status'
import { daten, goal, initiative, verknuepfe, vision } from './hilfen'

/** US-20 und A-40: der Zähler und seine Unabhängigkeit vom Filter. */

const v1 = vision()
const v2 = vision()
const zielA = goal()
const zielB = goal()
const nurV2 = goal()

const basis = daten({
  vision: [v1, v2],
  goal: [zielA, zielB, nurV2],
  goal_vision: [
    ...verknuepfe(v1.id, [zielA, zielB]),
    ...verknuepfe(v2.id, [nurV2]),
  ],
  initiative: [
    initiative({ goal_id: zielA.id, status: 'abgeschlossen' }),
    initiative({ goal_id: zielA.id, status: 'in_planung' }),
    initiative({ goal_id: zielB.id, status: 'begonnen' }),
    initiative({ goal_id: nurV2.id, status: 'abgeschlossen' }),
  ],
})

describe('US-20 · Zähler', () => {
  it('zählt die Initiativen der aktiven Vision', () => {
    expect(zaehleInitiativen(basis, berechneAlles(basis), v1.id)).toEqual({
      abgeschlossen: 1,
      gesamt: 3,
    })
  })

  it('zählt in der zweiten Vision nur deren Initiativen', () => {
    expect(zaehleInitiativen(basis, berechneAlles(basis), v2.id)).toEqual({
      abgeschlossen: 1,
      gesamt: 1,
    })
  })

  it('ohne Vision null von null', () => {
    expect(zaehleInitiativen(basis, berechneAlles(basis), null)).toEqual({
      abgeschlossen: 0,
      gesamt: 0,
    })
  })

  it('US-08: die letzte offene Initiative abschließen erhöht den Zähler um 1', () => {
    const vorher = zaehleInitiativen(basis, berechneAlles(basis), v1.id)
    const fertig = daten({
      ...basis,
      initiative: basis.initiative.map((i) =>
        i.goal_id === zielA.id ? { ...i, status: 'abgeschlossen' as const } : i,
      ),
    })
    const berechnet = berechneAlles(fertig)
    expect(zaehleInitiativen(fertig, berechnet, v1.id).abgeschlossen).toBe(
      vorher.abgeschlossen + 1,
    )
    // und das Ziel gilt jetzt als abgeschlossen
    expect(berechnet.status.get(zielA.id)).toBe('abgeschlossen')
  })

  it('A-40: der Filter ändert am Zähler nichts', () => {
    // Die Funktion nimmt den Filter gar nicht entgegen; der Test hält fest,
    // dass das Absicht ist und der Stand bei gesetztem Filter gleich bleibt.
    const mitFilter = daten({
      ...basis,
      settings: {
        owner_id: 'o',
        active_vision_id: v1.id,
        view: 'map',
        layout: 'flexible',
        timeline_scale: 'week',
        theme: 'dark',
        filter_status: ['blockiert'],
        filter_goal_ids: [zielB.id],
        updated_at: '2026-09-01T00:00:00Z',
      },
    })
    expect(zaehleInitiativen(mitFilter, berechneAlles(mitFilter), v1.id)).toEqual(
      { abgeschlossen: 1, gesamt: 3 },
    )
  })
})
