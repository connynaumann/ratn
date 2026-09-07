import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Input } from './Input'

/** .field aus dem Design System: Beschriftung über dem Feld */
type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  /** Text unter dem Feld, z. B. E-04 oder E-06 */
  fehler?: string | null
  symbol?: ReactNode
}

export function Field({ label, fehler, id, ...rest }: Props) {
  const eigeneId = useId()
  const feldId = id ?? eigeneId
  const fehlerId = `${feldId}-fehler`
  return (
    <div className="field">
      <label htmlFor={feldId}>{label}</label>
      <Input
        id={feldId}
        fehlerhaft={fehler != null && fehler !== ''}
        aria-describedby={fehler ? fehlerId : undefined}
        {...rest}
      />
      {fehler != null && fehler !== '' && (
        <p id={fehlerId} className="field-error" role="alert">
          {fehler}
        </p>
      )}
    </div>
  )
}
