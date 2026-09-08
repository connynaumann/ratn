import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEBOUNCE_MS,
  Schreiber,
  WIEDERHOLUNG_MS,
  verschmelze,
} from '@/lib/warteschlange'
import type { SpeicherZustand, Vorgang } from '@/lib/warteschlange'

/** US-22: automatisch speichern, bei Fehler E-03 und Neuversuch alle 10 s. */

const anlegen = (id: string, zeile: Record<string, unknown> = {}): Vorgang => ({
  art: 'anlegen',
  tabelle: 'goal',
  id,
  zeile: { id, ...zeile },
})
const aendern = (id: string, felder: Record<string, unknown>): Vorgang => ({
  art: 'aendern',
  tabelle: 'goal',
  id,
  felder,
})
const loeschen = (id: string): Vorgang => ({ art: 'loeschen', tabelle: 'goal', id })

describe('verschmelze', () => {
  it('hängt Vorgänge auf verschiedene Zeilen hintereinander', () => {
    const q = verschmelze(verschmelze([], anlegen('a')), anlegen('b'))
    expect(q.map((v) => v.id)).toEqual(['a', 'b'])
  })

  it('Ändern nach Anlegen wandert in die Anlege-Zeile', () => {
    const q = verschmelze([anlegen('a', { title: 'A' })], aendern('a', { title: 'B' }))
    expect(q).toHaveLength(1)
    expect(q[0]).toMatchObject({ art: 'anlegen', zeile: { title: 'B' } })
  })

  it('Ändern nach Ändern überlagert die Felder – letzter gewinnt', () => {
    const q = verschmelze(
      [aendern('a', { title: 'A', priority: 'hoch' })],
      aendern('a', { title: 'B' }),
    )
    expect(q).toHaveLength(1)
    expect(q[0]).toMatchObject({
      art: 'aendern',
      felder: { title: 'B', priority: 'hoch' },
    })
  })

  it('Löschen nach Anlegen entfernt beides', () => {
    expect(verschmelze([anlegen('a')], loeschen('a'))).toEqual([])
  })

  it('Löschen nach Ändern lässt nur das Löschen übrig', () => {
    const q = verschmelze([aendern('a', { title: 'A' })], loeschen('a'))
    expect(q).toEqual([loeschen('a')])
  })

  it('hält die Reihenfolge der übrigen Zeilen ein', () => {
    let q: Vorgang[] = []
    q = verschmelze(q, anlegen('vision'))
    q = verschmelze(q, anlegen('ziel'))
    q = verschmelze(q, aendern('vision', { title: 'neu' }))
    // Die Vision bleibt vorn: Fremdschlüssel verlangen sie vor dem Ziel.
    expect(q.map((v) => v.id)).toEqual(['vision', 'ziel'])
  })
})

describe('Schreiber', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function bau(senden: (v: Vorgang[]) => Promise<void>) {
    const zustaende: SpeicherZustand[] = []
    const schreiber = new Schreiber({
      senden,
      onZustand: (z) => zustaende.push(z),
    })
    return { schreiber, zustaende }
  }

  it('sammelt und schickt nach 500 ms gebündelt', async () => {
    const gesendet: Vorgang[][] = []
    const { schreiber, zustaende } = bau(async (v) => {
      gesendet.push(v)
    })

    schreiber.melde(aendern('a', { title: 'A' }))
    schreiber.melde(aendern('a', { title: 'B' }))
    schreiber.melde(aendern('b', { title: 'C' }))
    expect(gesendet).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
    expect(gesendet).toHaveLength(1)
    expect(gesendet[0]).toHaveLength(2)
    expect(gesendet[0]![0]).toMatchObject({ felder: { title: 'B' } })
    expect(zustaende.at(-1)).toBe('ruhig')
    schreiber.beenden()
  })

  it('US-22: nach spätestens 1 s ist geschrieben', async () => {
    let fertig = false
    const { schreiber } = bau(async () => {
      fertig = true
    })
    schreiber.melde(aendern('a', { title: 'A' }))
    await vi.advanceTimersByTimeAsync(1000)
    expect(fertig).toBe(true)
    schreiber.beenden()
  })

  it('E-03: meldet den Fehler und versucht es nach 10 s erneut', async () => {
    let versuche = 0
    const { schreiber, zustaende } = bau(async () => {
      versuche += 1
      if (versuche === 1) throw new Error('offline')
    })

    schreiber.melde(aendern('a', { title: 'A' }))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
    expect(versuche).toBe(1)
    expect(zustaende.at(-1)).toBe('fehler')
    expect(schreiber.offen).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(WIEDERHOLUNG_MS)
    expect(versuche).toBe(2)
    expect(zustaende.at(-1)).toBe('ruhig')
    expect(schreiber.offen).toHaveLength(0)
    schreiber.beenden()
  })

  it('verliert nichts, was während eines gescheiterten Laufs eingegeben wird', async () => {
    const gesendet: Vorgang[][] = []
    let versuche = 0
    const { schreiber } = bau(async (v) => {
      versuche += 1
      if (versuche === 1) {
        // Während des Laufs tippt die Nutzerin weiter
        schreiber.melde(aendern('a', { title: 'neuer Titel' }))
        throw new Error('offline')
      }
      gesendet.push(v)
    })

    schreiber.melde(aendern('a', { title: 'alt', priority: 'hoch' }))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
    await vi.advanceTimersByTimeAsync(WIEDERHOLUNG_MS)

    expect(gesendet).toHaveLength(1)
    // Die spätere Eingabe gewinnt, das übrige Feld bleibt erhalten
    expect(gesendet[0]![0]).toMatchObject({
      felder: { title: 'neuer Titel', priority: 'hoch' },
    })
    schreiber.beenden()
  })

  it('sendet auf Wunsch sofort', async () => {
    const gesendet: Vorgang[][] = []
    const { schreiber } = bau(async (v) => {
      gesendet.push(v)
    })
    schreiber.melde(aendern('a', { title: 'A' }))
    await schreiber.jetztSenden()
    expect(gesendet).toHaveLength(1)
    schreiber.beenden()
  })

  it('lässt einen zweiten Lauf den ersten nicht überholen', async () => {
    const reihenfolge: string[] = []
    // Der erste Lauf hängt, bis der Test ihn freigibt. Ein Halter statt einer
    // einfachen Variablen, damit die Zuweisung aus der Closure sichtbar bleibt.
    const halter: { freigeben: (() => void) | undefined } = {
      freigeben: undefined,
    }
    const { schreiber } = bau(async (v) => {
      reihenfolge.push(`start ${v[0]!.id}`)
      if (v[0]!.id === 'a') {
        await new Promise<void>((r) => {
          halter.freigeben = r
        })
      }
      reihenfolge.push(`ende ${v[0]!.id}`)
    })

    schreiber.melde(aendern('a', { title: 'A' }))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
    schreiber.melde(aendern('b', { title: 'B' }))
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
    expect(reihenfolge).toEqual(['start a'])

    halter.freigeben?.()
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS * 2)
    expect(reihenfolge).toEqual(['start a', 'ende a', 'start b', 'ende b'])
    schreiber.beenden()
  })
})
