import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { Checkbox } from '@/components/ui'
import { TX, fuelle } from '@/content/texte'
import type { Kartentyp } from '@/lib/model'
import { metrikErledigt } from '@/lib/status'
import { useKartenAktionen } from './KartenAktionen'
import type { Karte } from './knoten'
import {
  Anschluesse,
  Fortschritt,
  HoverPlus,
  PrioritaetsBadge,
  StatusBadge,
  Zeitraum,
} from './Kartenteile'

/**
 * Die vier Kartentypen aus Brief Abschnitt 4 (A-17).
 *
 * Größen, Flächen, Radien und Schatten stehen in map.css; hier steht nur der
 * Inhalt. Die Karten sind `memo`, damit das Ziehen einer Karte nicht alle
 * anderen neu rendert (Brief A-43: flüssiges Ziehen bis 200 Karten).
 */

/** Beschriftung des Hover-Plus je Elterntyp (Brief A-35, TX-12 bis TX-14). */
const PLUS_TEXT: Partial<Record<Kartentyp, string>> = {
  vision: TX['TX-12'],
  goal: TX['TX-13'],
  initiative: TX['TX-14'],
}

function Rahmen({
  typ,
  id,
  selected,
  farbe,
  children,
}: {
  typ: Kartentyp
  id: string
  selected: boolean
  farbe: string | null
  children: React.ReactNode
}) {
  const { unterkarteAnlegen } = useKartenAktionen()
  const plusText = PLUS_TEXT[typ]
  return (
    <div
      className={`karte karte-${typ}${selected ? ' karte-gewaehlt' : ''}`}
      style={
        farbe != null
          ? ({ '--karte-farbe': `var(--${farbe})` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
      {plusText != null && (
        <HoverPlus text={plusText} onAnlegen={() => unterkarteAnlegen(typ, id)} />
      )}
    </div>
  )
}

export const VisionKarte = memo(function VisionKarte({
  id,
  data,
  selected,
}: NodeProps<Karte>) {
  const vision = data.vision!
  return (
    <Rahmen typ="vision" id={id} selected={selected === true} farbe={null}>
      <Anschluesse eingang={false} />
      <div className="karte-kopf">
        <span className="karte-titel t-h3" title={vision.title}>
          {vision.title}
        </span>
        {data.status != null && <StatusBadge status={data.status} />}
      </div>
      <Fortschritt anteil={data.fortschritt} farbToken="accent" />
    </Rahmen>
  )
})

export const ZielKarte = memo(function ZielKarte({
  id,
  data,
  selected,
}: NodeProps<Karte>) {
  const ziel = data.goal!
  return (
    <Rahmen typ="goal" id={id} selected={selected === true} farbe={data.farbe}>
      <Anschluesse />
      <span className="karte-streifen" aria-hidden="true" />
      <div className="karte-kopf">
        <span className="karte-titel karte-titel-ziel" title={ziel.title}>
          {ziel.title}
        </span>
        {data.status != null && <StatusBadge status={data.status} />}
      </div>
      <Zeitraum start={ziel.start_date} ende={ziel.end_date} nurEnde />
      <Fortschritt
        anteil={data.fortschritt}
        farbToken={data.farbe ?? 'accent'}
      />
    </Rahmen>
  )
})

export const InitiativeKarte = memo(function InitiativeKarte({
  id,
  data,
  selected,
}: NodeProps<Karte>) {
  const initiative = data.initiative!
  return (
    <Rahmen
      typ="initiative"
      id={id}
      selected={selected === true}
      farbe={data.farbe}
    >
      <Anschluesse />
      <span className="karte-streifen" aria-hidden="true" />
      <div className="karte-kopf">
        <span
          className="karte-titel karte-titel-initiative"
          title={initiative.title}
        >
          {initiative.title}
        </span>
        {data.status != null && <StatusBadge status={data.status} />}
      </div>
      <div className="karte-fuss">
        <Zeitraum start={initiative.start_date} ende={initiative.end_date} />
        <PrioritaetsBadge prioritaet={initiative.priority} />
      </div>
    </Rahmen>
  )
})

export const MetrikKarte = memo(function MetrikKarte({
  id,
  data,
  selected,
}: NodeProps<Karte>) {
  const metrik = data.metric!
  const { metrikWechseln } = useKartenAktionen()
  const erledigt = metrikErledigt(metrik)
  return (
    <Rahmen typ="metric" id={id} selected={selected === true} farbe={data.farbe}>
      <Anschluesse ausgang={false} />
      {/* nodrag: der Klick soll abhaken, nicht die Karte verschieben (US-05) */}
      <span className="nodrag">
        <Checkbox
          an={erledigt}
          label={metrik.title}
          onWechsel={(an) => metrikWechseln(id, an)}
        />
      </span>
      <span className="karte-titel karte-titel-metrik" title={metrik.title}>
        {metrik.title}
      </span>
      {metrik.target_value != null && metrik.current_value != null && (
        <span className="t-mono karte-werte" data-numeric>
          {fuelle(TX['TX-16'], {
            ist: metrik.current_value,
            soll: metrik.target_value,
            Einheit: metrik.unit ?? '',
          }).trim()}
        </span>
      )}
    </Rahmen>
  )
})

export const KARTEN_TYPEN = {
  vision: VisionKarte,
  goal: ZielKarte,
  initiative: InitiativeKarte,
  metric: MetrikKarte,
} as const
