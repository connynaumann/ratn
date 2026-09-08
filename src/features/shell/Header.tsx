import { Filter, Maximize2, ImageDown, Menu } from 'lucide-react'
import { Badge, Button, Segmented, Tabs } from '@/components/ui'
import { TX, UI, fuelle } from '@/content/texte'
import type { Vision } from '@/lib/model'
import { VisionsAuswahl } from './VisionsAuswahl'
import { VisionsTitel } from './VisionsTitel'

/**
 * S-03 Header, Anordnung nach Brief A-31:
 * links Visionsname, Mitte Umschalter und Werkzeuge, rechts Filter, Zähler, Menü.
 *
 * Drei Spalten als Raster (1fr auto 1fr), damit die Mitte tatsächlich mittig
 * sitzt und nicht nur im übrig gebliebenen Platz zentriert wird.
 *
 * Ab 1024 px (Tablet quer, Brief A-06) wird es eng. Fit to Screen und PNG
 * zeigen ihre Beschriftung deshalb erst ab 1280 px; darunter bleiben Symbol
 * und aria-label.
 *
 * Seit Scheibe 2 arbeiten Visionsname (US-02) und Visionsauswahl (A-21). Die
 * übrigen Bedienelemente gehören zu den Scheiben 3 bis 7 und sind deaktiviert,
 * damit niemand ins Leere klickt.
 */
type Props = {
  /** Aktive Vision; ohne Vision steht der Schriftzug der App im Header */
  vision: Vision | null
  initiativenGesamt: number
  initiativenAbgeschlossen: number
}

const VIEW_OPTIONEN = [
  { wert: 'map', text: UI.header.view.map },
  { wert: 'linear', text: UI.header.view.linear },
] as const

const LAYOUT_OPTIONEN = [
  { wert: 'flexible', text: UI.header.layout.flexible },
  { wert: 'sorted', text: UI.header.layout.sorted },
  { wert: 'net', text: UI.header.layout.net },
] as const

export function Header({
  vision,
  initiativenGesamt,
  initiativenAbgeschlossen,
}: Props) {
  return (
    <header
      className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3"
      style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        {vision != null ? (
          <VisionsTitel vision={vision} />
        ) : (
          <h1 className="t-h3 truncate">{UI.login.titel}</h1>
        )}
        <VisionsAuswahl />
      </div>

      <div className="flex items-center gap-3">
        <Tabs
          optionen={VIEW_OPTIONEN}
          wert="map"
          onWechsel={() => {}}
          label={`${UI.header.view.map} / ${UI.header.view.linear}`}
          disabled
        />
        <Segmented
          optionen={LAYOUT_OPTIONEN}
          wert="flexible"
          onWechsel={() => {}}
          label={UI.header.layout.flexible}
          disabled
        />
        <Button
          variante="ghost"
          groesse="sm"
          aria-label={UI.header.fitToScreen}
          disabled
        >
          <Maximize2 size={14} strokeWidth={1.5} aria-hidden="true" />
          <span className="hidden xl:inline">{UI.header.fitToScreen}</span>
        </Button>
        <Button
          variante="ghost"
          groesse="sm"
          aria-label={UI.header.pngExport}
          disabled
        >
          <ImageDown size={14} strokeWidth={1.5} aria-hidden="true" />
          <span className="hidden xl:inline">{UI.header.pngExport}</span>
        </Button>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variante="secondary" groesse="sm" disabled>
          <Filter size={14} strokeWidth={1.5} aria-hidden="true" />
          {UI.header.filter}
        </Button>
        <Badge punkt farbToken="success" data-numeric>
          {fuelle(TX['TX-05'], {
            x: initiativenAbgeschlossen,
            y: initiativenGesamt,
          })}
        </Badge>
        <Button
          variante="ghost"
          groesse="sm"
          aria-label={UI.header.menue}
          disabled
        >
          <Menu size={14} strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}
