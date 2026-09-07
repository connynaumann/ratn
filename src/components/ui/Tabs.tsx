import { cx } from './klassen'

/** .tabs / .tab aus dem Design System, Abschnitt 07. Umschalter Map | Linear. */
export type TabOption<W extends string> = { wert: W; text: string }

type Props<W extends string> = {
  optionen: ReadonlyArray<TabOption<W>>
  wert: W
  onWechsel: (wert: W) => void
  label: string
  disabled?: boolean
}

export function Tabs<W extends string>({
  optionen,
  wert,
  onWechsel,
  label,
  disabled = false,
}: Props<W>) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {optionen.map((o) => (
        <button
          key={o.wert}
          type="button"
          role="tab"
          aria-selected={o.wert === wert}
          className={cx('tab', o.wert === wert && 'on')}
          disabled={disabled}
          onClick={() => onWechsel(o.wert)}
        >
          {o.text}
        </button>
      ))}
    </div>
  )
}
