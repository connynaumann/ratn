import type { CSSProperties, ReactNode } from 'react'
import { cx } from './klassen'

/**
 * .panel und die Property Rows aus dem Design System, Abschnitt 06.
 * Im Prototyp: Sidepanel, Dialoge, Popover.
 */

type PanelProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Panel({ children, className, style }: PanelProps) {
  return (
    <div className={cx('panel', className)} style={style}>
      {children}
    </div>
  )
}

type PanelHeadProps = {
  titel: string
  /** Wird der Schließen-Knopf gezeigt, braucht er eine Beschriftung */
  onSchliessen?: () => void
  schliessenLabel?: string
  rechts?: ReactNode
}

export function PanelHead({
  titel,
  onSchliessen,
  schliessenLabel,
  rechts,
}: PanelHeadProps) {
  return (
    <div className="panel-head">
      <span className="title">{titel}</span>
      {rechts}
      {onSchliessen != null && (
        <button
          type="button"
          className="panel-close"
          aria-label={schliessenLabel ?? titel}
          onClick={onSchliessen}
        >
          ×
        </button>
      )}
    </div>
  )
}

export function PanelBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cx('panel-body', className)}>{children}</div>
}

export function PropRow({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="prop-row">
      {htmlFor != null ? (
        <label className="plabel" htmlFor={htmlFor}>
          {label}
        </label>
      ) : (
        <span className="plabel">{label}</span>
      )}
      <div className="pctrl">{children}</div>
    </div>
  )
}

export function Divider() {
  return <div className="divider" />
}
