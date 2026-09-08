/**
 * Datumshilfen. In der Datenbank steht `date` als Text im Format JJJJ-MM-TT;
 * genauso arbeitet die Oberfläche, damit nichts über Zeitzonen verrutscht.
 */

/** Heutiges Datum in der Zeitzone des Geräts, als JJJJ-MM-TT. */
export function heute(jetzt: Date = new Date()): string {
  const jahr = jetzt.getFullYear()
  const monat = String(jetzt.getMonth() + 1).padStart(2, '0')
  const tag = String(jetzt.getDate()).padStart(2, '0')
  return `${jahr}-${monat}-${tag}`
}

/** Ist der Text ein gültiges Datum im Format JJJJ-MM-TT? */
export function istDatum(wert: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(wert)) return false
  const [jahr, monat, tag] = wert.split('-').map(Number) as [
    number,
    number,
    number,
  ]
  const d = new Date(Date.UTC(jahr, monat - 1, tag))
  return (
    d.getUTCFullYear() === jahr &&
    d.getUTCMonth() === monat - 1 &&
    d.getUTCDate() === tag
  )
}

/**
 * Prüfung für E-10: „Das Enddatum muss nach dem Startdatum liegen.“
 * Der Brief formuliert die Regel im Datenmodell als `end_date >= start_date`;
 * genau das prüft auch die Datenbank. Ein leeres Enddatum ist erlaubt.
 */
export function enddatumGueltig(
  startdatum: string,
  enddatum: string | null,
): boolean {
  if (enddatum == null || enddatum === '') return true
  if (!istDatum(enddatum) || !istDatum(startdatum)) return false
  return enddatum >= startdatum
}

/** Anzeige im Mono-Stil: 07.09.2026 */
export function alsDeutschesDatum(wert: string | null): string {
  if (wert == null || !istDatum(wert)) return ''
  const [jahr, monat, tag] = wert.split('-')
  return `${tag}.${monat}.${jahr}`
}
