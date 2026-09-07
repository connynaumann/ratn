import { cx } from './klassen'

/**
 * .seg aus dem Design System, Abschnitt 05.
 * Im Prototyp: Layout Flexibel | Sortiert | Netz und Woche | Monat.
 */
export type SegmentOption<W extends string> = {
  wert: W
  text: string
}

type Props<W extends string> = {
  optionen: ReadonlyArray<SegmentOption<W>>
  wert: W
  onWechsel: (wert: W) => void
  /** Beschriftung für Screenreader, z. B. „Layout“ */
  label: string
  disabled?: boolean
}

export function Segmented<W extends string>({
  optionen,
  wert,
  onWechsel,
  label,
  disabled = false,
}: Props<W>) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {optionen.map((o) => (
        <button
          key={o.wert}
          type="button"
          role="radio"
          aria-checked={o.wert === wert}
          className={cx(o.wert === wert && 'on')}
          disabled={disabled}
          onClick={() => onWechsel(o.wert)}
        >
          {o.text}
        </button>
      ))}
    </div>
  )
}
