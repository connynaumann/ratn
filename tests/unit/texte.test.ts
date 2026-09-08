import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { E, SR, TX, PRIORITAET, STATUS, TYP, UI, fuelle } from '@/content/texte'

/**
 * CLAUDE.md, Arbeitsregel 6: Texte wörtlich aus docs/texte.md, referenziert
 * über ihre IDs. Dieser Test liest die Quelle und vergleicht zeichengenau.
 * Wer im Code eine Formulierung ändert, ohne docs/texte.md zu ändern, sieht
 * hier einen roten Test – und umgekehrt fällt eine vergessene Übernahme auf.
 */

// process.cwd() ist die Projektwurzel; import.meta.url liefert unter Vitest
// eine /@fs/-Adresse, die readFileSync nicht auflösen kann.
const QUELLE = readFileSync(resolve(process.cwd(), 'docs/texte.md'), 'utf8')

/** Liest „| E-01 | … | Text |“ und gibt die letzte Spalte zurück. */
function ausTabelle(id: string): string | null {
  const zeile = QUELLE.split('\n').find((z) =>
    z.trimStart().startsWith(`| ${id} |`),
  )
  if (zeile == null) return null
  const spalten = zeile.split('|').map((s) => s.trim())
  // spalten[0] ist leer (vor dem ersten |), die letzte ebenso
  return spalten[spalten.length - 2] ?? null
}

describe('Fehler und Hinweise (E-xx)', () => {
  it.each(Object.keys(E))('%s steht wörtlich in docs/texte.md', (id) => {
    expect(ausTabelle(id)).toBe(E[id as keyof typeof E])
  })

  it('deckt alle TX-IDs der Quelle ab', () => {
    const inQuelle = [...QUELLE.matchAll(/^\| (TX-\d+) \|/gm)].map((m) => m[1])
    expect(new Set(inQuelle)).toEqual(new Set(Object.keys(TX)))
  })

  it('deckt alle E-IDs der Quelle ab', () => {
    const inQuelle = [...QUELLE.matchAll(/^\| (E-\d+a?) \|/gm)].map((m) => m[1])
    expect(new Set(inQuelle)).toEqual(new Set(Object.keys(E)))
  })
})

describe('Statusmeldungen (TX-xx)', () => {
  it.each(Object.keys(TX))('%s steht wörtlich in docs/texte.md', (id) => {
    expect(ausTabelle(id)).toBe(TX[id as keyof typeof TX])
  })
})

describe('Assistive Texte (SR-xx)', () => {
  it.each(Object.keys(SR))('%s steht wörtlich in docs/texte.md', (id) => {
    expect(ausTabelle(id)).toBe(SR[id as keyof typeof SR])
  })

  it('deckt alle SR-IDs der Quelle ab', () => {
    const inQuelle = [...QUELLE.matchAll(/^\| (SR-\d+) \|/gm)].map((m) => m[1])
    expect(new Set(inQuelle)).toEqual(new Set(Object.keys(SR)))
  })
})

describe('Schlüsselwerte', () => {
  it.each(Object.entries(TYP))('Typ %s heißt %s', (schluessel, text) => {
    expect(ausTabelle(schluessel)).toBe(text)
  })

  it.each(Object.entries(STATUS))('Status %s heißt %s', (schluessel, text) => {
    expect(ausTabelle(schluessel)).toBe(text)
  })

  it('Prioritäten stimmen mit der Quelle überein', () => {
    // Zeile: | hoch | Hoch | H |
    for (const [schluessel, wert] of Object.entries(PRIORITAET)) {
      const zeile = QUELLE.split('\n').find((z) =>
        z.trimStart().startsWith(`| ${schluessel} |`),
      )
      expect(zeile, `Zeile für ${schluessel}`).toBeDefined()
      const spalten = (zeile ?? '').split('|').map((s) => s.trim())
      expect(spalten[2]).toBe(wert.text)
      expect(spalten[3]).toBe(wert.kuerzel)
    }
  })
})

describe('Beschriftungen im Sidepanel', () => {
  /** Die Zeile „Feldbeschriftungen“ listet die Labels mit · getrennt. */
  function ausListe(zeilenAnfang: string): string[] {
    const zeile = QUELLE.split('\n').find((z) =>
      z.trimStart().startsWith(`| ${zeilenAnfang} |`),
    )
    const spalten = (zeile ?? '').split('|').map((s) => s.trim())
    return (spalten[2] ?? '').split('·').map((s) => s.trim())
  }

  it('jede Feldbeschriftung im Code steht in docs/texte.md', () => {
    const quelle = ausListe('Feldbeschriftungen')
    for (const wert of Object.values(UI.sidepanel.felder)) {
      expect(quelle, `„${wert}“ fehlt in docs/texte.md`).toContain(wert)
    }
  })

  it('jede Abschnittsbeschriftung im Code steht in docs/texte.md', () => {
    const quelle = ausListe('Abschnittsbeschriftungen im Detail')
    for (const wert of Object.values(UI.sidepanel.abschnitte)) {
      expect(quelle, `„${wert}“ fehlt in docs/texte.md`).toContain(wert)
    }
  })
})

describe('Platzhalter einsetzen', () => {
  it('füllt TX-05 (Zähler)', () => {
    expect(fuelle(TX['TX-05'], { x: 12, y: 30 })).toBe(
      '12 / 30 Initiativen abgeschlossen',
    )
  })

  it('füllt E-07 (Löschen mit Unterkarten)', () => {
    expect(fuelle(E['E-07'], { Typ: 'Ziel', Titel: 'Finanzierung', n: 2 })).toBe(
      'Ziel „Finanzierung“ löschen? Damit werden auch 2 zugehörige Karten gelöscht. Das lässt sich nicht rückgängig machen.',
    )
  })

  it('lässt unbekannte Platzhalter stehen', () => {
    expect(fuelle('[a] und [b]', { a: 1 })).toBe('1 und [b]')
  })
})
