# CLAUDE.md – System Map

<!-- Erstellt: 07.09.2026-16:05 · Gehört in die Wurzel des Repositories github.com/connynaumann/ratn -->

## Projekt

System Map hilft Conny beim Wechsel in die freie künstlerische Arbeit, indem sie Vision, Ziele, Initiativen und Metriken mit ihren Abhängigkeiten als Karte sichtbar macht, ähnlich einem U-Bahn-Netz.

Prototyp-Ziel: Wenn Ziele, Initiativen und Abhängigkeiten auf einer Karte sichtbar sind, lassen sich nächste Schritte schneller priorisieren und Fortschritt wird sichtbar.

Verbindliche Spezifikation: `docs/PRD_Brief.md`. Design System: `docs/design-system/framer-dark.html`. Texte: `docs/texte.md`.

Eine Nutzerin (connynaumann@gmail.com), mehrere Geräte, nur dunkler Modus.

## Stack

- Frontend: React 19, TypeScript, Vite (Single-Page-App)
- Karten-Canvas: React Flow `@xyflow/react` v12; Layout Sortiert mit `dagre`, Layout Netz eigene Radial-Berechnung
- Styling: Tailwind CSS 4 mit den Tokens aus `src/styles/tokens.css`; Radix-Primitive (Dialog, Popover, Select, Accordion) ohne shadcn-Standardlook
- Icons: `lucide-react`; Schrift: `@fontsource-variable/inter`
- Backend: Supabase (Postgres, Auth per Magic Link, Row Level Security), Projekt `system-map`, Region eu-central-1. Drei Migrationen sind angewendet. Ein Ziel kann zu mehreren Visionen gehören (Tabelle `goal_vision`, Brief D-09)
- PNG-Export: `html-to-image`
- Tests: Vitest (Statuslogik, Layout), Playwright (Abläufe)
- Hosting: Vercel, statisch
- Node 22, pnpm

## Befehle

- Installieren: `pnpm install`
- Entwicklung: `pnpm dev` → `http://localhost:5173`
- Tests: `pnpm test` · Abläufe: `pnpm test:e2e`
- Lint und Typen: `pnpm lint && pnpm typecheck`
- Build: `pnpm build`
- Datenbank: Migrationen liegen in `supabase/migrations/` und sind auf dem Supabase-Projekt bereits angewendet. Neue Migrationen dort ablegen und mit `supabase db push` anwenden.
- Testdaten: `pnpm db:seed` lädt `docs/testdaten.json`

## Ordnerstruktur

```
docs/PRD_Brief.md                  Spezifikation (verbindlich)
docs/design-system/framer-dark.html Design System (verbindlich für Tokens und Komponenten)
docs/texte.md                      alle Oberflächentexte, wörtlich übernehmen
docs/testdaten.json                echte Inhalte von Conny für Seed und Tests
src/styles/tokens.css              alle Farben, Radien, Abstände, Schatten als CSS-Variablen
src/components/ui/                 Basis-Komponenten nach dem Design System
src/features/map/                  Map-View, Karten, Kanten, Layouts
src/features/linear/               Linear-View
src/features/sidepanel/            Liste und Detail
src/lib/status.ts                  Statuslogik und Fortschritt (reine Funktionen, getestet)
src/lib/supabase.ts                Client, Laden, Speichern mit Debounce
supabase/migrations/               SQL-Migrationen
tests/                             Vitest und Playwright
.env.example                       alle Umgebungsvariablen, ohne Werte
```

## Arbeitsregeln

1. **Scope.** Nur bauen, was in `docs/PRD_Brief.md` steht. Ideen darüber hinaus als Vorschlag nennen, nicht umsetzen. Nichts aus „Nicht im Umfang“ anfangen.
2. **Reihenfolge.** Scheiben und Stories in der Reihenfolge aus `docs/PRD_Brief.md`, Abschnitt 12. Eine Scheibe vollständig fertig (inklusive Tests), dann melden und auf Prüfung warten.
3. **Fragen statt raten** bei: Fachlogik, Oberflächentexten, Änderungen am Datenmodell, neuen externen Diensten, allem, was Geld kostet. **Selbst entscheiden** bei: technischen Details innerhalb des Stacks, Dateistruktur, Benennung im Code.
4. **Akzeptanzkriterien werden zu Tests.** Jedes Kriterium einer Story ist mindestens ein automatisierter Test. Die Statustabelle aus Abschnitt 5 und die Fortschrittsrechnung sind mit Vitest abgedeckt.
5. **Verifizieren.** Nach jeder Scheibe: `pnpm lint && pnpm typecheck && pnpm test`, Entwicklungsserver starten, Ergebnis im Browser prüfen.
6. **Texte** wörtlich aus `docs/texte.md`, referenziert über ihre IDs (E-xx, TX-xx). Keine eigenen Formulierungen. Fehlende Texte als Frage melden. Sprache Deutsch, Buttons als Verben im Infinitiv.
7. **Design.** Nur Tokens aus `src/styles/tokens.css`. Kein Hex-Wert im Komponentencode. Komponenten sehen aus wie in `docs/design-system/framer-dark.html`; Zuordnung in `docs/PRD_Brief.md`, Abschnitt 4. Unter `/dev/components` liegt ein Schaukasten aller Basis-Komponenten zum Vergleich.
8. **Zustände.** Jeder Screen hat die Zustände leer, laden und Fehler wie im Brief beschrieben.
9. **Daten.** Alle Schreibvorgänge optimistisch mit 500 ms Debounce; bei Fehler Hinweis E-03 und Wiederholung alle 10 s. Lesen nur über den Anon-Key mit Row Level Security.
10. **Keine Secrets** im Code oder in Commits. `.env.example` bei jeder neuen Variable ergänzen. `.env.local` ist in `.gitignore`.
11. **Abschluss pro Scheibe.** Kurz berichten: was gebaut, was getestet, was offen, welche Annahmen aus dem Brief berührt wurden.

## Git

- Hauptbranch: `main`. Pro Scheibe ein Branch: `slice/1-grundgeruest`, `slice/2-karten` …
- Commit-Nachricht: `[US-03] Ziel per Hover-Plus anlegen` oder `[S1] Tokens und Basis-Komponenten`
- Kein Push, solange Lint, Typecheck oder Tests fehlschlagen
- Merge auf `main` erst nach Prüfung der Scheibe durch Conny

## Definition of Done (pro Story)

- [ ] Alle Akzeptanzkriterien erfüllt und durch Tests abgedeckt
- [ ] Zustände leer, laden, Fehler umgesetzt
- [ ] Funktioniert auf Desktop und Tablet-Querformat (ab 1024 px)
- [ ] Nur Tokens verwendet, Vergleich mit dem Design System bestanden
- [ ] Lint, Typecheck, Tests grün
- [ ] Keine Platzhaltertexte, keine `TODO`-Kommentare ohne Hinweis im Bericht
- [ ] `.env.example` und `README.md` aktuell

## Nicht tun

- Keine zusätzlichen Bibliotheken ohne Rückfrage (Ausnahme: die im Stack genannten)
- Keine Änderung am Datenmodell ohne Rückfrage; Migrationen nie umschreiben, nur neue anlegen
- Keine Funktionen aus „Nicht im Umfang“: Teilen, Benachrichtigungen, Kommentare, Anhänge, Undo, Smartphone-Layout, Mehrsprachigkeit, heller Modus
- Keine Secrets committen, keinen Service-Role-Key im Frontend
- Keine Skripte, die Nutzerdaten löschen, ohne ausdrückliche Anweisung
- Keinen Aufruf externer Dienste zur Laufzeit außer Supabase (Schrift und Icons liegen im Repo)
