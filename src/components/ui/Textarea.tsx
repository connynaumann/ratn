import type { TextareaHTMLAttributes } from 'react'
import { cx } from './klassen'

/** Beschreibungsfeld: `.input` als mehrzeiliges Feld (Brief Abschnitt 4). */
type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  fehlerhaft?: boolean
}

export function Textarea({ fehlerhaft = false, className, ...rest }: Props) {
  return (
    <textarea
      className={cx('input', 'textarea', className)}
      aria-invalid={fehlerhaft || undefined}
      {...rest}
    />
  )
}
