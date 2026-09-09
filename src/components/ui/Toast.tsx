import { useEffect } from 'react'

/**
 * Kurzer Hinweis unten mittig (Brief Abschnitt 4): --bg-elevated, --r-md,
 * --shadow-md, 13/500. Verwendet für E-11 (2 s) und E-09 (4 s).
 */
export function Toast({
  text,
  dauerMs,
  onEnde,
}: {
  text: string | null
  dauerMs: number
  onEnde: () => void
}) {
  useEffect(() => {
    if (text == null) return
    const timer = setTimeout(onEnde, dauerMs)
    return () => clearTimeout(timer)
  }, [text, dauerMs, onEnde])

  if (text == null) return null
  return (
    <div className="toast" role="status">
      {text}
    </div>
  )
}
