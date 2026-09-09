/**
 * Alle Oberflächentexte, wörtlich aus docs/texte.md.
 *
 * Keine Formulierung im Komponentencode – nur Verweise auf diese Konstanten
 * (CLAUDE.md, Arbeitsregel 6). Neue Texte zuerst in docs/texte.md eintragen,
 * dann hier. tests/unit/texte.test.ts liest docs/texte.md und vergleicht jeden
 * Eintrag zeichengenau; wer hier etwas ändert, ohne die Quelle zu ändern,
 * bekommt einen roten Test.
 */

/** Fehler und Hinweise (E-xx) */
export const E = {
  'E-01': 'Noch keine Vision. Lege deine Vision an, um zu starten.',
  'E-02': 'Die Daten konnten nicht geladen werden. Bitte versuche es noch einmal.',
  'E-03': 'Änderungen konnten nicht gespeichert werden. Wir versuchen es weiter.',
  'E-04': 'Diese E-Mail-Adresse ist nicht freigegeben.',
  'E-05': 'Der Link ist abgelaufen. Fordere einen neuen an.',
  'E-06': 'Bitte gib einen Titel mit 1 bis 80 Zeichen ein.',
  'E-07': '[Typ] „[Titel]“ löschen? Damit werden auch [n] zugehörige Karten gelöscht. Das lässt sich nicht rückgängig machen.',
  'E-07a': '[Typ] „[Titel]“ löschen? Das lässt sich nicht rückgängig machen.',
  'E-08': 'Diese Abhängigkeit würde einen Kreis erzeugen und ist nicht möglich.',
  'E-09': 'Das Bild konnte nicht erstellt werden. Bitte versuche es noch einmal.',
  'E-10': 'Das Enddatum muss nach dem Startdatum liegen.',
  'E-11': 'Zum Verschieben das Layout „Flexibel“ wählen.',
  'E-12': 'Bitte melde dich erneut an.',
  'E-13': 'Die Datei konnte nicht gelesen werden. Bitte wähle einen Export aus System Map.',
  'E-14': 'Ein Ziel braucht mindestens eine Vision.',
} as const

/** Statusmeldungen und Bestätigungen (TX-xx) */
export const TX = {
  'TX-01': 'Wir haben dir einen Anmelde-Link geschickt. Prüfe dein Postfach.',
  'TX-02': 'Gespeichert',
  'TX-03': 'Wird gespeichert …',
  'TX-04': 'Status manuell gesetzt',
  'TX-05': '[x] / [y] Initiativen abgeschlossen',
  'TX-06': '[n] Karten importieren? Alle vorhandenen Daten werden ersetzt.',
  'TX-10': 'Keine Karten passen zum Filter.',
  'TX-11': '[p] %',
  'TX-12': 'Neues Ziel',
  'TX-13': 'Neue Initiative',
  'TX-14': 'Neue Metrik',
  'TX-15': 'Heute',
  'TX-16': '[ist] / [soll] [Einheit]',
  // Übergangstext: ab Scheibe 3 steht dort die Karte, dann entfällt TX-17.
  'TX-17':
    'Die Karte kommt später. Bis dahin arbeitest du in der Übersicht rechts.',
} as const

/**
 * Assistive Texte (SR-xx): nicht sichtbar, aber vorgelesen. Sie sind Text für
 * die Nutzerin und stehen deshalb genauso in docs/texte.md wie alles andere
 * (Brief A-10).
 */
export const SR = {
  'SR-01': 'Aufklappen',
  'SR-02': 'Zuklappen',
  'SR-03': 'Wird geladen …',
  'SR-04': 'Zielfarbe [n]',
  'SR-05': 'Hineinzoomen',
  'SR-06': 'Herauszoomen',
  'SR-07': 'Übersicht der ganzen Map',
} as const

/** Typbezeichnungen (TX-07a) */
export const TYP = {
  vision: 'Vision',
  goal: 'Ziel',
  initiative: 'Initiative',
  metric: 'Metrik',
} as const

/** Status (TX-08) */
export const STATUS = {
  in_planung: 'In Planung',
  begonnen: 'Begonnen',
  abgeschlossen: 'Abgeschlossen',
  blockiert: 'Blockiert',
} as const

/** Priorität (TX-09) – Kürzel erscheint als Badge auf der Karte */
export const PRIORITAET = {
  hoch: { text: 'Hoch', kuerzel: 'H' },
  mittel: { text: 'Mittel', kuerzel: 'M' },
  niedrig: { text: 'Niedrig', kuerzel: 'N' },
  null: { text: 'Keine', kuerzel: '–' },
} as const

/** Buttons und Beschriftungen (TX-07) */
export const UI = {
  header: {
    view: { map: 'Map', linear: 'Linear' },
    layout: { flexible: 'Flexibel', sorted: 'Sortiert', net: 'Netz' },
    zeitskala: { week: 'Woche', month: 'Monat' },
    fitToScreen: 'Fit to Screen',
    pngExport: 'Als PNG speichern',
    filter: 'Filter',
    filterZuruecksetzen: 'Zurücksetzen',
    menue: 'Menü',
    datenExportieren: 'Daten exportieren',
    datenImportieren: 'Daten importieren',
    abmelden: 'Abmelden',
    visionWechseln: 'Vision wechseln',
    neueVision: 'Neue Vision',
  },
  sidepanel: {
    titelListe: 'Übersicht',
    zurueckZurListe: 'Zurück zur Liste',
    abschnitte: {
      allgemein: 'Allgemein',
      status: 'Status',
      zeitraum: 'Zeitraum',
      metriken: 'Metriken',
      abhaengigkeiten: 'Abhängigkeiten',
    },
    felder: {
      titel: 'Titel',
      beschreibung: 'Beschreibung',
      status: 'Status',
      prioritaet: 'Priorität',
      startdatum: 'Startdatum',
      enddatum: 'Enddatum',
      farbe: 'Farbe',
      fortschritt: 'Fortschritt',
      blockiertDurch: 'Blockiert durch',
      typ: 'Typ',
      visionen: 'Visionen',
    },
    manuellSetzen: 'manuell setzen',
    abhaengigkeitHinzufuegen: 'Hinzufügen',
    metrikHinzufuegen: 'Neue Metrik',
    sollwert: 'Sollwert',
    istwert: 'Istwert',
    einheit: 'Einheit',
    loeschen: 'Löschen',
  },
  dialog: {
    neueVision: 'Neue Vision',
    neuesZiel: 'Neues Ziel',
    neueInitiative: 'Neue Initiative',
    neueMetrik: 'Neue Metrik',
    feldTitel: 'Titel',
    anlegen: 'Anlegen',
    abbrechen: 'Abbrechen',
    loeschenTitel: 'Löschen?',
    loeschen: 'Löschen',
    abhaengigkeitTitel: 'Blockiert durch',
    abhaengigkeitSuche: 'Ziel oder Initiative suchen …',
    importieren: 'Importieren',
    dateiWaehlen: 'Datei wählen',
  },
  login: {
    titel: 'System Map',
    feld: 'E-Mail-Adresse',
    button: 'Link senden',
  },
  leer: {
    keineVision: E['E-01'],
    keineVisionButton: 'Vision anlegen',
    zielOhneInitiativen: 'Noch keine Initiativen.',
    zielOhneInitiativenButton: 'Neue Initiative',
    initiativeOhneMetriken: 'Keine Metriken. Optional.',
    initiativeOhneMetrikenButton: 'Neue Metrik',
    linearOhneZiele: 'Noch keine Ziele mit Zeitraum.',
  },
  fehlerErneutLaden: 'Erneut laden',
} as const

/**
 * Setzt Platzhalter der Form [name] ein.
 * fuelle(TX['TX-05'], { x: 12, y: 30 }) → „12 / 30 Initiativen abgeschlossen“
 */
export function fuelle(
  vorlage: string,
  werte: Record<string, string | number>,
): string {
  return vorlage.replace(/\[(\w+)\]/g, (treffer, name: string) =>
    name in werte ? String(werte[name]) : treffer,
  )
}
