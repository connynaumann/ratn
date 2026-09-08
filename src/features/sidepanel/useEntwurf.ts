import { useEffect, useState } from 'react'

/**
 * Ein Feld, das beim Tippen sofort speichert, aber ungültige Zwischenstände
 * nicht durchreicht.
 *
 * Warum überhaupt ein lokaler Entwurf: das Titelfeld muss leer sein dürfen,
 * während die Nutzerin es neu schreibt. Ohne Entwurf würde der Store den alten
 * Titel sofort zurückschreiben und E-06 wäre nie sichtbar.
 *
 * `pruefen` gibt die Fehlermeldung zurück oder null. Nur gültige Werte gehen
 * an `speichern`; ungültige bleiben im Feld stehen und zeigen die Meldung.
 * Beim Verlassen wird ein ungültiger Wert auf den gespeicherten zurückgesetzt.
 */
export function useEntwurf(
  gespeichert: string,
  speichern: (wert: string) => void,
  pruefen: (wert: string) => string | null = () => null,
  /** Wechselt dieser Schlüssel, gilt eine andere Karte: Entwurf verwerfen. */
  schluessel?: string,
) {
  const [entwurf, setEntwurf] = useState(gespeichert)
  const [fehler, setFehler] = useState<string | null>(null)

  useEffect(() => {
    setEntwurf(gespeichert)
    setFehler(null)
    // Absicht: nur beim Kartenwechsel zurücksetzen, nicht bei jedem
    // Speichervorgang – sonst springt der Cursor beim Tippen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel])

  function aendern(wert: string) {
    setEntwurf(wert)
    const meldung = pruefen(wert)
    setFehler(meldung)
    if (meldung == null) speichern(wert)
  }

  function verlassen() {
    if (fehler != null) {
      setEntwurf(gespeichert)
      setFehler(null)
    }
  }

  return { entwurf, fehler, aendern, verlassen }
}
