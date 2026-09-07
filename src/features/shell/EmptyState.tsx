import type { ReactNode } from 'react'

/** Leerer Zustand mittig auf der Fläche – E-01, E-02, TX-10. */
export function EmptyState({
  text,
  aktion,
}: {
  text: string
  aktion?: ReactNode
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="t-body" style={{ color: 'var(--text-secondary)' }}>
        {text}
      </p>
      {aktion}
    </div>
  )
}
