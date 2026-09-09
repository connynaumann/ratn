import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import type { Daten } from '@/lib/model'
import type { SpeicherZustand, Vorgang } from '@/lib/warteschlange'
import { TestStore } from '../fixture/TestStore'

/**
 * Rendert eine Komponente im Test-Store. Der Store selbst liegt unter
 * tests/fixture, weil ihn auch die Playwright-Vorrichtung braucht.
 */
export function rendereMitStore(
  ui: ReactNode,
  start: Daten,
  optionen: { vorgaenge?: Vorgang[]; speicherZustand?: SpeicherZustand } = {},
) {
  return render(
    <TestStore
      start={start}
      vorgaenge={optionen.vorgaenge}
      speicherZustand={optionen.speicherZustand}
    >
      {ui}
    </TestStore>,
  )
}

export { TestStore }
