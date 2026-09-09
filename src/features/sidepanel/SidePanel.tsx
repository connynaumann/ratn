import { Panel, PanelBody, PanelHead } from '@/components/ui'
import { TX, TYP, UI } from '@/content/texte'
import type { Kartentyp, KartenRef, Vision } from '@/lib/model'
import { useStore } from '@/store/useStore'
import { Detail } from './Detail'
import { Liste } from './Liste'

/**
 * S-06 und S-07 im selben Panel: ohne Auswahl die Liste, mit Auswahl das
 * Detail. Der Fuß zeigt den Speicherstand (TX-02, TX-03).
 */
type Props = {
  vision: Vision | null
  onNeueKarte: (typ: Kartentyp, elternId: string) => void
  onLoeschen: (ref: KartenRef) => void
  onAbhaengigkeit: (zielId: string) => void
}

export function SidePanel({
  vision,
  onNeueKarte,
  onLoeschen,
  onAbhaengigkeit,
}: Props) {
  const { auswahl, waehleKarte, speicherZustand } = useStore()

  const imDetail = auswahl != null
  const fussText =
    speicherZustand === 'speichert'
      ? TX['TX-03']
      : speicherZustand === 'ruhig'
        ? TX['TX-02']
        : ''

  return (
    <aside className="shrink-0 p-4 pl-0">
      <Panel className="flex h-full flex-col">
        <PanelHead
          titel={imDetail ? TYP[auswahl.typ] : UI.sidepanel.titelListe}
          onSchliessen={imDetail ? () => waehleKarte(null) : undefined}
          schliessenLabel={UI.sidepanel.zurueckZurListe}
        />
        <div className="divider" />
        <PanelBody className="min-h-0 flex-1 overflow-y-auto pt-4">
          {vision == null ? (
            <p className="t-body" style={{ color: 'var(--text-secondary)' }}>
              {UI.leer.keineVision}
            </p>
          ) : imDetail ? (
            <Detail
              ref_={auswahl}
              onNeueMetrik={(id) => onNeueKarte('metric', id)}
              onLoeschen={onLoeschen}
              onAbhaengigkeit={onAbhaengigkeit}
            />
          ) : (
            <Liste vision={vision} onNeueKarte={onNeueKarte} />
          )}
        </PanelBody>
        <div className="panel-fuss">
          <span role="status">{fussText}</span>
        </div>
      </Panel>
    </aside>
  )
}
