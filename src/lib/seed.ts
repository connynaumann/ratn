import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, TablesInsert } from './database.types'

/**
 * Testdaten aus docs/testdaten.json in die Datenbank schreiben (Brief D-12).
 *
 * Der Seed läuft in der angemeldeten App unter /dev/seed. Es gibt keinen Weg
 * daran vorbei: Row Level Security lässt nur eigene Zeilen zu, und ein
 * Service-Role-Key kommt nicht zum Einsatz. `owner_id` wird bewusst nicht
 * mitgeschickt – die Spalte hat in allen Tabellen den Standard auth.uid().
 *
 * baueSeedZeilen() ist rein und ohne Netz testbar: es ersetzt die Platzhalter-
 * IDs (v1, g1, i01 …) durch echte UUIDs und behält alle Verweise bei.
 */

type Status = Database['public']['Enums']['card_status']
type Prioritaet = Database['public']['Enums']['card_priority']
type Quelle = Database['public']['Enums']['dependency_source']

export type TestdatenVision = {
  id: string
  title: string
  description: string | null
  status_override: Status | null
  priority: Prioritaet | null
  start_date: string
  end_date: string | null
  pos_x: number
  pos_y: number
}

export type TestdatenGoal = TestdatenVision & { color: string }

export type TestdatenGoalVision = {
  goal_id: string
  vision_id: string
  sort_index: number
}

export type TestdatenInitiative = {
  id: string
  goal_id: string
  title: string
  description: string | null
  status: Status
  priority: Prioritaet | null
  start_date: string
  end_date: string | null
  pos_x: number
  pos_y: number
  sort_index: number
}

export type TestdatenMetric = {
  id: string
  initiative_id: string
  title: string
  done: boolean
  target_value: number | null
  current_value: number | null
  unit: string | null
  pos_x: number
  pos_y: number
}

export type TestdatenDependency = {
  id: string
  source_type: Quelle
  source_id: string
  target_goal_id: string
}

export type TestdatenSettings = {
  active_vision_id: string | null
  view: Database['public']['Enums']['view_mode']
  layout: Database['public']['Enums']['layout_mode']
  timeline_scale: Database['public']['Enums']['timeline_scale']
  theme: Database['public']['Enums']['theme_mode']
  filter_status: Status[]
  filter_goal_ids: string[]
}

export type Testdaten = {
  vision: TestdatenVision[]
  goal: TestdatenGoal[]
  goal_vision: TestdatenGoalVision[]
  initiative: TestdatenInitiative[]
  metric: TestdatenMetric[]
  dependency: TestdatenDependency[]
  settings: TestdatenSettings
}

export type SeedZeilen = {
  vision: TablesInsert<'vision'>[]
  goal: TablesInsert<'goal'>[]
  goal_vision: TablesInsert<'goal_vision'>[]
  initiative: TablesInsert<'initiative'>[]
  metric: TablesInsert<'metric'>[]
  dependency: TablesInsert<'dependency'>[]
  settings: TablesInsert<'settings'>
}

/** Reihenfolge des Schreibens; Fremdschlüssel verlangen genau diese. */
export const SEED_REIHENFOLGE = [
  'vision',
  'goal',
  'goal_vision',
  'initiative',
  'metric',
  'dependency',
] as const

export type SeedTabelle = (typeof SEED_REIHENFOLGE)[number]

function neueUuid(): string {
  return crypto.randomUUID()
}

/**
 * Ersetzt die Platzhalter-IDs durch UUIDs und gibt fertige Insert-Zeilen
 * zurück. `erzeugeId` ist austauschbar, damit Tests feste Werte einsetzen
 * können.
 */
export function baueSeedZeilen(
  daten: Testdaten,
  erzeugeId: () => string = neueUuid,
): SeedZeilen {
  const uuid = new Map<string, string>()
  const loese = (platzhalter: string): string => {
    const vorhanden = uuid.get(platzhalter)
    if (vorhanden != null) return vorhanden
    throw new Error(`Testdaten verweisen auf unbekannte ID: ${platzhalter}`)
  }
  const vergib = (platzhalter: string): string => {
    const neu = erzeugeId()
    uuid.set(platzhalter, neu)
    return neu
  }

  const vision = daten.vision.map((v) => ({
    id: vergib(v.id),
    title: v.title,
    description: v.description,
    status_override: v.status_override,
    priority: v.priority,
    start_date: v.start_date,
    end_date: v.end_date,
    pos_x: v.pos_x,
    pos_y: v.pos_y,
  }))

  const goal = daten.goal.map((g) => ({
    id: vergib(g.id),
    title: g.title,
    description: g.description,
    color: g.color,
    status_override: g.status_override,
    priority: g.priority,
    start_date: g.start_date,
    end_date: g.end_date,
    pos_x: g.pos_x,
    pos_y: g.pos_y,
  }))

  const goal_vision = daten.goal_vision.map((gv) => ({
    goal_id: loese(gv.goal_id),
    vision_id: loese(gv.vision_id),
    sort_index: gv.sort_index,
  }))

  const initiative = daten.initiative.map((i) => ({
    id: vergib(i.id),
    goal_id: loese(i.goal_id),
    title: i.title,
    description: i.description,
    status: i.status,
    priority: i.priority,
    start_date: i.start_date,
    end_date: i.end_date,
    pos_x: i.pos_x,
    pos_y: i.pos_y,
    sort_index: i.sort_index,
  }))

  const metric = daten.metric.map((m) => ({
    id: vergib(m.id),
    initiative_id: loese(m.initiative_id),
    title: m.title,
    done: m.done,
    target_value: m.target_value,
    current_value: m.current_value,
    unit: m.unit,
    pos_x: m.pos_x,
    pos_y: m.pos_y,
  }))

  const dependency = daten.dependency.map((d) => ({
    id: vergib(d.id),
    source_type: d.source_type,
    source_id: loese(d.source_id),
    target_goal_id: loese(d.target_goal_id),
  }))

  const settings = {
    active_vision_id:
      daten.settings.active_vision_id != null
        ? loese(daten.settings.active_vision_id)
        : null,
    view: daten.settings.view,
    layout: daten.settings.layout,
    timeline_scale: daten.settings.timeline_scale,
    theme: daten.settings.theme,
    filter_status: daten.settings.filter_status,
    filter_goal_ids: daten.settings.filter_goal_ids,
  }

  return { vision, goal, goal_vision, initiative, metric, dependency, settings }
}

export type SeedErgebnis =
  | { art: 'geschrieben'; zeilen: Record<SeedTabelle | 'settings', number> }
  | { art: 'uebersprungen'; grund: 'daten-vorhanden'; visionen: number }
  | { art: 'fehler'; meldung: string }

/**
 * Schreibt die Testdaten. Bricht ab, sobald bereits eine Vision existiert –
 * der Seed ersetzt und löscht nichts (Antwort F-2).
 */
export async function wendeSeedAn(
  client: SupabaseClient<Database>,
  daten: Testdaten,
): Promise<SeedErgebnis> {
  const vorhanden = await client
    .from('vision')
    .select('id', { count: 'exact', head: true })
  if (vorhanden.error != null) {
    return { art: 'fehler', meldung: vorhanden.error.message }
  }
  if ((vorhanden.count ?? 0) > 0) {
    return {
      art: 'uebersprungen',
      grund: 'daten-vorhanden',
      visionen: vorhanden.count ?? 0,
    }
  }

  const zeilen = baueSeedZeilen(daten)
  const gezaehlt: Record<string, number> = {}

  for (const tabelle of SEED_REIHENFOLGE) {
    const satz = zeilen[tabelle]
    if (satz.length === 0) {
      gezaehlt[tabelle] = 0
      continue
    }
    // Der Aufruf ist je Tabelle typisiert; die Schleife verliert die
    // Verbindung zwischen Tabellenname und Zeilentyp, daher hier ein Cast.
    const { error } = await client
      .from(tabelle)
      .insert(satz as never)
    if (error != null) {
      return { art: 'fehler', meldung: `${tabelle}: ${error.message}` }
    }
    gezaehlt[tabelle] = satz.length
  }

  const { error: settingsFehler } = await client
    .from('settings')
    .upsert(zeilen.settings, { onConflict: 'owner_id' })
  if (settingsFehler != null) {
    return { art: 'fehler', meldung: `settings: ${settingsFehler.message}` }
  }
  gezaehlt.settings = 1

  return {
    art: 'geschrieben',
    zeilen: gezaehlt as Record<SeedTabelle | 'settings', number>,
  }
}
