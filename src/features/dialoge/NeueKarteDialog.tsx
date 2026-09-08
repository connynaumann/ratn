import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Dialog, Field } from '@/components/ui'
import { E, UI } from '@/content/texte'
import { METRIK_TITEL_MAX, TITEL_MAX, titelGueltig } from '@/lib/titel'
import type { Kartentyp } from '@/lib/model'

/**
 * S-08 Neue Karte. Der Typ ergibt sich aus der Stelle, an der angelegt wird
 * (Brief Abschnitt 7). Leerer oder zu langer Titel → E-06, kein Anlegen.
 */
const TITEL_JE_TYP: Record<Kartentyp, string> = {
  vision: UI.dialog.neueVision,
  goal: UI.dialog.neuesZiel,
  initiative: UI.dialog.neueInitiative,
  metric: UI.dialog.neueMetrik,
}

type Props = {
  typ: Kartentyp | null
  onAbbrechen: () => void
  onAnlegen: (titel: string) => void
}

export function NeueKarteDialog({ typ, onAbbrechen, onAnlegen }: Props) {
  const [titel, setTitel] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const max = typ === 'metric' ? METRIK_TITEL_MAX : TITEL_MAX

  useEffect(() => {
    if (typ != null) {
      setTitel('')
      setFehler(null)
    }
  }, [typ])

  function absenden(ereignis: FormEvent) {
    ereignis.preventDefault()
    if (!titelGueltig(titel, max)) {
      setFehler(E['E-06'])
      return
    }
    onAnlegen(titel.trim())
  }

  return (
    <Dialog
      offen={typ != null}
      onOffenWechsel={(offen) => {
        if (!offen) onAbbrechen()
      }}
      titel={typ != null ? TITEL_JE_TYP[typ] : ''}
      fuss={
        <>
          <Button variante="ghost" onClick={onAbbrechen}>
            {UI.dialog.abbrechen}
          </Button>
          <Button variante="primary" type="submit" form="neue-karte">
            {UI.dialog.anlegen}
          </Button>
        </>
      }
    >
      <form id="neue-karte" onSubmit={absenden} noValidate>
        <Field
          label={UI.dialog.feldTitel}
          value={titel}
          autoFocus
          fehler={fehler}
          onChange={(e) => {
            setTitel(e.target.value)
            setFehler(null)
          }}
        />
      </form>
    </Dialog>
  )
}
