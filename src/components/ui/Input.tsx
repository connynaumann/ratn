import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from './klassen'

/** .input aus dem Design System, Abschnitt 05 */
type Props = InputHTMLAttributes<HTMLInputElement> & {
  /** Setzt aria-invalid und den roten Rahmen (E-06, E-10) */
  fehlerhaft?: boolean
  /** Symbol links im Feld */
  symbol?: ReactNode
  /** Einheit rechts im Feld, z. B. „Seiten“ */
  einheit?: string
  numerisch?: boolean
}

export function Input({
  fehlerhaft = false,
  symbol,
  einheit,
  numerisch = false,
  className,
  ...rest
}: Props) {
  const feld = (
    <input
      className={cx(
        'input',
        numerisch && 'num',
        symbol != null && 'has-icon',
        className,
      )}
      aria-invalid={fehlerhaft || undefined}
      {...rest}
    />
  )
  if (symbol == null && einheit == null) return feld
  return (
    <span className="input-wrap">
      {symbol != null && <span className="icon">{symbol}</span>}
      {feld}
      {einheit != null && <span className="unit">{einheit}</span>}
    </span>
  )
}
