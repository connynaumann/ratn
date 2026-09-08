import { describe, expect, it } from 'vitest'
import {
  betroffeneKarten,
  initiativeAnlegen,
  istZuordnungsFehler,
  karteAendern,
  karteLoeschen,
  metrikAnlegen,
  visionAnlegen,
  zielAnlegen,
  zielVisionZuordnen,
} from '@/lib/aktionen'
import { naechsteZielfarbe } from '@/lib/farben'
import { daten, dependency, goal, initiative, metric, verknuepfe, vision } from './hilfen'

/** Feste IDs statt Zufall, damit Verweise nachvollziehbar bleiben. */
function zaehler(praefix = 'neu') {
  let n = 0
  return () => `${praefix}-${(n += 1)}`
}

describe('Anlegen', () => {
  it('US-02: Vision mit Titel, Startdatum heute', () => {
    const { daten: neu, id, vorgaenge } = visionAnlegen(daten(), ' Kunst ', zaehler())
    expect(neu.vision).toHaveLength(1)
    expect(neu.vision[0]!.title).toBe('Kunst')
    expect(neu.vision[0]!.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(vorgaenge).toEqual([
      { art: 'anlegen', tabelle: 'vision', id, zeile: expect.any(Object) },
    ])
  })

  it('US-03: Ziel bekommt die nächste freie Farbe und eine Verknüpfung', () => {
    const v = vision()
    const { daten: neu, id } = zielAnlegen(
      daten({ vision: [v] }),
      v.id,
      'Finanzierung',
      zaehler(),
    )
    expect(neu.goal[0]!.color).toBe('line-1')
    expect(neu.goal_vision).toEqual([
      expect.objectContaining({ goal_id: id, vision_id: v.id, sort_index: 0 }),
    ])
    expect(neu.goal[0]!.status_override).toBeNull()
  })

  it('US-03: das neunte Ziel erhält wieder line-1', () => {
    const acht = Array.from({ length: 8 }, (_, i) =>
      goal({ color: `line-${i + 1}` }),
    )
    expect(naechsteZielfarbe(acht)).toBe('line-1')
  })

  it('vergibt Farben der Reihe nach und füllt Lücken', () => {
    expect(naechsteZielfarbe([])).toBe('line-1')
    expect(naechsteZielfarbe([goal({ color: 'line-1' })])).toBe('line-2')
    // line-2 wurde gelöscht: die Lücke wird zuerst wieder gefüllt
    expect(
      naechsteZielfarbe([goal({ color: 'line-1' }), goal({ color: 'line-3' })]),
    ).toBe('line-2')
  })

  it('US-04: Initiative gehört zu genau einem Ziel, Status In Planung', () => {
    const g = goal()
    const { daten: neu } = initiativeAnlegen(
      daten({ goal: [g] }),
      g.id,
      'Portfolio erstellen',
      zaehler(),
    )
    expect(neu.initiative[0]!.goal_id).toBe(g.id)
    expect(neu.initiative[0]!.status).toBe('in_planung')
    expect(neu.initiative[0]!.sort_index).toBe(0)
  })

  it('zählt sort_index je Ziel hoch', () => {
    const g = goal()
    const eins = initiativeAnlegen(daten({ goal: [g] }), g.id, 'A', zaehler('a'))
    const zwei = initiativeAnlegen(eins.daten, g.id, 'B', zaehler('b'))
    expect(zwei.daten.initiative.map((i) => i.sort_index)).toEqual([0, 1])
  })

  it('US-05: Metrik hängt an ihrer Initiative und ist offen', () => {
    const i = initiative()
    const { daten: neu } = metrikAnlegen(
      daten({ initiative: [i] }),
      i.id,
      'Portfolio liegt als PDF vor',
      zaehler(),
    )
    expect(neu.metric[0]!.initiative_id).toBe(i.id)
    expect(neu.metric[0]!.done).toBe(false)
    expect(neu.metric[0]!.target_value).toBeNull()
  })

  it('schickt kein owner_id mit – das setzt die Datenbank', () => {
    const { vorgaenge } = visionAnlegen(daten(), 'Kunst', zaehler())
    const zeile = (vorgaenge[0] as { zeile: Record<string, unknown> }).zeile
    expect(Object.hasOwn(zeile, 'owner_id')).toBe(false)
  })
})

describe('Ändern', () => {
  it('ändert nur die gemeinte Zeile und meldet genau ein Feld', () => {
    const a = goal({ title: 'A' })
    const b = goal({ title: 'B' })
    const { daten: neu, vorgaenge } = karteAendern(
      daten({ goal: [a, b] }),
      { typ: 'goal', id: b.id },
      { title: 'B neu' },
    )
    expect(neu.goal.map((g) => g.title)).toEqual(['A', 'B neu'])
    expect(vorgaenge).toEqual([
      { art: 'aendern', tabelle: 'goal', id: b.id, felder: { title: 'B neu' } },
    ])
  })
})

describe('Löschen (US-07, A-03)', () => {
  const v = vision()
  const g = goal()
  const i1 = initiative({ goal_id: g.id })
  const i2 = initiative({ goal_id: g.id })
  const m = metric({ initiative_id: i1.id })
  const basis = daten({
    vision: [v],
    goal: [g],
    goal_vision: verknuepfe(v.id, [g]),
    initiative: [i1, i2],
    metric: [m],
    dependency: [
      dependency({ source_type: 'initiative', source_id: i1.id, target_goal_id: g.id }),
    ],
  })

  it('T-15: Ziel mit 2 Initiativen nennt die richtige Anzahl', () => {
    // zwei Initiativen plus eine Metrik
    expect(betroffeneKarten(basis, { typ: 'goal', id: g.id })).toHaveLength(3)
  })

  it('Metrik allein hat keine Unterkarten', () => {
    expect(betroffeneKarten(basis, { typ: 'metric', id: m.id })).toHaveLength(0)
  })

  it('entfernt Ziel, Initiativen, Metriken und Abhängigkeiten', () => {
    const { daten: neu, vorgaenge } = karteLoeschen(basis, { typ: 'goal', id: g.id })
    expect(neu.goal).toHaveLength(0)
    expect(neu.initiative).toHaveLength(0)
    expect(neu.metric).toHaveLength(0)
    expect(neu.dependency).toHaveLength(0)
    expect(neu.goal_vision).toHaveLength(0)
    expect(neu.vision).toHaveLength(1)
    // Nur die oberste Zeile geht an die Datenbank; den Rest räumt sie selbst ab
    expect(vorgaenge).toEqual([
      { art: 'loeschen', tabelle: 'goal', id: g.id },
    ])
  })

  it('D-09: Vision löschen lässt ein Ziel stehen, das zu einer zweiten gehört', () => {
    const v2 = vision()
    const geteilt = goal()
    const eigen = goal()
    const d = daten({
      vision: [v, v2],
      goal: [geteilt, eigen],
      goal_vision: [
        ...verknuepfe(v.id, [geteilt, eigen]),
        ...verknuepfe(v2.id, [geteilt]),
      ],
      initiative: [initiative({ goal_id: eigen.id })],
    })
    // nur das eigene Ziel und seine Initiative verschwinden
    expect(betroffeneKarten(d, { typ: 'vision', id: v.id })).toHaveLength(2)

    const { daten: neu } = karteLoeschen(d, { typ: 'vision', id: v.id })
    expect(neu.goal.map((g) => g.id)).toEqual([geteilt.id])
    expect(neu.initiative).toHaveLength(0)
    expect(neu.goal_vision).toHaveLength(1)
  })
})

describe('Ziel ↔ Vision (US-25)', () => {
  const v1 = vision()
  const v2 = vision()
  const g = goal()
  const basis = daten({
    vision: [v1, v2],
    goal: [g],
    goal_vision: verknuepfe(v1.id, [g]),
  })

  it('hakt eine zweite Vision an', () => {
    const e = zielVisionZuordnen(basis, g.id, v2.id, true)
    expect(istZuordnungsFehler(e)).toBe(false)
    if (istZuordnungsFehler(e)) return
    expect(e.daten.goal_vision).toHaveLength(2)
    expect(e.vorgaenge[0]).toMatchObject({ art: 'anlegen', tabelle: 'goal_vision' })
  })

  it('entfernt eine Verknüpfung, wenn eine zweite bleibt', () => {
    const zwei = zielVisionZuordnen(basis, g.id, v2.id, true)
    if (istZuordnungsFehler(zwei)) throw new Error('unerwartet')
    const e = zielVisionZuordnen(zwei.daten, g.id, v1.id, false)
    if (istZuordnungsFehler(e)) throw new Error('unerwartet')
    expect(e.daten.goal_vision.map((gv) => gv.vision_id)).toEqual([v2.id])
    expect(e.vorgaenge[0]).toMatchObject({ art: 'loeschen', tabelle: 'goal_vision' })
  })

  it('E-14: die letzte Vision lässt sich nicht abwählen', () => {
    const e = zielVisionZuordnen(basis, g.id, v1.id, false)
    expect(istZuordnungsFehler(e)).toBe(true)
    expect(basis.goal_vision).toHaveLength(1)
  })

  it('doppeltes Anhaken ändert nichts', () => {
    const e = zielVisionZuordnen(basis, g.id, v1.id, true)
    if (istZuordnungsFehler(e)) throw new Error('unerwartet')
    expect(e.vorgaenge).toHaveLength(0)
    expect(e.daten.goal_vision).toHaveLength(1)
  })
})
