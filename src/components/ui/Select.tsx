import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import { cx } from './klassen'

/**
 * select.input aus dem Design System, Abschnitt 05.
 *
 * Der Pfeil kommt als Lucide-Symbol; das Design System zeichnet ihn als
 * data:-URI mit dem fest verdrahteten Wert %23999, was gegen T-12 verstoßen
 * würde (siehe Kopf von src/styles/components.css).
 */
type Option = { wert: string; text: string }

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  optionen: ReadonlyArray<Option>
}

export function Select({ optionen, className, ...rest }: Props) {
  return (
    <span className="select-wrap">
      <select className={cx('input', className)} {...rest}>
        {optionen.map((o) => (
          <option key={o.wert} value={o.wert}>
            {o.text}
          </option>
        ))}
      </select>
      <span className="select-caret" aria-hidden="true">
        <ChevronDown size={14} strokeWidth={1.5} />
      </span>
    </span>
  )
}
