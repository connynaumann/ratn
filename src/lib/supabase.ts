import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { env } from './env'

/**
 * Supabase-Client für die gesamte App.
 *
 * Im Frontend liegt ausschließlich der öffentliche Client-Key; jeder Zugriff
 * geht über Row Level Security und sieht nur die eigenen Zeilen (Brief
 * Abschnitt 11). Ein Service-Role-Key kommt nirgends vor – auch nicht im Seed.
 *
 * detectSessionInUrl übernimmt die Rückkehr vom Magic Link: supabase-js liest
 * den Code aus der Adresse, tauscht ihn gegen eine Sitzung und räumt die
 * Adresse auf. flowType 'pkce' ist der Standard und hier ausgeschrieben, damit
 * sichtbar bleibt, warum die Rückkehr als ?code=… und nicht als Fragment mit
 * access_token kommt.
 */
export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabasePublishableKey,
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'system-map-auth',
    },
  },
)
