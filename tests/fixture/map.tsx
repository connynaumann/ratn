import { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/inter'
import '@xyflow/react/dist/style.css'
import '@/styles/tokens.css'
import '@/styles/theme.css'
import '@/styles/base.css'
import '@/styles/components.css'
import '@/styles/map.css'

import type { Daten } from '@/lib/model'
import { AppShell } from '@/features/shell/AppShell'
import { startdaten } from './startdaten'
import { TestStore } from './TestStore'

/**
 * Prüfvorrichtung für Playwright.
 *
 * Warum es sie gibt: Map-Verhalten – Zoomgrenzen, Fit to Screen, Ziehen –
 * lässt sich nur in einem echten Browser prüfen. jsdom hat keine Maße, und
 * die App selbst steht hinter dem Magic-Link-Login, den ein Test nicht
 * durchlaufen kann. Die Vorrichtung zeigt dieselbe Oberfläche mit denselben
 * Aktionen, nur mit den Daten aus docs/testdaten.json im Speicher.
 *
 * Sie wird nicht ausgeliefert: Vite baut nur index.html; diese Seite ist
 * ausschließlich über den Entwicklungsserver erreichbar, den Playwright
 * selbst startet.
 *
 * Der Zustand liegt in sessionStorage, damit ein Neuladen die gezogene
 * Position behält (Abnahmetest T-08). sessionStorage gehört zum Tab, also
 * startet jeder Playwright-Kontext von selbst wieder sauber. `?frisch`
 * erzwingt den Ausgangszustand.
 */
const SCHLUESSEL = 'system-map-vorrichtung'

function geladen(): Daten {
  if (new URLSearchParams(window.location.search).has('frisch')) {
    window.sessionStorage.removeItem(SCHLUESSEL)
    return startdaten()
  }
  try {
    const roh = window.sessionStorage.getItem(SCHLUESSEL)
    if (roh != null) return JSON.parse(roh) as Daten
  } catch {
    // Unlesbarer Stand: lieber frisch anfangen als raten.
  }
  return startdaten()
}

function Vorrichtung() {
  const [start] = useState(geladen)

  const sichern = useCallback((daten: Daten) => {
    try {
      window.sessionStorage.setItem(SCHLUESSEL, JSON.stringify(daten))
    } catch {
      // Ohne Sicherung läuft alles außer dem Neuladen-Test weiter.
    }
  }, [])

  return (
    <TestStore start={start} onDaten={sichern}>
      <AppShell />
    </TestStore>
  )
}

const wurzel = document.getElementById('root')
if (wurzel == null) throw new Error('Element #root fehlt')
createRoot(wurzel).render(<Vorrichtung />)
