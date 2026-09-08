import { heute } from './datum'
import { naechsteZielfarbe } from './farben'
import { goalVisionId } from './daten'
import type { Daten, Kartentyp, KartenRef } from './model'
import type { Vorgang } from './warteschlange'

/**
 * Fachliche Vorgänge auf den Daten.
 *
 * Jede Funktion ist rein: sie bekommt den Zustand und gibt den neuen Zustand
 * samt der Vorgänge zurück, die an die Datenbank gehen. Dadurch lässt sich das
 * Verhalten ohne React und ohne Netz prüfen – Anlegen, Löschen mit
 * Unterkarten, Zuordnung zu Visionen.
 *
 * Beim Löschen wird bewusst nur die oberste Zeile an die Datenbank geschickt.
 * Unterkarten, Abhängigkeiten und verwaiste Ziele räumt die Datenbank selbst
 * ab – über Fremdschlüssel und die Trigger aus den Migrationen 0001 und 0003.
 * Im Client wird derselbe Teilbaum entfernt, damit die Oberfläche sofort passt.
 */

export type Ergebnis = { daten: Daten; vorgaenge: Vorgang[] }

function neueId(): string {
  return crypto.randomUUID()
}

// ------------------------------------------------------------- Anlegen

export function visionAnlegen(
  daten: Daten,
  titel: string,
  erzeugeId: () => string = neueId,
): Ergebnis & { id: string } {
  const id = erzeugeId()
  const zeile = {
    id,
    title: titel.trim(),
    description: null,
    status_override: null,
    priority: null,
    start_date: heute(),
    end_date: null,
    pos_x: 0,
    pos_y: 0,
  }
  return {
    id,
    daten: { ...daten, vision: [...daten.vision, zeile as Daten['vision'][number]] },
    vorgaenge: [{ art: 'anlegen', tabelle: 'vision', id, zeile }],
  }
}

export function zielAnlegen(
  daten: Daten,
  visionId: string,
  titel: string,
  erzeugeId: () => string = neueId,
): Ergebnis & { id: string } {
  const id = erzeugeId()
  const zeile = {
    id,
    title: titel.trim(),
    description: null,
    color: naechsteZielfarbe(daten.goal),
    status_override: null,
    priority: null,
    start_date: heute(),
    end_date: null,
    pos_x: 0,
    pos_y: 0,
  }
  const sortIndex = daten.goal_vision.filter((gv) => gv.vision_id === visionId)
    .length
  const verknuepfung = {
    goal_id: id,
    vision_id: visionId,
    sort_index: sortIndex,
  }
  return {
    id,
    daten: {
      ...daten,
      goal: [...daten.goal, zeile as Daten['goal'][number]],
      goal_vision: [
        ...daten.goal_vision,
        verknuepfung as Daten['goal_vision'][number],
      ],
    },
    vorgaenge: [
      { art: 'anlegen', tabelle: 'goal', id, zeile },
      {
        art: 'anlegen',
        tabelle: 'goal_vision',
        id: goalVisionId(id, visionId),
        zeile: verknuepfung,
      },
    ],
  }
}

export function initiativeAnlegen(
  daten: Daten,
  goalId: string,
  titel: string,
  erzeugeId: () => string = neueId,
): Ergebnis & { id: string } {
  const id = erzeugeId()
  const zeile = {
    id,
    goal_id: goalId,
    title: titel.trim(),
    description: null,
    status: 'in_planung' as const,
    priority: null,
    start_date: heute(),
    end_date: null,
    pos_x: 0,
    pos_y: 0,
    sort_index: daten.initiative.filter((i) => i.goal_id === goalId).length,
  }
  return {
    id,
    daten: {
      ...daten,
      initiative: [...daten.initiative, zeile as Daten['initiative'][number]],
    },
    vorgaenge: [{ art: 'anlegen', tabelle: 'initiative', id, zeile }],
  }
}

export function metrikAnlegen(
  daten: Daten,
  initiativeId: string,
  titel: string,
  erzeugeId: () => string = neueId,
): Ergebnis & { id: string } {
  const id = erzeugeId()
  const zeile = {
    id,
    initiative_id: initiativeId,
    title: titel.trim(),
    done: false,
    target_value: null,
    current_value: null,
    unit: null,
    pos_x: 0,
    pos_y: 0,
  }
  return {
    id,
    daten: { ...daten, metric: [...daten.metric, zeile as Daten['metric'][number]] },
    vorgaenge: [{ art: 'anlegen', tabelle: 'metric', id, zeile }],
  }
}

// ------------------------------------------------------------- Ändern

const TABELLE_ZU_TYP = {
  vision: 'vision',
  goal: 'goal',
  initiative: 'initiative',
  metric: 'metric',
} as const satisfies Record<Kartentyp, Kartentyp>

export function karteAendern(
  daten: Daten,
  ref: KartenRef,
  felder: Record<string, unknown>,
): Ergebnis {
  const tabelle = TABELLE_ZU_TYP[ref.typ]
  const liste = daten[tabelle] as Array<{ id: string }>
  const neu = liste.map((zeile) =>
    zeile.id === ref.id ? { ...zeile, ...felder } : zeile,
  )
  return {
    daten: { ...daten, [tabelle]: neu } as Daten,
    vorgaenge: [{ art: 'aendern', tabelle, id: ref.id, felder }],
  }
}

// ------------------------------------------------------------- Löschen

/** IDs aller Karten, die beim Löschen von `ref` mit verschwinden. */
export function betroffeneKarten(daten: Daten, ref: KartenRef): KartenRef[] {
  if (ref.typ === 'metric') return []

  if (ref.typ === 'initiative') {
    return daten.metric
      .filter((m) => m.initiative_id === ref.id)
      .map((m) => ({ typ: 'metric' as const, id: m.id }))
  }

  if (ref.typ === 'goal') {
    const initiativen = daten.initiative.filter((i) => i.goal_id === ref.id)
    const metriken = daten.metric.filter((m) =>
      initiativen.some((i) => i.id === m.initiative_id),
    )
    return [
      ...initiativen.map((i) => ({ typ: 'initiative' as const, id: i.id })),
      ...metriken.map((m) => ({ typ: 'metric' as const, id: m.id })),
    ]
  }

  // Vision: nur Ziele, die danach zu keiner Vision mehr gehören (Brief A-03,
  // angepasst durch D-09). Ein Ziel in einer zweiten Vision bleibt erhalten.
  const verwaisteZiele = daten.goal.filter((g) => {
    const visionen = daten.goal_vision.filter((gv) => gv.goal_id === g.id)
    return visionen.length > 0 && visionen.every((gv) => gv.vision_id === ref.id)
  })
  const initiativen = daten.initiative.filter((i) =>
    verwaisteZiele.some((g) => g.id === i.goal_id),
  )
  const metriken = daten.metric.filter((m) =>
    initiativen.some((i) => i.id === m.initiative_id),
  )
  return [
    ...verwaisteZiele.map((g) => ({ typ: 'goal' as const, id: g.id })),
    ...initiativen.map((i) => ({ typ: 'initiative' as const, id: i.id })),
    ...metriken.map((m) => ({ typ: 'metric' as const, id: m.id })),
  ]
}

export function karteLoeschen(daten: Daten, ref: KartenRef): Ergebnis {
  const mit = betroffeneKarten(daten, ref)
  const weg = new Set([ref.id, ...mit.map((k) => k.id)])

  const neu: Daten = {
    ...daten,
    vision: daten.vision.filter((v) => !weg.has(v.id)),
    goal: daten.goal.filter((g) => !weg.has(g.id)),
    goal_vision: daten.goal_vision.filter(
      (gv) => !weg.has(gv.goal_id) && !weg.has(gv.vision_id),
    ),
    initiative: daten.initiative.filter((i) => !weg.has(i.id)),
    metric: daten.metric.filter((m) => !weg.has(m.id)),
    dependency: daten.dependency.filter(
      (d) => !weg.has(d.source_id) && !weg.has(d.target_goal_id),
    ),
  }

  return {
    daten: neu,
    vorgaenge: [{ art: 'loeschen', tabelle: TABELLE_ZU_TYP[ref.typ], id: ref.id }],
  }
}

// ------------------------------------------------- Ziel ↔ Vision (US-25)

export type ZuordnungErgebnis = Ergebnis | { fehler: 'letzte-vision' }

export function istZuordnungsFehler(
  e: ZuordnungErgebnis,
): e is { fehler: 'letzte-vision' } {
  return 'fehler' in e
}

/**
 * Hakt eine Vision bei einem Ziel an oder ab (US-25).
 *
 * Die letzte Verknüpfung lässt sich nicht entfernen: die Datenbank würde das
 * Ziel samt Initiativen löschen (Trigger goal_vision_delete_orphans). Die
 * Oberfläche verhindert das und zeigt E-14 (Brief A-48).
 */
export function zielVisionZuordnen(
  daten: Daten,
  goalId: string,
  visionId: string,
  an: boolean,
): ZuordnungErgebnis {
  const bestehende = daten.goal_vision.filter((gv) => gv.goal_id === goalId)
  const schonDa = bestehende.some((gv) => gv.vision_id === visionId)

  if (an) {
    if (schonDa) return { daten, vorgaenge: [] }
    const zeile = {
      goal_id: goalId,
      vision_id: visionId,
      sort_index: daten.goal_vision.filter((gv) => gv.vision_id === visionId)
        .length,
    }
    return {
      daten: {
        ...daten,
        goal_vision: [
          ...daten.goal_vision,
          zeile as Daten['goal_vision'][number],
        ],
      },
      vorgaenge: [
        {
          art: 'anlegen',
          tabelle: 'goal_vision',
          id: goalVisionId(goalId, visionId),
          zeile,
        },
      ],
    }
  }

  if (!schonDa) return { daten, vorgaenge: [] }
  if (bestehende.length <= 1) return { fehler: 'letzte-vision' }

  return {
    daten: {
      ...daten,
      goal_vision: daten.goal_vision.filter(
        (gv) => !(gv.goal_id === goalId && gv.vision_id === visionId),
      ),
    },
    vorgaenge: [
      {
        art: 'loeschen',
        tabelle: 'goal_vision',
        id: goalVisionId(goalId, visionId),
      },
    ],
  }
}

// ---------------------------------------------------------- Einstellungen

export function einstellungAendern(
  daten: Daten,
  felder: Partial<NonNullable<Daten['settings']>>,
): Ergebnis {
  const vorher = daten.settings
  const nachher = { ...(vorher ?? {}), ...felder } as NonNullable<
    Daten['settings']
  >
  return {
    daten: { ...daten, settings: nachher },
    vorgaenge: [
      { art: 'aendern', tabelle: 'settings', id: 'eigene', felder },
    ],
  }
}
