import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Abnahmetest T-12, erster Teil (US-21):
 * „Suche nach #[0-9a-fA-F]{3,8} in src/ außer tokens.css → keine Treffer.“
 *
 * Der Scan schließt Kommentare ausdrücklich ein. Ein Farbwert, der nur in
 * einem Kommentar steht, gehört genauso wenig in den Komponentencode wie
 * einer im Regelwerk – und ein Test mit Ausnahmen für Kommentare wäre still
 * aufweichbar.
 */

// process.cwd() ist die Projektwurzel; import.meta.url liefert unter Vitest
// eine /@fs/-Adresse, die readFileSync nicht auflösen kann.
const WURZEL = resolve(process.cwd())
const SRC = join(WURZEL, 'src')
const TOKENS = join(SRC, 'styles', 'tokens.css')
const HEX = /#[0-9a-fA-F]{3,8}/g

/** Einzige erlaubte Ausnahme: die Datei, in der die Tokens definiert sind. */
const AUSNAHMEN = new Set([TOKENS])

function alleDateien(ordner: string): string[] {
  const gefunden: string[] = []
  for (const eintrag of readdirSync(ordner)) {
    const pfad = join(ordner, eintrag)
    if (statSync(pfad).isDirectory()) gefunden.push(...alleDateien(pfad))
    else gefunden.push(pfad)
  }
  return gefunden
}

describe('T-12 · keine Farbwerte außerhalb von tokens.css', () => {
  it('findet in src/ keinen Hex-Wert außer in tokens.css', () => {
    const treffer: string[] = []
    for (const datei of alleDateien(SRC)) {
      if (AUSNAHMEN.has(datei)) continue
      const inhalt = readFileSync(datei, 'utf8')
      for (const fund of inhalt.matchAll(HEX)) {
        treffer.push(`${relative(WURZEL, datei)}: ${fund[0]}`)
      }
    }
    expect(treffer).toEqual([])
  })

  it('tokens.css enthält die Farbwerte tatsächlich', () => {
    const inhalt = readFileSync(TOKENS, 'utf8')
    expect(inhalt.match(HEX)?.length ?? 0).toBeGreaterThan(20)
  })
})

describe('Tokens aus Brief Abschnitt 4 sind vollständig', () => {
  const inhalt = readFileSync(TOKENS, 'utf8')

  const ERWARTET = [
    // Hintergrund
    '--bg-app', '--bg-panel', '--bg-surface', '--bg-elevated', '--bg-input',
    '--bg-hover', '--bg-active',
    // Rahmen
    '--border-subtle', '--border-default', '--border-strong',
    // Text
    '--text-primary', '--text-secondary', '--text-tertiary', '--text-disabled',
    '--text-inverse',
    // Akzent und Semantik
    '--accent', '--accent-hover', '--accent-muted', '--teal', '--teal-deep',
    '--success', '--warning', '--danger',
    // Radius
    '--r-xs', '--r-sm', '--r-md', '--r-lg', '--r-xl', '--r-pill',
    // Abstände
    '--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-8', '--s-10',
    '--s-16',
    // Schatten und Schrift
    '--shadow-sm', '--shadow-md', '--shadow-lg', '--font-sans', '--font-mono',
    // Zusätze aus Brief A-51
    '--on-accent',
    '--status-in-planung', '--status-begonnen', '--status-abgeschlossen',
    '--status-blockiert',
  ]

  it.each(ERWARTET)('definiert %s', (token) => {
    expect(inhalt).toContain(`${token}:`)
  })

  it('definiert die acht Zielfarben aus A-13', () => {
    for (let nr = 1; nr <= 8; nr += 1) {
      expect(inhalt).toContain(`--line-${nr}:`)
    }
  })

  it('legt alle Tokens unter :root[data-theme="dark"] ab (A-44)', () => {
    expect(inhalt).toContain(":root[data-theme='dark']")
    // Kein zweiter Selektor: der helle Modus kommt später als eigener Block.
    const selektoren = inhalt.match(/^[^\s/*][^{]*\{/gm) ?? []
    expect(selektoren).toHaveLength(1)
  })
})
