import { Button, Dialog } from '@/components/ui'
import { E, TYP, UI, fuelle } from '@/content/texte'
import type { Kartentyp } from '@/lib/model'

/**
 * S-09 Löschen bestätigen (US-07).
 *
 * Der Text nennt die Anzahl der Karten, die tatsächlich mit verschwinden
 * (Brief A-03/D-09). Bei null Unterkarten gilt der kürzere Text E-07a.
 */
type Props = {
  offen: boolean
  typ: Kartentyp
  titel: string
  /** Anzahl der Unterkarten, die mit gelöscht werden */
  betroffen: number
  onAbbrechen: () => void
  onLoeschen: () => void
}

export function LoeschenDialog({
  offen,
  typ,
  titel,
  betroffen,
  onAbbrechen,
  onLoeschen,
}: Props) {
  const text =
    betroffen > 0
      ? fuelle(E['E-07'], { Typ: TYP[typ], Titel: titel, n: betroffen })
      : fuelle(E['E-07a'], { Typ: TYP[typ], Titel: titel })

  return (
    <Dialog
      offen={offen}
      onOffenWechsel={(o) => {
        if (!o) onAbbrechen()
      }}
      titel={UI.dialog.loeschenTitel}
      fuss={
        <>
          <Button variante="ghost" onClick={onAbbrechen}>
            {UI.dialog.abbrechen}
          </Button>
          <Button variante="danger" onClick={onLoeschen}>
            {UI.dialog.loeschen}
          </Button>
        </>
      }
    >
      <p className="t-body" style={{ color: 'var(--text-secondary)' }}>
        {text}
      </p>
    </Dialog>
  )
}
