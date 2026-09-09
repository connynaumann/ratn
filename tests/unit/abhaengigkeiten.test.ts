import { describe, expect, it } from 'vitest'
import {
  abhaengigkeitAnlegen,
  abhaengigkeitLoeschen,
  istAbhaengigkeitsFehler,
} from '@/lib/aktionen'
import {
  blockierer,
  existiertBereits,
  moeglicheQuellen,
  pruefeQuelle,
  wuerdeKreisErzeugen,
} from '@/lib/abhaengigkeiten'
import { berechneAlles } from '@/lib/status'
import { daten, dependency, goal, initiative, verknuepfe, vision } from './hilfen'

/** US-10: Ziel durch Abhängigkeit blockieren, mit Kreisprüfung (E-08). */

function zaehler() {
  let n = 0
  return () => `dep-${(n += 1)}`
}

const v = vision()
const a = goal({ title: 'A' })
const b = goal({ title: 'B' })
const c = goal({ title: 'C' })
const iA = initiative({ goal_id: a.id, title: 'Initiative in A' })
const basis = daten({
  vision: [v],
  goal: [a, b, c],
  goal_vision: verknuepfe(v.id, [a, b, c]),
  initiative: [iA],
})

describe('Kreisprüfung (E-08)', () => {
  it('erlaubt A → B, wenn nichts zurückführt', () => {
    expect(wuerdeKreisErzeugen(basis, { typ: 'goal', id: a.id }, b.id)).toBe(false)
  })

  it('T-07: verbietet B → A, wenn A → B bereits besteht', () => {
    const mitAB = daten({
      ...basis,
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
      ],
    })
    expect(wuerdeKreisErzeugen(mitAB, { typ: 'goal', id: b.id }, a.id)).toBe(true)
  })

  it('erkennt auch einen längeren Kreis A → B → C → A', () => {
    const kette = daten({
      ...basis,
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
        dependency({ source_type: 'goal', source_id: b.id, target_goal_id: c.id }),
      ],
    })
    expect(wuerdeKreisErzeugen(kette, { typ: 'goal', id: c.id }, a.id)).toBe(true)
    // Die Gegenrichtung schließt keinen Kreis
    expect(wuerdeKreisErzeugen(kette, { typ: 'goal', id: a.id }, c.id)).toBe(false)
  })

  it('ein Ziel kann sich nicht selbst blockieren', () => {
    expect(wuerdeKreisErzeugen(basis, { typ: 'goal', id: a.id }, a.id)).toBe(true)
    expect(pruefeQuelle(basis, { typ: 'goal', id: a.id }, a.id)).toBe('selbst')
  })

  it('A-24: eine Initiative darf ihr eigenes Ziel blockieren', () => {
    expect(wuerdeKreisErzeugen(basis, { typ: 'initiative', id: iA.id }, a.id)).toBe(
      false,
    )
    expect(pruefeQuelle(basis, { typ: 'initiative', id: iA.id }, a.id)).toBeNull()
  })

  it('eine Initiative erzeugt nie einen Kreis – sie ist nur Quelle', () => {
    const mitKette = daten({
      ...basis,
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
      ],
    })
    expect(
      wuerdeKreisErzeugen(mitKette, { typ: 'initiative', id: iA.id }, b.id),
    ).toBe(false)
  })
})

describe('Doppelte Abhängigkeiten', () => {
  const mitAB = daten({
    ...basis,
    dependency: [
      dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
    ],
  })

  it('erkennt eine bestehende Abhängigkeit', () => {
    expect(existiertBereits(mitAB, { typ: 'goal', id: a.id }, b.id)).toBe(true)
    expect(existiertBereits(mitAB, { typ: 'goal', id: c.id }, b.id)).toBe(false)
  })

  it('lehnt sie beim Anlegen ab', () => {
    expect(pruefeQuelle(mitAB, { typ: 'goal', id: a.id }, b.id)).toBe(
      'schon-vorhanden',
    )
  })
})

describe('Anlegen und Entfernen', () => {
  it('legt an und meldet genau einen Vorgang', () => {
    const e = abhaengigkeitAnlegen(basis, { typ: 'goal', id: a.id }, b.id, zaehler())
    expect(istAbhaengigkeitsFehler(e)).toBe(false)
    if (istAbhaengigkeitsFehler(e)) return
    expect(e.daten.dependency).toHaveLength(1)
    expect(e.daten.dependency[0]).toMatchObject({
      source_type: 'goal',
      source_id: a.id,
      target_goal_id: b.id,
    })
    expect(e.vorgaenge).toEqual([
      { art: 'anlegen', tabelle: 'dependency', id: 'dep-1', zeile: expect.any(Object) },
    ])
  })

  it('E-08: legt bei einem Kreis nichts an', () => {
    const mitAB = daten({
      ...basis,
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
      ],
    })
    const e = abhaengigkeitAnlegen(mitAB, { typ: 'goal', id: b.id }, a.id, zaehler())
    expect(e).toEqual({ fehler: 'kreis' })
    expect(mitAB.dependency).toHaveLength(1)
  })

  it('entfernt eine Abhängigkeit', () => {
    const d = dependency({
      source_type: 'goal',
      source_id: a.id,
      target_goal_id: b.id,
    })
    const e = abhaengigkeitLoeschen(daten({ ...basis, dependency: [d] }), d.id)
    expect(e.daten.dependency).toHaveLength(0)
    expect(e.vorgaenge).toEqual([
      { art: 'loeschen', tabelle: 'dependency', id: d.id },
    ])
  })
})

describe('Auswahl im Dialog S-10', () => {
  it('bietet die anderen Ziele und alle Initiativen der Vision an', () => {
    const quellen = moeglicheQuellen(basis, v.id, b.id)
    const ids = quellen.map((q) => q.id)
    expect(ids).toContain(a.id)
    expect(ids).toContain(c.id)
    expect(ids).toContain(iA.id)
    // Das blockierte Ziel selbst steht nicht zur Wahl
    expect(ids).not.toContain(b.id)
  })

  it('nennt bei Initiativen das Ziel, damit sie unterscheidbar sind', () => {
    const quelle = moeglicheQuellen(basis, v.id, b.id).find(
      (q) => q.id === iA.id,
    )
    expect(quelle?.zielTitel).toBe('A')
  })

  it('zeigt nur Karten der aktiven Vision', () => {
    const andere = vision()
    const fremdesZiel = goal({ title: 'Fremd' })
    const d = daten({
      ...basis,
      vision: [v, andere],
      goal: [a, b, c, fremdesZiel],
      goal_vision: [...verknuepfe(v.id, [a, b, c]), ...verknuepfe(andere.id, [fremdesZiel])],
    })
    expect(moeglicheQuellen(d, v.id, b.id).map((q) => q.id)).not.toContain(
      fremdesZiel.id,
    )
  })
})

describe('Blockierer eines Ziels', () => {
  it('nennt Titel von Zielen und Initiativen', () => {
    const d = daten({
      ...basis,
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
        dependency({
          source_type: 'initiative',
          source_id: iA.id,
          target_goal_id: b.id,
        }),
      ],
    })
    expect(blockierer(d, b.id).map((x) => x.titel)).toEqual([
      'A',
      'Initiative in A',
    ])
  })
})

describe('US-10: Wirkung auf den Status', () => {
  it('B ist blockiert, solange A offen ist – und wird frei, wenn A fertig ist', () => {
    const offen = daten({
      ...basis,
      dependency: [
        dependency({ source_type: 'goal', source_id: a.id, target_goal_id: b.id }),
      ],
    })
    expect(berechneAlles(offen).status.get(b.id)).toBe('blockiert')

    const fertig = daten({
      ...offen,
      initiative: [{ ...iA, status: 'abgeschlossen' as const }],
    })
    expect(berechneAlles(fertig).status.get(a.id)).toBe('abgeschlossen')
    expect(berechneAlles(fertig).status.get(b.id)).toBe('in_planung')
  })
})
