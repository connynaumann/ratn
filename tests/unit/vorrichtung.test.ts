import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Die Prüfvorrichtung unter tests/fixture darf niemals im Produktivbuild
 * landen. Zwei Wege könnten sie hineinziehen:
 *   1. eine Datei unter src/ importiert aus tests/
 *   2. index.html verweist auf die Vorrichtung
 * Beides prüft dieser Test. Vite baut sonst nur index.html; alles andere
 * bleibt dem Entwicklungsserver vorbehalten, den Playwright selbst startet.
 */

const WURZEL = resolve(process.cwd())

function alleDateien(ordner: string): string[] {
  const gefunden: string[] = []
  for (const eintrag of readdirSync(ordner)) {
    const pfad = join(ordner, eintrag)
    if (statSync(pfad).isDirectory()) gefunden.push(...alleDateien(pfad))
    else gefunden.push(pfad)
  }
  return gefunden
}

describe('Prüfvorrichtung bleibt außerhalb der App', () => {
  it('keine Datei unter src/ importiert aus tests/', () => {
    const treffer: string[] = []
    for (const datei of alleDateien(join(WURZEL, 'src'))) {
      if (!/\.(ts|tsx)$/.test(datei)) continue
      const inhalt = readFileSync(datei, 'utf8')
      for (const zeile of inhalt.split('\n')) {
        if (/^\s*import .*from\s+['"].*\btests\//.test(zeile)) {
          treffer.push(`${relative(WURZEL, datei)}: ${zeile.trim()}`)
        }
      }
    }
    expect(treffer).toEqual([])
  })

  it('index.html verweist nur auf den echten Einstieg', () => {
    const inhalt = readFileSync(join(WURZEL, 'index.html'), 'utf8')
    expect(inhalt).toContain('/src/main.tsx')
    expect(inhalt).not.toContain('tests/')
  })

  it('die Vorrichtung liegt unter tests/fixture', () => {
    const html = readFileSync(
      join(WURZEL, 'tests', 'fixture', 'map.html'),
      'utf8',
    )
    expect(html).toContain('/tests/fixture/map.tsx')
  })
})
