import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { SidePanel } from '@/features/sidepanel/SidePanel'
import { SpeicherHinweis } from '@/features/shell/SpeicherHinweis'
import type { Daten } from '@/lib/model'
import type { Vorgang } from '@/lib/warteschlange'
import { daten, goal, initiative, metric, verknuepfe, vision } from './hilfen'
import { rendereMitStore } from './testStore'

/**
 * Die Akzeptanzkriterien aus US-06, US-07, US-18, US-22 und US-25 an der
 * echten Oberfläche – mit den echten Aktionen, ohne Netz.
 */

const v1 = vision({ title: 'Freier bildender Künstler' })
const v2 = vision({ title: 'Principal Product Designer' })
const zielA = goal({ title: 'Künstlerische Richtung', color: 'line-1' })
const zielB = goal({ title: 'Finanzierung', color: 'line-2' })
const i1 = initiative({ goal_id: zielA.id, title: 'Portfolio erstellen' })
const m1 = metric({ initiative_id: i1.id, title: 'Portfolio liegt als PDF vor' })

function basis(): Daten {
  return daten({
    vision: [v1, v2],
    goal: [zielA, zielB],
    goal_vision: [
      ...verknuepfe(v1.id, [zielA, zielB]),
      ...verknuepfe(v2.id, [zielB]),
    ],
    initiative: [i1],
    metric: [m1],
    settings: {
      owner_id: 'o',
      active_vision_id: v1.id,
      view: 'map',
      layout: 'flexible',
      timeline_scale: 'week',
      theme: 'dark',
      filter_status: [],
      filter_goal_ids: [],
      updated_at: '2026-09-01T00:00:00Z',
    },
  })
}

let vorgaenge: Vorgang[]

function zeige(start: Daten = basis()) {
  vorgaenge = []
  return rendereMitStore(
    <SidePanel vision={v1} onNeueKarte={() => {}} onLoeschen={() => {}} />,
    start,
    { vorgaenge },
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('US-18 · Liste als Accordion', () => {
  it('zeigt Vision, Ziele, Initiativen und Metriken mit Statuspunkt', async () => {
    zeige()
    const zeilen = screen.getAllByRole('treeitem')
    const texte = zeilen.map((z) => z.textContent)
    expect(texte.some((t) => t?.includes('Freier bildender Künstler'))).toBe(true)
    expect(texte.some((t) => t?.includes('Künstlerische Richtung'))).toBe(true)
    expect(texte.some((t) => t?.includes('Portfolio erstellen'))).toBe(true)
    expect(texte.some((t) => t?.includes('Portfolio liegt als PDF vor'))).toBe(true)

    // Statuspunkt an Vision, Ziel und Initiative; Metriken haben keinen Status
    expect(screen.getAllByRole('img', { name: 'In Planung' }).length).toBeGreaterThanOrEqual(3)
  })

  it('zeigt nur die Ziele der aktiven Vision', () => {
    zeige()
    // zielB hängt an beiden Visionen, ist hier also dabei
    expect(screen.getByText('Finanzierung')).toBeInTheDocument()
  })

  it('Klick auf eine Zeile öffnet das Detail', async () => {
    zeige()
    await userEvent.click(screen.getByText('Künstlerische Richtung'))
    expect(screen.getByLabelText('Titel')).toHaveValue('Künstlerische Richtung')
    // „Ziel“ steht zweimal: als Panel-Titel und als Wert der Zeile „Typ“
    expect(screen.getAllByText('Ziel')).toHaveLength(2)
  })

  it('A-42: ein zugeklapptes Ziel bleibt nach dem Neuaufbau zugeklappt', async () => {
    const { unmount } = zeige()
    const zielZeile = screen
      .getAllByRole('treeitem')
      .find((z) => z.textContent?.includes('Künstlerische Richtung'))!
    await userEvent.click(within(zielZeile).getByRole('button', { name: 'Zuklappen' }))
    expect(screen.queryByText('Portfolio erstellen')).not.toBeInTheDocument()

    unmount()
    zeige()
    expect(screen.queryByText('Portfolio erstellen')).not.toBeInTheDocument()
    expect(screen.getByText('Künstlerische Richtung')).toBeInTheDocument()
  })
})

describe('US-06 · Karte im Detailpanel bearbeiten', () => {
  it('zeigt die Felder aus Abschnitt 5 für ein Ziel', async () => {
    zeige()
    await userEvent.click(screen.getByText('Künstlerische Richtung'))
    for (const label of [
      'Titel',
      'Priorität',
      'Startdatum',
      'Enddatum',
      'Beschreibung',
    ]) {
      expect(screen.getByLabelText(label), label).toBeInTheDocument()
    }
    // „Status“ steht zweimal: als Abschnittsbeschriftung und als Feldname.
    // Bei einem Ziel ohne Übersteuerung ist der Wert Text, kein Auswahlfeld.
    expect(screen.getAllByText('Status')).toHaveLength(2)
    expect(screen.getByText('In Planung')).toBeInTheDocument()
    expect(screen.getByText('Farbe')).toBeInTheDocument()
    expect(screen.getByText('Fortschritt')).toBeInTheDocument()
    expect(screen.getByText('Visionen')).toBeInTheDocument()
  })

  it('eine Titeländerung wird gemeldet', async () => {
    zeige()
    await userEvent.click(screen.getByText('Künstlerische Richtung'))
    await userEvent.type(screen.getByLabelText('Titel'), '!')
    expect(vorgaenge.at(-1)).toMatchObject({
      art: 'aendern',
      tabelle: 'goal',
      felder: { title: 'Künstlerische Richtung!' },
    })
  })

  it('E-06: ein leerer Titel wird nicht gespeichert', async () => {
    zeige()
    await userEvent.click(screen.getByText('Künstlerische Richtung'))
    await userEvent.clear(screen.getByLabelText('Titel'))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Bitte gib einen Titel mit 1 bis 80 Zeichen ein.',
    )
    expect(vorgaenge).toHaveLength(0)
  })

  it('E-10: ein Enddatum vor dem Startdatum wird nicht übernommen', async () => {
    zeige()
    await userEvent.click(screen.getByText('Künstlerische Richtung'))
    const ende = screen.getByLabelText('Enddatum')
    await userEvent.type(ende, '2020-01-01')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Das Enddatum muss nach dem Startdatum liegen.',
    )
    expect(vorgaenge.some((v) => 'felder' in v && 'end_date' in v.felder)).toBe(
      false,
    )
  })

  it('Vision und Ziel zeigen den abgeleiteten Status, mit Schalter zum Übersteuern', async () => {
    zeige()
    await userEvent.click(screen.getByText('Künstlerische Richtung'))
    const schalter = screen.getByRole('switch', { name: 'manuell setzen' })
    expect(schalter).not.toBeChecked()
    // Ohne Übersteuerung steht der berechnete Status als Text da
    expect(screen.getByText('In Planung')).toBeInTheDocument()

    await userEvent.click(schalter)
    expect(vorgaenge.at(-1)).toMatchObject({
      felder: { status_override: 'in_planung' },
    })
  })

  it('bei einer Initiative wird der Status direkt gesetzt', async () => {
    zeige()
    await userEvent.click(screen.getByText('Portfolio erstellen'))
    expect(
      screen.queryByRole('switch', { name: 'manuell setzen' }),
    ).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'begonnen')
    expect(vorgaenge.at(-1)).toMatchObject({
      tabelle: 'initiative',
      felder: { status: 'begonnen' },
    })
  })
})

describe('US-05 · Metriken', () => {
  it('Abhaken hebt den Fortschritt der Initiative', async () => {
    zeige()
    await userEvent.click(screen.getByText('Portfolio erstellen'))
    expect(screen.getByText('0 %')).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Portfolio liegt als PDF vor' }),
    )
    expect(screen.getByText('100 %')).toBeInTheDocument()
  })

  it('Soll- und Istwert werden nur gemeinsam gesetzt', async () => {
    zeige()
    await userEvent.click(screen.getByText('Portfolio erstellen'))
    await userEvent.type(screen.getByLabelText('Sollwert'), '4')
    // Die Datenbank verlangt beide Werte oder keinen (metric_values_pair)
    expect(vorgaenge.at(-1)).toMatchObject({
      tabelle: 'metric',
      felder: { target_value: 4, current_value: 0 },
    })
  })
})

describe('US-25 · Ziel mehreren Visionen zuordnen', () => {
  it('zeigt alle Visionen, die verknüpften angehakt', async () => {
    zeige()
    await userEvent.click(screen.getByText('Finanzierung'))
    expect(
      screen.getByRole('checkbox', { name: 'Freier bildender Künstler' }),
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Principal Product Designer' }),
    ).toBeChecked()
  })

  it('entfernt eine Verknüpfung und behält die andere', async () => {
    zeige()
    await userEvent.click(screen.getByText('Finanzierung'))
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Principal Product Designer' }),
    )
    expect(
      screen.getByRole('checkbox', { name: 'Principal Product Designer' }),
    ).not.toBeChecked()
    expect(vorgaenge.at(-1)).toMatchObject({
      art: 'loeschen',
      tabelle: 'goal_vision',
    })
  })

  it('E-14: die letzte Vision lässt sich nicht abwählen', async () => {
    zeige()
    await userEvent.click(screen.getByText('Künstlerische Richtung'))
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Freier bildender Künstler' }),
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ein Ziel braucht mindestens eine Vision.',
    )
    expect(
      screen.getByRole('checkbox', { name: 'Freier bildender Künstler' }),
    ).toBeChecked()
    expect(vorgaenge).toHaveLength(0)
  })
})

describe('US-22 · Speicherstand im Fuß', () => {
  it('zeigt TX-02 in Ruhe', () => {
    zeige()
    expect(screen.getByRole('status')).toHaveTextContent('Gespeichert')
  })

  it('zeigt TX-03 während des Speicherns', () => {
    vorgaenge = []
    rendereMitStore(
      <SidePanel vision={v1} onNeueKarte={() => {}} onLoeschen={() => {}} />,
      basis(),
      { vorgaenge, speicherZustand: 'speichert' },
    )
    expect(screen.getByRole('status')).toHaveTextContent('Wird gespeichert …')
  })
})

describe('E-03 · Speicherhinweis', () => {
  it('bleibt weg, solange gespeichert wird', () => {
    rendereMitStore(<SpeicherHinweis />, basis(), { speicherZustand: 'speichert' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('erscheint als Balken, wenn das Speichern fehlschlägt', () => {
    rendereMitStore(<SpeicherHinweis />, basis(), { speicherZustand: 'fehler' })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Änderungen konnten nicht gespeichert werden. Wir versuchen es weiter.',
    )
  })
})
