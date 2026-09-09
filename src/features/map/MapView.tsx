import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react'
import type { NodeChange, NodeMouseHandler, OnNodeDrag } from '@xyflow/react'
import { Toast } from '@/components/ui'
import { E, SR } from '@/content/texte'
import type { Kartentyp, Vision } from '@/lib/model'
import { useStore } from '@/store/useStore'
import { KARTEN_TYPEN } from './Karten'
import { KartenAktionenContext } from './KartenAktionen'
import type { KartenAktionen } from './KartenAktionen'
import { baueKanten, baueKarten } from './knoten'
import { KARTEN_MASSE, ZOOM_MAX, ZOOM_MIN } from './masse'
import type { Karte } from './knoten'
import { Zoomsteuerung } from './Zoomsteuerung'

/**
 * S-04 Map-View, Layout „Flexibel“ (US-03, US-12, US-13).
 *
 * Gezeigt wird immer nur die aktive Vision (Brief D-09). Die Positionen
 * stehen in der Datenbank; beim Loslassen einer Karte wird die neue Position
 * gespeichert und ist damit auch auf einem zweiten Gerät dieselbe (US-12).
 *
 * In „Sortiert“ und „Netz“ sind Karten nicht ziehbar; ein Ziehversuch zeigt
 * E-11 (US-12). Diese beiden Layouts kommen in Scheibe 5 – die Sperre steht
 * schon hier, weil sie zu US-12 gehört.
 */

type Props = {
  vision: Vision
  onNeueKarte: (typ: Kartentyp, elternId: string) => void
}

export function MapView({ vision, onNeueKarte }: Props) {
  const { daten, berechnet, auswahl, waehleKarte, karteAendern } = useStore()
  const { fitView, setCenter, getZoom } = useReactFlow()
  const [hinweis, setHinweis] = useState<string | null>(null)

  const layout = daten.settings?.layout ?? 'flexible'
  const ziehbar = layout === 'flexible'

  const karten = useMemo(
    () => baueKarten(daten, berechnet, vision.id),
    [daten, berechnet, vision.id],
  )
  const kanten = useMemo(() => baueKanten(daten, vision.id), [daten, vision.id])

  /** Auswahl aus dem Sidepanel auf die Karten übertragen (US-18). */
  const kartenMitAuswahl = useMemo(
    () =>
      karten.map((k) => ({
        ...k,
        selected: auswahl?.id === k.id,
        draggable: ziehbar,
      })),
    [karten, auswahl?.id, ziehbar],
  )

  /**
   * Beim ersten Laden mit Fit to Screen starten (US-13). Danach nur noch,
   * wenn die Vision wechselt – sonst würde jede Änderung den Ausschnitt
   * zurücksetzen.
   */
  const zuletztGezeigt = useRef<string | null>(null)
  useEffect(() => {
    if (zuletztGezeigt.current === vision.id) return
    if (karten.length === 0) return
    zuletztGezeigt.current = vision.id
    // Nach dem Messen der Knoten, sonst rechnet React Flow mit Nullgrößen.
    const timer = setTimeout(() => void fitView({ duration: 0 }), 0)
    return () => clearTimeout(timer)
  }, [vision.id, karten.length, fitView])

  /**
   * Eine im Sidepanel gewählte Zeile rückt in die Mitte (US-18:
   * „die Karte wird hervorgehoben und zentriert“).
   */
  const zuletztZentriert = useRef<string | null>(null)
  useEffect(() => {
    if (auswahl == null) {
      zuletztZentriert.current = null
      return
    }
    if (zuletztZentriert.current === auswahl.id) return
    const karte = karten.find((k) => k.id === auswahl.id)
    if (karte == null) return
    zuletztZentriert.current = auswahl.id
    // Auf die Mitte der Karte zielen, nicht auf ihre linke obere Ecke – und
    // den aktuellen Zoom behalten. Ohne `zoom` springt React Flow auf den
    // Höchstwert, hier also auf 200 %.
    const mass = KARTEN_MASSE[karte.data.typ]
    setCenter(
      karte.position.x + mass.breite / 2,
      karte.position.y + mass.hoehe / 2,
      { duration: 300, zoom: getZoom() },
    )
  }, [auswahl, karten, setCenter, getZoom])

  /** Position beim Loslassen speichern (US-12). */
  const beimLoslassen = useCallback<OnNodeDrag<Karte>>(
    (_ereignis, knoten) => {
      const typ = knoten.data.typ
      karteAendern(
        { typ, id: knoten.id },
        { pos_x: Math.round(knoten.position.x), pos_y: Math.round(knoten.position.y) },
      )
    },
    [karteAendern],
  )

  /**
   * React Flow meldet jede Bewegung; gespeichert wird erst beim Loslassen.
   * Auswahländerungen werden ignoriert – die Auswahl führt der Store.
   */
  const beiAenderung = useCallback(
    (aenderungen: NodeChange<Karte>[]) => {
      if (ziehbar) return
      if (aenderungen.some((a) => a.type === 'position')) {
        setHinweis(E['E-11'])
      }
    },
    [ziehbar],
  )

  const aktionen = useMemo<KartenAktionen>(
    () => ({
      unterkarteAnlegen: (elternTyp, elternId) => {
        const kindTyp: Record<string, Kartentyp> = {
          vision: 'goal',
          goal: 'initiative',
          initiative: 'metric',
        }
        const kind = kindTyp[elternTyp]
        if (kind != null) onNeueKarte(kind, elternId)
      },
      metrikWechseln: (metrikId, an) =>
        karteAendern({ typ: 'metric', id: metrikId }, { done: an }),
    }),
    [onNeueKarte, karteAendern],
  )

  const beiKlick = useCallback<NodeMouseHandler<Karte>>(
    (_ereignis, knoten) => waehleKarte({ typ: knoten.data.typ, id: knoten.id }),
    [waehleKarte],
  )

  return (
    <KartenAktionenContext.Provider value={aktionen}>
      <div className="map-flaeche">
        <ReactFlow
          nodes={kartenMitAuswahl}
          edges={kanten}
          nodeTypes={KARTEN_TYPEN}
          onNodesChange={beiAenderung}
          onNodeDragStop={beimLoslassen}
          onNodeClick={beiKlick}
          onPaneClick={() => waehleKarte(null)}
          nodesDraggable={ziehbar}
          nodesConnectable={false}
          elementsSelectable
          minZoom={ZOOM_MIN}
          maxZoom={ZOOM_MAX}
          proOptions={{ hideAttribution: true }}
          /* Brief A-43: bis 200 Karten flüssig ziehen */
          onlyRenderVisibleElements
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
          {/*
            Die Farbe kommt über eine Klasse, nicht über nodeColor: React Flow
            schreibt nodeColor in das SVG-Attribut `fill`, und ein var() wird
            dort nicht aufgelöst – die Karten blieben unsichtbar. Die
            Zuordnung steht in map.css.
          */}
          <MiniMap
            pannable
            zoomable
            ariaLabel={SR['SR-07']}
            nodeClassName={(knoten) => {
              const farbe = (knoten.data as Karte['data']).farbe
              return `minimap-karte minimap-${farbe ?? 'vision'}`
            }}
          />
          <Zoomsteuerung />
        </ReactFlow>
        <Toast text={hinweis} dauerMs={2000} onEnde={() => setHinweis(null)} />
      </div>
    </KartenAktionenContext.Provider>
  )
}
