import { Button } from '@/components/ui'
import { UI } from '@/content/texte'
import { EmptyState } from './EmptyState'
import { Header } from './Header'
import { SidePanel } from './SidePanel'

/**
 * S-02 App-Rahmen: Header oben, Hauptfläche links, Sidepanel rechts.
 *
 * Scheibe 1 zeigt den leeren Zustand E-01. Der Knopf „Vision anlegen“ ist
 * sichtbar und deaktiviert – US-02 gehört zu Scheibe 2 (Antwort F-10).
 */
export function AppShell() {
  return (
    <div className="flex h-dvh flex-col" style={{ background: 'var(--bg-app)' }}>
      <Header titel={UI.login.titel} initiativenGesamt={0} initiativenAbgeschlossen={0} />
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <EmptyState
            text={UI.leer.keineVision}
            aktion={
              <Button variante="primary" disabled>
                {UI.leer.keineVisionButton}
              </Button>
            }
          />
        </main>
        <SidePanel />
      </div>
    </div>
  )
}
