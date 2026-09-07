# System Map

Vision, Ziele, Initiativen und Metriken mit ihren Abhängigkeiten als Karte –
ähnlich einem U-Bahn-Netz.

Verbindliche Spezifikation: [`docs/PRD_Brief.md`](docs/PRD_Brief.md) ·
Design System: [`docs/design-system/framer-dark.html`](docs/design-system/framer-dark.html) ·
Oberflächentexte: [`docs/texte.md`](docs/texte.md) ·
Arbeitsregeln: [`CLAUDE.md`](CLAUDE.md)

**Stand:** Scheibe 1 (Grundgerüst) – Anmeldung, Design-Tokens, Basis-Komponenten,
App-Rahmen, Seed. Die Karte selbst kommt ab Scheibe 3.

---

## Einrichten (unter 15 Minuten)

Voraussetzung: **Node 22 oder neuer**. pnpm kommt über Corepack, es muss nichts
global installiert werden.

```bash
corepack enable pnpm
pnpm install
cp .env.example .env.local   # Werte eintragen, siehe unten
pnpm dev
```

Danach läuft die App auf <http://localhost:5173>.

### Umgebungsvariablen

Alle vier stehen in `.env.example`. `.env.local` gehört nicht ins Repository.

| Variable | Woher |
|---|---|
| `VITE_SUPABASE_URL` | Supabase-Dashboard → Project Settings → Data API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → Publishable key (`sb_publishable_…`) |
| `VITE_APP_URL` | lokal `http://localhost:5173`, auf Vercel die Adresse des Projekts |
| `VITE_ALLOWED_EMAIL` | die einzige freigegebene Adresse; muss der Zeile in `public.allowed_email` entsprechen |

Im Frontend liegt ausschließlich der öffentliche Client-Key. Der
Service-Role-Key wird nirgends verwendet – auch nicht im Seed.

### Datenbank

Die drei Migrationen in `supabase/migrations/` sind auf dem Projekt
`system-map` (Ref `nfmyezhwwwreqjryxlho`, Frankfurt) bereits angewendet. Ihre
Dateinamen tragen genau die Versionen, die in der Datenbank stehen, damit
`supabase db push` sie nicht erneut anwendet. `supabase/config.toml` bindet das
Repository an das Projekt.

Neue Migrationen dort ablegen und mit `supabase db push` anwenden. Bestehende
Migrationen inhaltlich nie ändern.

---

## Einmalige Supabase-Einstellungen

Diese fünf Punkte stehen nicht im Code und müssen einmal im Dashboard gesetzt
werden (Brief D-15). Danach besteht T-01.

| # | Pfad im Dashboard | Feld | Sollwert | Standard heute |
|---|---|---|---|---|
| 1 | Authentication → URL Configuration | **Site URL** | `http://localhost:5173` für die Entwicklung; nach Scheibe 7 die Vercel-Adresse | vermutlich `http://localhost:3000` |
| 2 | Authentication → URL Configuration | **Redirect URLs** | beide Einträge anlegen: `http://localhost:5173/**` und später `https://<projekt>.vercel.app/**` | leer |
| 3 | Authentication → Sign In / Providers → Email | **Email OTP Expiration** | `900` (= 15 Minuten, Brief US-01 und Mailvorlage) | `3600` (60 Minuten). Werte über 86400 lässt Supabase nicht zu |
| 4 | Authentication → Sessions | **Inactivity timeout** | `30 days` – die Sitzung verlängert sich bei Nutzung (Brief A-30) | leer, also unbegrenzt |
| 5 | Authentication → Emails → Templates → **Magic Link** | Betreff und Text | siehe unten | englischer Standardtext |

Zu **4**: auf derselben Seite steht **Time-box user sessions**. Das ist eine
harte Obergrenze *ohne* Verlängerung und bleibt leer – A-30 verlangt
„30 Tage, Verlängerung bei Nutzung“, und das leistet nur der Inactivity
timeout.

Zu **3**: Supabase hat die Seite in den letzten Versionen mehrfach umbenannt
(mal `Providers → Email`, mal `Sign In / Providers → Email`). Gesucht ist das
Feld mit dem Wort **OTP** und einer Angabe in Sekunden. Wenn du es nicht
findest, sag Bescheid – dann ist die Einstellung an anderer Stelle gelandet und
wir prüfen sie gemeinsam.

### Mailvorlage „Magic Link“

Wörtlich aus [`docs/texte.md`](docs/texte.md), Abschnitt „E-Mails“:

- **Betreff:** `Dein Anmelde-Link für System Map`
- **Text:** `Hallo, mit diesem Link meldest du dich bei System Map an. Der Link ist 15 Minuten gültig.`
- **Button:** `Anmelden` – im Template der Link `{{ .ConfirmationURL }}`
- **Fußzeile:** `Wenn du diese Mail nicht angefordert hast, ignoriere sie.`

### Freigegebene Adresse

Die Registrierung ist geschlossen. Durchgesetzt wird das in der Datenbank:
Tabelle `public.allowed_email` mit einem Trigger auf `auth.users`. Die Tabelle
ist über die API nicht erreichbar; eine weitere Adresse fügst du im
SQL-Editor des Dashboards hinzu.

---

## Befehle

| Befehl | Wirkung |
|---|---|
| `pnpm dev` | Entwicklungsserver auf <http://localhost:5173> |
| `pnpm build` | Produktivbuild nach `dist/` |
| `pnpm preview` | Produktivbuild lokal ansehen |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript |
| `pnpm test` | Vitest |
| `pnpm test:e2e` | Playwright (startet den Dev-Server selbst) |
| `pnpm db:seed` | zeigt den Weg zum Seed, siehe unten |

Vor dem ersten `pnpm test:e2e` einmal die Browser laden:

```bash
pnpm exec playwright install chromium
```

---

## Testdaten einspielen

Alle Tabellen stehen unter Row Level Security; geschrieben werden darf nur als
angemeldete Nutzerin. Deshalb läuft der Seed in der App und nicht als Skript
(Brief D-12):

1. `pnpm dev`
2. <http://localhost:5173> öffnen und per Magic Link anmelden
3. <http://localhost:5173/dev/seed> öffnen
4. **Testdaten einspielen** drücken

Der Seed schreibt nur, wenn noch keine Vision besteht, und zeigt danach die
Zeilenzahl je Tabelle. Er löscht und ersetzt nichts. Quelle:
[`docs/testdaten.json`](docs/testdaten.json) – 2 Visionen, 6 Ziele (3 davon in
beiden Visionen), 16 Initiativen, 9 Metriken, 2 Abhängigkeiten.

---

## Entwicklerseiten

Beide werden mit ausgeliefert, sind nur angemeldet erreichbar und nirgends in
der Oberfläche verlinkt (Brief D-13):

- `/dev/components` – Schaukasten aller Basis-Komponenten. Nebeneinander mit
  `docs/design-system/framer-dark.html` öffnen; Farben, Radien, Größen und
  Hover-Zustände müssen übereinstimmen (Abnahmetest T-12).
- `/dev/seed` – Testdaten einspielen.

---

## Aufbau

```
docs/                       Spezifikation, Texte, Design System, Testdaten
src/styles/tokens.css       einzige Datei mit Farbwerten (T-12)
src/styles/theme.css        Tailwind-Einstieg, nur var()-Verweise
src/styles/components.css   Komponenten-CSS aus der Design-System-Datei
src/components/ui/          Basis-Komponenten als dünne Hüllen darum
src/content/texte.ts        alle Oberflächentexte, gegen docs/texte.md geprüft
src/lib/                    Supabase-Client, Auth, Seed, Datenbank-Typen
src/features/auth/          S-01 Anmeldung
src/features/shell/         S-02 App-Rahmen, S-03 Header, S-06 Sidepanel
src/dev/                    /dev/components und /dev/seed
src/router.ts               eigener Mini-Router (Brief A-52)
supabase/migrations/        SQL-Migrationen, bereits angewendet
tests/unit/                 Vitest
tests/e2e/                  Playwright
```

Die Datei `src/lib/database.types.ts` ist aus dem Supabase-Projekt erzeugt und
eingecheckt, damit der Build ohne Netzzugriff auskommt. Nach einer neuen
Migration neu erzeugen.

---

## Manuelle Abnahme

Ein Abnahmetest lässt sich nicht automatisieren:

- **T-01** (US-01): freigegebene Adresse eingeben → Link im Postfach öffnen →
  die App zeigt S-02. Der Klick auf einen Link in einer echten Mail ist im Test
  nicht nachstellbar. Alles davor und danach ist abgedeckt: T-02 (fremde
  Adresse → E-04, kein Versand) und E-05 (abgelaufener Link) laufen in
  `tests/e2e/login.spec.ts`.

---

## Hinweise

- Supabase pausiert kostenlose Projekte nach sieben Tagen ohne Zugriff.
  Reaktivierung per Klick im Dashboard.
- Magic-Link-Mails sind im Free Tier auf wenige pro Stunde begrenzt. Für eine
  Nutzerin reicht das.
- Der Prototyp ist ausschließlich dunkel (Brief D-05). Die Tokens sind für
  einen hellen Modus vorbereitet: ein zweiter Block `:root[data-theme="light"]`
  in `tokens.css` genügt, die Komponenten bleiben unverändert.
