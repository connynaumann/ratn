/** Fügt Klassennamen zusammen und lässt leere Werte weg. */
export function cx(...teile: Array<string | false | null | undefined>): string {
  return teile.filter(Boolean).join(' ')
}
