import * as RadixDialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { UI } from '@/content/texte'

/**
 * Dialog nach Brief Abschnitt 4: `.panel` zentriert, 400 px, Overlay
 * rgba(0,0,0,.6).
 *
 * Radix übernimmt Fokusfalle, Escape, Klick daneben und aria-Attribute
 * (Brief Abschnitt 3, A-10). Das Aussehen kommt vollständig aus
 * components.css.
 */
type Props = {
  offen: boolean
  onOffenWechsel: (offen: boolean) => void
  titel: string
  /** Kurzbeschreibung für Screenreader, wenn der Titel allein zu knapp ist */
  beschreibung?: string
  children: ReactNode
  /** Buttonzeile unten */
  fuss: ReactNode
}

export function Dialog({
  offen,
  onOffenWechsel,
  titel,
  beschreibung,
  children,
  fuss,
}: Props) {
  return (
    <RadixDialog.Root open={offen} onOpenChange={onOffenWechsel}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="dialog-overlay" />
        <RadixDialog.Content className="panel dialog-panel">
          <div className="panel-head">
            <RadixDialog.Title className="title">{titel}</RadixDialog.Title>
            <RadixDialog.Close
              className="panel-close"
              aria-label={UI.dialog.abbrechen}
            >
              ×
            </RadixDialog.Close>
          </div>
          <div className="divider" />
          <div className="panel-body pt-4">
            {beschreibung != null && (
              <RadixDialog.Description className="t-label">
                {beschreibung}
              </RadixDialog.Description>
            )}
            {children}
            <div className="dialog-fuss">{fuss}</div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
