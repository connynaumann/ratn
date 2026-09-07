/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL des Supabase-Projekts, z. B. https://<ref>.supabase.co */
  readonly VITE_SUPABASE_URL: string
  /** Öffentlicher Client-Key (sb_publishable_…). Niemals der Service-Role-Key. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  /** Adresse, auf die der Magic Link zurückführt */
  readonly VITE_APP_URL: string
  /** Einzige freigegebene E-Mail-Adresse (Brief A-29) */
  readonly VITE_ALLOWED_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
