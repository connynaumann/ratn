import { Trash2 } from 'lucide-react'
import { Button, Checkbox, Input } from '@/components/ui'
import { UI } from '@/content/texte'
import type { Metric } from '@/lib/model'
import { metrikErledigt } from '@/lib/status'
import { METRIK_TITEL_MAX, titelGueltig } from '@/lib/titel'
import { E } from '@/content/texte'
import { useStore } from '@/store/useStore'
import { useEntwurf } from './useEntwurf'

/**
 * Metriken einer Initiative im Detailpanel (US-05).
 *
 * Eine Metrik ist ein abhakbares Kriterium mit optionalem Zahlenwert
 * (Brief A-23). Erreicht der Istwert den Sollwert, gilt sie als erledigt –
 * das Häkchen zeigt das an, ohne dass `done` gesetzt sein muss.
 */
function MetrikZeile({ metrik }: { metrik: Metric }) {
  const { karteAendern, karteLoeschen } = useStore()
  const ref = { typ: 'metric' as const, id: metrik.id }

  const titel = useEntwurf(
    metrik.title,
    (wert) => karteAendern(ref, { title: wert.trim() }),
    (wert) => (titelGueltig(wert, METRIK_TITEL_MAX) ? null : E['E-06']),
    metrik.id,
  )

  const erledigt = metrikErledigt(metrik)

  /**
   * Soll- und Istwert hängen zusammen: die Datenbank verlangt, dass beide
   * gesetzt oder beide leer sind (Constraint metric_values_pair). Wird eines
   * geleert, wandert das andere mit.
   */
  function setzeWert(feld: 'target_value' | 'current_value', roh: string) {
    const zahl = roh.trim() === '' ? null : Number(roh)
    if (zahl != null && Number.isNaN(zahl)) return
    const anderes =
      feld === 'target_value' ? metrik.current_value : metrik.target_value
    if (zahl == null) {
      karteAendern(ref, { target_value: null, current_value: null })
      return
    }
    karteAendern(ref, {
      [feld]: zahl,
      ...(anderes == null
        ? { [feld === 'target_value' ? 'current_value' : 'target_value']: 0 }
        : {}),
    })
  }

  return (
    <div className="metrik-zeile">
      <div className="metrik-kopf">
        <Checkbox
          an={erledigt}
          onWechsel={(an) => karteAendern(ref, { done: an })}
          label={metrik.title}
        />
        <Input
          value={titel.entwurf}
          fehlerhaft={titel.fehler != null}
          onChange={(e) => titel.aendern(e.target.value)}
          onBlur={titel.verlassen}
          aria-label={UI.dialog.feldTitel}
        />
        <Button
          variante="ghost"
          groesse="sm"
          aria-label={`${UI.sidepanel.loeschen}: ${metrik.title}`}
          onClick={() => karteLoeschen(ref)}
        >
          <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </div>
      {titel.fehler != null && (
        <p className="field-error" role="alert">
          {titel.fehler}
        </p>
      )}
      <div className="metrik-werte">
        <Input
          numerisch
          inputMode="decimal"
          aria-label={UI.sidepanel.istwert}
          value={metrik.current_value ?? ''}
          placeholder={UI.sidepanel.istwert}
          onChange={(e) => setzeWert('current_value', e.target.value)}
        />
        <span className="t-label">/</span>
        <Input
          numerisch
          inputMode="decimal"
          aria-label={UI.sidepanel.sollwert}
          value={metrik.target_value ?? ''}
          placeholder={UI.sidepanel.sollwert}
          onChange={(e) => setzeWert('target_value', e.target.value)}
        />
        <Input
          aria-label={UI.sidepanel.einheit}
          placeholder={UI.sidepanel.einheit}
          maxLength={20}
          value={metrik.unit ?? ''}
          onChange={(e) =>
            karteAendern(ref, {
              unit: e.target.value.trim() === '' ? null : e.target.value,
            })
          }
        />
      </div>
    </div>
  )
}

export function MetrikFelder({
  initiativeId,
  onNeueMetrik,
}: {
  initiativeId: string
  onNeueMetrik: () => void
}) {
  const { daten } = useStore()
  const metriken = daten.metric.filter((m) => m.initiative_id === initiativeId)

  return (
    <div className="metrik-liste">
      {metriken.length === 0 && (
        <p className="t-label">{UI.leer.initiativeOhneMetriken}</p>
      )}
      {metriken.map((m) => (
        <MetrikZeile key={m.id} metrik={m} />
      ))}
      <Button variante="secondary" groesse="sm" onClick={onNeueMetrik}>
        {UI.sidepanel.metrikHinzufuegen}
      </Button>
    </div>
  )
}
