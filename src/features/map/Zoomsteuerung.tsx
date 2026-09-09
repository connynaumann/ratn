import { Maximize2, Minus, Plus } from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { Button } from '@/components/ui'
import { SR, UI } from '@/content/texte'

/**
 * Zoom-Steuerung unten links als `.btn-secondary sm` (Brief A-46).
 * Der Zoombereich 10 % bis 200 % steckt in den Grenzen der MapView (US-13).
 */
export function Zoomsteuerung() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  return (
    <div className="map-zoom">
      <Button
        variante="secondary"
        groesse="sm"
        aria-label={SR['SR-06']}
        onClick={() => zoomOut()}
      >
        <Minus size={14} strokeWidth={1.5} aria-hidden="true" />
      </Button>
      <Button
        variante="secondary"
        groesse="sm"
        aria-label={SR['SR-05']}
        onClick={() => zoomIn()}
      >
        <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
      </Button>
      <Button
        variante="secondary"
        groesse="sm"
        aria-label={UI.header.fitToScreen}
        onClick={() => void fitView()}
      >
        <Maximize2 size={14} strokeWidth={1.5} aria-hidden="true" />
      </Button>
    </div>
  )
}
