import type { Kartentyp } from '@/lib/model'

/**
 * Kartengrößen aus Brief Abschnitt 4 (A-17). Sie stehen hier als Zahlen und
 * nicht als Token, weil React Flow sie zum Rechnen braucht – für Fit to
 * Screen, für die Minimap und für die Position neuer Karten. Im Aussehen der
 * Karten kommen dieselben Werte aus map.css.
 */
export const KARTEN_MASSE: Record<Kartentyp, { breite: number; hoehe: number }> =
  {
    vision: { breite: 280, hoehe: 120 },
    goal: { breite: 240, hoehe: 100 },
    initiative: { breite: 220, hoehe: 84 },
    metric: { breite: 200, hoehe: 40 },
  }

/** Waagerechter Abstand zwischen einer Elternkarte und ihren Kindern. */
export const SPALTEN_ABSTAND = 80

/** Senkrechter Abstand zwischen Geschwisterkarten. */
export const ZEILEN_ABSTAND = 24

/**
 * Zoomgrenzen der Map (US-13: „zoomt die Map zwischen 10 % und 200 %“).
 * Als Konstanten, damit die Werte im Test festliegen – der Zoom selbst lässt
 * sich nur im echten Browser prüfen, nicht in jsdom.
 */
export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 2
