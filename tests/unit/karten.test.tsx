import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { KARTEN_TYPEN } from '@/features/map/Karten'
import { KartenAktionenContext } from '@/features/map/KartenAktionen'
import type { KartenAktionen } from '@/features/map/KartenAktionen'
import type { KartenDaten } from '@/features/map/knoten'
import type { Kartentyp } from '@/lib/model'
import { goal, initiative, metric, vision } from './hilfen'

/**
 * Die Karten aus Brief Abschnitt 4 (A-17) und das Hover-Plus (A-35).
 * Der Canvas selbst wird im Browser geprüft; hier geht es um Inhalt und
 * Verhalten einer einzelnen Karte.
 */

function zeige(
  typ: Kartentyp,
  daten: KartenDaten,
  aktionen: Partial<KartenAktionen> = {},
  selected = false,
) {
  const Karte = KARTEN_TYPEN[typ]
  const wert: KartenAktionen = {
    unterkarteAnlegen: vi.fn(),
    metrikWechseln: vi.fn(),
    ...aktionen,
  }
  const huelle = ({ children }: { children: ReactNode }) => (
    <ReactFlowProvider>
      <KartenAktionenContext.Provider value={wert}>
        {children}
      </KartenAktionenContext.Provider>
    </ReactFlowProvider>
  )
  const Huelle = huelle
  return render(
    <Huelle>
      {/* React Flow reicht sonst die vollen NodeProps durch; hier genügt das Nötige */}
      {/* @ts-expect-error – NodeProps von Hand gestellt */}
      <Karte id={`${typ}-1`} data={daten} selected={selected} />
    </Huelle>,
  )
}

const v = vision({ title: 'Freier bildender Künstler' })
const g = goal({ title: 'Professionalität', color: 'line-2', end_date: '2027-03-31' })
const i = initiative({
  title: 'Portfolio erstellen',
  status: 'abgeschlossen',
  priority: 'mittel',
  start_date: '2026-09-01',
  end_date: '2026-09-30',
})
const m = metric({ title: 'Werke fotografiert', current_value: 6, target_value: 12, unit: 'Stück' })

describe('Vision-Karte', () => {
  const daten: KartenDaten = {
    typ: 'vision',
    status: 'begonnen',
    fortschritt: 0.42,
    farbe: null,
    vision: v,
  }

  it('zeigt Titel, Status und Fortschritt', () => {
    zeige('vision', daten)
    expect(screen.getByText('Freier bildender Künstler')).toBeInTheDocument()
    expect(screen.getByText('Begonnen')).toBeInTheDocument()
    expect(screen.getByText('42 %')).toBeInTheDocument()
  })

  it('US-03: das Hover-Plus heißt „Neues Ziel“ und legt eines an', async () => {
    const unterkarteAnlegen = vi.fn()
    zeige('vision', daten, { unterkarteAnlegen })
    const plus = screen.getByRole('button', { name: 'Neues Ziel' })
    await userEvent.click(plus)
    expect(unterkarteAnlegen).toHaveBeenCalledWith('vision', 'vision-1')
  })

  it('zeigt den Auswahlrahmen, wenn sie gewählt ist', () => {
    const { container } = zeige('vision', daten, {}, true)
    expect(container.querySelector('.karte')).toHaveClass('karte-gewaehlt')
  })
})

describe('Ziel-Karte', () => {
  const daten: KartenDaten = {
    typ: 'goal',
    status: 'blockiert',
    fortschritt: 0.25,
    farbe: 'line-2',
    goal: g,
  }

  it('zeigt Titel, Status, Enddatum und Fortschritt in der Zielfarbe', () => {
    const { container } = zeige('goal', daten)
    expect(screen.getByText('Professionalität')).toBeInTheDocument()
    expect(screen.getByText('Blockiert')).toBeInTheDocument()
    expect(screen.getByText('31.03.2027')).toBeInTheDocument()
    expect(screen.getByText('25 %')).toBeInTheDocument()
    const fuellung = container.querySelector('.karte-balken-fuellung')
    expect(fuellung).toHaveStyle({ background: 'var(--line-2)', width: '25%' })
  })

  it('trägt den Farbstreifen in der Zielfarbe', () => {
    const { container } = zeige('goal', daten)
    expect(container.querySelector('.karte')).toHaveStyle({
      '--karte-farbe': 'var(--line-2)',
    })
    expect(container.querySelector('.karte-streifen')).toBeInTheDocument()
  })

  it('das Hover-Plus heißt „Neue Initiative“', async () => {
    const unterkarteAnlegen = vi.fn()
    zeige('goal', daten, { unterkarteAnlegen })
    await userEvent.click(screen.getByRole('button', { name: 'Neue Initiative' }))
    expect(unterkarteAnlegen).toHaveBeenCalledWith('goal', 'goal-1')
  })
})

describe('Initiativ-Karte', () => {
  const daten: KartenDaten = {
    typ: 'initiative',
    status: 'abgeschlossen',
    fortschritt: 1,
    farbe: 'line-2',
    initiative: i,
  }

  it('zeigt Titel, Status, Zeitraum und Priorität', () => {
    zeige('initiative', daten)
    expect(screen.getByText('Portfolio erstellen')).toBeInTheDocument()
    expect(screen.getByText('Abgeschlossen')).toBeInTheDocument()
    expect(screen.getByText(/01\.09\.2026/)).toBeInTheDocument()
    expect(screen.getByText(/30\.09\.2026/)).toBeInTheDocument()
    // Priorität mittel → Kürzel „M“
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('ohne Priorität kein Badge (A-17)', () => {
    zeige('initiative', {
      ...daten,
      initiative: { ...i, priority: null },
    })
    expect(screen.queryByText('M')).not.toBeInTheDocument()
  })

  it('das Hover-Plus heißt „Neue Metrik“', async () => {
    const unterkarteAnlegen = vi.fn()
    zeige('initiative', daten, { unterkarteAnlegen })
    await userEvent.click(screen.getByRole('button', { name: 'Neue Metrik' }))
    expect(unterkarteAnlegen).toHaveBeenCalledWith('initiative', 'initiative-1')
  })
})

describe('Metrik-Karte', () => {
  const daten: KartenDaten = {
    typ: 'metric',
    status: null,
    fortschritt: 0.5,
    farbe: 'line-2',
    metric: m,
  }

  it('zeigt Häkchen, Titel und ist/soll mit Einheit', () => {
    zeige('metric', daten)
    expect(screen.getByText('Werke fotografiert')).toBeInTheDocument()
    expect(screen.getByText('6 / 12 Stück')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Werke fotografiert' })).toBeInTheDocument()
  })

  it('US-05: Abhaken auf der Karte meldet die Änderung', async () => {
    const metrikWechseln = vi.fn()
    zeige('metric', daten, { metrikWechseln })
    await userEvent.click(screen.getByRole('checkbox'))
    expect(metrikWechseln).toHaveBeenCalledWith('metric-1', true)
  })

  it('zeigt das Häkchen gesetzt, wenn der Istwert den Sollwert erreicht', () => {
    zeige('metric', {
      ...daten,
      metric: { ...m, current_value: 12 },
    })
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('ohne Zahlenwerte keine Werteanzeige', () => {
    zeige('metric', {
      ...daten,
      metric: { ...m, current_value: null, target_value: null, unit: null },
    })
    expect(screen.queryByText(/\//)).not.toBeInTheDocument()
  })

  it('hat kein Hover-Plus – unter der Metrik kommt nichts mehr (A-35)', () => {
    zeige('metric', daten)
    expect(screen.queryByRole('button', { name: /Neue/ })).not.toBeInTheDocument()
  })
})
