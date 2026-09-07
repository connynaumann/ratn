/**
 * `pnpm db:seed` – Hinweis statt Skript.
 *
 * Alle Tabellen stehen unter Row Level Security; geschrieben werden darf nur
 * als angemeldete Nutzerin. Ein Service-Role-Key kommt nicht zum Einsatz
 * (Brief D-12). Deshalb läuft der Seed in der App.
 */
const zeilen = [
  '',
  'Testdaten einspielen (Brief D-12)',
  '',
  '  1. pnpm dev',
  '  2. http://localhost:5173 öffnen und per Magic Link anmelden',
  '  3. http://localhost:5173/dev/seed öffnen',
  '  4. „Testdaten einspielen“ drücken',
  '',
  'Der Seed schreibt nur, wenn noch keine Vision besteht, und nennt danach',
  'die Zeilenzahl je Tabelle. Er löscht und ersetzt nichts.',
  '',
  'Quelle: docs/testdaten.json',
  '',
]
console.log(zeilen.join('\n'))
