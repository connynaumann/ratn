import { useEffect, useState } from 'react'
import {
  Button,
  Divider,
  Input,
  PropRow,
  Select,
  Textarea,
  Toggle,
} from '@/components/ui'
import { E, PRIORITAET, SR, STATUS, TX, TYP, UI, fuelle } from '@/content/texte'
import { enddatumGueltig } from '@/lib/datum'
import { ZIELFARBEN } from '@/lib/farben'
import type { Goal, Initiative, KartenRef, Metric, Vision } from '@/lib/model'
import { alsProzent } from '@/lib/status'
import { titelGueltig } from '@/lib/titel'
import { useStore } from '@/store/useStore'
import { BlockiertDurch } from './BlockiertDurch'
import { MetrikFelder } from './MetrikFelder'
import { useEntwurf } from './useEntwurf'
import { VisionenFeld } from './VisionenFeld'

/**
 * S-07 Sidepanel, Detail (US-06).
 *
 * Zeigt die Felder aus Brief Abschnitt 5 für den jeweiligen Typ. Änderungen
 * gehen sofort in den Zustand und mit 500 ms Verzögerung an die Datenbank;
 * der Fuß des Panels meldet TX-03 und TX-02.
 *
 * Status: bei Initiativen wird er gesetzt, bei Ziel und Vision abgeleitet und
 * über „manuell setzen“ übersteuerbar (Brief Abschnitt 5).
 */

const STATUS_OPTIONEN = Object.entries(STATUS).map(([wert, text]) => ({
  wert,
  text,
}))

const PRIORITAET_OPTIONEN = [
  { wert: '', text: PRIORITAET.null.text },
  { wert: 'hoch', text: PRIORITAET.hoch.text },
  { wert: 'mittel', text: PRIORITAET.mittel.text },
  { wert: 'niedrig', text: PRIORITAET.niedrig.text },
]

type Karte = Vision | Goal | Initiative | Metric

function findeKarte(
  ref: KartenRef,
  daten: ReturnType<typeof useStore>['daten'],
): Karte | undefined {
  if (ref.typ === 'vision') return daten.vision.find((v) => v.id === ref.id)
  if (ref.typ === 'goal') return daten.goal.find((g) => g.id === ref.id)
  if (ref.typ === 'initiative') {
    return daten.initiative.find((i) => i.id === ref.id)
  }
  return daten.metric.find((m) => m.id === ref.id)
}

type Props = {
  ref_: KartenRef
  onNeueMetrik: (initiativeId: string) => void
  onLoeschen: (ref: KartenRef) => void
  onAbhaengigkeit: (zielId: string) => void
}

export function Detail({
  ref_,
  onNeueMetrik,
  onLoeschen,
  onAbhaengigkeit,
}: Props) {
  const { daten, berechnet, karteAendern } = useStore()
  const karte = findeKarte(ref_, daten)
  const [datumsFehler, setDatumsFehler] = useState<string | null>(null)

  // Ein Datumsfehler gehört zur Karte, nicht zum Panel: beim Wechsel weg damit.
  useEffect(() => {
    setDatumsFehler(null)
  }, [ref_.id])

  const titel = useEntwurf(
    karte != null ? (karte as { title: string }).title : '',
    (wert) => karteAendern(ref_, { title: wert.trim() }),
    (wert) => (titelGueltig(wert, ref_.typ === 'metric' ? 120 : 80) ? null : E['E-06']),
    ref_.id,
  )

  if (karte == null) return null

  const mitZeitraum = ref_.typ !== 'metric'
  const mitBeschreibung = ref_.typ !== 'metric'
  const mitPrioritaet = ref_.typ !== 'metric'
  const abgeleitet = ref_.typ === 'goal' || ref_.typ === 'vision'
  const fortschritt = berechnet.fortschritt.get(ref_.id) ?? 0

  const zeitKarte = karte as Vision | Goal | Initiative
  const uebersteuert =
    abgeleitet && (karte as Vision | Goal).status_override != null
  const status = berechnet.status.get(ref_.id) ?? 'in_planung'

  /** E-10: Enddatum vor Startdatum wird nicht übernommen. */
  function setzeEnddatum(wert: string) {
    const neu = wert === '' ? null : wert
    if (!enddatumGueltig(zeitKarte.start_date, neu)) {
      setDatumsFehler(E['E-10'])
      return
    }
    setDatumsFehler(null)
    karteAendern(ref_, { end_date: neu })
  }

  /**
   * Wird das Startdatum hinter das Enddatum geschoben, würde die Datenbank
   * die Zeile ablehnen. Statt eines stillen Fehlschlags: E-10 zeigen und den
   * alten Wert behalten.
   */
  function setzeStartdatum(wert: string) {
    if (wert === '') return
    if (!enddatumGueltig(wert, zeitKarte.end_date)) {
      setDatumsFehler(E['E-10'])
      return
    }
    setDatumsFehler(null)
    karteAendern(ref_, { start_date: wert })
  }

  return (
    <>
      <PropRow label={UI.sidepanel.felder.titel} htmlFor="detail-titel">
        <Input
          id="detail-titel"
          value={titel.entwurf}
          fehlerhaft={titel.fehler != null}
          onChange={(e) => titel.aendern(e.target.value)}
          onBlur={titel.verlassen}
        />
      </PropRow>
      {titel.fehler != null && (
        <p className="field-error" role="alert">
          {titel.fehler}
        </p>
      )}

      <PropRow label={UI.sidepanel.felder.typ}>
        <span className="t-label">{TYP[ref_.typ]}</span>
      </PropRow>

      <Divider />

      {ref_.typ !== 'metric' && (
        <>
          <div className="sec-label detail-abschnitt">
            {UI.sidepanel.abschnitte.status}
          </div>

          {/* Kein htmlFor am Schalter: er ist ein Button, kein Formularfeld –
              seinen Namen trägt er selbst über aria-label. */}
          {abgeleitet && (
            <PropRow label={UI.sidepanel.manuellSetzen}>
              <Toggle
                id="detail-manuell"
                an={uebersteuert}
                label={UI.sidepanel.manuellSetzen}
                onWechsel={(an) =>
                  karteAendern(ref_, { status_override: an ? status : null })
                }
              />
            </PropRow>
          )}

          {/* htmlFor nur, wenn hier wirklich ein Auswahlfeld steht: bei
              abgeleitetem Status ist es reiner Text. */}
          <PropRow
            label={UI.sidepanel.felder.status}
            htmlFor={
              abgeleitet && !uebersteuert ? undefined : 'detail-status'
            }
          >
            {abgeleitet && !uebersteuert ? (
              <span className="t-label">{STATUS[status]}</span>
            ) : (
              <Select
                id="detail-status"
                optionen={STATUS_OPTIONEN}
                value={status}
                onChange={(e) =>
                  karteAendern(
                    ref_,
                    abgeleitet
                      ? { status_override: e.target.value }
                      : { status: e.target.value },
                  )
                }
              />
            )}
          </PropRow>

          {uebersteuert && <p className="t-label">{TX['TX-04']}</p>}

          {mitPrioritaet && (
            <PropRow
              label={UI.sidepanel.felder.prioritaet}
              htmlFor="detail-prio"
            >
              <Select
                id="detail-prio"
                optionen={PRIORITAET_OPTIONEN}
                value={(karte as Vision).priority ?? ''}
                onChange={(e) =>
                  karteAendern(ref_, {
                    priority: e.target.value === '' ? null : e.target.value,
                  })
                }
              />
            </PropRow>
          )}
        </>
      )}

      {mitZeitraum && (
        <>
          <Divider />
          <div className="sec-label detail-abschnitt">
            {UI.sidepanel.abschnitte.zeitraum}
          </div>
          <PropRow label={UI.sidepanel.felder.startdatum} htmlFor="detail-start">
            <Input
              id="detail-start"
              type="date"
              value={zeitKarte.start_date}
              onChange={(e) => setzeStartdatum(e.target.value)}
            />
          </PropRow>
          <PropRow label={UI.sidepanel.felder.enddatum} htmlFor="detail-ende">
            <Input
              id="detail-ende"
              type="date"
              value={zeitKarte.end_date ?? ''}
              fehlerhaft={datumsFehler != null}
              onChange={(e) => setzeEnddatum(e.target.value)}
            />
          </PropRow>
          {datumsFehler != null && (
            <p className="field-error" role="alert">
              {datumsFehler}
            </p>
          )}
        </>
      )}

      {ref_.typ === 'goal' && (
        <PropRow label={UI.sidepanel.felder.farbe}>
          <div className="farbwahl">
            {ZIELFARBEN.map((farbe, nummer) => (
              <button
                key={farbe}
                type="button"
                // Ohne eigene Beschriftung läse ein Screenreader den
                // Tokennamen „line-1“ vor.
                aria-label={fuelle(SR['SR-04'], { n: nummer + 1 })}
                aria-pressed={(karte as Goal).color === farbe}
                style={{ background: `var(--${farbe})` }}
                onClick={() => karteAendern(ref_, { color: farbe })}
              />
            ))}
          </div>
        </PropRow>
      )}

      <PropRow label={UI.sidepanel.felder.fortschritt}>
        <span className="t-mono" data-numeric>
          {fuelle(TX['TX-11'], { p: alsProzent(fortschritt) })}
        </span>
      </PropRow>

      {mitBeschreibung && (
        <>
          <Divider />
          <PropRow
            label={UI.sidepanel.felder.beschreibung}
            htmlFor="detail-beschreibung"
          >
            <Textarea
              id="detail-beschreibung"
              maxLength={2000}
              value={(karte as Vision).description ?? ''}
              onChange={(e) =>
                karteAendern(ref_, {
                  description:
                    e.target.value.trim() === '' ? null : e.target.value,
                })
              }
            />
          </PropRow>
        </>
      )}

      {ref_.typ === 'initiative' && (
        <>
          <Divider />
          <div className="sec-label detail-abschnitt">
            {UI.sidepanel.abschnitte.metriken}
          </div>
          <MetrikFelder
            initiativeId={ref_.id}
            onNeueMetrik={() => onNeueMetrik(ref_.id)}
          />
        </>
      )}

      {ref_.typ === 'goal' && (
        <>
          <Divider />
          <div className="sec-label detail-abschnitt">
            {UI.sidepanel.abschnitte.abhaengigkeiten}
          </div>
          <PropRow label={UI.sidepanel.felder.blockiertDurch}>
            <span />
          </PropRow>
          <BlockiertDurch
            zielId={ref_.id}
            onHinzufuegen={() => onAbhaengigkeit(ref_.id)}
          />

          <Divider />
          <div className="sec-label detail-abschnitt">
            {UI.sidepanel.felder.visionen}
          </div>
          {/* key: beim Kartenwechsel neu aufbauen, sonst bliebe eine
              E-14-Meldung des vorigen Ziels stehen. */}
          <VisionenFeld key={ref_.id} goalId={ref_.id} />
        </>
      )}

      <Divider />
      <div className="dialog-fuss">
        <Button variante="danger" groesse="sm" onClick={() => onLoeschen(ref_)}>
          {UI.sidepanel.loeschen}
        </Button>
      </div>
    </>
  )
}
