import { SR } from '@/content/texte'

/**
 * Ladezustand für S-02 (Brief Abschnitt 7).
 *
 * In Scheibe 1 wird nur die gespeicherte Sitzung geprüft – ein sehr kurzer
 * Moment. Deshalb bewusst schlicht: zwei ruhige Flächen in der Form von Header
 * und Sidepanel, ohne Animation. Ausgebaut wird der Zustand in Scheibe 2, wenn
 * echte Daten geladen werden (U-8).
 */
export function LadeZustand() {
  return (
    <div className="flex h-dvh flex-col" style={{ background: 'var(--bg-app)' }}>
      <div
        className="h-[53px] shrink-0"
        style={{
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex-1" />
        <div className="shrink-0 p-4 pl-0">
          <div
            className="h-full w-[320px]"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-lg)',
            }}
          />
        </div>
      </div>
      <span className="sr-only" role="status">
        {SR['SR-03']}
      </span>
    </div>
  )
}
