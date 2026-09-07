import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './klassen'

/** .btn aus dem Design System, Abschnitt 04 */
export type ButtonVariante = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonGroesse = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: ButtonVariante
  groesse?: ButtonGroesse
  children?: ReactNode
}

export function Button({
  variante = 'secondary',
  groesse = 'md',
  className,
  type = 'button',
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cx(
        'btn',
        `btn-${variante}`,
        groesse !== 'md' && groesse,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
