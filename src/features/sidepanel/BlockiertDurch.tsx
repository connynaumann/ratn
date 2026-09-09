import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import { TYP, UI } from '@/content/texte'
import { blockierer } from '@/lib/abhaengigkeiten'
import { useStore } from '@/store/useStore'

/**
 * „Blockiert durch“ im Detailpanel eines Ziels (Brief Abschnitt 4):
 * Liste aus `.badge` je Abhängigkeit mit `×`, darunter `.btn-secondary sm`
 * „Hinzufügen“ (US-10).
 */
export function BlockiertDurch({
  zielId,
  onHinzufuegen,
}: {
  zielId: string
  onHinzufuegen: () => void
}) {
  const { daten, abhaengigkeitLoeschen } = useStore()
  const eintraege = blockierer(daten, zielId)

  return (
    <div className="blockiert-durch">
      {eintraege.map((eintrag) => (
        <span key={eintrag.id} className="badge blockade-badge">
          <span className="t-label">{TYP[eintrag.source_type]}</span>
          {eintrag.titel}
          <button
            type="button"
            className="blockade-weg"
            aria-label={`${UI.sidepanel.loeschen}: ${eintrag.titel}`}
            onClick={() => abhaengigkeitLoeschen(eintrag.id)}
          >
            <X size={12} strokeWidth={2} aria-hidden="true" />
          </button>
        </span>
      ))}
      <Button variante="secondary" groesse="sm" onClick={onHinzufuegen}>
        {UI.sidepanel.abhaengigkeitHinzufuegen}
      </Button>
    </div>
  )
}
