import { cx } from './klassen'

/**
 * .check aus dem Design System, Abschnitt 05.
 * Im Prototyp: Metrik erledigt.
 *
 * Das Häkchen erbt seine Farbe über currentColor aus .check, damit kein
 * Farbwert im Komponentencode steht (T-12).
 */
type Props = {
  an: boolean
  onWechsel: (an: boolean) => void
  label: string
  disabled?: boolean
  id?: string
}

export function Checkbox({ an, onWechsel, label, disabled = false, id }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={an}
      aria-label={label}
      disabled={disabled}
      className={cx('check', an && 'on')}
      onClick={() => onWechsel(!an)}
    >
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
        <path
          d="M1 4l2.5 2.5L9 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
