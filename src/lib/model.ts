import type { Database, Tables } from './database.types'

/** Zeilen der Datenbank, wie sie im Client liegen. */
export type Vision = Tables<'vision'>
export type Goal = Tables<'goal'>
export type GoalVision = Tables<'goal_vision'>
export type Initiative = Tables<'initiative'>
export type Metric = Tables<'metric'>
export type Dependency = Tables<'dependency'>
export type Settings = Tables<'settings'>

export type Status = Database['public']['Enums']['card_status']
export type Prioritaet = Database['public']['Enums']['card_priority']
export type Zielfarbe = `line-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

/** Die vier Kartentypen aus Abschnitt 5. */
export const KARTENTYPEN = ['vision', 'goal', 'initiative', 'metric'] as const
export type Kartentyp = (typeof KARTENTYPEN)[number]

/** Verweis auf eine Karte: Typ und ID reichen, um sie im Zustand zu finden. */
export type KartenRef = { typ: Kartentyp; id: string }

/** Alles, was beim Start geladen wird. */
export type Daten = {
  vision: Vision[]
  goal: Goal[]
  goal_vision: GoalVision[]
  initiative: Initiative[]
  metric: Metric[]
  dependency: Dependency[]
  settings: Settings | null
}

export const LEERE_DATEN: Daten = {
  vision: [],
  goal: [],
  goal_vision: [],
  initiative: [],
  metric: [],
  dependency: [],
  settings: null,
}

export const STATUS_TOKEN: Record<Status, string> = {
  in_planung: 'status-in-planung',
  begonnen: 'status-begonnen',
  abgeschlossen: 'status-abgeschlossen',
  blockiert: 'status-blockiert',
}
