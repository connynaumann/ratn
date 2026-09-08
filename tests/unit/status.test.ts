import { describe, expect, it } from 'vitest'
import {
  alsProzent,
  berechneAlles,
  initiativeFortschritt,
  metrikErledigt,
  metrikFortschritt,
  zielFortschritt,
} from '@/lib/status'
import {
  daten,
  dependency,
  goal,
  initiative,
  metric,
  verknuepfe,
  vision,
} from './hilfen'

/**
 * Die Statustabelle aus Brief Abschnitt 5 und die Fortschrittsrechnung aus
 * A-27, Zeile für Zeile (CLAUDE.md, Arbeitsregel 4).
 */

describe('Status eines Ziels', () => {
  it('In Planung: ohne Initiativen', () => {
    const g = goal()
    const d = daten({ goal: [g] })
    expect(berechneAlles(d).status.get(g.id)).toBe('in_planung')
  })

  it('In Planung: alle Initiativen in Planung', () => {
    const g = goal()
    const d = daten({
      goal: [g],
      initiative: [
        initiative({ goal_id: g.id, status: 'in_planung' }),
        initiative({ goal_id: g.id, status: 'in_planung' }),
      ],
    })
    expect(berechneAlles(d).status.get(g.id)).toBe('in_planung')
  })

  it('Begonnen: mindestens eine Initiative begonnen', () => {
    const g = goal()
    const d = daten({
      goal: [g],
      initiative: [
        initiative({ goal_id: g.id, status: 'begonnen' }),
        initiative({ goal_id: g.id, status: 'in_planung' }),
      ],
    })
    expect(berechneAlles(d).status.get(g.id)).toBe('begonnen')
  })

  it('Begonnen: eine abgeschlossen, eine offen', () => {
    const g = goal()
    const d = daten({
      goal: [g],
      initiative: [
        initiative({ goal_id: g.id, status: 'abgeschlossen' }),
        initiative({ goal_id: g.id, status: 'in_planung' }),
      ],
    })
    expect(berechneAlles(d).status.get(g.id)).toBe('begonnen')
  })

  it('Abgeschlossen: mindestens eine Initiative und alle abgeschlossen', () => {
    const g = goal()
    const d = daten({
      goal: [g],
      initiative: [
        initiative({ goal_id: g.id, status: 'abgeschlossen' }),
        initiative({ goal_id: g.id, status: 'abgeschlossen' }),
      ],
    })
    expect(berechneAlles(d).status.get(g.id)).toBe('abgeschlossen')
  })

  it('Blockiert: eine Initiative ist blockiert', () => {
    const g = goal()
    const d = daten({
      goal: [g],
      initiative: [
        initiative({ goal_id: g.id, status: 'abgeschlossen' }),
        initiative({ goal_id: g.id, status: 'blockiert' }),
      ],
    })
    expect(berechneAlles(d).status.get(g.id)).toBe('blockiert')
  })

  it('Blockiert: Abhängigkeit von einem offenen Ziel', () => {
    const a = goal({ title: 'A' })
    const b = goal({ title: 'B' })
    const d = daten({
      goal: [a, b],
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
      ],
    })
    expect(berechneAlles(d).status.get(b.id)).toBe('blockiert')
  })

  it('nicht mehr blockiert, sobald die Quelle abgeschlossen ist', () => {
    const a = goal({ title: 'A' })
    const b = goal({ title: 'B' })
    const d = daten({
      goal: [a, b],
      initiative: [initiative({ goal_id: a.id, status: 'abgeschlossen' })],
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
      ],
    })
    expect(berechneAlles(d).status.get(a.id)).toBe('abgeschlossen')
    expect(berechneAlles(d).status.get(b.id)).toBe('in_planung')
  })

  it('Blockiert: Abhängigkeit von einer offenen Initiative', () => {
    const a = goal({ title: 'A' })
    const b = goal({ title: 'B' })
    const x = initiative({ goal_id: a.id, status: 'begonnen' })
    const d = daten({
      goal: [a, b],
      initiative: [x],
      dependency: [
        dependency({
          source_type: 'initiative',
          source_id: x.id,
          target_goal_id: b.id,
        }),
      ],
    })
    expect(berechneAlles(d).status.get(b.id)).toBe('blockiert')
  })

  it('status_override schlägt die Ableitung', () => {
    const g = goal({ status_override: 'abgeschlossen' })
    const d = daten({
      goal: [g],
      initiative: [initiative({ goal_id: g.id, status: 'in_planung' })],
    })
    expect(berechneAlles(d).status.get(g.id)).toBe('abgeschlossen')
  })
})

describe('Status einer Vision', () => {
  it('In Planung ohne Ziele', () => {
    const v = vision()
    expect(berechneAlles(daten({ vision: [v] })).status.get(v.id)).toBe(
      'in_planung',
    )
  })

  it('Abgeschlossen: mindestens ein Ziel und alle abgeschlossen', () => {
    const v = vision()
    const g = goal()
    const d = daten({
      vision: [v],
      goal: [g],
      goal_vision: verknuepfe(v.id, [g]),
      initiative: [initiative({ goal_id: g.id, status: 'abgeschlossen' })],
    })
    expect(berechneAlles(d).status.get(v.id)).toBe('abgeschlossen')
  })

  it('Begonnen, sobald ein Ziel blockiert ist – nie selbst blockiert (A-26)', () => {
    const v = vision()
    const a = goal()
    const b = goal()
    const d = daten({
      vision: [v],
      goal: [a, b],
      goal_vision: verknuepfe(v.id, [a, b]),
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
      ],
    })
    expect(berechneAlles(d).status.get(b.id)).toBe('blockiert')
    expect(berechneAlles(d).status.get(v.id)).toBe('begonnen')
  })

  it('zählt nur die verknüpften Ziele', () => {
    const v1 = vision()
    const v2 = vision()
    const fertig = goal()
    const offen = goal()
    const d = daten({
      vision: [v1, v2],
      goal: [fertig, offen],
      goal_vision: [...verknuepfe(v1.id, [fertig]), ...verknuepfe(v2.id, [offen])],
      initiative: [initiative({ goal_id: fertig.id, status: 'abgeschlossen' })],
    })
    const { status } = berechneAlles(d)
    expect(status.get(v1.id)).toBe('abgeschlossen')
    expect(status.get(v2.id)).toBe('in_planung')
  })

  it('ein geteiltes Ziel hat in beiden Visionen denselben Status (A-47)', () => {
    const v1 = vision()
    const v2 = vision()
    const geteilt = goal()
    const d = daten({
      vision: [v1, v2],
      goal: [geteilt],
      goal_vision: [...verknuepfe(v1.id, [geteilt]), ...verknuepfe(v2.id, [geteilt])],
      initiative: [initiative({ goal_id: geteilt.id, status: 'begonnen' })],
    })
    const { status } = berechneAlles(d)
    expect(status.get(geteilt.id)).toBe('begonnen')
    expect(status.get(v1.id)).toBe('begonnen')
    expect(status.get(v2.id)).toBe('begonnen')
  })
})

describe('Fortschritt (A-27)', () => {
  it('Metrik: erledigt = 100 %', () => {
    expect(metrikFortschritt(metric({ done: true }))).toBe(1)
  })

  it('Metrik: ist/soll', () => {
    expect(
      metrikFortschritt(metric({ current_value: 3, target_value: 4 })),
    ).toBe(0.75)
  })

  it('Metrik: ohne Werte 0 %', () => {
    expect(metrikFortschritt(metric())).toBe(0)
  })

  it('Metrik gilt als erledigt, wenn der Istwert den Sollwert erreicht (US-05)', () => {
    expect(metrikErledigt(metric({ current_value: 4, target_value: 4 }))).toBe(
      true,
    )
    expect(metrikErledigt(metric({ current_value: 3, target_value: 4 }))).toBe(
      false,
    )
  })

  it('US-11: 4 Metriken, 1 erledigt → 25 %', () => {
    const i = initiative()
    const metriken = [
      metric({ initiative_id: i.id, done: true }),
      metric({ initiative_id: i.id }),
      metric({ initiative_id: i.id }),
      metric({ initiative_id: i.id }),
    ]
    expect(initiativeFortschritt(i, metriken)).toBe(0.25)
  })

  it('Initiative ohne Metriken: nach Status', () => {
    expect(initiativeFortschritt(initiative({ status: 'abgeschlossen' }), [])).toBe(1)
    expect(initiativeFortschritt(initiative({ status: 'begonnen' }), [])).toBe(0.5)
    expect(initiativeFortschritt(initiative({ status: 'in_planung' }), [])).toBe(0)
  })

  it('US-11: Ziel mit 25 % und 75 % → 50 %', () => {
    expect(zielFortschritt([0.25, 0.75])).toBe(0.5)
  })

  it('US-11: Vision mit 50 % und 100 % → 75 %', () => {
    const v = vision()
    const halb = goal()
    const ganz = goal()
    const d = daten({
      vision: [v],
      goal: [halb, ganz],
      goal_vision: verknuepfe(v.id, [halb, ganz]),
      initiative: [
        initiative({ goal_id: halb.id, status: 'begonnen' }),
        initiative({ goal_id: ganz.id, status: 'abgeschlossen' }),
      ],
    })
    const { fortschritt } = berechneAlles(d)
    expect(alsProzent(fortschritt.get(halb.id) ?? 0)).toBe(50)
    expect(alsProzent(fortschritt.get(ganz.id) ?? 0)).toBe(100)
    expect(alsProzent(fortschritt.get(v.id) ?? 0)).toBe(75)
  })

  it('Ziel ohne Initiativen: 0 %', () => {
    expect(zielFortschritt([])).toBe(0)
  })
})
