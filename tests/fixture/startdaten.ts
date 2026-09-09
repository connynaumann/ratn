import { baueSeedZeilen } from '@/lib/seed'
import type { Daten } from '@/lib/model'
import { testdaten } from '@/dev/testdaten'

/**
 * Startzustand der Vorrichtung, aus docs/testdaten.json.
 *
 * Dieselbe Quelle wie der Seed, dieselbe Umwandlung – nur landet das Ergebnis
 * im Speicher statt in der Datenbank. Die Spalten, die sonst die Datenbank
 * setzt (owner_id, created_at, updated_at), werden hier ergänzt.
 */
const SYSTEMSPALTEN = {
  owner_id: 'vorrichtung',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
}

export function startdaten(): Daten {
  const zeilen = baueSeedZeilen(testdaten)
  return {
    vision: zeilen.vision.map((v) => ({ ...SYSTEMSPALTEN, ...v })),
    goal: zeilen.goal.map((g) => ({ ...SYSTEMSPALTEN, ...g })),
    goal_vision: zeilen.goal_vision.map((gv) => ({ ...SYSTEMSPALTEN, ...gv })),
    initiative: zeilen.initiative.map((i) => ({ ...SYSTEMSPALTEN, ...i })),
    metric: zeilen.metric.map((m) => ({ ...SYSTEMSPALTEN, ...m })),
    dependency: zeilen.dependency.map((d) => ({ ...SYSTEMSPALTEN, ...d })),
    settings: { ...SYSTEMSPALTEN, ...zeilen.settings },
  } as Daten
}
