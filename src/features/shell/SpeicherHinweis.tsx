import { E } from '@/content/texte'
import { useStore } from '@/store/useStore'

/**
 * E-03: Balken unter dem Header, solange Schreibvorgänge fehlschlagen.
 *
 * Er bleibt stehen, bis das Speichern gelingt; die Warteschlange versucht es
 * alle 10 Sekunden erneut (Brief Abschnitt 10, US-22).
 */
export function SpeicherHinweis() {
  const { speicherZustand } = useStore()
  if (speicherZustand !== 'fehler') return null
  return (
    <div className="speicher-hinweis" role="alert">
      {E['E-03']}
    </div>
  )
}
