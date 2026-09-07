import type { CSSProperties, ReactNode } from 'react'
import { cx } from './klassen'

/**
 * .badge aus dem Design System, Abschnitt 07.
 * Im Prototyp: Status auf Karten, Zähler im Header, Priorität, Filteranzahl.
 */
export type BadgeTon = 'neutral' | 'blue' | 'green'

type Props = {
  children: ReactNode
  /** Punkt vor dem Text (.badge.dot) */
  punkt?: boolean
  ton?: BadgeTon
  /**
   * Farbe als Token-Name ohne führende Striche, z. B. 'status-blockiert'.
   * Die Farbe wird über currentColor auch für den Punkt wirksam.
   */
  farbToken?: string
  className?: string
}

export function Badge({
  children,
  punkt = false,
  ton = 'neutral',
  farbToken,
  className,
}: Props) {
  const stil: CSSProperties | undefined =
    farbToken != null ? { color: `var(--${farbToken})` } : undefined
  return (
    <span
      className={cx('badge', punkt && 'dot', ton !== 'neutral' && ton, className)}
      style={stil}
    >
      {children}
    </span>
  )
}
