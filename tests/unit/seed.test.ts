import { describe, expect, it } from 'vitest'
import { baueSeedZeilen, SEED_REIHENFOLGE } from '@/lib/seed'
import type { Testdaten } from '@/lib/seed'
import roh from '../../docs/testdaten.json'

/**
 * Der Seed baut aus docs/testdaten.json fertige Insert-Zeilen. Geprüft wird,
 * was schiefgehen kann: verlorene Verweise, verletzte Constraints der
 * Migration, falsche Reihenfolge.
 */

const daten = roh as unknown as Testdaten

/** Feste IDs statt Zufall, damit sich Verweise nachvollziehen lassen. */
function zaehler() {
  let n = 0
  return () => `00000000-0000-4000-8000-${String((n += 1)).padStart(12, '0')}`
}

describe('baueSeedZeilen', () => {
  const zeilen = baueSeedZeilen(daten, zaehler())

  it('übernimmt jede Zeile aus docs/testdaten.json', () => {
    expect(zeilen.vision).toHaveLength(daten.vision.length)
    expect(zeilen.goal).toHaveLength(daten.goal.length)
    expect(zeilen.goal_vision).toHaveLength(daten.goal_vision.length)
    expect(zeilen.initiative).toHaveLength(daten.initiative.length)
    expect(zeilen.metric).toHaveLength(daten.metric.length)
    expect(zeilen.dependency).toHaveLength(daten.dependency.length)
  })

  it('entspricht der Aufstellung aus Brief Abschnitt 15', () => {
    expect(zeilen.vision).toHaveLength(2)
    expect(zeilen.goal).toHaveLength(6)
    expect(zeilen.initiative).toHaveLength(16)
    expect(zeilen.metric).toHaveLength(9)
    expect(zeilen.dependency).toHaveLength(2)
    // drei Ziele hängen an beiden Visionen: 6 + 3 = 9
    expect(zeilen.goal_vision).toHaveLength(9)
  })

  it('ersetzt alle Platzhalter-IDs durch UUIDs', () => {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    for (const v of zeilen.vision) expect(v.id).toMatch(uuid)
    for (const g of zeilen.goal) expect(g.id).toMatch(uuid)
    for (const i of zeilen.initiative) expect(i.id).toMatch(uuid)
    for (const m of zeilen.metric) expect(m.id).toMatch(uuid)
  })

  it('hält alle Verweise innerhalb des Satzes', () => {
    const visionIds = new Set(zeilen.vision.map((v) => v.id))
    const goalIds = new Set(zeilen.goal.map((g) => g.id))
    const initiativeIds = new Set(zeilen.initiative.map((i) => i.id))

    for (const gv of zeilen.goal_vision) {
      expect(goalIds.has(gv.goal_id)).toBe(true)
      expect(visionIds.has(gv.vision_id)).toBe(true)
    }
    for (const i of zeilen.initiative) expect(goalIds.has(i.goal_id)).toBe(true)
    for (const m of zeilen.metric) {
      expect(initiativeIds.has(m.initiative_id)).toBe(true)
    }
    for (const d of zeilen.dependency) {
      const quelle = d.source_type === 'goal' ? goalIds : initiativeIds
      expect(quelle.has(d.source_id)).toBe(true)
      expect(goalIds.has(d.target_goal_id)).toBe(true)
    }
    expect(visionIds.has(zeilen.settings.active_vision_id ?? '')).toBe(true)
  })

  it('schickt kein owner_id mit – das setzt die Datenbank', () => {
    const alle = [
      ...zeilen.vision,
      ...zeilen.goal,
      ...zeilen.goal_vision,
      ...zeilen.initiative,
      ...zeilen.metric,
      ...zeilen.dependency,
      zeilen.settings,
    ]
    for (const zeile of alle) {
      expect(Object.hasOwn(zeile, 'owner_id')).toBe(false)
    }
  })

  it('erfüllt die Constraints aus Migration 0001', () => {
    for (const g of zeilen.goal) {
      expect(g.color).toMatch(/^line-[1-8]$/)
    }
    for (const zeile of [...zeilen.vision, ...zeilen.goal, ...zeilen.initiative]) {
      expect(zeile.title.length).toBeGreaterThanOrEqual(1)
      expect(zeile.title.length).toBeLessThanOrEqual(80)
      if (zeile.end_date != null) {
        expect(zeile.end_date >= zeile.start_date!).toBe(true)
      }
    }
    for (const m of zeilen.metric) {
      // metric_values_pair: beide gesetzt oder beide leer
      expect(m.target_value == null).toBe(m.current_value == null)
      expect(m.title.length).toBeLessThanOrEqual(120)
      if (m.unit != null) expect(m.unit.length).toBeLessThanOrEqual(20)
    }
    for (const d of zeilen.dependency) {
      // dependency_no_self
      if (d.source_type === 'goal') {
        expect(d.source_id).not.toBe(d.target_goal_id)
      }
    }
  })

  it('erzeugt für jedes Ziel mindestens eine Vision (A-48)', () => {
    const verknuepft = new Set(zeilen.goal_vision.map((gv) => gv.goal_id))
    for (const g of zeilen.goal) expect(verknuepft.has(g.id!)).toBe(true)
  })

  it('meldet einen unbekannten Verweis statt still zu schreiben', () => {
    const kaputt: Testdaten = {
      ...daten,
      initiative: [{ ...daten.initiative[0]!, goal_id: 'gibtsnicht' }],
    }
    expect(() => baueSeedZeilen(kaputt, zaehler())).toThrow(/gibtsnicht/)
  })

  it('schreibt in einer Reihenfolge, die Fremdschlüssel erfüllt', () => {
    expect([...SEED_REIHENFOLGE]).toEqual([
      'vision',
      'goal',
      'goal_vision',
      'initiative',
      'metric',
      'dependency',
    ])
  })
})
