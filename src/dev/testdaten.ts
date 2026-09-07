import roh from '../../docs/testdaten.json'
import type { Testdaten } from '@/lib/seed'

/**
 * docs/testdaten.json als getypte Struktur.
 *
 * Die Datei wird beim Bauen eingebettet; sie ist Teil des Repositories und
 * enthält keine Geheimnisse. Der Cast steht an genau einer Stelle, damit die
 * Prüfung der Werte im Test (tests/unit/seed.test.ts) und in der Datenbank
 * (Constraints der Migration) die eigentliche Absicherung bleibt.
 */
export const testdaten = roh as unknown as Testdaten

export const testdatenMeta = roh.meta
