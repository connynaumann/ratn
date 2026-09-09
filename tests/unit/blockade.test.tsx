import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AbhaengigkeitDialog } from '@/features/dialoge/AbhaengigkeitDialog'
import { BlockiertDurch } from '@/features/sidepanel/BlockiertDurch'
import { FilterInhalt } from '@/features/shell/FilterInhalt'
import { FilterPopover } from '@/features/shell/FilterPopover'
import type { Daten } from '@/lib/model'
import type { Vorgang } from '@/lib/warteschlange'
import { daten, dependency, goal, initiative, verknuepfe, vision } from './hilfen'
import { rendereMitStore } from './testStore'

/**
 * US-10 (S-10 und Kreisprüfung) und US-19 (Filter) an der Oberfläche.
 */

/** Eine Zielzeile in S-10; sie heißt „Ziel <Titel>“. */
function zielZeile(titel: string, darfFehlen = false) {
  const name = `Ziel ${titel}`
  return darfFehlen
    ? screen.queryByRole('button', { name })
    : screen.getByRole('button', { name })
}

const v = vision({ title: 'Freier bildender Künstler' })
const zielA = goal({ title: 'Professionalität', color: 'line-1' })
const zielB = goal({ title: 'Öffentlichkeit', color: 'line-2' })
const iA = initiative({ goal_id: zielA.id, title: 'Portfolio erstellen' })

function basis(mitAB = false): Daten {
  return daten({
    vision: [v],
    goal: [zielA, zielB],
    goal_vision: verknuepfe(v.id, [zielA, zielB]),
    initiative: [iA],
    dependency: mitAB
      ? [
          dependency({
            source_type: 'goal',
            source_id: zielA.id,
            target_goal_id: zielB.id,
          }),
        ]
      : [],
    settings: {
      owner_id: 'o',
      active_vision_id: v.id,
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

describe('S-10 · Abhängigkeit anlegen', () => {
  it('listet Ziele und Initiativen mit Suchfeld', () => {
    rendereMitStore(
      <AbhaengigkeitDialog zielId={zielB.id} onSchliessen={() => {}} />,
      basis(),
    )
    expect(screen.getByLabelText('Ziel oder Initiative suchen …')).toBeInTheDocument()
    // Jede Zeile nennt ihren Typ; bei Initiativen zusätzlich ihr Ziel, damit
    // gleichnamige unterscheidbar bleiben.
    expect(zielZeile('Professionalität')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Initiative Portfolio erstellen Professionalität' }),
    ).toBeInTheDocument()
    // Das blockierte Ziel steht nicht zur Wahl
    expect(
      screen.queryByRole('button', { name: 'Ziel Öffentlichkeit' }),
    ).not.toBeInTheDocument()
  })

  it('filtert über das Suchfeld', async () => {
    rendereMitStore(
      <AbhaengigkeitDialog zielId={zielB.id} onSchliessen={() => {}} />,
      basis(),
    )
    await userEvent.type(
      screen.getByLabelText('Ziel oder Initiative suchen …'),
      'Portfolio',
    )
    expect(
      screen.getByRole('button', { name: /Portfolio erstellen/ }),
    ).toBeInTheDocument()
    // Die Zielzeile fällt weg; „Professionalität“ bleibt nur als Elternangabe
    // der gefundenen Initiative stehen.
    expect(zielZeile('Professionalität', true)).toBeNull()
  })

  it('legt die Abhängigkeit an und schließt den Dialog', async () => {
    const vorgaenge: Vorgang[] = []
    const schliessen = vi.fn()
    rendereMitStore(
      <AbhaengigkeitDialog zielId={zielB.id} onSchliessen={schliessen} />,
      basis(),
      { vorgaenge },
    )
    await userEvent.click(zielZeile('Professionalität')!)
    expect(vorgaenge.at(-1)).toMatchObject({
      art: 'anlegen',
      tabelle: 'dependency',
      zeile: { source_type: 'goal', source_id: zielA.id, target_goal_id: zielB.id },
    })
    expect(schliessen).toHaveBeenCalled()
  })

  it('T-07: eine Quelle, die einen Kreis erzeugen würde, ist nicht wählbar', async () => {
    const vorgaenge: Vorgang[] = []
    // A blockiert bereits B; jetzt aus A heraus B als Blockierer wählen
    rendereMitStore(
      <AbhaengigkeitDialog zielId={zielA.id} onSchliessen={() => {}} />,
      basis(true),
      { vorgaenge },
    )
    const zeile = zielZeile('Öffentlichkeit')!
    expect(zeile).toBeDisabled()
    await userEvent.click(zeile)
    expect(vorgaenge).toHaveLength(0)
  })

  it('E-08 steht unter der Liste, sobald eine Quelle einen Kreis erzeugen würde', () => {
    rendereMitStore(
      <AbhaengigkeitDialog zielId={zielA.id} onSchliessen={() => {}} />,
      basis(true),
    )
    // Ein deaktivierter Knopf lässt sich nicht klicken; der Hinweis muss
    // deshalb von selbst dastehen (Brief Abschnitt 10: „Auswahl blockiert,
    // Hinweis unter dem Feld“).
    expect(screen.getByRole('status')).toHaveTextContent(
      'Diese Abhängigkeit würde einen Kreis erzeugen und ist nicht möglich.',
    )
    expect(zielZeile('Öffentlichkeit')).toHaveAttribute(
      'title',
      'Diese Abhängigkeit würde einen Kreis erzeugen und ist nicht möglich.',
    )
  })

  it('ohne drohenden Kreis steht kein Hinweis da', () => {
    rendereMitStore(
      <AbhaengigkeitDialog zielId={zielB.id} onSchliessen={() => {}} />,
      basis(),
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('eine schon bestehende Abhängigkeit ist nicht noch einmal wählbar', () => {
    rendereMitStore(
      <AbhaengigkeitDialog zielId={zielB.id} onSchliessen={() => {}} />,
      basis(true),
    )
    expect(zielZeile('Professionalität')).toBeDisabled()
  })
})

describe('„Blockiert durch“ im Detailpanel', () => {
  it('zeigt die Blockierer als Badge mit ×', () => {
    rendereMitStore(
      <BlockiertDurch zielId={zielB.id} onHinzufuegen={() => {}} />,
      basis(true),
    )
    expect(screen.getByText('Professionalität')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Löschen: Professionalität' }),
    ).toBeInTheDocument()
  })

  it('entfernt eine Abhängigkeit', async () => {
    const vorgaenge: Vorgang[] = []
    rendereMitStore(
      <BlockiertDurch zielId={zielB.id} onHinzufuegen={() => {}} />,
      basis(true),
      { vorgaenge },
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Löschen: Professionalität' }),
    )
    expect(vorgaenge.at(-1)).toMatchObject({
      art: 'loeschen',
      tabelle: 'dependency',
    })
  })

  it('„Hinzufügen“ öffnet S-10', async () => {
    const oeffnen = vi.fn()
    rendereMitStore(
      <BlockiertDurch zielId={zielB.id} onHinzufuegen={oeffnen} />,
      basis(),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    expect(oeffnen).toHaveBeenCalled()
  })
})

describe('US-19 · Filter', () => {
  it('zeigt Status und Ziele zur Mehrfachauswahl', () => {
    rendereMitStore(<FilterInhalt />, basis())
    expect(screen.getByRole('checkbox', { name: 'Blockiert' })).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Professionalität' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Öffentlichkeit' }),
    ).toBeInTheDocument()
  })

  it('meldet die Auswahl in die Einstellungen', async () => {
    const vorgaenge: Vorgang[] = []
    rendereMitStore(<FilterInhalt />, basis(), { vorgaenge })
    await userEvent.click(screen.getByRole('checkbox', { name: 'Blockiert' }))
    expect(vorgaenge.at(-1)).toMatchObject({
      tabelle: 'settings',
      felder: { filter_status: ['blockiert'] },
    })
  })

  it('meldet auch die Zielauswahl', async () => {
    const vorgaenge: Vorgang[] = []
    rendereMitStore(<FilterInhalt />, basis(), { vorgaenge })
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Professionalität' }),
    )
    expect(vorgaenge.at(-1)).toMatchObject({
      felder: { filter_goal_ids: [zielA.id] },
    })
  })

  it('„Zurücksetzen“ erscheint erst mit aktivem Filter und leert beide Kriterien', async () => {
    const vorgaenge: Vorgang[] = []
    rendereMitStore(<FilterInhalt />, basis(), { vorgaenge })
    expect(
      screen.queryByRole('button', { name: 'Zurücksetzen' }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Blockiert' }))
    await userEvent.click(screen.getByRole('button', { name: 'Zurücksetzen' }))
    expect(vorgaenge.at(-1)).toMatchObject({
      felder: { filter_status: [], filter_goal_ids: [] },
    })
  })

  /**
   * Der Popover-Rahmen bekommt genau einen Test, und der klickt mit fireEvent.
   * Radix rechnet beim Öffnen die Position aus und legt eine Schicht über das
   * Dokument, die jede Zeigerbewegung mithört – in jsdom kostet allein das
   * Rendern dieses Rahmens Sekunden. Alles Fachliche steckt in FilterInhalt
   * und wird oben ohne Radix geprüft.
   */
  it('der Knopf zeigt die Anzahl der Kriterien und öffnet den Inhalt', () => {
    const mitFilter = basis()
    mitFilter.settings!.filter_status = ['blockiert']
    mitFilter.settings!.filter_goal_ids = [zielA.id]
    rendereMitStore(<FilterPopover />, mitFilter)

    const knopf = screen.getByRole('button', { name: /Filter/ })
    expect(knopf).toHaveTextContent('2')

    fireEvent.click(knopf)
    expect(screen.getByRole('checkbox', { name: 'Blockiert' })).toBeChecked()
  })
})
