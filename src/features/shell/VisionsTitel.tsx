import { useState } from 'react'
import { E, UI } from '@/content/texte'
import { titelGueltig } from '@/lib/titel'
import type { Vision } from '@/lib/model'
import { useStore } from '@/store/useStore'

/**
 * Visionsname im Header, editierbar per Klick (US-02, Brief Abschnitt 4).
 * Enter oder Verlassen speichert; Escape verwirft. Leerer oder zu langer
 * Titel → E-06, keine Änderung.
 *
 * Bei mehreren Visionen steht daneben die Auswahl (A-21); die liegt in
 * VisionsAuswahl.
 */
export function VisionsTitel({ vision }: { vision: Vision }) {
  const { karteAendern } = useStore()
  const [bearbeitet, setBearbeitet] = useState(false)
  const [entwurf, setEntwurf] = useState(vision.title)
  const [fehler, setFehler] = useState<string | null>(null)

  function beginnen() {
    setEntwurf(vision.title)
    setFehler(null)
    setBearbeitet(true)
  }

  function speichern() {
    if (!titelGueltig(entwurf)) {
      setFehler(E['E-06'])
      return
    }
    karteAendern({ typ: 'vision', id: vision.id }, { title: entwurf.trim() })
    setBearbeitet(false)
    setFehler(null)
  }

  function abbrechen() {
    setBearbeitet(false)
    setFehler(null)
    setEntwurf(vision.title)
  }

  if (!bearbeitet) {
    return (
      <button
        type="button"
        className="visions-titel t-h3"
        onClick={beginnen}
        aria-label={`${UI.sidepanel.felder.titel}: ${vision.title}`}
      >
        {vision.title}
      </button>
    )
  }

  return (
    <div className="visions-titel-feld">
      <input
        className="input t-h3"
        value={entwurf}
        autoFocus
        aria-label={UI.sidepanel.felder.titel}
        aria-invalid={fehler != null || undefined}
        onChange={(e) => {
          setEntwurf(e.target.value)
          setFehler(null)
        }}
        onBlur={speichern}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            speichern()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            abbrechen()
          }
        }}
      />
      {fehler != null && (
        <p className="field-error" role="alert">
          {fehler}
        </p>
      )}
    </div>
  )
}
