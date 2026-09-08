/**
 * Auf- und zugeklappte Zeilen im Sidepanel.
 *
 * Der Zustand liegt im Browser, nicht in der Datenbank (Brief A-42): er gehört
 * zum Gerät, nicht zu den Daten. localStorage kann fehlschlagen – privates
 * Fenster, gesperrte Website-Daten –, deshalb ist jeder Zugriff abgesichert
 * und die Liste funktioniert auch ohne gespeicherten Stand.
 */
const SCHLUESSEL = 'system-map-zugeklappt'

export function ladeZugeklappt(): Set<string> {
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL)
    if (roh == null) return new Set()
    const liste: unknown = JSON.parse(roh)
    if (!Array.isArray(liste)) return new Set()
    return new Set(liste.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

export function speichereZugeklappt(ids: Set<string>): void {
  try {
    window.localStorage.setItem(SCHLUESSEL, JSON.stringify([...ids]))
  } catch {
    // Ohne gespeicherten Stand ist beim nächsten Laden alles aufgeklappt.
    // Das ist ein hinnehmbarer Verlust, kein Fehler für die Nutzerin.
  }
}
