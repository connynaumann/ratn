import { describe, expect, it } from 'vitest'
import { alsDeutschesDatum, enddatumGueltig, heute, istDatum } from '@/lib/datum'
import { METRIK_TITEL_MAX, TITEL_MAX, titelGueltig } from '@/lib/titel'

/** E-06 und E-10 – die beiden Feldprüfungen aus Brief Abschnitt 10. */

describe('Titel (E-06)', () => {
  it('nimmt 1 bis 80 Zeichen an', () => {
    expect(titelGueltig('A')).toBe(true)
    expect(titelGueltig('x'.repeat(TITEL_MAX))).toBe(true)
  })

  it('lehnt leer und nur Leerzeichen ab', () => {
    expect(titelGueltig('')).toBe(false)
    expect(titelGueltig('   ')).toBe(false)
  })

  it('lehnt mehr als 80 Zeichen ab', () => {
    expect(titelGueltig('x'.repeat(TITEL_MAX + 1))).toBe(false)
  })

  it('erlaubt bei Metriken 120 Zeichen', () => {
    const lang = 'x'.repeat(100)
    expect(titelGueltig(lang)).toBe(false)
    expect(titelGueltig(lang, METRIK_TITEL_MAX)).toBe(true)
  })
})

describe('Datum', () => {
  it('heute liefert JJJJ-MM-TT in der Zeitzone des Geräts', () => {
    expect(heute(new Date(2026, 8, 7, 23, 30))).toBe('2026-09-07')
    expect(heute(new Date(2026, 0, 1, 0, 15))).toBe('2026-01-01')
  })

  it('erkennt ungültige Daten', () => {
    expect(istDatum('2026-09-07')).toBe(true)
    expect(istDatum('2026-02-30')).toBe(false)
    expect(istDatum('2026-13-01')).toBe(false)
    expect(istDatum('07.09.2026')).toBe(false)
  })

  it('E-10: Enddatum darf nicht vor dem Startdatum liegen', () => {
    expect(enddatumGueltig('2026-09-01', '2026-09-30')).toBe(true)
    expect(enddatumGueltig('2026-09-01', '2026-09-01')).toBe(true)
    expect(enddatumGueltig('2026-09-30', '2026-09-01')).toBe(false)
  })

  it('ein leeres Enddatum ist erlaubt', () => {
    expect(enddatumGueltig('2026-09-01', null)).toBe(true)
    expect(enddatumGueltig('2026-09-01', '')).toBe(true)
  })

  it('zeigt Daten deutsch an', () => {
    expect(alsDeutschesDatum('2026-09-07')).toBe('07.09.2026')
    expect(alsDeutschesDatum(null)).toBe('')
  })
})
