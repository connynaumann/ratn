import { Select } from '@/components/ui'
import { UI } from '@/content/texte'
import { useStore } from '@/store/useStore'

/**
 * Auswahlmenü, sobald es mehr als eine Vision gibt (Brief A-21).
 * Map, Liste und Zähler zeigen immer nur die aktive Vision (D-09).
 */
export function VisionsAuswahl() {
  const { daten, aktiveVision, waehleVision } = useStore()
  if (daten.vision.length < 2 || aktiveVision == null) return null

  return (
    <Select
      className="visions-auswahl"
      aria-label={UI.header.visionWechseln}
      value={aktiveVision.id}
      optionen={daten.vision.map((v) => ({ wert: v.id, text: v.title }))}
      onChange={(e) => waehleVision(e.target.value)}
    />
  )
}
