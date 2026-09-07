# PRD-Brief für Claude Code – System Map

**Erstellt:** 07.09.2026-15:26 · **Aktualisiert:** 07.09.2026-18:48 · **Version:** 0.5 (freigegeben, Abstimmung zu Scheibe 1 eingearbeitet)

**Quellen:** Google Doc „260907-System Map-Spezifikation“ (Stand 07.09.2026); `framer-dark-design-system.html` (Dropbox „System Map“, Stand 23.07.2026); Google Doc „260907-System Map-Testdaten“ (Stand 07.09.2026); Antworten von Conny vom 07.09.2026 (elf Fragen)

**Ablageort im Repo:** `docs/PRD_Brief.md`

## Bitte zuerst lesen

Dieser Brief trennt drei Arten von Aussagen:

- **Spez** – steht so in der Spezifikation.
- **Antwort D-xx** – hast du am 07.09.2026 entschieden (elf Fragen, Abschnitt 14).
- **Annahme A-xx** – fehlt in der Spezifikation, Vorschlag von mir. Alle Annahmen stehen gesammelt in Abschnitt 14. Zum Freigeben reicht: „A-03 nein, stattdessen …“.

Unklare oder unvollständige Stellen der Spezifikation sind mit **[Spez unvollständig]** markiert.

**Neu in v0.5:** Antworten aus der Abstimmung zum Plan für Scheibe 1 (07.09.2026-18:48). Neue Entscheidungen D-12 bis D-15: Seed über `/dev/seed` in der angemeldeten App statt über einen Service-Role-Key; `/dev/components` und `/dev/seed` werden hinter dem Login mit ausgeliefert; Migrationsdateien auf die angewendeten Versionen umbenannt und `supabase/config.toml` angelegt; die einmaligen Supabase-Auth-Einstellungen macht Conny im Dashboard nach der Liste in der README. Neue Annahmen A-51 bis A-56, darunter die dokumentierte Kontrast-Ausnahme für gefüllte Buttons. Korrigiert: TX-07 ohne Modus-Texte, US-23 nur dunkel, E-07a nachgetragen, Formulierung zum Client-Key, drei Migrationen, Sidepanel-Breite und Kartenradien begründet. Beim Bauen von Scheibe 1 fiel auf, dass **E-14 in `docs/texte.md` fehlte**, obwohl der Brief den Text seit v0.4 führt; wörtlich nachgetragen.

**Neu in v0.4:** Ein Ziel kann zu mehreren Visionen gehören (D-09, Migration 0003). Testdaten aus deinem Google Doc liegen als `docs/testdaten.json` vor (D-10, D-11). Neu: Story US-25, Test T-17, Annahmen A-47 bis A-50.

**Neu in v0.3:** Freigabe aller Annahmen (D-07). Infrastruktur eingetragen: Repository, Supabase-Projekt mit angewendeter Migration, freigegebene E-Mail (D-08). `CLAUDE.md`, `docs/texte.md`, `.env.example` und `supabase/migrations/` liegen vor.

**Neu in v0.2:** Abschnitt 4 auf das Framer Dark Design System umgestellt (D-05, A-12 bis A-19, A-44 bis A-46); Modus-Umschalter aus dem Prototyp genommen; Stack, US-21, T-12, Scheibe 1 und Assets angepasst.

---

## 0 Ziel

**System Map** hilft Conny beim Wechsel von der Rolle Head of Product Design in die freie künstlerische Arbeit, indem sie Vision, Ziele, Initiativen und Metriken mit ihren Abhängigkeiten als Karte sichtbar macht. (Spez, Story)

**Zweck laut Spez:** das ganze System beleuchten und transparent machen, um nächste Schritte zu planen, zu priorisieren und Vorankommen sichtbar zu machen.

**Hypothese, die der Prototyp prüft:** Dazu liegen keine expliziten Informationen vor. A-01: „Wenn Ziele, Initiativen und Abhängigkeiten auf einer Karte sichtbar sind, kann ich nächste Schritte schneller priorisieren und sehe Fortschritt.“

**Wofür der Prototyp gebaut wird:** Dazu liegen keine expliziten Informationen vor. A-02: Eigennutzung ab dem ersten Tag, keine Testnutzer:innen.

## 1 Scope

Antwort: **Alles aus der Spezifikation ist Must.** Die Reihenfolge der Umsetzung steht in Abschnitt 12.

**Must (Spez)**

- Karten der Typen Vision, Ziel, Initiative, Metrik anlegen und bearbeiten
- Status je Karte: In Planung (grau), Begonnen (blau), Abgeschlossen (grün), Blockiert (rot)
- Abhängigkeiten: Initiative blockiert Ziel; Ziel blockiert Ziel
- Map-View mit den Layouts Flexibel, Sortiert, Netz; Karten ziehbar; Zoom; Fit to Screen; Layout-Umschalter
- Linear-View: Swimlanes, Woche/Monat, neuestes Ziel zuerst
- Sidepanel rechts: Accordion Vision → Ziel → Initiativen; Klick auf Karte öffnet Detailansicht zum Bearbeiten
- Header: Visionsname (editierbar per Klick), Filter, Zähler abgeschlossener Initiativen
- Automatisches Speichern
- Export der aktuellen Darstellung als PNG
- Hover-Plus auf Karten zum Anlegen von Unterkarten

**Must (Antwort)**

- Login per Magic Link, Daten in Cloud-Datenbank, Nutzung auf mehreren Geräten synchron
- Status von Ziel und Vision automatisch aus Abhängigkeiten abgeleitet, manuell überschreibbar
- Eine Initiative gehört zu genau einem Ziel
- Oberfläche nach dem Framer Dark Design System, nur dunkler Modus; heller Modus später (D-05)

**Must (Annahme, für die Nutzbarkeit nötig)**

- A-03: Karten löschen mit Bestätigung. Die Spezifikation erwähnt Löschen nicht.
- A-04: JSON-Export und -Import aller Daten als Sicherung.

**Nicht im Umfang (Annahme A-05)**

- Weitere Nutzer:innen, Teilen, Rollen
- Benachrichtigungen, Erinnerungen
- Kommentare, Dateianhänge
- Rückgängig/Wiederholen (Undo/Redo)
- Optimierung für Smartphone
- Mehrsprachigkeit
- Heller Modus und Modus-Umschalter (D-05; Tokens vorbereitet, siehe A-44)

## 2 Nutzer, Geräte, Sprache

| Vorgabe | Wert | Quelle |
|---|---|---|
| Rollen | eine Nutzerin, angemeldet; keine Gäste | Antwort |
| Geräte | mehrere Geräte synchron; „Map kann an die Größe des jeweiligen Bildschirms angepasst werden“ | Antwort, Spez |
| Geräte-Priorität | 1. Desktop/Laptop, 2. Tablet (Querformat); Smartphone nicht optimiert | A-06 |
| Browser | aktuelle Versionen von Chrome, Safari, Firefox, Edge | A-07 |
| Sprache der Oberfläche | Deutsch | A-08 |
| Ansprache | keine Anrede nötig (Einzelnutzung); Buttons als Verben im Infinitiv, z. B. „Speichern“ | A-09 |
| Barrierefreiheit | Formulare und Sidepanel per Tastatur bedienbar; Kontrast mindestens 4,5:1 für Fließtext, Labels, Kartentexte und Statusangaben; gefüllte Buttons auf `--accent-hover` und `--danger` folgen dem Design System und liegen bei rund 3,5:1 (dokumentierte Ausnahme, A-56); Ziehen auf der Karte ohne Tastaturalternative | A-10, A-56 |

## 3 Stack und Umgebung

Dazu liegen keine expliziten Informationen in der Spezifikation vor. Alle Zeilen sind A-11, sofern nicht anders markiert.

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Frontend | React 19, TypeScript, Vite (Single-Page-App) | Reine Client-App, kein serverseitiges Rendern nötig |
| Karten-Canvas | React Flow (`@xyflow/react`, v12) | Ziehbare Knoten, Kanten, Zoom, Fit View, Dark Mode, PNG-Export sind eingebaut |
| Automatisches Layout | `dagre` für Sortiert; eigene Radial-Berechnung für Netz | Kleine Bibliothek, ausreichend für Hierarchie |
| Linear-View | eigene Umsetzung mit CSS Grid | Keine passende leichte Bibliothek; Anforderungen sind überschaubar |
| PNG-Export | `html-to-image` | Von React Flow dokumentierter Weg |
| Styling | Tailwind CSS 4 mit den Framer-Dark-Tokens als CSS-Variablen; Radix-Primitive (Dialog, Popover, Select, Accordion) für Tastatur und Fokus, gestaltet nach `docs/design-system/framer-dark.html`; kein shadcn-Standardlook | Design System ist vorgegeben (D-05); Radix liefert Barrierefreiheit ohne eigenes Aussehen |
| Backend, Datenbank, Login | Supabase: Postgres, Auth (Magic Link), Row Level Security, Region EU (Frankfurt) | Antwort: Cloud, mehrere Geräte |
| Speichern | Optimistisch im Client, Schreiben an Supabase mit 500 ms Verzögerung (Debounce); beim Start alles laden | Spez: automatisches Speichern |
| Konflikte | Letzter Schreibvorgang gewinnt | Einzelnutzung |
| Tests | Vitest (Statuslogik, Layout-Berechnung), Playwright (Abläufe) | – |
| Hosting | Vercel, statische Auslieferung | – |
| Laufzeit | Node 22 oder neuer, pnpm 12 über Corepack | A-54 |
| Repository | `github.com/connynaumann/ratn` (privat) | Antwort. Inhalt von hier nicht einsehbar; Claude Code prüft beim Start, ob das Repo leer ist |
| Supabase | Organisation „RATN“, Projekt `system-map`, Ref `nfmyezhwwwreqjryxlho`, Region eu-central-1 (Frankfurt), Postgres 17, angelegt 07.09.2026 über den Konnektor, 0 € / Monat | Antwort D-08 |
| Datenbank-Migration | `20260907141301_system_map_schema.sql`, `20260907141325_system_map_harden_functions.sql`, `20260907161048_goal_multi_vision.sql` – alle auf dem Projekt angewendet am 07.09.2026; Security-Advisor ohne Warnungen. Die Dateinamen tragen genau die in der Datenbank eingetragenen Versionen, damit `supabase db push` sie nicht erneut anwendet (D-14); `supabase/config.toml` bindet das Projekt | D-08, D-09, D-14 |
| Vercel | Konto vorhanden, noch kein Team und kein Projekt; Projekt wird in Scheibe 7 aus dem Repository angelegt | Antwort |
| Kosten | Free Tier beider Dienste. Hinweis: Supabase pausiert kostenlose Projekte nach 7 Tagen ohne Zugriff; Reaktivierung per Klick im Dashboard | – |
| Domain | Vercel-Adresse reicht | A-11 |

## 4 Design-Werte

**Basis (Antwort D-05):** „Framer Dark – Mini Design System v1.0“ (`framer-dark-design-system.html`, Dropbox-Ordner „System Map“, Stand 23.07.2026). Die Datei wird unverändert als `docs/design-system/framer-dark.html` ins Repo kopiert; Claude Code liest sie direkt. Der Prototyp ist dunkel. Ein heller Modus kommt später; die Tokens sind dafür vorbereitet (A-44).

**Aus der Spezifikation:** Mehrfarbigkeit nach dem New Yorker U-Bahn-System; jedes Ziel bekommt eine eigene Farbe; Statusfarben grau, blau, grün, rot.

**Umsetzungsgenauigkeit (A-12):** Tokens und Komponentenmuster aus dem Design System sind verbindlich. Der Aufbau der Karten und der Map ist nicht im Design System enthalten und folgt A-17, A-18 und A-46.

### Tokens (verbindlich, aus Abschnitt 08 der Design-System-Datei)

| Gruppe | Token | Wert | Verwendung im Prototyp |
|---|---|---|---|
| Hintergrund | `--bg-app` | #050505 | Map-Canvas, Seitenhintergrund |
| | `--bg-panel` | #0F0F0F | Header, Sidepanel-Liste, Ziel- und Initiativ-Karten |
| | `--bg-surface` | #161616 | Sidepanel-Detail, Dialoge, Vision-Karte, Popover |
| | `--bg-elevated` | #1C1C1C | Karten im Hover, Toasts |
| | `--bg-input` | #232323 | Eingabefelder, Segmented Controls |
| | `--bg-hover` | #2A2A2A | Hover auf Feldern und Zeilen |
| | `--bg-active` | #333333 | aktives Segment, Fortschrittsbalken-Hintergrund |
| Text | `--text-primary` | #F5F5F5 | Titel, Werte |
| | `--text-secondary` | #999999 | Labels, Fließtext, Status „In Planung“ |
| | `--text-tertiary` | #5C5C5C | Platzhalter, Datumsangaben auf Karten |
| | `--text-disabled` | #3D3D3D | inaktive Elemente |
| | `--text-inverse` | #0A0A0A | Text auf Teal |
| Rahmen | `--border-subtle` | rgba(255,255,255,.07) | Kartenrahmen, Trennlinien |
| | `--border-default` | rgba(255,255,255,.12) | Punktraster der Map |
| | `--border-strong` | rgba(255,255,255,.20) | Outline-Buttons, Checkbox |
| Akzent | `--accent` | #2B6FF2 | Auswahl, Fokusring, primäre Buttons, Status „Begonnen“, Heute-Linie |
| | `--accent-hover` | #4A85F5 | Hover primärer Buttons |
| | `--accent-muted` | rgba(43,111,242,.16) | Kinder der ausgewählten Zeile im Accordion |
| | `--teal`, `--teal-deep` | #8ED1CE, #57979B | Teal ist Zielfarbe 5 (A-13); sonst nicht verwendet |
| Semantik | `--success` | #3ECF8E | Status „Abgeschlossen“ |
| | `--warning` | #F5A623 | Speicherhinweis E-03 |
| | `--danger` | #F24B4B | Status „Blockiert“, Blockade-Linien, Löschen |
| Radius | `--r-xs` … `--r-xl`, `--r-pill` | 6, 8, 10, 14, 20, 999 px | Felder 10; Karten nach der Kartentabelle: Vision `--r-xl` (20), Ziel und Initiative `--r-lg` (14); Panels und Dialoge 20; Metrik-Pille 999 |
| Abstand | `--s-1` … `--s-16` | 4er-Raster: 4, 8, 12, 16, 20, 24, 32, 40, 64 px | alle Abstände |
| Schatten | `--shadow-sm`, `--shadow-md`, `--shadow-lg` | siehe Datei | Segmente, Toasts, Panels (lg mit 1 px Hairline) |
| Schrift | `--font-sans` | InterVariable, Inter, -apple-system, sans-serif | alles außer Zahlen |
| | `--font-mono` | SF Mono, JetBrains Mono, Menlo, monospace | Datumsangaben, Prozentwerte, Zähler |

### Statusfarben (Spez: grau, blau, grün, rot → Design-System-Tokens, A-14)

| Status | Token | Wert | Kontrast auf `--bg-app` |
|---|---|---|---|
| In Planung | `--text-secondary` | #999999 | 7,2 : 1 |
| Begonnen | `--accent` | #2B6FF2 | 4,5 : 1 |
| Abgeschlossen | `--success` | #3ECF8E | 10,2 : 1 |
| Blockiert | `--danger` | #F24B4B | 5,7 : 1 |

### Zielfarben (A-13)

Angelehnt an die Linienfarben der MTA New York, geprüft auf dem dunklen Hintergrund. Blau ist nicht enthalten: Blau ist im Design System für Auswahl, Fokus und Status „Begonnen“ reserviert; das MTA-Blau #0039A6 erreicht auf `--bg-app` nur 2,1 : 1. Zuweisung automatisch in dieser Reihenfolge, im Detailpanel änderbar. Ab dem neunten Ziel beginnt die Reihe von vorn.

| Nr. | Token | Wert | Vorbild | Kontrast auf `--bg-app` |
|---|---|---|---|---|
| 1 | `--line-1` | #EE352E | MTA Linien 1, 2, 3 | 5,0 : 1 |
| 2 | `--line-2` | #FF6319 | MTA Linien B, D, F, M | 6,8 : 1 |
| 3 | `--line-3` | #FCCC0A | MTA Linien N, Q, R, W | 13,4 : 1 |
| 4 | `--line-4` | #6CBE45 | MTA Linie G | 8,8 : 1 |
| 5 | `--line-5` | #8ED1CE | Framer Teal | 11,8 : 1 |
| 6 | `--line-6` | #B933AD | MTA Linie 7 | 4,0 : 1 |
| 7 | `--line-7` | #996633 | MTA Linien J, Z | 4,2 : 1 |
| 8 | `--line-8` | #00933C | MTA Linien 4, 5, 6 | 5,1 : 1 |

**Trennung von Zielfarbe und Status (A-15):** Die Zielfarbe färbt die Linien (Kanten) und einen Farbstreifen am linken Kartenrand. Der Status erscheint als Badge mit Punkt (`.badge.dot`) in der Statusfarbe oben rechts auf der Karte. Beides bleibt gleichzeitig lesbar.

### Typografie (A-16)

Inter Variable über das npm-Paket `@fontsource-variable/inter` (Lizenz SIL OFL), im Build mitgeliefert; kein Aufruf einer Schrift-CDN zur Laufzeit. Basisgröße der App 14 px (wie `body` im Design System). Zahlen mit `font-variant-numeric: tabular-nums`.

| Element | Muster im Design System | Größe / Gewicht / Laufweite |
|---|---|---|
| Visionsname im Header, Vision-Titel auf Karte | Heading 3 (`.t-h3`) | 18 / 600 / −1 % |
| Ziel-Titel auf Karte | Body-Lead-in | 15 / 600 |
| Initiativ-Titel, Panel-Titel, Zeilen im Accordion | `.panel-head .title`, `.tree-row` | 13 / 600 bzw. 13 / 400 |
| Metrik-Titel, Labels, Feldbeschriftungen | Label (`.t-label`) | 12 / 500, `--text-secondary` |
| Datum, Prozent, Zähler | Mono (`.t-mono`) | 12 / 400, `--font-mono` |
| Abschnittsbeschriftungen im Sidepanel | `.sec-label` | 11 / 600, Versalien, Laufweite 12 %, `--accent` |
| Dialogtitel | Heading 2 (`.t-h2`) | 26 / 700 / −2 % |

### Komponenten-Zuordnung (A-45)

| Element im Prototyp | Muster im Design System | Details |
|---|---|---|
| Umschalter Map / Linear | Tabs (`.tab`, `.tab.on`) | aktiv `--bg-active` |
| Layout-Umschalter Flexibel / Sortiert / Netz; Woche / Monat | Segmented Control (`.seg`) | 3 bzw. 2 Segmente, 12 / 600 |
| Zähler „x / y Initiativen abgeschlossen“ | Badge (`.badge.dot`) in `--success` | – |
| Fit to Screen, Als PNG speichern, Menü | `.btn-ghost` mit Icon | Icons: Lucide, 14 px |
| Filter-Button | `.btn-secondary sm` + `.badge.blue` mit Anzahl | Popover als `.panel` |
| Visionsname editierbar | `.t-h3`; bei Klick `.input` in gleicher Größe | Enter oder Verlassen speichert |
| Sidepanel | Panel (`.panel`): `--bg-surface`, `--r-xl`, `--shadow-lg`, Breite **320 px** | rechts, volle Höhe, 16 px Abstand zum Rand. Die 300 px des Design Systems gelten für ein frei schwebendes Panel; unseres läuft über die volle Höhe und trägt mehr Inhalt, daher 320 px |
| Sidepanel Liste | Layer Tree (`.tree`, `.tree-row`, `.ind-1`, `.ind-2`) | ausgewählte Zeile `.sel` (`--accent`), Kinder `.sel-child` (`--accent-muted`); Caret `▾ / ›`; Statuspunkt 6 px rechts |
| Sidepanel Detail | Property Rows (`.prop-row`: Label 92 px links `--text-secondary`, Control rechts) mit `.divider` zwischen Gruppen | Kopf `.panel-head` mit Titel und `×` (zurück zur Liste) |
| Textfelder, Datum, Beschreibung | `.input` (kein Rahmen, Fokus 1 px `--accent`) | Datum im `--font-mono` |
| Status, Priorität | `select.input` | – |
| „manuell setzen“ | `.toggle` | an = `--accent` |
| Metrik erledigt | `.check` | an = `--accent` |
| Ziel-/Istwert einer Metrik | `.input.num` + `.unit` + `.stepper` | – |
| Zielfarbe wählen | 8 Kreise 18 px, gewählter mit 2 px `--text-primary` Ring | – |
| Blockiert durch | Liste aus `.badge` je Abhängigkeit mit `×`, darunter `.btn-secondary sm` „Hinzufügen“ | – |
| Buttons in Dialogen | Anlegen `.btn-primary`; Abbrechen `.btn-ghost`; Löschen `.btn-danger` | – |
| Dialoge | `.panel` zentriert, 400 px, Overlay rgba(0,0,0,.6) | – |
| Hover-Plus auf Karten | Kreis 24 px `--accent`, weißes `+` (wie `.bp-ico`), Tooltip mit Text | am rechten Kartenrand |
| Status auf Karten | `.badge.dot` in Statusfarbe, Text 11 / 600 | – |
| Priorität auf Karten | `.badge` mit „H“, „M“, „N“ | ohne Priorität kein Badge |
| Speicherhinweis E-03 | Balken unter dem Header, Hintergrund rgba(245,166,35,.12), Text `--warning` | – |
| Toasts E-09, E-11 | `--bg-elevated`, `--r-md`, `--shadow-md`, 13 / 500 | unten mittig |
| Heute-Linie (Linear) | 1 px `--accent`, Label „Heute“ im Stil `.cursor-label` | – |
| Login-Seite | `.panel` zentriert mit `.field` und `.btn-primary` | – |

### Map-Canvas (A-46)

Hintergrund `--bg-app` mit Punktraster (React Flow `Background`, Variante `dots`, Abstand 24 px, Punktgröße 1 px, Farbe `--border-default`). Minimap unten rechts in `--bg-panel` mit `--border-subtle`, Karten in ihrer Zielfarbe. Zoom-Steuerung unten links als `.btn-secondary sm`. Auswahl einer Karte: Rahmen 1,5 px `--accent` (wie `.bp-bar`).

### Karten (A-17)

| Typ | Größe | Fläche, Radius, Schatten | Inhalt |
|---|---|---|---|
| Vision | 280 × 120 px | `--bg-surface`, `--r-xl`, `--shadow-lg` | Titel 18 / 600; Fortschrittsbalken 3 px `--accent` auf `--bg-active` mit Prozent im Mono; Status-Badge |
| Ziel | 240 × 100 px | `--bg-panel`, `--r-lg`, `--border-subtle`; Farbstreifen 6 px links in Zielfarbe | Titel 15 / 600; Enddatum Mono 12 `--text-tertiary`; Fortschrittsbalken 3 px in Zielfarbe; Status-Badge |
| Initiative | 220 × 84 px | `--bg-panel`, `--r-lg`, `--border-subtle`; Farbstreifen 4 px links in Zielfarbe | Titel 13 / 600; Start–Ende Mono 11; Status-Badge; Prioritäts-Badge |
| Metrik | 200 × 40 px | `.badge`-Pille: `--bg-surface`, `--r-pill`, `--border-subtle` | `.check` links; Titel 12 / 500; bei Zahlenwert „ist / soll“ Mono rechts |

Hover: Fläche wechselt zu `--bg-elevated`. Gedimmt durch Filter: Deckkraft 25 %.

### Linien (A-18)

Kanten Vision → Ziel und Ziel → Initiative: 6 px in der Zielfarbe, React Flow `smoothstep` mit Radius 14, Deckkraft 90 %. Kanten Initiative → Metrik: 3 px. Blockierende Abhängigkeiten: 2 px gestrichelt (8 / 6) in `--danger` mit Pfeilspitze am blockierten Ziel. Hover auf einer Kante: Breite + 2 px.

### Bewegung (A-19)

Farb- und Hintergrundwechsel 150 ms (wie `.15s` im Design System). Toggle 180 ms. Layoutwechsel 300 ms. Sonst keine Übergänge.

### Vorbereitung heller Modus (A-44, Antwort D-05)

Alle Tokens liegen in `src/styles/tokens.css` unter `:root[data-theme="dark"]`. Komponenten verwenden ausschließlich Tokens; kein Hex-Wert im Komponentencode (Prüfung in T-12). `settings.theme` bleibt im Datenmodell mit Standard `dark`. Ein heller Modus ergänzt später nur einen Block `:root[data-theme="light"]` und den Umschalter im Header.

### Dateien

| Was | Pfad im Repo | Status |
|---|---|---|
| Design System | `docs/design-system/framer-dark.html` | vorhanden (Dropbox) |
| Tokens | `src/styles/tokens.css` | wird aus der Design-System-Datei erzeugt |
| Schrift | npm-Paket `@fontsource-variable/inter` | wird bei `pnpm install` geladen |
| Icons | Paket `lucide-react` | – |
| Logo | – | Dazu liegen keine Informationen vor. Prototyp nutzt den Schriftzug „System Map“ in `.t-h3`. |
| Screenshots | – | nicht vorhanden |
| Oberflächentexte | `docs/texte.md` | aus Abschnitt 10 |
| Testdaten | `docs/testdaten.json` | siehe Abschnitt 15 |

## 5 Datenmodell

Antwort: Initiative gehört zu genau einem Ziel. Jede Tabelle hat `owner_id` (= angemeldete Nutzerin) und Row Level Security: nur eigene Zeilen lesbar und schreibbar.

**Stand der Umsetzung (D-08):** Das Modell ist als Migration angelegt und auf dem Supabase-Projekt angewendet. Abweichungen gegenüber dem Text: Status, Priorität, View, Layout, Zeitskala und Theme sind Postgres-Enums (`card_status`, `card_priority`, `view_mode`, `layout_mode`, `timeline_scale`, `theme_mode`); `color` ist Text mit Prüfung auf `line-1` … `line-8`; Löschen kaskadiert über Fremdschlüssel, polymorphe Abhängigkeiten über Trigger; `updated_at` wird per Trigger gesetzt; zusätzlich gibt es die Tabelle `allowed_email` (Abschnitt 6). Die Kreisprüfung für Abhängigkeiten (E-08) bleibt im Client.

### vision

| Feld | Typ | Pflicht | Regel | Quelle |
|---|---|---|---|---|
| id | UUID | ja | vom System | – |
| owner_id | UUID → auth.users | ja | – | Antwort |
| title | Text | ja | 1–80 Zeichen; im Header editierbar | Spez |
| description | Text | nein | max. 2000 Zeichen | Spez |
| status_override | Auswahl oder leer | nein | in_planung / begonnen / abgeschlossen / blockiert; leer = automatisch | Antwort |
| priority | Auswahl oder leer | nein | hoch / mittel / niedrig | Spez („kann eine Priorität haben“); Werte A-20 |
| start_date | Datum | ja | Standard: Tag der Erstellung, änderbar | Spez |
| end_date | Datum | nein | ≥ start_date | Spez |
| pos_x, pos_y | Zahl | ja | Position im Layout Flexibel; Standard 0,0 | Spez |
| created_at, updated_at | Zeitstempel | ja | vom System | – |

Spez: „Es kann ein oder mehrere Visionen geben.“ A-21: Das Datenmodell erlaubt mehrere; die Map zeigt eine Vision; bei mehreren erscheint im Header ein Auswahlmenü.

### goal (Ziel)

| Feld | Typ | Pflicht | Regel | Quelle |
|---|---|---|---|---|
| id | UUID | ja | vom System | – |
| owner_id | UUID | ja | – | – |
| title | Text | ja | 1–80 Zeichen | Spez |
| description | Text | nein | max. 2000 Zeichen | Spez |
| color | Text | ja | einer der Tokens `--line-1` … `--line-8`; automatisch der nächste freie | Spez (eigene Farbe pro Ziel) |
| status_override | Auswahl oder leer | nein | wie bei vision | Antwort |
| priority | Auswahl oder leer | nein | hoch / mittel / niedrig | A-20 |
| start_date | Datum | ja | Standard: Tag der Erstellung | Spez |
| end_date | Datum | nein | ≥ start_date | Spez |
| pos_x, pos_y | Zahl | ja | eine Position je Ziel, auch bei mehreren Visionen (A-49) | Spez |
| created_at, updated_at | Zeitstempel | ja | – | – |

Die Zuordnung zur Vision und die Reihenfolge stehen in `goal_vision`.

### goal_vision (Ziel ↔ Vision, D-09)

| Feld | Typ | Pflicht | Regel |
|---|---|---|---|
| goal_id | UUID → goal | ja | Teil des Primärschlüssels |
| vision_id | UUID → vision | ja | Teil des Primärschlüssels |
| owner_id | UUID | ja | – |
| sort_index | Zahl | ja | Reihenfolge im Uhrzeigersinn und im Accordion, je Vision; Standard: Erstellungsreihenfolge (A-22) |
| created_at | Zeitstempel | ja | vom System |

Regeln: Jedes Ziel braucht mindestens eine Vision. Wird die letzte Verknüpfung entfernt, löscht die Datenbank das Ziel samt Initiativen (Trigger `goal_vision_delete_orphans`). Die Oberfläche verhindert das Entfernen der letzten Vision (A-48).

### initiative

| Feld | Typ | Pflicht | Regel | Quelle |
|---|---|---|---|---|
| id | UUID | ja | vom System | – |
| owner_id | UUID | ja | – | – |
| goal_id | UUID → goal | ja | genau ein Ziel | Antwort |
| title | Text | ja | 1–80 Zeichen | Spez |
| description | Text | nein | max. 2000 Zeichen | Spez |
| status | Auswahl | ja | in_planung / begonnen / abgeschlossen / blockiert; Standard in_planung; wird manuell gesetzt | Spez („gilt als abgeschlossen, wenn ihr Status durch mich beendet gesetzt wird“) |
| priority | Auswahl oder leer | nein | hoch / mittel / niedrig | A-20 |
| start_date | Datum | ja | Standard: Tag der Erstellung | Spez |
| end_date | Datum | nein | ≥ start_date | Spez |
| pos_x, pos_y | Zahl | ja | – | Spez |
| sort_index | Zahl | ja | Reihenfolge unter dem Ziel | A-22 |
| created_at, updated_at | Zeitstempel | ja | – | – |

### metric (Metrik)

Spez: Die Definition einer Metrik ist optional je Initiative und dient der Darstellung von Fortschritt und Status. Beispiel: „Portfolio liegt als komprimiertes PDF vor“. **[Spez unvollständig]**: ob eine Metrik ein Zahlenwert oder ein Kriterium ist, steht nicht in der Spezifikation. A-23: Eine Metrik ist ein abhakbares Kriterium mit optionalem Zahlenwert.

| Feld | Typ | Pflicht | Regel |
|---|---|---|---|
| id | UUID | ja | vom System |
| owner_id | UUID | ja | – |
| initiative_id | UUID → initiative | ja | – |
| title | Text | ja | 1–120 Zeichen |
| done | Ja/Nein | ja | Standard nein |
| target_value, current_value | Zahl | nein | nur gemeinsam sinnvoll; wenn current ≥ target, gilt done = ja |
| unit | Text | nein | z. B. „Seiten“, „€“ |
| pos_x, pos_y | Zahl | ja | – |
| created_at, updated_at | Zeitstempel | ja | – |

### dependency (Abhängigkeit)

Spez: „Ein Ziel kann gesperrt werden in Abhängigkeit zu einer Initiative, die beendet sein muss.“ „Ein nicht erreichtes Ziel kann das Erreichen eines anderen Zieles blockieren.“

| Feld | Typ | Pflicht | Regel |
|---|---|---|---|
| id | UUID | ja | vom System |
| owner_id | UUID | ja | – |
| source_type | Auswahl | ja | goal / initiative |
| source_id | UUID | ja | die blockierende Karte |
| target_goal_id | UUID → goal | ja | das blockierte Ziel |
| created_at | Zeitstempel | ja | – |

Regeln: Keine Abhängigkeit eines Ziels auf sich selbst. Keine Kreise (A blockiert B, B blockiert A) – wird beim Anlegen geprüft, siehe E-08. Eine Initiative kann nur ein Ziel blockieren, zu dem sie nicht gehört, oder ihr eigenes Ziel (A-24: beides erlaubt).

### settings (Einstellungen, eine Zeile je Nutzerin, A-25)

| Feld | Typ | Regel |
|---|---|---|
| owner_id | UUID | Primärschlüssel |
| active_vision_id | UUID oder leer | zuletzt gezeigte Vision |
| view | Auswahl | map / linear; Standard map |
| layout | Auswahl | flexible / sorted / net; Standard flexible |
| timeline_scale | Auswahl | week / month; Standard week |
| theme | Auswahl | dark; vorbereitet: light / system (A-44); Standard dark |
| filter_status | Liste | leer = alle |
| filter_goal_ids | Liste | leer = alle |

**Beziehungen**

- vision n ↔ n goal über `goal_vision` (D-09)
- goal 1 → n initiative (Antwort D-04). **Folge von D-09:** Gehört ein Ziel zu zwei Visionen, erscheinen alle seine Initiativen unter beiden Visionen. Die Markierungen (1)/(2) auf Initiativenebene aus deinem Google Doc sind damit nicht abgebildet (A-47).
- initiative 1 → n metric
- goal oder initiative → n dependency → goal

**Abgeleitete Werte (nicht gespeichert, im Client berechnet)**

Statuslogik (Antwort: automatisch, manuell überschreibbar). Reihenfolge der Auswertung: `status_override` gesetzt → dieser Status. Sonst:

| Karte | Blockiert | Abgeschlossen | Begonnen | In Planung |
|---|---|---|---|---|
| Ziel | mindestens eine Abhängigkeit, deren Quelle nicht abgeschlossen ist, oder mindestens eine Initiative mit Status blockiert | mindestens eine Initiative und alle Initiativen abgeschlossen | mindestens eine Initiative begonnen oder abgeschlossen | sonst |
| Vision | – (A-26: Vision wird nie automatisch blockiert) | mindestens ein Ziel und alle Ziele abgeschlossen | mindestens ein Ziel begonnen, abgeschlossen oder blockiert | sonst |

Bei Vision zählen nur die über `goal_vision` verknüpften Ziele. Ein geteiltes Ziel hat denselben Status in beiden Visionen, weil sein Status nur aus seinen Initiativen und Abhängigkeiten folgt (A-47).

Fortschritt (Spez: „Eine Karte zeigt den Fortschritt als“ **[Spez unvollständig]**; A-27):

- Metrik: erledigt = 100 %, sonst current/target, sonst 0 %
- Initiative: Anteil erledigter Metriken; ohne Metriken: abgeschlossen = 100 %, begonnen = 50 %, sonst 0 %
- Ziel: Durchschnitt des Fortschritts seiner Initiativen; ohne Initiativen 0 %
- Vision: Durchschnitt des Fortschritts ihrer verknüpften Ziele
- Darstellung: Balken in Zielfarbe, Prozentzahl daneben

**„Kategorie“:** Spez: „Eine Karte hat eine Kategorie, die identisch ist mit der Initiative.“ **[Spez unvollständig]** – der Satz ist nicht eindeutig. A-28: Es gibt kein eigenes Feld. Die Kategorie einer Karte ist das Ziel, zu dem sie gehört; sie bestimmt die Farbe.

**Löschen (A-03, angepasst durch D-09):** Vision löscht ihre Verknüpfungen; Ziele, die danach zu keiner Vision mehr gehören, werden mit ihren Initiativen, Metriken und Abhängigkeiten gelöscht. Ein Ziel, das noch zu einer anderen Vision gehört, bleibt erhalten. Die Bestätigung E-07 zählt nur die Karten, die tatsächlich verschwinden. Ziel löscht Initiativen, Metriken und alle Abhängigkeiten, in denen es vorkommt. Initiative löscht Metriken und Abhängigkeiten. Vorher Bestätigung mit Anzahl der betroffenen Karten (E-07). Kein Papierkorb.

**Testdaten:** `docs/testdaten.json`, siehe Abschnitt 15.

## 6 Login und Rechte

| Vorgabe | Entscheidung | Quelle |
|---|---|---|
| Login nötig | ja | Antwort |
| Methode | Magic Link per E-Mail, Supabase Auth | Antwort; Anbieter A-11 |
| Registrierung | geschlossen; nur `connynaumann@gmail.com`. Durchgesetzt in der Datenbank: Tabelle `allowed_email` mit Trigger auf `auth.users`, ohne API-Zugriff. Zusätzlich `VITE_ALLOWED_EMAIL` im Client für die Meldung E-04 vor dem Absenden | A-29, Antwort |
| Angemeldet bleiben | 30 Tage; Verlängerung bei Nutzung | A-30 |
| Rollen | nur Besitzerin: sieht, ändert, löscht alles Eigene | Antwort |

## 7 Screens und Flows

**Screens**

| ID | Route | Zweck | Elemente | Leer | Laden | Fehler | Quelle |
|---|---|---|---|---|---|---|---|
| S-01 | `/login` | Anmeldung | Schriftzug, E-Mail-Feld, Button „Link senden“, Bestätigungstext | – | Button deaktiviert | E-04, E-05 | Antwort |
| S-02 | `/` | App-Rahmen | Header (S-03), Hauptfläche (S-04 oder S-05), Sidepanel (S-06 oder S-07) | E-01 | Skeleton für Header und Sidepanel | E-02 | Spez |
| S-03 | – | Header | links: Visionsname editierbar (Klick → Eingabefeld); Mitte: Umschalter Map/Linear, Layout-Umschalter (nur bei Map), Woche/Monat (nur bei Linear), Fit to Screen, PNG-Export; rechts: Filter, Zähler „x / y Initiativen abgeschlossen“, Menü (JSON-Export/-Import, Abmelden) | – | – | – | Spez; Anordnung A-31 |
| S-04 | – | Map-View | React-Flow-Canvas, Karten, Kanten, Hover-Plus, Zoom-Steuerung unten links, Minimap unten rechts | E-01 | – | – | Spez; Minimap A-32 |
| S-05 | – | Linear-View | Zeitachse oben (Wochen oder Monate), eine Swimlane je Ziel, Balken je Initiative, Heute-Linie | E-01 | – | – | Spez |
| S-06 | – | Sidepanel Liste | Accordion Vision → Ziel → Initiativen; Metriken als Unterpunkte der Initiative; Statuspunkt je Zeile; Klick auf Zeile wählt Karte aus und öffnet S-07 | E-01 | – | – | Spez; Metrik-Ebene A-33 |
| S-07 | – | Sidepanel Detail | Felder der gewählten Karte: Titel, Typ (nur Anzeige), Status (bei Ziel/Vision: automatisch mit Schalter „manuell setzen“), Priorität, Startdatum, Enddatum, Beschreibung, Farbe (nur Ziel), Metriken (nur Initiative), „Blockiert durch“ (nur Ziel), Fortschritt, „Visionen“ (nur Ziel, Mehrfachauswahl, D-09), Buttons „Löschen“ und „Zurück zur Liste“ | – | – | E-06, E-10, E-14 | Spez |
| S-08 | Dialog | Neue Karte | Titel, Button „Anlegen“; Typ ergibt sich aus dem Hover-Plus | – | – | E-06 | Spez |
| S-09 | Dialog | Löschen bestätigen | Text E-07, Buttons „Löschen“ und „Abbrechen“ | – | – | – | A-03 |
| S-10 | Dialog | Abhängigkeit anlegen | Auswahl „Blockiert durch“: Liste der Ziele und Initiativen, Suchfeld | – | – | E-08 | A-34 |

**Sichtbarkeit bei mehreren Visionen (D-09):** Map, Linear-View, Sidepanel, Filter und Zähler zeigen immer nur die aktive Vision (`settings.active_vision_id`) und die mit ihr verknüpften Ziele samt Initiativen und Metriken. Ein geteiltes Ziel erscheint in beiden Visionen mit derselben Farbe, demselben Status und denselben Initiativen (A-47).

**Hover-Plus (Spez, mit Widerspruch):** Die Spezifikation nennt beim Ziel sowohl „Plus für Neues Ziel“ als auch „Plus für Neue Initiative oder Metric“. A-35: Vision-Karte → „Neues Ziel“. Ziel-Karte → „Neue Initiative“. Initiative-Karte → „Neue Metrik“. Neues Ziel aus einem Ziel heraus entfällt; ein blockierendes Ziel wird über S-10 verknüpft.

**Layouts der Map-View (Spez; Unterschied Sortiert/Netz [Spez unvollständig], A-36)**

| Layout | Verhalten |
|---|---|
| Flexibel | Positionen wie von Conny gezogen (`pos_x`, `pos_y`); neue Karten erscheinen rechts neben der Elternkarte |
| Sortiert | Hierarchie von links nach rechts: aktive Vision → ihre Ziele → Initiativen → Metriken, berechnet mit dagre; Ziele in `sort_index`-Reihenfolge (aus `goal_vision`) von oben nach unten |
| Netz | Aktive Vision in der Mitte; ihre Ziele auf einem Kreis im Uhrzeigersinn ab 12 Uhr nach `sort_index` (aus `goal_vision`); Initiativen auf einem äußeren Kreisbogen um ihr Ziel; Metriken außen an der Initiative |

In Sortiert und Netz sind Karten nicht ziehbar; ein Hinweis erscheint beim Ziehversuch (E-11). Der Layout-Umschalter ist ein dreiteiliger Schalter Flexibel | Sortiert | Netz (Spez „Toggle Layout: Wechsel zwischen“ **[Spez unvollständig]**, A-37).

**Linear-View (Spez)**

- Eine Swimlane je Ziel, Reihenfolge: neuestes Ziel (nach `created_at`) zuerst; Zielname und Farbe links
- Balken je Initiative von `start_date` bis `end_date`; ohne Enddatum bis heute mit offenem, gestricheltem Ende (A-38)
- Ziele mit Enddatum zeigen eine Raute an ihrem Enddatum (A-38)
- Umschalter Woche/Monat im Header; horizontal scrollbar; Heute-Linie
- Klick auf einen Balken öffnet S-07

**Filter (Spez „Filter:“ ohne Inhalt [Spez unvollständig], A-39):** Filter nach Status (Mehrfachauswahl) und nach Ziel (Mehrfachauswahl). In der Map werden nicht passende Karten auf 25 % Deckkraft gedimmt, Positionen bleiben. In Linear-View und Sidepanel werden sie ausgeblendet. Aktiver Filter zeigt eine Zahl auf dem Filter-Button und „Zurücksetzen“.

**Zähler (Spez):** „x / y Initiativen abgeschlossen“ über alle Ziele der aktiven Vision; reagiert nicht auf den Filter (A-40).

**Flows**

- **F-01 Anmeldung:** S-01 → E-Mail → „Link senden“ → TX-01 → Link in Mail öffnen → S-02. Fehler: E-04, E-05.
- **F-02 Erste Vision:** S-02 leer → E-01 mit Button „Vision anlegen“ → S-08 → Titel → S-02 zeigt Vision mittig, Sidepanel zeigt Accordion.
- **F-03 Ziel anlegen:** Hover auf Vision → Plus → S-08 → Titel → Ziel erscheint mit nächster freier Farbe, verbunden mit Vision; Sidepanel aktualisiert.
- **F-04 Initiative und Metrik anlegen:** Hover auf Ziel → Plus → S-08 → Initiative; Hover auf Initiative → Plus → S-08 → Metrik.
- **F-05 Karte bearbeiten:** Klick auf Karte (Map, Linear oder Liste) → S-07 → Feld ändern → automatisch gespeichert (Anzeige „Gespeichert“ im Sidepanel-Fuß) → „Zurück zur Liste“.
- **F-06 Abhängigkeit anlegen:** S-07 eines Ziels → „Blockiert durch“ → „Hinzufügen“ → S-10 → Auswahl → gestrichelte Kante erscheint; Zielstatus wird neu berechnet. Fehler: E-08.
- **F-07 Layout wechseln:** Layout-Umschalter → Karten bewegen sich animiert an die berechneten Positionen → zurück zu Flexibel stellt die gespeicherten Positionen wieder her.
- **F-08 Linear-View:** Umschalter Map/Linear → S-05 → Woche/Monat wechseln → Klick auf Balken → S-07.
- **F-09 PNG-Export:** Button → Datei `system-map-[Vision]-[JJJJ-MM-TT].png` der aktuellen Darstellung (Map: sichtbarer Ausschnitt inklusive aller Karten bei Fit; Linear: gesamte Zeitachse) wird heruntergeladen. Fehler: E-09.
- **F-10 Modus:** entfällt im Prototyp (D-05). Die App startet immer dunkel.
- **F-11 Zweites Gerät:** Anmeldung auf zweitem Gerät → gleicher Stand wie auf dem ersten; Änderungen erscheinen nach Neuladen (A-41: kein Live-Sync im Prototyp).
- **F-13 Ziel einer zweiten Vision zuordnen:** S-07 eines Ziels → Feld „Visionen“ → zweite Vision anhaken → Ziel erscheint auch in Map, Sidepanel und Linear-View dieser Vision. Fehler: letzte Vision abwählen → E-14.
- **F-12 Löschen:** S-07 → „Löschen“ → S-09 → „Löschen“ → Karte und Unterkarten verschwinden; Sidepanel zeigt Liste.

## 8 User Stories mit Akzeptanzkriterien

Alle Stories sind Must (Antwort). Rolle ist immer „Conny, angemeldet“.

### Konto

**US-01 Anmeldung per Magic Link** — Screens: S-01, S-02

- Gegeben ich bin auf S-01, wenn ich die freigegebene E-Mail eingebe und „Link senden“ klicke, dann sehe ich TX-01 und erhalte eine Mail mit Link.
- Gegeben ich öffne den Link innerhalb von 15 Minuten, dann sehe ich S-02 mit meinen Daten.
- Fehlerfall: Gegeben ich gebe eine nicht freigegebene E-Mail ein, dann sehe ich E-04 und es wird keine Mail gesendet.
- Fehlerfall: Gegeben der Link ist älter als 15 Minuten, dann sehe ich S-01 mit E-05.

### Karten anlegen und bearbeiten

**US-02 Vision anlegen und benennen** — S-02, S-03, S-08

- Gegeben es gibt keine Vision, wenn ich S-02 öffne, dann sehe ich E-01 mit Button „Vision anlegen“.
- Gegeben ich lege eine Vision mit Titel an, dann steht der Titel im Header und die Karte liegt mittig auf der Map.
- Gegeben ich klicke auf den Titel im Header, ändere ihn und drücke Enter oder verlasse das Feld, dann ist der neue Titel gespeichert und auf der Karte sichtbar.
- Fehlerfall: leerer Titel → E-06, keine Änderung.

**US-03 Ziel anlegen** — S-04, S-08

- Gegeben ich fahre mit der Maus über die Vision, dann erscheint ein Plus mit Beschriftung „Neues Ziel“.
- Gegeben ich lege ein Ziel an, dann hat es die nächste freie Zielfarbe, eine Verknüpfung zur aktiven Vision, eine Kante zu ihr, Status In Planung, Startdatum heute.
- Gegeben ich lege ein neuntes Ziel an, dann erhält es `--line-1`.

**US-04 Initiative anlegen** — S-04, S-08

- Gegeben ich fahre über ein Ziel, dann erscheint ein Plus „Neue Initiative“.
- Gegeben ich lege eine Initiative an, dann gehört sie zu genau diesem Ziel, trägt dessen Farbe, hat Status In Planung und Startdatum heute.

**US-05 Metrik anlegen und abhaken** — S-04, S-07, S-08

- Gegeben ich fahre über eine Initiative, dann erscheint ein Plus „Neue Metrik“.
- Gegeben ich hake eine Metrik in S-07 oder auf der Karte ab, dann steigt der Fortschritt der Initiative entsprechend.
- Gegeben eine Metrik hat Ziel- und Istwert und der Istwert erreicht den Zielwert, dann gilt sie als erledigt.

**US-06 Karte im Detailpanel bearbeiten** — S-07

- Gegeben ich wähle eine Karte, dann zeigt S-07 alle Felder aus Abschnitt 5 für diesen Typ.
- Gegeben ich ändere ein Feld, dann ist die Änderung nach spätestens 1 s gespeichert und der Fuß zeigt „Gespeichert“.
- Gegeben ich lade die Seite neu, dann ist die Änderung vorhanden.
- Fehlerfall: Enddatum vor Startdatum → E-10, Enddatum wird nicht übernommen.

**US-07 Karte löschen** — S-07, S-09

- Gegeben ich klicke „Löschen“, dann sehe ich S-09 mit E-07 und der Anzahl betroffener Unterkarten.
- Gegeben ich bestätige, dann sind Karte, Unterkarten und Abhängigkeiten entfernt, in Map, Linear und Sidepanel.
- Gegeben ich breche ab, dann ändert sich nichts.

**US-25 Ziel mehreren Visionen zuordnen** (D-09) — S-07

Als Conny möchte ich ein Ziel mehreren Visionen zuordnen, damit ein gemeinsames Thema wie „Finanzierung“ in beiden Visionen erscheint, ohne es doppelt zu pflegen.

- Gegeben ich wähle ein Ziel, dann zeigt S-07 unter „Visionen“ alle Visionen als Mehrfachauswahl, die verknüpften angehakt.
- Gegeben ich hake eine weitere Vision an, dann erscheint das Ziel in deren Map, Sidepanel und Linear-View, mit derselben Farbe, demselben Status und denselben Initiativen.
- Gegeben ich entferne eine Verknüpfung, dann verschwindet das Ziel aus dieser Vision und bleibt in der anderen erhalten.
- Fehlerfall: Gegeben nur noch eine Vision ist angehakt, wenn ich sie abwähle, dann sehe ich E-14 und die Verknüpfung bleibt bestehen.

### Status, Abhängigkeiten, Fortschritt

**US-08 Status einer Initiative setzen** — S-07

- Gegeben ich setze den Status einer Initiative, dann zeigt die Karte den Statuspunkt in der passenden Farbe (Abschnitt 4).
- Gegeben ich setze die letzte offene Initiative eines Ziels auf Abgeschlossen, dann wird das Ziel automatisch Abgeschlossen und der Zähler im Header erhöht sich um 1.

**US-09 Automatischer Status mit manueller Übersteuerung** — S-07

- Gegeben ein Ziel hat Initiativen mit gemischten Status, dann zeigt es den Status nach der Tabelle in Abschnitt 5.
- Gegeben ich schalte in S-07 „manuell setzen“ ein und wähle Abgeschlossen, dann zeigt das Ziel Abgeschlossen, auch wenn Initiativen offen sind, und S-07 zeigt den Hinweis „manuell gesetzt“.
- Gegeben ich schalte „manuell setzen“ aus, dann gilt wieder der berechnete Status.

**US-10 Ziel durch Abhängigkeit blockieren** — S-07, S-10

- Gegeben ich füge bei Ziel B „Blockiert durch Ziel A“ hinzu und A ist nicht abgeschlossen, dann ist B Blockiert und eine gestrichelte Kante A → B erscheint.
- Gegeben A wird Abgeschlossen, dann berechnet sich B neu.
- Gegeben ich füge bei Ziel B „Blockiert durch Initiative X“ hinzu, dann gilt dasselbe für X.
- Fehlerfall: Gegeben B blockiert bereits A und ich versuche A → B, dann sehe ich E-08 und nichts wird angelegt.

**US-11 Fortschritt sehen** — S-04, S-07

- Gegeben eine Initiative hat 4 Metriken, 1 erledigt, dann zeigt sie 25 %.
- Gegeben ein Ziel hat 2 Initiativen mit 25 % und 75 %, dann zeigt es 50 %.
- Gegeben eine Vision hat 2 Ziele mit 50 % und 100 %, dann zeigt sie 75 %.

### Map-View

**US-12 Karten frei anordnen** — S-04

- Gegeben Layout Flexibel, wenn ich eine Karte ziehe und loslasse, dann bleibt sie dort, auch nach Neuladen und auf einem zweiten Gerät.
- Gegeben Layout Sortiert oder Netz, wenn ich eine Karte ziehen will, dann bewegt sie sich nicht und E-11 erscheint 2 s lang.

**US-13 Zoom und Fit to Screen** — S-04

- Gegeben ich scrolle oder nutze die Zoom-Steuerung, dann zoomt die Map zwischen 10 % und 200 %.
- Gegeben ich klicke „Fit to Screen“, dann sind alle Karten der aktiven Vision sichtbar.
- Gegeben ich lade die Seite, dann startet die Map mit Fit to Screen.

**US-14 Layout Sortiert** — S-04

- Gegeben ich wähle Sortiert, dann liegt die Vision links, Ziele in einer Spalte rechts davon in `sort_index`-Reihenfolge, Initiativen rechts ihrer Ziele, Metriken rechts ihrer Initiativen; keine Karten überlappen.

**US-15 Layout Netz** — S-04

- Gegeben ich wähle Netz, dann liegt die Vision in der Mitte, das erste Ziel bei 12 Uhr, weitere im Uhrzeigersinn gleichmäßig verteilt, Initiativen außen um ihr Ziel, Metriken außen an ihrer Initiative; keine Karten überlappen.

**US-16 Layoutwechsel animiert und gespeichert** — S-03, S-04

- Gegeben ich wechsle das Layout, dann bewegen sich die Karten in 300 ms an ihre neuen Positionen.
- Gegeben ich wechsle zurück zu Flexibel, dann liegen die Karten wieder auf den gespeicherten Positionen.
- Gegeben ich lade die Seite neu, dann ist das zuletzt gewählte Layout aktiv.

### Linear-View

**US-17 Zeitplan in Swimlanes** — S-05

- Gegeben ich wechsle zu Linear, dann sehe ich je Ziel eine Swimlane, neuestes Ziel oben, mit Zielfarbe.
- Gegeben eine Initiative hat Start 01.09. und Ende 30.09., dann reicht ihr Balken in der Wochenansicht über 5 Wochenspalten (KW 36 bis 40) und in der Monatsansicht über die Spalte September.
- Gegeben eine Initiative hat kein Enddatum, dann endet ihr Balken heute mit gestricheltem Rand.
- Gegeben ich klicke einen Balken, dann öffnet S-07.

### Sidepanel

**US-18 Liste als Accordion** — S-06

- Gegeben ich öffne S-02, dann zeigt das Sidepanel die Vision, darunter aufklappbar die Ziele, darunter Initiativen, darunter Metriken, jeweils mit Statuspunkt.
- Gegeben ich klicke eine Zeile, dann wird die Karte auf der Map hervorgehoben und zentriert, und S-07 öffnet sich.
- Gegeben ich klappe ein Ziel zu, dann bleibt es nach Neuladen zugeklappt (A-42: Zustand im Browser gespeichert).

### Header

**US-19 Filter** — S-03

- Gegeben ich filtere nach Status Blockiert, dann sind in der Map nur blockierte Karten voll sichtbar, andere gedimmt; Linear und Sidepanel zeigen nur blockierte Karten und ihre Eltern.
- Gegeben ein Filter ist aktiv, dann zeigt der Filter-Button die Anzahl aktiver Kriterien und „Zurücksetzen“.

**US-20 Zähler** — S-03

- Gegeben 30 Initiativen, 12 abgeschlossen, dann steht im Header „12 / 30 Initiativen abgeschlossen“.

**US-21 Dunkles Design nach Framer Dark** — alle (D-05)

- Gegeben ich öffne die App, dann ist `data-theme="dark"` am Wurzelelement gesetzt und alle Flächen, Texte, Felder, Buttons und Karten nutzen die Tokens aus Abschnitt 4.
- Gegeben ich durchsuche den Komponentencode nach Hex-Farbwerten, dann finde ich keine außerhalb von `src/styles/tokens.css`.
- Gegeben ich vergleiche Buttons, Felder, Segmented Controls, Toggle, Checkbox, Panel und Tree mit `docs/design-system/framer-dark.html`, dann stimmen Farben, Radien, Größen und Hover-Zustände überein.

### Speichern und Export

**US-22 Automatisch speichern** — alle

- Gegeben ich ändere etwas, dann ist es nach spätestens 1 s gespeichert, ohne Speichern-Button.
- Gegeben die Verbindung fehlt, dann sehe ich E-03; Änderungen bleiben in der Oberfläche und werden nach Rückkehr der Verbindung gesendet.

**US-23 PNG-Export** — S-03

- Gegeben Map-View, wenn ich „Als PNG speichern“ klicke, dann wird eine PNG-Datei mit allen Karten der aktiven Vision, im dunklen Modus, mindestens 2-fach aufgelöst, heruntergeladen.
- Gegeben Linear-View, dann enthält die PNG-Datei alle Swimlanes und die gesamte Zeitachse.

**US-24 JSON-Export und -Import** — S-03 (A-04)

- Gegeben ich wähle „Daten exportieren“, dann erhalte ich eine JSON-Datei mit allen Tabellen aus Abschnitt 5.
- Gegeben ich importiere eine solche Datei, dann sehe ich vorher die Anzahl der Karten und eine Bestätigung; nach Bestätigung ersetzt der Import alle Daten.

## 9 Externe Dienste und Umgebungsvariablen

| Dienst | Zweck | Dokumentation | Konto | Bei Ausfall |
|---|---|---|---|---|
| Supabase | Datenbank, Auth, Magic-Link-Mails | supabase.com/docs | Projekt `system-map` vorhanden | E-02 beim Laden, E-03 beim Speichern; Login nicht möglich |
| Vercel | Hosting | vercel.com/docs | Konto vorhanden, Projekt in Scheibe 7 | App nicht erreichbar |
| npm `@fontsource-variable/inter` | Schrift Inter Variable | fontsource.org | keins nötig; Paket wird bei der Installation geladen, kein Aufruf zur Laufzeit | – |

Hinweis: Supabase versendet Magic-Link-Mails im Free Tier mit einer Obergrenze von wenigen Mails pro Stunde. Für eine Nutzerin reicht das. Bei Bedarf später eigener Mailversand (z. B. Resend).

`.env.example`

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_APP_URL=
VITE_ALLOWED_EMAIL=
```

Die Werte liegen in `.env.local` (nicht im Repo, in `.gitignore`). Im Frontend liegt ausschließlich der öffentliche Client-Key (`sb_publishable_…`); der Service-Role-Key wird nirgends verwendet – auch nicht im Seed (D-12).

Import/Export: JSON (A-04) und PNG (Spez). Tracking: keins. Zahlungen: keine.

## 10 Fehlerfälle und Texte

| ID | Situation | Verhalten | Text (wörtlich) |
|---|---|---|---|
| E-01 | Keine Vision vorhanden | Hinweis mittig auf der Map, Button „Vision anlegen“; Sidepanel leer mit demselben Hinweis | „Noch keine Vision. Lege deine Vision an, um zu starten.“ |
| E-02 | Daten laden schlägt fehl | Hinweis mittig, Button „Erneut laden“ | „Die Daten konnten nicht geladen werden. Bitte versuche es noch einmal.“ |
| E-03 | Speichern schlägt fehl oder keine Verbindung | Balken in `--warning` unter dem Header, bleibt bis zum Erfolg; Eingaben bleiben erhalten; automatischer Neuversuch alle 10 s | „Änderungen konnten nicht gespeichert werden. Wir versuchen es weiter.“ |
| E-04 | E-Mail ungültig oder nicht freigegeben | Feld rot, kein Versand | „Diese E-Mail-Adresse ist nicht freigegeben.“ |
| E-05 | Login-Link abgelaufen oder ungültig | Zurück zu S-01 mit Hinweis | „Der Link ist abgelaufen. Fordere einen neuen an.“ |
| E-06 | Titel leer oder länger als 80 Zeichen | Feld rot, Anlegen oder Speichern blockiert | „Bitte gib einen Titel mit 1 bis 80 Zeichen ein.“ |
| E-07 | Löschen bestätigen | Dialog S-09; Zahl wird eingesetzt; bei 0 Unterkarten nur der erste Satz | „[Typ] „[Titel]“ löschen? Damit werden auch [n] zugehörige Karten gelöscht. Das lässt sich nicht rückgängig machen.“ |
| E-07a | Löschen bestätigen, ohne Unterkarten | Dialog S-09 | „[Typ] „[Titel]“ löschen? Das lässt sich nicht rückgängig machen.“ |
| E-08 | Abhängigkeit würde einen Kreis erzeugen | Auswahl blockiert, Hinweis unter dem Feld | „Diese Abhängigkeit würde einen Kreis erzeugen und ist nicht möglich.“ |
| E-09 | PNG-Export schlägt fehl | Kurzer Hinweis unten (Toast, 4 s) | „Das Bild konnte nicht erstellt werden. Bitte versuche es noch einmal.“ |
| E-10 | Enddatum vor Startdatum | Feld rot, Wert nicht übernommen | „Das Enddatum muss nach dem Startdatum liegen.“ |
| E-11 | Ziehen im Layout Sortiert oder Netz | Toast 2 s | „Zum Verschieben das Layout „Flexibel“ wählen.“ |
| E-12 | Sitzung abgelaufen | Weiterleitung zu S-01, danach zurück zur App | „Bitte melde dich erneut an.“ |
| E-13 | JSON-Import: Datei ungültig | Hinweis im Dialog, kein Import | „Die Datei konnte nicht gelesen werden. Bitte wähle einen Export aus System Map.“ |
| E-14 | Letzte Vision eines Ziels abgewählt | Auswahl bleibt bestehen, Hinweis unter dem Feld | „Ein Ziel braucht mindestens eine Vision.“ |

Für den Wortlaut aller Oberflächentexte ist `docs/texte.md` maßgeblich. Weichen Brief und `docs/texte.md` voneinander ab, gilt `docs/texte.md`; die Abweichung wird hier nachgezogen.

Weitere Texte (TX-xx) für `docs/texte.md`:

| ID | Verwendung | Text |
|---|---|---|
| TX-01 | Nach „Link senden“ | „Wir haben dir einen Anmelde-Link geschickt. Prüfe dein Postfach.“ |
| TX-02 | Sidepanel-Fuß nach Speichern | „Gespeichert“ |
| TX-03 | Sidepanel-Fuß während Speichern | „Wird gespeichert …“ |
| TX-04 | Hinweis bei manuellem Status | „Status manuell gesetzt“ |
| TX-05 | Zähler | „[x] / [y] Initiativen abgeschlossen“ |
| TX-06 | JSON-Import Bestätigung | „[n] Karten importieren? Alle vorhandenen Daten werden ersetzt.“ |
| TX-07 | Buttons und Beschriftungen | „Neues Ziel“, „Neue Initiative“, „Neue Metrik“, „Vision anlegen“, „Anlegen“, „Abbrechen“, „Löschen“, „Zurück zur Liste“, „Fit to Screen“, „Als PNG speichern“, „Daten exportieren“, „Daten importieren“, „Abmelden“, „Filter“, „Zurücksetzen“, „Map“, „Linear“, „Flexibel“, „Sortiert“, „Netz“, „Woche“, „Monat“, „Blockiert durch“, „Hinzufügen“, „manuell setzen“ |
| TX-08 | Status | „In Planung“, „Begonnen“, „Abgeschlossen“, „Blockiert“ |
| TX-09 | Priorität | „Hoch“, „Mittel“, „Niedrig“, „Keine“ |

## 11 Qualitätsvorgaben mit Folge

Dazu liegen keine expliziten Informationen in der Spezifikation vor. Alle Zeilen A-43.

| Vorgabe | Konkrete Folge |
|---|---|
| Flüssiges Ziehen bis 200 Karten | Nur sichtbare Karten voll rendern (React Flow `onlyRenderVisibleElements`); Layout-Berechnung außerhalb des Render-Pfads |
| Erste Anzeige unter 2 s | Alle Daten in einer Abfrage je Tabelle laden; Schrift lokal; keine Bibliotheken über 200 kB zusätzlich |
| Sicherheit | Nur der öffentliche Client-Key (`sb_publishable_…`) im Frontend, niemals der Service-Role-Key; Row Level Security auf allen Tabellen |
| Datenschutz | Supabase-Region Frankfurt; kein Tracking; keine Cookies außer Sitzung |
| Barrierefreiheit | Siehe Abschnitt 2 |
| Wartbarkeit | README mit Setup in unter 15 Minuten: Supabase-Projekt anlegen, Migrationen ausführen, `.env` füllen, `pnpm dev` |
| Datensicherung | JSON-Export (A-04); Supabase-Backups im Free Tier nicht enthalten |

## 12 Umsetzungsreihenfolge

| Scheibe | Inhalt | Stories | Prüfbar durch |
|---|---|---|---|
| 1 Grundgerüst | Vite, React, TypeScript, Tailwind, `tokens.css` aus dem Design System, Basis-Komponenten (Button, Input, Segmented, Toggle, Checkbox, Badge, Panel, Tree-Row) nach `docs/design-system/framer-dark.html`, Supabase-Client (Migrationen sind bereits angewendet, siehe Abschnitt 3), Auth mit `VITE_ALLOWED_EMAIL`, App-Rahmen mit Header und Sidepanel-Platzhalter, Seed aus `docs/testdaten.json` über `/dev/seed` (D-12), README mit den einmaligen Supabase-Einstellungen (D-15) | US-01, US-21 | Login funktioniert, Komponenten-Schaukasten unter `/dev/components` gleicht der Design-System-Datei, Tabellen existieren, `pnpm test` läuft |
| 2 Karten ohne Canvas | Sidepanel Liste und Detail, Anlegen über Buttons in der Liste (Plus statt Hover), Bearbeiten, Löschen, Autosave, Fehlerbalken E-03, Zuordnung Ziel ↔ Vision | US-02, US-04 bis US-07, US-18, US-22, US-25 | Alle Kartentypen anlegbar und änderbar, Änderungen nach Neuladen vorhanden |
| 3 Map Flexibel | React Flow, Karten nach Abschnitt 4, Kanten, Hover-Plus, Ziehen mit Speichern, Zoom, Fit to Screen, Minimap | US-03, US-12, US-13 | Karten ziehbar, Positionen auf zweitem Gerät gleich |
| 4 Statuslogik | Ableitung, manuelle Übersteuerung, Abhängigkeiten mit S-10 und Kreisprüfung, Fortschritt, Zähler, Filter | US-08 bis US-11, US-19, US-20 | Vitest-Tests der Statustabelle grün; Blockieren sichtbar |
| 5 Layouts | Sortiert (dagre), Netz (radial), Umschalter, Animation, Sperre beim Ziehen | US-14 bis US-16 | Kein Überlappen bei Testdaten; Wechsel in 300 ms |
| 6 Linear-View | Swimlanes, Woche/Monat, Heute-Linie, offene Enden | US-17 | Balken stimmen mit Testdaten überein |
| 7 Export und Abschluss | PNG-Export, JSON-Export/-Import, Abnahmetests aus Abschnitt 13 als Playwright-Tests, Deployment auf Vercel, Übergabe-Doku | US-23, US-24 | Alle Tests grün auf der Vercel-URL |

## 13 Abnahmetests

| ID | Story | Schritte | Erwartet |
|---|---|---|---|
| T-01 | US-01 | S-01 → freigegebene E-Mail → Link öffnen | S-02 sichtbar. **Manueller Test:** der Klick auf den Link im Postfach lässt sich nicht automatisieren |
| T-02 | US-01 | S-01 → andere E-Mail | E-04, keine Mail |
| T-03 | US-02, US-03 | Vision anlegen → Hover → Neues Ziel „Finanzierung“ | Ziel mit `--line-1`, Kante zur Vision, Sidepanel zeigt es |
| T-04 | US-04, US-05 | Initiative „Portfolio erstellen“ → Metrik „Portfolio liegt als komprimiertes PDF vor“ → abhaken | Initiative zeigt 100 %, Ziel zeigt 100 %, Ziel Abgeschlossen, Zähler „1 / 1“ |
| T-05 | US-09 | Ziel mit offener Initiative → „manuell setzen“ → Abgeschlossen | Ziel grün, TX-04 sichtbar; Schalter aus → wieder berechnet |
| T-06 | US-10 | Ziel B blockiert durch Ziel A (offen) | B rot, gestrichelte Kante; A abschließen → B neu berechnet |
| T-07 | US-10 | A → B, dann B → A versuchen | E-08 |
| T-08 | US-12 | Karte ziehen → Neuladen → zweiter Browser-Kontext | Position identisch |
| T-09 | US-14, US-15 | Testdaten laden → Sortiert → Netz | Keine überlappenden Karten (Bounding-Box-Prüfung) |
| T-10 | US-17 | Linear, Woche → Initiative 01.09.–30.09. | Balken über KW 36–40; Monat: Spalte September |
| T-11 | US-19 | Filter Status Blockiert | Nur blockierte Karten voll sichtbar; Sidepanel nur blockierte mit Eltern |
| T-12 | US-21 | Suche nach `#[0-9a-fA-F]{3,8}` in `src/` außer `tokens.css`; `/dev/components` öffnen | keine Treffer; Hintergrund #050505, Buttons und Felder wie in der Design-System-Datei |
| T-13 | US-22 | Netzwerk trennen → Titel ändern → Netzwerk verbinden | E-03 erscheint, verschwindet; Änderung gespeichert |
| T-14 | US-23 | Map → Als PNG speichern | Datei vorhanden, Breite ≥ 2 × Canvas-Breite |
| T-15 | US-07 | Ziel mit 2 Initiativen löschen | E-07 mit „2“, danach alle drei Karten weg |
| T-16 | US-24 | Export → Daten löschen → Import | Kartenanzahl wie vor dem Export |
| T-17 | US-25 | Ziel „Finanzierung“ → Visionen → zweite Vision abwählen und wieder anhaken; Vision wechseln | Ziel in beiden Visionen mit gleicher Farbe und gleichem Status; letzte Vision abwählen → E-14 |

**Fertig ist der Prototyp, wenn:** T-01 bis T-17 auf der Vercel-URL bestehen, alle Screens die Zustände leer, laden und Fehler zeigen, die Oberfläche der Design-System-Datei entspricht, Desktop und Tablet-Querformat funktionieren, keine Platzhaltertexte sichtbar sind und die README ein Setup in unter 15 Minuten erlaubt.

## 14 Entscheidungen und Annahmen

**Entschieden am 07.09.2026 (Antworten)**

| Nr. | Entscheidung |
|---|---|
| D-01 | Nur Conny als Nutzerin, mehrere Geräte synchron, Cloud-Datenbank, Login per Magic Link |
| D-02 | Alles aus der Spezifikation ist Must |
| D-03 | Status von Ziel und Vision automatisch abgeleitet, manuell überschreibbar |
| D-04 | Eine Initiative gehört zu genau einem Ziel |
| D-05 | Framer Dark Design System als Basis; Prototyp nur dunkel, heller Modus später ohne Umbau ergänzbar |
| D-06 | Brief wird in Dropbox und Google Drive „System Map“ abgelegt |
| D-07 | Brief v0.2 mit allen Annahmen A-01 bis A-46 freigegeben |
| D-08 | Supabase-Projekt `system-map` über den Konnektor angelegt (Frankfurt, 0 € / Monat), Datenmodell als Migration angewendet |
| D-09 | Datenmodell geändert: Ein Ziel kann zu mehreren Visionen gehören (`goal_vision`). Umgesetzt in Migration 0003 |
| D-10 | „Bildhauerei / Ton“ und „Skizzieren“ werden eigene Initiativen: „Weiterbildung Bildhauerei / Ton“ und „Weiterbildung Skizzieren“; die Sammel-Initiative „Weiterbildungen“ entfällt |
| D-11 | Für die Testdaten werden Status, Zeiträume, Prioritäten, Metriken und Abhängigkeiten erfunden, damit alle Ansichten und Tests etwas zeigen |
| D-12 | Der Seed läuft über `/dev/seed` in der angemeldeten App, nicht über einen Service-Role-Key. Er schreibt nur, wenn für die Nutzerin noch keine Vision besteht, und zeigt danach die Zeilenzahl je Tabelle. `pnpm db:seed` gibt nur diesen Weg als Hinweis aus |
| D-13 | `/dev/components` und `/dev/seed` werden mit ausgeliefert, nur hinter dem Login erreichbar und nirgends in der Oberfläche verlinkt. So bleibt T-12 auf der Vercel-Adresse prüfbar |
| D-14 | Die drei Migrationsdateien wurden auf die tatsächlich angewendeten Versionen umbenannt (Inhalt unverändert), `supabase/config.toml` mit `project_id` angelegt |
| D-15 | Die einmaligen Supabase-Auth-Einstellungen (Site URL, Redirect URLs, Gültigkeit des Magic Links, Sitzungsdauer, Mailvorlage) nimmt Conny im Dashboard vor, nach der Liste im Abschnitt „Einmalige Supabase-Einstellungen“ der README |

**Annahmen zur Bestätigung**

| Nr. | Thema | Vorschlag | Abschnitt |
|---|---|---|---|
| A-01 | Hypothese | Karte macht Priorisieren schneller und Fortschritt sichtbar | 0 |
| A-02 | Zweck | Eigennutzung ab Tag 1, keine Testnutzer:innen | 0 |
| A-03 | Löschen | Löschen mit Bestätigung, Unterkarten werden mitgelöscht, kein Papierkorb | 1, 5 |
| A-04 | Sicherung | JSON-Export und -Import | 1, 8 |
| A-05 | Nicht im Umfang | Teilen, Benachrichtigungen, Kommentare, Anhänge, Undo, Smartphone, Mehrsprachigkeit | 1 |
| A-06 | Geräte | Desktop zuerst, Tablet quer, Smartphone nicht optimiert | 2 |
| A-07 | Browser | aktuelle Chrome, Safari, Firefox, Edge | 2 |
| A-08 | Sprache | Deutsch | 2 |
| A-09 | Ansprache | Verben im Infinitiv, keine Anrede | 2 |
| A-10 | Barrierefreiheit | Tastatur für Formulare, Kontrast 4,5:1; Ziehen ohne Tastaturalternative | 2 |
| A-11 | Stack | React, Vite, React Flow, dagre, Tailwind mit Framer-Tokens, Radix-Primitive, Supabase, Vercel, Vitest, Playwright | 3 |
| A-12 | Umsetzungsgenauigkeit | Tokens und Komponentenmuster verbindlich; Karten und Map nach A-17, A-18, A-46 | 4 |
| A-13 | Zielfarben | 8 Farben: 7 MTA-Linien plus Framer Teal, ohne Blau, auf dunklem Grund geprüft, automatisch zugewiesen, änderbar | 4 |
| A-14 | Statusfarben | In Planung `--text-secondary`, Begonnen `--accent`, Abgeschlossen `--success`, Blockiert `--danger` | 4 |
| A-15 | Farbe vs. Status | Zielfarbe = Linien und Streifen; Status = Badge mit Punkt | 4 |
| A-16 | Schrift | Inter Variable über `@fontsource-variable/inter`; Größen nach den Mustern des Design Systems | 4 |
| A-17 | Kartenaufbau | Größen, Flächen, Radien und Inhalte je Typ nach Design-System-Tokens | 4 |
| A-18 | Linien | 6 px in Zielfarbe, abgerundet; Blockade 2 px gestrichelt `--danger` mit Pfeil | 4 |
| A-19 | Bewegung | 150 ms Farbwechsel wie im Design System, Toggle 180 ms, Layoutwechsel 300 ms | 4 |
| A-20 | Priorität | Hoch / Mittel / Niedrig / Keine | 5 |
| A-21 | Mehrere Visionen | Modell erlaubt mehrere; Map zeigt eine; Auswahl im Header | 5 |
| A-22 | Reihenfolge | `sort_index` für Ziele und Initiativen, Standard Erstellungsreihenfolge | 5 |
| A-23 | Metrik | abhakbares Kriterium mit optionalem Ziel-/Istwert | 5 |
| A-24 | Blockade durch eigene Initiative | erlaubt | 5 |
| A-25 | Einstellungen | View, Layout, Zeitskala, Modus, Filter, aktive Vision in der Datenbank, gelten auf allen Geräten | 5 |
| A-26 | Vision-Status | Vision wird nie automatisch Blockiert | 5 |
| A-27 | Fortschritt | Prozent aus Metriken → Initiativen → Ziele → Vision; Balken in Zielfarbe | 5 |
| A-28 | „Kategorie“ | kein eigenes Feld; Kategorie = Ziel | 5 |
| A-29 | Registrierung | nur eine freigegebene E-Mail | 6 |
| A-30 | Sitzung | 30 Tage | 6 |
| A-31 | Header-Anordnung | links Vision, Mitte View/Layout/Fit/Export, rechts Filter/Zähler/Menü | 7 |
| A-32 | Minimap | unten rechts in der Map | 7 |
| A-33 | Sidepanel-Tiefe | Metriken als vierte Ebene im Accordion | 7 |
| A-34 | Abhängigkeit anlegen | über Dialog S-10 aus dem Detailpanel des Ziels | 7 |
| A-35 | Hover-Plus | Vision → Ziel, Ziel → Initiative, Initiative → Metrik | 7 |
| A-36 | Sortiert vs. Netz | Sortiert = Hierarchie links → rechts; Netz = radial um die Vision | 7 |
| A-37 | Layout-Umschalter | dreiteiliger Schalter Flexibel / Sortiert / Netz | 7 |
| A-38 | Linear ohne Enddatum | Balken bis heute, gestricheltes Ende; Ziel-Enddatum als Raute | 7 |
| A-39 | Filter | nach Status und Ziel; Map dimmt, Linear und Sidepanel blenden aus | 7 |
| A-40 | Zähler | über alle Initiativen der aktiven Vision, unabhängig vom Filter | 7 |
| A-41 | Sync | Änderungen anderer Geräte nach Neuladen, kein Live-Sync | 7 |
| A-42 | Accordion-Zustand | im Browser gespeichert, nicht in der Datenbank | 8 |
| A-43 | Qualität | Werte wie in Abschnitt 11 | 11 |
| A-44 | Heller Modus vorbereitet | Tokens unter `data-theme="dark"` in `tokens.css`, keine Hex-Werte im Komponentencode, `settings.theme` bleibt | 4 |
| A-45 | Komponenten-Zuordnung | Tabs, Segmented, Badge, Panel, Tree, Property Rows, Inputs, Toggle, Check, Buttons wie in der Tabelle | 4 |
| A-46 | Map-Canvas | Punktraster in `--border-default`, Minimap, Auswahlrahmen `--accent` | 4 |
| A-47 | Geteilte Ziele | Ein Ziel in zwei Visionen zeigt in beiden dieselben Initiativen, dieselbe Farbe und denselben Status. Die Markierungen (1)/(2) auf Initiativenebene aus dem Google Doc sind nicht abgebildet | 5, 7 |
| A-48 | Letzte Vision | Ein Ziel braucht mindestens eine Vision; die Oberfläche verhindert das Abwählen der letzten (E-14). Entfällt die letzte Verknüpfung doch, löscht die Datenbank das Ziel | 5 |
| A-49 | Position geteilter Karten | Ein Ziel hat eine Position, die in allen Visionen gilt. Im Layout „Flexibel“ liegen geteilte Ziele daher in beiden Maps an derselben Stelle; „Fit to Screen“ gleicht das aus. Sortiert und Netz berechnen ohnehin je Vision | 5, 7 |
| A-50 | Inhalte der Testdaten | Titel und Zuordnung stammen aus dem Google Doc. Status, Zeiträume, Prioritäten, Metriken, Abhängigkeiten, Beschreibungen und Positionen sind erfunden (D-11) und in der App änderbar | 15 |
| A-51 | Zusätzliche Tokens | `--on-accent` (#FFFFFF) für Text und Symbole auf `--accent`, ersetzt jedes `#fff` des Design Systems; dazu vier Status-Aliase `--status-in-planung`, `--status-begonnen`, `--status-abgeschlossen`, `--status-blockiert` als Verweise auf bestehende Tokens, ohne neuen Farbwert | 4 |
| A-52 | Router | Eigener Mini-Router für `/login`, `/`, `/dev/components` und `/dev/seed` statt `react-router`; verarbeitet die Rückkehr vom Magic Link mit Query- und Hash-Parametern | 3 |
| A-53 | Komponentenaufbau | Die Basis-Komponenten übernehmen die CSS-Regeln aus `framer-dark.html` unverändert (Farben durch Tokens ersetzt); React-Komponenten sind dünne Hüllen. Tailwind dient nur dem Layout | 3, 4 |
| A-54 | Laufzeit | Node 22 oder neuer, pnpm über Corepack. In `package.json` steht `packageManager: pnpm@12.3.4` – die auf dem Rechner vorhandene Fassung. Im Plan war von pnpm 10 die Rede; das war meine Annahme, nicht der Bestand | 3 |
| A-55 | Testwerkzeuge | Testing Library neben Vitest und Playwright | 3 |
| A-56 | Kontrast gefüllter Buttons | Kontrast mindestens 4,5:1 gilt für Fließtext, Labels, Kartentexte und Statusangaben. Weißer Text auf `--accent-hover` (3,52:1) und `--danger` (3,57:1) erreicht das nicht; da das Design System verbindlich ist (D-05), bleibt es dabei. Bewusste, dokumentierte Ausnahme zu A-10 | 2, 4 |

**Offen (von dir zu liefern):** nichts. Alle Angaben liegen vor.

## 15 Assets-Checkliste

- [x] `docs/PRD_Brief.md` – diese Datei (v0.5)
- [x] `docs/design-system/framer-dark.html` – Kopie von `framer-dark-design-system.html` aus Dropbox „System Map“
- [x] Schrift – npm-Paket `@fontsource-variable/inter`, wird in Scheibe 1 installiert
- [x] `docs/texte.md` – aus Abschnitt 10 erzeugt, ergänzt um Buttons, Feldbeschriftungen, leere Zustände, Mail-Vorlage
- [x] `docs/testdaten.json` – aus dem Google Doc „260907-System Map-Testdaten“ erzeugt: 2 Visionen, 6 Ziele (3 davon in beiden Visionen), 16 Initiativen, 9 Metriken, 2 Abhängigkeiten, Positionen und Einstellungen. Enthaltene Testfälle: blockiertes Ziel (Öffentlichkeit), abgeschlossene Initiative (KSK Mitgliedschaft), zwei Initiativen ohne Enddatum, zwei Ziele ohne Initiativen (leerer Zustand), Metriken mit und ohne Zahlenwert, beide Arten von Abhängigkeit. Erfundene Werte siehe A-50
- [x] `.env.example` und `.env.local` – siehe Abschnitt 9
- [x] Konten: Supabase (Projekt angelegt), Vercel (Konto vorhanden)
- [x] `CLAUDE.md` – liegt vor
- [x] `supabase/migrations/` – drei Migrationen, angewendet; Dateinamen auf die angewendeten Versionen angeglichen (D-14)
- [x] `supabase/config.toml` – bindet das Repository an das Supabase-Projekt (D-14)

## 16 Startprompt für Claude Code

```
Lies CLAUDE.md, docs/PRD_Brief.md, docs/texte.md und docs/design-system/framer-dark.html vollständig.
Die Supabase-Migrationen in supabase/migrations/ sind bereits angewendet; lies sie, um das Datenmodell zu kennen.
Erstelle einen Umsetzungsplan für Scheibe 1 aus Abschnitt 12:
welche Dateien du anlegst, welche Pakete du installierst, welche Migrationen du schreibst.
Liste alle Stellen, an denen der Brief unklar oder widersprüchlich ist, als Fragen.
Baue noch nichts. Warte auf meine Freigabe.
```
