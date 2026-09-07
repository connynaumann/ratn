import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Badge,
  Button,
  Checkbox,
  Field,
  Panel,
  PanelBody,
  PanelHead,
  PropRow,
  Segmented,
  Select,
  Tabs,
  Toggle,
  TreeRow,
} from '@/components/ui'

/**
 * US-21: die Basis-Komponenten tragen die Klassen des Design Systems und sind
 * per Tastatur bedienbar (Brief A-10). Geprüft werden Klassen und Verhalten,
 * nicht Pixel – der Vergleich mit der Design-System-Datei geschieht am
 * Schaukasten unter /dev/components.
 */

describe('Button', () => {
  it('trägt .btn und die Variante', () => {
    render(<Button variante="primary">Anlegen</Button>)
    const knopf = screen.getByRole('button', { name: 'Anlegen' })
    expect(knopf).toHaveClass('btn', 'btn-primary')
  })

  it('ist standardmäßig type="button", nicht submit', () => {
    render(<Button>Abbrechen</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('nimmt im deaktivierten Zustand keine Klicks an', async () => {
    const klick = vi.fn()
    render(
      <Button disabled onClick={klick}>
        Aus
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(klick).not.toHaveBeenCalled()
  })

  it('setzt die Größenklasse nur abseits von md', () => {
    const { rerender } = render(<Button groesse="sm">A</Button>)
    expect(screen.getByRole('button')).toHaveClass('sm')
    rerender(<Button groesse="md">A</Button>)
    expect(screen.getByRole('button').className).not.toContain('md')
  })
})

describe('Field', () => {
  it('verbindet Beschriftung und Feld', () => {
    render(<Field label="E-Mail-Adresse" />)
    expect(screen.getByLabelText('E-Mail-Adresse')).toHaveClass('input')
  })

  it('zeigt den Fehler und markiert das Feld', () => {
    render(<Field label="Titel" fehler="Bitte gib einen Titel ein." />)
    const feld = screen.getByLabelText('Titel')
    expect(feld).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Bitte gib einen Titel ein.',
    )
    expect(feld).toHaveAccessibleDescription('Bitte gib einen Titel ein.')
  })

  it('markiert ohne Fehler nichts', () => {
    render(<Field label="Titel" />)
    expect(screen.getByLabelText('Titel')).not.toHaveAttribute('aria-invalid')
  })
})

describe('Segmented', () => {
  it('markiert das aktive Segment mit .on', () => {
    render(
      <Segmented
        label="Layout"
        wert="sorted"
        onWechsel={() => {}}
        optionen={[
          { wert: 'flexible', text: 'Flexibel' },
          { wert: 'sorted', text: 'Sortiert' },
          { wert: 'net', text: 'Netz' },
        ]}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Sortiert' })).toHaveClass('on')
    expect(screen.getByRole('radio', { name: 'Flexibel' })).not.toHaveClass('on')
  })

  it('meldet den gewählten Wert', async () => {
    const wechsel = vi.fn()
    render(
      <Segmented
        label="Zeitskala"
        wert="week"
        onWechsel={wechsel}
        optionen={[
          { wert: 'week', text: 'Woche' },
          { wert: 'month', text: 'Monat' },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Monat' }))
    expect(wechsel).toHaveBeenCalledWith('month')
  })
})

describe('Tabs', () => {
  it('setzt aria-selected und .tab.on', () => {
    render(
      <Tabs
        label="Ansicht"
        wert="map"
        onWechsel={() => {}}
        optionen={[
          { wert: 'map', text: 'Map' },
          { wert: 'linear', text: 'Linear' },
        ]}
      />,
    )
    const aktiv = screen.getByRole('tab', { name: 'Map' })
    expect(aktiv).toHaveClass('tab', 'on')
    expect(aktiv).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Toggle', () => {
  it('ist ein Schalter mit aria-checked', () => {
    render(<Toggle an onWechsel={() => {}} label="manuell setzen" />)
    const schalter = screen.getByRole('switch', { name: 'manuell setzen' })
    expect(schalter).toHaveClass('toggle', 'on')
    expect(schalter).toBeChecked()
  })

  it('lässt sich mit der Tastatur bedienen', async () => {
    const wechsel = vi.fn()
    render(<Toggle an={false} onWechsel={wechsel} label="manuell setzen" />)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(wechsel).toHaveBeenCalledWith(true)
  })
})

describe('Checkbox', () => {
  it('ist eine Checkbox mit aria-checked', () => {
    render(<Checkbox an onWechsel={() => {}} label="Metrik erledigt" />)
    const box = screen.getByRole('checkbox', { name: 'Metrik erledigt' })
    expect(box).toHaveClass('check', 'on')
    expect(box).toBeChecked()
  })

  it('schaltet um', async () => {
    const wechsel = vi.fn()
    render(<Checkbox an onWechsel={wechsel} label="Metrik erledigt" />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(wechsel).toHaveBeenCalledWith(false)
  })
})

describe('Badge', () => {
  it('trägt .badge und optional .dot', () => {
    render(<Badge punkt>Blockiert</Badge>)
    expect(screen.getByText('Blockiert')).toHaveClass('badge', 'dot')
  })

  it('setzt die Farbe als Token, nicht als Farbwert', () => {
    render(<Badge farbToken="status-blockiert">Blockiert</Badge>)
    expect(screen.getByText('Blockiert')).toHaveStyle({
      color: 'var(--status-blockiert)',
    })
  })
})

describe('Panel', () => {
  it('baut Kopf, Trenner und Körper', async () => {
    const schliessen = vi.fn()
    render(
      <Panel>
        <PanelHead titel="Ziel" onSchliessen={schliessen} schliessenLabel="Schließen" />
        <PanelBody>
          <PropRow label="Titel" htmlFor="p-titel">
            <input id="p-titel" className="input" />
          </PropRow>
        </PanelBody>
      </Panel>,
    )
    expect(screen.getByText('Ziel')).toHaveClass('title')
    expect(screen.getByLabelText('Titel')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Schließen' }))
    expect(schliessen).toHaveBeenCalledTimes(1)
  })
})

describe('TreeRow', () => {
  it('zeigt Einzug, Auswahl und Statuspunkt', () => {
    render(
      <TreeRow
        text="Finanzierung"
        ebene={1}
        ausgewaehlt
        statusToken="status-begonnen"
        statusLabel="Begonnen"
      />,
    )
    const zeile = screen.getByRole('treeitem')
    expect(zeile).toHaveClass('tree-row', 'ind-1', 'sel')
    expect(screen.getByRole('img', { name: 'Begonnen' })).toHaveStyle({
      color: 'var(--status-begonnen)',
    })
  })

  it('reagiert auf Enter', async () => {
    const auswahl = vi.fn()
    render(<TreeRow text="Finanzierung" onAuswahl={auswahl} />)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(auswahl).toHaveBeenCalledTimes(1)
  })

  it('trennt Aufklappen von Auswählen', async () => {
    const auswahl = vi.fn()
    const aufklappen = vi.fn()
    render(
      <TreeRow
        text="Finanzierung"
        aufgeklappt={false}
        onAuswahl={auswahl}
        onAufklappen={aufklappen}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Aufklappen' }))
    expect(aufklappen).toHaveBeenCalledTimes(1)
    expect(auswahl).not.toHaveBeenCalled()
  })
})

describe('Select', () => {
  it('rendert die Optionen und trägt .input', () => {
    render(
      <Select
        aria-label="Status"
        optionen={[
          { wert: 'in_planung', text: 'In Planung' },
          { wert: 'begonnen', text: 'Begonnen' },
        ]}
      />,
    )
    const auswahl = screen.getByRole('combobox', { name: 'Status' })
    expect(auswahl).toHaveClass('input')
    expect(screen.getByRole('option', { name: 'Begonnen' })).toBeInTheDocument()
  })
})
