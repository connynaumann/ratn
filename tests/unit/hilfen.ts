import type {
  Daten,
  Dependency,
  Goal,
  Initiative,
  Metric,
  Vision,
} from '@/lib/model'
import { LEERE_DATEN } from '@/lib/model'

/** Kurze Bauhelfer für Testdaten – nur die Felder, die der Test braucht. */

let zaehler = 0
export function id(praefix = 'x'): string {
  zaehler += 1
  return `${praefix}-${String(zaehler).padStart(4, '0')}`
}

export function vision(teil: Partial<Vision> = {}): Vision {
  return {
    id: id('v'),
    owner_id: 'o',
    title: 'Vision',
    description: null,
    status_override: null,
    priority: null,
    start_date: '2026-09-01',
    end_date: null,
    pos_x: 0,
    pos_y: 0,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    ...teil,
  }
}

export function goal(teil: Partial<Goal> = {}): Goal {
  return {
    id: id('g'),
    owner_id: 'o',
    title: 'Ziel',
    description: null,
    color: 'line-1',
    status_override: null,
    priority: null,
    start_date: '2026-09-01',
    end_date: null,
    pos_x: 0,
    pos_y: 0,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    ...teil,
  }
}

export function initiative(teil: Partial<Initiative> = {}): Initiative {
  return {
    id: id('i'),
    owner_id: 'o',
    goal_id: 'g',
    title: 'Initiative',
    description: null,
    status: 'in_planung',
    priority: null,
    start_date: '2026-09-01',
    end_date: null,
    pos_x: 0,
    pos_y: 0,
    sort_index: 0,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    ...teil,
  }
}

export function metric(teil: Partial<Metric> = {}): Metric {
  return {
    id: id('m'),
    owner_id: 'o',
    initiative_id: 'i',
    title: 'Metrik',
    done: false,
    target_value: null,
    current_value: null,
    unit: null,
    pos_x: 0,
    pos_y: 0,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    ...teil,
  }
}

export function dependency(teil: Partial<Dependency> = {}): Dependency {
  return {
    id: id('d'),
    owner_id: 'o',
    source_type: 'goal',
    source_id: 'g',
    target_goal_id: 'g',
    created_at: '2026-09-01T00:00:00Z',
    ...teil,
  }
}

export function daten(teil: Partial<Daten> = {}): Daten {
  return { ...LEERE_DATEN, ...teil }
}

/** Verknüpft Ziele mit einer Vision, in der gegebenen Reihenfolge. */
export function verknuepfe(visionId: string, ziele: Goal[]) {
  return ziele.map((g, index) => ({
    goal_id: g.id,
    vision_id: visionId,
    owner_id: 'o',
    sort_index: index,
    created_at: '2026-09-01T00:00:00Z',
  }))
}
