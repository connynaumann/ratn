/**
 * Titelprüfung für E-06: „Bitte gib einen Titel mit 1 bis 80 Zeichen ein.“
 * Metriken erlauben 120 Zeichen (Abschnitt 5); dafür nimmt die Funktion die
 * Obergrenze als Parameter.
 */
export const TITEL_MAX = 80
export const METRIK_TITEL_MAX = 120

export function titelGueltig(wert: string, max: number = TITEL_MAX): boolean {
  const getrimmt = wert.trim()
  return getrimmt.length >= 1 && getrimmt.length <= max
}
