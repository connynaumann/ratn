import { Handle, Position } from '@xyflow/react'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui'
import { PRIORITAET, STATUS, TX, fuelle } from '@/content/texte'
import { alsDeutschesDatum } from '@/lib/datum'
import { STATUS_TOKEN } from '@/lib/model'
import type { Prioritaet, Status } from '@/lib/model'
import { alsProzent } from '@/lib/status'

/**
 * Bausteine, die alle Kartentypen teilen (Brief Abschnitt 4, A-17).
 */

/** Ein- und Ausgang für die Kanten. Unsichtbar, siehe map.css. */
export function Anschluesse({
  eingang = true,
  ausgang = true,
}: {
  eingang?: boolean
  ausgang?: boolean
}) {
  return (
    <>
      {eingang && (
        <Handle type="target" position={Position.Left} isConnectable={false} />
      )}
      {ausgang && (
        <Handle type="source" position={Position.Right} isConnectable={false} />
      )}
    </>
  )
}

/** Status-Badge mit Punkt, oben rechts auf der Karte (A-15). */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge punkt farbToken={STATUS_TOKEN[status]} className="karte-status">
      {STATUS[status]}
    </Badge>
  )
}

/** Prioritäts-Badge „H“, „M“, „N“; ohne Priorität kein Badge (A-17). */
export function PrioritaetsBadge({ prioritaet }: { prioritaet: Prioritaet | null }) {
  if (prioritaet == null) return null
  return <Badge className="karte-prio">{PRIORITAET[prioritaet].kuerzel}</Badge>
}

/**
 * Fortschrittsbalken 3 px mit Prozentzahl im Mono daneben.
 * `farbToken` ist die Zielfarbe; die Vision nutzt `--accent`.
 */
export function Fortschritt({
  anteil,
  farbToken,
}: {
  anteil: number
  farbToken: string
}) {
  const prozent = alsProzent(anteil)
  return (
    <div className="karte-fortschritt">
      <div className="karte-balken" role="presentation">
        <div
          className="karte-balken-fuellung"
          style={{
            width: `${prozent}%`,
            background: `var(--${farbToken})`,
          }}
        />
      </div>
      <span className="t-mono" data-numeric>
        {fuelle(TX['TX-11'], { p: prozent })}
      </span>
    </div>
  )
}

/** Zeitraum im Mono, z. B. „01.09.2026 – 30.09.2026“. */
export function Zeitraum({
  start,
  ende,
  nurEnde = false,
}: {
  start: string
  ende: string | null
  nurEnde?: boolean
}) {
  if (nurEnde) {
    if (ende == null) return null
    return (
      <span className="t-mono karte-datum" data-numeric>
        {alsDeutschesDatum(ende)}
      </span>
    )
  }
  return (
    <span className="t-mono karte-datum" data-numeric>
      {alsDeutschesDatum(start)}
      {ende != null && ` – ${alsDeutschesDatum(ende)}`}
    </span>
  )
}

/**
 * Hover-Plus am rechten Kartenrand (Brief A-35, Abschnitt 4):
 * Kreis 24 px in `--accent`, weißes Plus, Tooltip mit Text.
 *
 * Der Tooltip ist das native `title` – ein eigenes Popover wäre auf einer
 * Karte, die man zugleich ziehen kann, mehr Ärger als Nutzen.
 */
export function HoverPlus({
  text,
  onAnlegen,
}: {
  text: string
  onAnlegen: () => void
}) {
  return (
    <button
      type="button"
      className="karte-plus nodrag"
      title={text}
      aria-label={text}
      onClick={(e) => {
        e.stopPropagation()
        onAnlegen()
      }}
    >
      <Plus size={14} strokeWidth={2} aria-hidden="true" />
    </button>
  )
}
