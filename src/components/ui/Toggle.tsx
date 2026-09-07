import { cx } from './klassen'

/**
 * .toggle aus dem Design System, Abschnitt 05.
 * Im Prototyp: „manuell setzen“ im Detailpanel.
 *
 * role="switch" statt einer Radix-Komponente: das Design System gibt das
 * Aussehen vollständig vor, und ein Knopf mit aria-checked ist per Tastatur
 * bedienbar (Brief A-10, Entscheidung E-8 aus dem Plan).
 */
type Props = {
  an: boolean
  onWechsel: (an: boolean) => void
  label: string
  disabled?: boolean
  id?: string
}

export function Toggle({ an, onWechsel, label, disabled = false, id }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={an}
      aria-label={label}
      disabled={disabled}
      className={cx('toggle', an && 'on')}
      onClick={() => onWechsel(!an)}
    />
  )
}
