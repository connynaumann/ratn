import type { BuiltInEdge, Edge, Node } from '@xyflow/react'
import type {
  Daten,
  Goal,
  Initiative,
  Kartentyp,
  Metric,
  Status,
  Vision,
} from '@/lib/model'
import type { StatusUndFortschritt } from '@/lib/status'
import { KARTEN_MASSE } from './masse'

/**
 * Aus den Daten werden Knoten und Kanten für React Flow.
 *
 * Gezeigt wird immer nur die aktive Vision mit ihren verknüpften Zielen samt
 * Initiativen und Metriken (Brief D-09, Abschnitt 7). Ein Ziel, das zu zwei
 * Visionen gehört, erscheint in beiden – mit derselben Position, weil es nur
 * ein `pos_x`/`pos_y` je Ziel gibt (A-49).
 *
 * Reine Funktion ohne React: so lässt sich prüfen, welche Karten und welche
 * Kanten entstehen, ohne einen Canvas zu rendern.
 */

export type KartenDaten = {
  typ: Kartentyp
  status: Status | null
  fortschritt: number
  /** Zielfarbe als Tokenname, z. B. „line-1“; Visionen haben keine */
  farbe: string | null
  vision?: Vision
  goal?: Goal
  initiative?: Initiative
  metric?: Metric
}

export type Karte = Node<KartenDaten>

/** Kantenarten aus Brief A-18 */
export const KANTEN_BREITE = {
  hierarchie: 6,
  metrik: 3,
  blockade: 2,
} as const

export const KANTEN_RADIUS = 14

function knoten(
  id: string,
  typ: Kartentyp,
  pos: { x: number; y: number },
  daten: KartenDaten,
): Karte {
  return {
    id,
    type: typ,
    position: { x: pos.x, y: pos.y },
    data: daten,
    /*
     * Die Maße stehen hier und nicht im CSS. React Flow braucht sie, bevor
     * gemessen wurde – für Fit to Screen, für die Bounds und vor allem für
     * die Minimap: die zeichnet nur Knoten mit bekannten Maßen. Weil die
     * Knoten bei jedem Rendern neu aus den Daten entstehen, bekommen sie
     * `measured` nie zurückgeschrieben; ohne feste Maße bliebe die Minimap
     * leer. Die Karte selbst füllt den Knoten (map.css).
     */
    width: KARTEN_MASSE[typ].breite,
    height: KARTEN_MASSE[typ].hoehe,
    draggable: true,
  }
}

export function baueKarten(
  daten: Daten,
  berechnet: StatusUndFortschritt,
  aktiveVisionId: string | null,
): Karte[] {
  const vision = daten.vision.find((v) => v.id === aktiveVisionId)
  if (vision == null) return []

  const zielIds = daten.goal_vision
    .filter((gv) => gv.vision_id === vision.id)
    .sort((a, b) => a.sort_index - b.sort_index)
    .map((gv) => gv.goal_id)
  const ziele = zielIds
    .map((id) => daten.goal.find((g) => g.id === id))
    .filter((g): g is Goal => g != null)
  const initiativen = daten.initiative
    .filter((i) => ziele.some((g) => g.id === i.goal_id))
    .sort((a, b) => a.sort_index - b.sort_index)
  const metriken = daten.metric.filter((m) =>
    initiativen.some((i) => i.id === m.initiative_id),
  )

  const karten: Karte[] = [
    knoten(vision.id, 'vision', { x: vision.pos_x, y: vision.pos_y }, {
      typ: 'vision',
      status: berechnet.status.get(vision.id) ?? null,
      fortschritt: berechnet.fortschritt.get(vision.id) ?? 0,
      farbe: null,
      vision,
    }),
  ]

  for (const ziel of ziele) {
    karten.push(
      knoten(ziel.id, 'goal', { x: ziel.pos_x, y: ziel.pos_y }, {
        typ: 'goal',
        status: berechnet.status.get(ziel.id) ?? null,
        fortschritt: berechnet.fortschritt.get(ziel.id) ?? 0,
        farbe: ziel.color,
        goal: ziel,
      }),
    )
  }

  for (const initiative of initiativen) {
    const ziel = ziele.find((g) => g.id === initiative.goal_id)
    karten.push(
      knoten(
        initiative.id,
        'initiative',
        { x: initiative.pos_x, y: initiative.pos_y },
        {
          typ: 'initiative',
          status: berechnet.status.get(initiative.id) ?? null,
          fortschritt: berechnet.fortschritt.get(initiative.id) ?? 0,
          farbe: ziel?.color ?? null,
          initiative,
        },
      ),
    )
  }

  for (const metrik of metriken) {
    const initiative = initiativen.find((i) => i.id === metrik.initiative_id)
    const ziel = ziele.find((g) => g.id === initiative?.goal_id)
    karten.push(
      knoten(metrik.id, 'metric', { x: metrik.pos_x, y: metrik.pos_y }, {
        typ: 'metric',
        status: null,
        fortschritt: berechnet.fortschritt.get(metrik.id) ?? 0,
        farbe: ziel?.color ?? null,
        metric: metrik,
      }),
    )
  }

  return karten
}

/**
 * `pathOptions` gibt es nur auf den eingebauten Kantentypen, nicht auf dem
 * allgemeinen `Edge`. Deshalb wird hier über den engeren Typ gebaut und erst
 * am Ende auf `Edge` verbreitert.
 */
type SmoothstepKante = Extract<BuiltInEdge, { type?: 'smoothstep' }>

function kante(
  id: string,
  quelle: string,
  ziel: string,
  farbToken: string | null,
  breite: number,
  extra: Partial<Edge> = {},
): Edge {
  const gebaut: SmoothstepKante = {
    id,
    source: quelle,
    target: ziel,
    type: 'smoothstep',
    pathOptions: { borderRadius: KANTEN_RADIUS },
    style: {
      stroke: farbToken != null ? `var(--${farbToken})` : 'var(--danger)',
      strokeWidth: breite,
      opacity: 0.9,
    },
  }
  return { ...gebaut, ...extra }
}

/**
 * Kanten nach Brief A-18:
 * Vision → Ziel und Ziel → Initiative 6 px in der Zielfarbe,
 * Initiative → Metrik 3 px,
 * Blockaden 2 px gestrichelt in --danger mit Pfeilspitze am blockierten Ziel.
 */
export function baueKanten(
  daten: Daten,
  aktiveVisionId: string | null,
): Edge[] {
  const sichtbar = new Set(
    baueKartenIds(daten, aktiveVisionId),
  )
  if (sichtbar.size === 0) return []

  const kanten: Edge[] = []

  for (const gv of daten.goal_vision) {
    if (gv.vision_id !== aktiveVisionId) continue
    if (!sichtbar.has(gv.goal_id)) continue
    const ziel = daten.goal.find((g) => g.id === gv.goal_id)
    kanten.push(
      kante(
        `v-${gv.vision_id}-${gv.goal_id}`,
        gv.vision_id,
        gv.goal_id,
        ziel?.color ?? null,
        KANTEN_BREITE.hierarchie,
      ),
    )
  }

  for (const initiative of daten.initiative) {
    if (!sichtbar.has(initiative.id)) continue
    const ziel = daten.goal.find((g) => g.id === initiative.goal_id)
    kanten.push(
      kante(
        `g-${initiative.goal_id}-${initiative.id}`,
        initiative.goal_id,
        initiative.id,
        ziel?.color ?? null,
        KANTEN_BREITE.hierarchie,
      ),
    )
  }

  for (const metrik of daten.metric) {
    if (!sichtbar.has(metrik.id)) continue
    const initiative = daten.initiative.find(
      (i) => i.id === metrik.initiative_id,
    )
    const ziel = daten.goal.find((g) => g.id === initiative?.goal_id)
    kanten.push(
      kante(
        `i-${metrik.initiative_id}-${metrik.id}`,
        metrik.initiative_id,
        metrik.id,
        ziel?.color ?? null,
        KANTEN_BREITE.metrik,
      ),
    )
  }

  // Blockaden: nur zeigen, wenn beide Enden sichtbar sind
  for (const abhaengigkeit of daten.dependency) {
    if (!sichtbar.has(abhaengigkeit.source_id)) continue
    if (!sichtbar.has(abhaengigkeit.target_goal_id)) continue
    kanten.push(
      kante(
        `d-${abhaengigkeit.id}`,
        abhaengigkeit.source_id,
        abhaengigkeit.target_goal_id,
        null,
        KANTEN_BREITE.blockade,
        {
          className: 'kante-blockade',
          markerEnd: { type: 'arrowclosed', color: 'var(--danger)' } as Edge['markerEnd'],
        },
      ),
    )
  }

  return kanten
}

/** IDs aller Karten, die zur aktiven Vision gehören. */
export function baueKartenIds(
  daten: Daten,
  aktiveVisionId: string | null,
): string[] {
  if (aktiveVisionId == null) return []
  if (!daten.vision.some((v) => v.id === aktiveVisionId)) return []

  const zielIds = daten.goal_vision
    .filter((gv) => gv.vision_id === aktiveVisionId)
    .map((gv) => gv.goal_id)
    .filter((id) => daten.goal.some((g) => g.id === id))
  const initiativeIds = daten.initiative
    .filter((i) => zielIds.includes(i.goal_id))
    .map((i) => i.id)
  const metrikIds = daten.metric
    .filter((m) => initiativeIds.includes(m.initiative_id))
    .map((m) => m.id)

  return [aktiveVisionId, ...zielIds, ...initiativeIds, ...metrikIds]
}
