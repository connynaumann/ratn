/**
 * Schreibwarteschlange für das automatische Speichern (US-22, Brief Abschnitt 3).
 *
 * Regeln aus dem Brief:
 * - Optimistisch im Client, Schreiben an Supabase mit 500 ms Verzögerung
 * - Bei Fehler: Hinweis E-03, Eingaben bleiben erhalten, Neuversuch alle 10 s
 * - Letzter Schreibvorgang gewinnt (Einzelnutzung)
 *
 * Der Kern ist reine Logik und ohne Netz testbar: `verschmelze` entscheidet,
 * wie sich zwei Vorgänge auf dieselbe Zeile zusammenfassen lassen. Die IDs
 * erzeugt der Client (crypto.randomUUID), deshalb steht schon beim Anlegen die
 * endgültige ID fest und ein späteres Ändern findet dieselbe Zeile.
 */

export type Tabelle =
  | 'vision'
  | 'goal'
  | 'goal_vision'
  | 'initiative'
  | 'metric'
  | 'dependency'
  | 'settings'

export type Vorgang =
  | { art: 'anlegen'; tabelle: Tabelle; id: string; zeile: Record<string, unknown> }
  | { art: 'aendern'; tabelle: Tabelle; id: string; felder: Record<string, unknown> }
  | { art: 'loeschen'; tabelle: Tabelle; id: string }

/** Schlüssel einer Zeile: Tabelle und ID zusammen. */
export function schluessel(v: Vorgang): string {
  return `${v.tabelle}:${v.id}`
}

/**
 * Fasst einen neuen Vorgang mit den bereits wartenden zusammen.
 *
 * - Ändern nach Anlegen → die Felder wandern in die Anlege-Zeile
 * - Ändern nach Ändern → Felder werden überlagert (letzter gewinnt)
 * - Löschen nach Anlegen → beides entfällt, die Zeile hat die Datenbank nie
 *   gesehen
 * - Löschen nach Ändern → nur das Löschen bleibt
 *
 * Die Reihenfolge der übrigen Vorgänge bleibt erhalten; das ist wichtig, weil
 * Fremdschlüssel eine Vision vor ihrem Ziel verlangen.
 */
export function verschmelze(warteschlange: Vorgang[], neu: Vorgang): Vorgang[] {
  const k = schluessel(neu)
  const index = warteschlange.findIndex((v) => schluessel(v) === k)
  if (index === -1) return [...warteschlange, neu]

  const alt = warteschlange[index]!
  const kopie = [...warteschlange]

  if (neu.art === 'loeschen') {
    if (alt.art === 'anlegen') {
      kopie.splice(index, 1)
      return kopie
    }
    kopie[index] = neu
    return kopie
  }

  if (neu.art === 'aendern') {
    if (alt.art === 'anlegen') {
      kopie[index] = {
        ...alt,
        zeile: { ...alt.zeile, ...neu.felder },
      }
      return kopie
    }
    if (alt.art === 'aendern') {
      kopie[index] = { ...alt, felder: { ...alt.felder, ...neu.felder } }
      return kopie
    }
    // Ändern nach Löschen ergibt keinen Sinn; der neue Vorgang gewinnt.
    kopie[index] = neu
    return kopie
  }

  // Anlegen auf eine Zeile, die schon wartet: der neue Vorgang gewinnt.
  kopie[index] = neu
  return kopie
}

export const DEBOUNCE_MS = 500
export const WIEDERHOLUNG_MS = 10_000

export type SpeicherZustand = 'ruhig' | 'speichert' | 'fehler'

export type Senden = (vorgaenge: Vorgang[]) => Promise<void>

type Optionen = {
  senden: Senden
  onZustand: (zustand: SpeicherZustand) => void
  debounceMs?: number
  wiederholungMs?: number
}

/**
 * Sammelt Vorgänge, schickt sie gebündelt und wiederholt bei Fehler.
 *
 * Bewusst kein React: so lässt sich der Ablauf mit falschen Zeitgebern prüfen,
 * ohne eine Komponente zu rendern.
 */
export class Schreiber {
  #warteschlange: Vorgang[] = []
  #laeuft = false
  #timer: ReturnType<typeof setTimeout> | null = null
  #optionen: Required<Optionen>

  constructor(optionen: Optionen) {
    this.#optionen = {
      debounceMs: DEBOUNCE_MS,
      wiederholungMs: WIEDERHOLUNG_MS,
      ...optionen,
    }
  }

  /** Nimmt einen Vorgang auf und plant das Senden. */
  melde(vorgang: Vorgang): void {
    this.#warteschlange = verschmelze(this.#warteschlange, vorgang)
    this.#optionen.onZustand('speichert')
    this.#plane(this.#optionen.debounceMs)
  }

  /** Wartende Vorgänge, für Tests und die Anzeige. */
  get offen(): Vorgang[] {
    return [...this.#warteschlange]
  }

  /** Sendet sofort, ohne auf die Verzögerung zu warten. */
  async jetztSenden(): Promise<void> {
    this.#stoppeTimer()
    await this.#senden()
  }

  /** Beendet alle Zeitgeber; für das Aufräumen in React. */
  beenden(): void {
    this.#stoppeTimer()
  }

  #plane(verzoegerung: number): void {
    this.#stoppeTimer()
    this.#timer = setTimeout(() => {
      this.#timer = null
      void this.#senden()
    }, verzoegerung)
  }

  #stoppeTimer(): void {
    if (this.#timer != null) {
      clearTimeout(this.#timer)
      this.#timer = null
    }
  }

  async #senden(): Promise<void> {
    if (this.#laeuft) {
      // Während eines Laufs Neues nicht überholen lassen; danach erneut planen.
      this.#plane(this.#optionen.debounceMs)
      return
    }
    if (this.#warteschlange.length === 0) {
      this.#optionen.onZustand('ruhig')
      return
    }

    const stapel = this.#warteschlange
    this.#warteschlange = []
    this.#laeuft = true
    this.#optionen.onZustand('speichert')

    try {
      await this.#optionen.senden(stapel)
      this.#laeuft = false
      if (this.#warteschlange.length > 0) {
        this.#plane(this.#optionen.debounceMs)
      } else {
        this.#optionen.onZustand('ruhig')
      }
    } catch {
      this.#laeuft = false
      // E-03: die Änderungen bleiben erhalten und werden weiter versucht.
      // Der fehlgeschlagene Stapel kommt zuerst zurück in die Schlange, damit
      // die Reihenfolge der Fremdschlüssel stimmt; anschließend werden die
      // inzwischen eingegangenen Vorgänge daraufgelegt, sodass für dieselbe
      // Zeile die neuere Eingabe gewinnt und nichts verloren geht.
      const wieder = stapel.reduce(
        (liste, vorgang) => verschmelze(liste, vorgang),
        [] as Vorgang[],
      )
      this.#warteschlange = this.#warteschlange.reduce(
        (liste, vorgang) => verschmelze(liste, vorgang),
        wieder,
      )
      this.#optionen.onZustand('fehler')
      this.#plane(this.#optionen.wiederholungMs)
    }
  }
}
