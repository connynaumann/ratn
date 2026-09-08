import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import type { Daten } from './model'
import type { Tabelle, Vorgang } from './warteschlange'

/**
 * Laden und Schreiben gegen Supabase.
 *
 * Gelesen wird beim Start alles auf einmal – eine Abfrage je Tabelle, parallel
 * (Brief Abschnitt 11: „Erste Anzeige unter 2 s“). Row Level Security sorgt
 * dafür, dass nur eigene Zeilen zurückkommen; ein `where owner_id = …` wäre
 * überflüssig.
 */

export type LadeErgebnis =
  | { ok: true; daten: Daten }
  | { ok: false; meldung: string }

export async function ladeAlles(
  client: SupabaseClient<Database>,
): Promise<LadeErgebnis> {
  const [vision, goal, goalVision, initiative, metric, dependency, settings] =
    await Promise.all([
      client.from('vision').select('*').order('created_at'),
      client.from('goal').select('*').order('created_at'),
      client.from('goal_vision').select('*').order('sort_index'),
      client.from('initiative').select('*').order('sort_index'),
      client.from('metric').select('*').order('created_at'),
      client.from('dependency').select('*'),
      client.from('settings').select('*').maybeSingle(),
    ])

  const fehler = [
    vision.error,
    goal.error,
    goalVision.error,
    initiative.error,
    metric.error,
    dependency.error,
    settings.error,
  ].find((f) => f != null)
  if (fehler != null) return { ok: false, meldung: fehler.message }

  return {
    ok: true,
    daten: {
      vision: vision.data ?? [],
      goal: goal.data ?? [],
      goal_vision: goalVision.data ?? [],
      initiative: initiative.data ?? [],
      metric: metric.data ?? [],
      dependency: dependency.data ?? [],
      settings: settings.data ?? null,
    },
  }
}

/**
 * Primärschlüssel je Tabelle. goal_vision hat einen zusammengesetzten
 * Schlüssel; im Client steht er als „<goal_id>|<vision_id>“ in der ID, damit
 * die Warteschlange mit einem Feld auskommt.
 */
export const GOAL_VISION_TRENNER = '|'

export function goalVisionId(goalId: string, visionId: string): string {
  return `${goalId}${GOAL_VISION_TRENNER}${visionId}`
}

function goalVisionTeile(id: string): { goal_id: string; vision_id: string } {
  const [goal_id, vision_id] = id.split(GOAL_VISION_TRENNER)
  if (goal_id == null || vision_id == null) {
    throw new Error(`Ungültige goal_vision-ID: ${id}`)
  }
  return { goal_id, vision_id }
}

/** Wie wird eine Zeile in ihrer Tabelle adressiert? */
function trefferFuer(
  client: SupabaseClient<Database>,
  tabelle: Tabelle,
  id: string,
) {
  const abfrage = client.from(tabelle)
  if (tabelle === 'goal_vision') {
    const { goal_id, vision_id } = goalVisionTeile(id)
    return { abfrage, filter: { goal_id, vision_id } as Record<string, string> }
  }
  if (tabelle === 'settings') {
    // settings hat owner_id als Primärschlüssel; die Zeile der Nutzerin ist
    // durch Row Level Security ohnehin die einzige sichtbare.
    return { abfrage, filter: {} as Record<string, string> }
  }
  return { abfrage, filter: { id } as Record<string, string> }
}

/**
 * Schickt einen Stapel Vorgänge in der gegebenen Reihenfolge.
 *
 * Nacheinander statt parallel: Fremdschlüssel verlangen, dass die Vision vor
 * ihrem Ziel ankommt. Der erste Fehler bricht ab und wirft – die
 * Warteschlange legt den Stapel dann zurück und versucht es erneut (E-03).
 */
export async function sendeVorgaenge(
  client: SupabaseClient<Database>,
  vorgaenge: Vorgang[],
): Promise<void> {
  for (const vorgang of vorgaenge) {
    const { abfrage, filter } = trefferFuer(client, vorgang.tabelle, vorgang.id)

    if (vorgang.art === 'anlegen') {
      const { error } = await abfrage.insert(vorgang.zeile as never)
      if (error != null) {
        throw new Error(`${vorgang.tabelle} anlegen: ${error.message}`)
      }
      continue
    }

    if (vorgang.art === 'aendern') {
      if (vorgang.tabelle === 'settings') {
        const { error } = await client
          .from('settings')
          .upsert(vorgang.felder as never, { onConflict: 'owner_id' })
        if (error != null) throw new Error(`settings: ${error.message}`)
        continue
      }
      const { error } = await abfrage.update(vorgang.felder as never).match(filter)
      if (error != null) {
        throw new Error(`${vorgang.tabelle} ändern: ${error.message}`)
      }
      continue
    }

    const { error } = await abfrage.delete().match(filter)
    if (error != null) {
      throw new Error(`${vorgang.tabelle} löschen: ${error.message}`)
    }
  }
}
