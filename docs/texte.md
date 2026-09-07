# Oberflächentexte – System Map

Erstellt: 07.09.2026-16:05 · Quelle: PRD-Brief, Abschnitt 10 · Sprache: Deutsch · Ansprache: keine; Buttons als Verben im Infinitiv

Alle Texte wörtlich übernehmen. Platzhalter in eckigen Klammern werden zur Laufzeit eingesetzt. Neue Texte hier eintragen, nicht im Code.

## Fehler und Hinweise (E-xx)

| ID | Situation | Text |
|---|---|---|
| E-01 | Keine Vision vorhanden | Noch keine Vision. Lege deine Vision an, um zu starten. |
| E-02 | Daten laden schlägt fehl | Die Daten konnten nicht geladen werden. Bitte versuche es noch einmal. |
| E-03 | Speichern schlägt fehl oder keine Verbindung | Änderungen konnten nicht gespeichert werden. Wir versuchen es weiter. |
| E-04 | E-Mail ungültig oder nicht freigegeben | Diese E-Mail-Adresse ist nicht freigegeben. |
| E-05 | Login-Link abgelaufen oder ungültig | Der Link ist abgelaufen. Fordere einen neuen an. |
| E-06 | Titel leer oder länger als 80 Zeichen | Bitte gib einen Titel mit 1 bis 80 Zeichen ein. |
| E-07 | Löschen bestätigen | [Typ] „[Titel]“ löschen? Damit werden auch [n] zugehörige Karten gelöscht. Das lässt sich nicht rückgängig machen. |
| E-07a | Löschen bestätigen, ohne Unterkarten | [Typ] „[Titel]“ löschen? Das lässt sich nicht rückgängig machen. |
| E-08 | Abhängigkeit würde einen Kreis erzeugen | Diese Abhängigkeit würde einen Kreis erzeugen und ist nicht möglich. |
| E-09 | PNG-Export schlägt fehl | Das Bild konnte nicht erstellt werden. Bitte versuche es noch einmal. |
| E-10 | Enddatum vor Startdatum | Das Enddatum muss nach dem Startdatum liegen. |
| E-11 | Ziehen im Layout Sortiert oder Netz | Zum Verschieben das Layout „Flexibel“ wählen. |
| E-12 | Sitzung abgelaufen | Bitte melde dich erneut an. |
| E-13 | JSON-Import: Datei ungültig | Die Datei konnte nicht gelesen werden. Bitte wähle einen Export aus System Map. |
| E-14 | Letzte Vision eines Ziels abgewählt | Ein Ziel braucht mindestens eine Vision. |

## Statusmeldungen und Bestätigungen (TX-xx)

| ID | Verwendung | Text |
|---|---|---|
| TX-01 | Nach „Link senden“ | Wir haben dir einen Anmelde-Link geschickt. Prüfe dein Postfach. |
| TX-02 | Sidepanel-Fuß nach Speichern | Gespeichert |
| TX-03 | Sidepanel-Fuß während Speichern | Wird gespeichert … |
| TX-04 | Hinweis bei manuellem Status | Status manuell gesetzt |
| TX-05 | Zähler im Header | [x] / [y] Initiativen abgeschlossen |
| TX-06 | JSON-Import Bestätigung | [n] Karten importieren? Alle vorhandenen Daten werden ersetzt. |
| TX-10 | Leere Liste im Sidepanel bei aktivem Filter | Keine Karten passen zum Filter. |
| TX-11 | Fortschritt auf Karten | [p] % |
| TX-12 | Tooltip Hover-Plus auf Vision | Neues Ziel |
| TX-13 | Tooltip Hover-Plus auf Ziel | Neue Initiative |
| TX-14 | Tooltip Hover-Plus auf Initiative | Neue Metrik |
| TX-15 | Heute-Linie in der Linear-View | Heute |
| TX-16 | Metrik mit Zahlenwert auf der Karte | [ist] / [soll] [Einheit] |

## Typbezeichnungen (TX-07a)

| Schlüssel | Text |
|---|---|
| vision | Vision |
| goal | Ziel |
| initiative | Initiative |
| metric | Metrik |

## Status (TX-08)

| Schlüssel | Text |
|---|---|
| in_planung | In Planung |
| begonnen | Begonnen |
| abgeschlossen | Abgeschlossen |
| blockiert | Blockiert |

## Priorität (TX-09)

| Schlüssel | Text | Kürzel auf Karte |
|---|---|---|
| hoch | Hoch | H |
| mittel | Mittel | M |
| niedrig | Niedrig | N |
| null | Keine | – |

## Buttons und Beschriftungen (TX-07)

### Header

| Element | Text |
|---|---|
| View-Umschalter | Map · Linear |
| Layout-Umschalter | Flexibel · Sortiert · Netz |
| Zeitskala | Woche · Monat |
| Fit to Screen | Fit to Screen |
| PNG-Export | Als PNG speichern |
| Filter | Filter |
| Filter zurücksetzen | Zurücksetzen |
| Menü | Menü |
| Menüpunkte | Daten exportieren · Daten importieren · Abmelden |
| Visionsauswahl (bei mehreren Visionen) | Vision wechseln · Neue Vision |

### Sidepanel

| Element | Text |
|---|---|
| Panel-Titel Liste | Übersicht |
| Zurück zur Liste | Zurück zur Liste |
| Abschnittsbeschriftungen im Detail | Allgemein · Status · Zeitraum · Metriken · Abhängigkeiten |
| Feldbeschriftungen | Titel · Beschreibung · Status · Priorität · Startdatum · Enddatum · Farbe · Fortschritt · Blockiert durch |
| Schalter manueller Status | manuell setzen |
| Abhängigkeit hinzufügen | Hinzufügen |
| Metrik hinzufügen | Neue Metrik |
| Ziel-/Istwert | Sollwert · Istwert · Einheit |
| Löschen | Löschen |

### Dialoge

| Element | Text |
|---|---|
| Neue Karte, Titel des Dialogs | Neue Vision · Neues Ziel · Neue Initiative · Neue Metrik |
| Feld | Titel |
| Bestätigen | Anlegen |
| Abbrechen | Abbrechen |
| Löschen bestätigen, Titel | Löschen? |
| Löschen bestätigen, Buttons | Löschen · Abbrechen |
| Abhängigkeit anlegen, Titel | Blockiert durch |
| Abhängigkeit anlegen, Suchfeld | Ziel oder Initiative suchen … |
| Import, Buttons | Importieren · Abbrechen |
| Import, Datei wählen | Datei wählen |

### Login

| Element | Text |
|---|---|
| Titel | System Map |
| Feld | E-Mail-Adresse |
| Button | Link senden |

### Leere Zustände

| Situation | Text | Button |
|---|---|---|
| Keine Vision (Map, Sidepanel) | E-01 | Vision anlegen |
| Ziel ohne Initiativen im Sidepanel | Noch keine Initiativen. | Neue Initiative |
| Initiative ohne Metriken im Detail | Keine Metriken. Optional. | Neue Metrik |
| Linear-View ohne Ziele | Noch keine Ziele mit Zeitraum. | – |

## E-Mails (Supabase Auth, Vorlage „Magic Link“)

| Element | Text |
|---|---|
| Betreff | Dein Anmelde-Link für System Map |
| Text | Hallo, mit diesem Link meldest du dich bei System Map an. Der Link ist 15 Minuten gültig. |
| Button | Anmelden |
| Fußzeile | Wenn du diese Mail nicht angefordert hast, ignoriere sie. |

## Rechtliches

Dazu liegen keine Informationen vor. Impressum und Datenschutzhinweis sind für die Einzelnutzung im Prototyp nicht vorgesehen (Brief, Abschnitt 11).
