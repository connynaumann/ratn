import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Button, Dialog, Input } from '@/components/ui'
import { E, TYP, UI } from '@/content/texte'
import { moeglicheQuellen, pruefeQuelle } from '@/lib/abhaengigkeiten'
import type { Quelle, QuellenFehler } from '@/lib/abhaengigkeiten'
import { useStore } from '@/store/useStore'

/**
 * S-10 Abhängigkeit anlegen (US-10, Brief A-34).
 *
 * Liste der Ziele und Initiativen mit Suchfeld. Quellen, die einen Kreis
 * erzeugen würden oder schon eingetragen sind, stehen deaktiviert in der
 * Liste – so ist sichtbar, *dass* es sie gibt.
 *
 * E-08 verlangt beides: „Auswahl blockiert, Hinweis unter dem Feld“. Ein
 * deaktivierter Knopf lässt sich nicht anklicken, also käme über den Klick
 * nie ein Hinweis zustande. Deshalb steht E-08 unter der Liste, sobald
 * mindestens eine Quelle wegen eines Kreises ausfällt – und zusätzlich als
 * Tooltip an der betroffenen Zeile.
 */

export function AbhaengigkeitDialog({
  zielId,
  onSchliessen,
}: {
  /** Das blockierte Ziel; null = Dialog zu */
  zielId: string | null
  onSchliessen: () => void
}) {
  const { daten, aktiveVision, abhaengigkeitAnlegen } = useStore()
  const [suche, setSuche] = useState('')

  useEffect(() => {
    if (zielId != null) setSuche('')
  }, [zielId])

  const quellen = useMemo(() => {
    if (zielId == null) return []
    const alle = moeglicheQuellen(daten, aktiveVision?.id ?? null, zielId)
    const begriff = suche.trim().toLowerCase()
    if (begriff === '') return alle
    return alle.filter(
      (q) =>
        q.titel.toLowerCase().includes(begriff) ||
        (q.zielTitel ?? '').toLowerCase().includes(begriff),
    )
  }, [daten, aktiveVision?.id, zielId, suche])

  /** Gründe je Quelle, einmal berechnet – die Liste zeigt sie zweifach. */
  const gruende = useMemo(() => {
    const karte = new Map<string, QuellenFehler | null>()
    if (zielId == null) return karte
    for (const q of quellen) {
      karte.set(
        `${q.typ}-${q.id}`,
        pruefeQuelle(daten, { typ: q.typ, id: q.id }, zielId),
      )
    }
    return karte
  }, [daten, quellen, zielId])

  const kreisVorhanden = [...gruende.values()].some((g) => g === 'kreis')

  function waehle(quelle: Quelle) {
    if (zielId == null) return
    if (abhaengigkeitAnlegen({ typ: quelle.typ, id: quelle.id }, zielId) != null) {
      return
    }
    onSchliessen()
  }

  return (
    <Dialog
      offen={zielId != null}
      onOffenWechsel={(offen) => {
        if (!offen) onSchliessen()
      }}
      titel={UI.dialog.abhaengigkeitTitel}
      fuss={
        <Button variante="ghost" onClick={onSchliessen}>
          {UI.dialog.abbrechen}
        </Button>
      }
    >
      <Input
        value={suche}
        autoFocus
        placeholder={UI.dialog.abhaengigkeitSuche}
        aria-label={UI.dialog.abhaengigkeitSuche}
        symbol={<Search size={13} strokeWidth={1.5} />}
        onChange={(e) => setSuche(e.target.value)}
      />

      <ul className="quellen-liste" aria-label={UI.dialog.abhaengigkeitTitel}>
        {quellen.map((quelle) => {
          const grund = gruende.get(`${quelle.typ}-${quelle.id}`) ?? null
          return (
            <li key={`${quelle.typ}-${quelle.id}`}>
              <button
                type="button"
                className="quellen-zeile"
                disabled={grund != null}
                title={grund === 'kreis' ? E['E-08'] : undefined}
                onClick={() => waehle(quelle)}
              >
                <span className="quellen-typ t-label">{TYP[quelle.typ]}</span>
                <span className="quellen-titel">{quelle.titel}</span>
                {quelle.zielTitel != null && (
                  <span className="t-label quellen-eltern">
                    {quelle.zielTitel}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {kreisVorhanden && (
        <p className="field-error" role="status">
          {E['E-08']}
        </p>
      )}
    </Dialog>
  )
}
