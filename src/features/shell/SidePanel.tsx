import { Panel, PanelBody, PanelHead } from '@/components/ui'
import { UI } from '@/content/texte'
import { EmptyState } from './EmptyState'

/**
 * S-06 Sidepanel, Liste.
 *
 * In Scheibe 1 ein Platzhalter: Panel in den Maßen aus Brief Abschnitt 4
 * (320 px, volle Höhe, 16 px Abstand zum Rand) mit dem leeren Zustand E-01.
 * Das Accordion Vision → Ziel → Initiative → Metrik kommt in Scheibe 2.
 */
export function SidePanel() {
  return (
    <aside className="shrink-0 p-4 pl-0">
      <Panel className="flex h-full flex-col">
        <PanelHead titel={UI.sidepanel.titelListe} />
        <PanelBody className="flex-1">
          <EmptyState text={UI.leer.keineVision} />
        </PanelBody>
      </Panel>
    </aside>
  )
}
