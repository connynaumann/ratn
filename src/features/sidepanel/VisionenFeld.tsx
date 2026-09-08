import { useState } from 'react'
import { Checkbox } from '@/components/ui'
import { E } from '@/content/texte'
import { useStore } from '@/store/useStore'

/**
 * „Visionen“ im Detailpanel eines Ziels (US-25, Brief D-09).
 *
 * Mehrfachauswahl über alle Visionen; die verknüpften sind angehakt. Die
 * letzte Verknüpfung lässt sich nicht abwählen – sonst löschte die Datenbank
 * das Ziel samt Initiativen (Trigger goal_vision_delete_orphans). Stattdessen
 * erscheint E-14 und die Verknüpfung bleibt (Brief A-48).
 */
export function VisionenFeld({ goalId }: { goalId: string }) {
  const { daten, zielVisionZuordnen } = useStore()
  const [fehler, setFehler] = useState<string | null>(null)

  const verknuepft = new Set(
    daten.goal_vision.filter((gv) => gv.goal_id === goalId).map((gv) => gv.vision_id),
  )

  return (
    <div className="visionen-feld">
      {daten.vision.map((vision) => (
        <label key={vision.id} className="visionen-zeile">
          <Checkbox
            an={verknuepft.has(vision.id)}
            label={vision.title}
            onWechsel={(an) => {
              const ok = zielVisionZuordnen(goalId, vision.id, an)
              setFehler(ok ? null : E['E-14'])
            }}
          />
          <span className="t-label">{vision.title}</span>
        </label>
      ))}
      {fehler != null && (
        <p className="field-error" role="alert">
          {fehler}
        </p>
      )}
    </div>
  )
}
