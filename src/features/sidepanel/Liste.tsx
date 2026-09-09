import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, TreeRow } from '@/components/ui'
import { STATUS, TX, UI } from '@/content/texte'
import { sichtbareImBaum } from '@/lib/filter'
import { STATUS_TOKEN } from '@/lib/model'
import type { Kartentyp, KartenRef, Vision } from '@/lib/model'
import { useStore } from '@/store/useStore'
import { ladeZugeklappt, speichereZugeklappt } from './aufklappen'

/**
 * S-06 Sidepanel, Liste (US-18).
 *
 * Accordion Vision → Ziel → Initiative → Metrik, jede Zeile mit Statuspunkt.
 * Klick auf eine Zeile wählt die Karte und öffnet S-07.
 *
 * In Scheibe 2 gibt es noch keine Karte zum Überfahren, deshalb wird über die
 * Plus-Knöpfe in der Liste angelegt (Brief Abschnitt 12, „Plus statt Hover“).
 * Ziele und Initiativen bekommen je einen Knopf; Metriken werden im Detail der
 * Initiative angelegt – ein Knopf unter jeder einzelnen Initiative hätte die
 * Liste mit mehr Knöpfen als Karten gefüllt.
 */
type Props = {
  vision: Vision
  onNeueKarte: (typ: Kartentyp, elternId: string) => void
}

export function Liste({ vision, onNeueKarte }: Props) {
  const { daten, berechnet, auswahl, waehleKarte, filter } = useStore()
  const [zugeklappt, setZugeklappt] = useState<Set<string>>(ladeZugeklappt)

  /**
   * Bei aktivem Filter bleiben nur passende Karten und ihre Eltern stehen
   * (US-19). Ohne Filter ist `sichtbar` null und es wird nichts ausgeblendet.
   */
  const sichtbar = sichtbareImBaum(daten, berechnet, filter)
  const zeigen = (id: string) => sichtbar == null || sichtbar.has(id)

  useEffect(() => {
    speichereZugeklappt(zugeklappt)
  }, [zugeklappt])

  const umklappen = useCallback((id: string) => {
    setZugeklappt((alt) => {
      const neu = new Set(alt)
      if (neu.has(id)) neu.delete(id)
      else neu.add(id)
      return neu
    })
  }, [])

  const istAusgewaehlt = (ref: KartenRef) =>
    auswahl?.typ === ref.typ && auswahl.id === ref.id

  /** Gehört die Zeile zur ausgewählten Karte? Dann .sel-child. */
  const istKindDerAuswahl = (elternIds: string[]) =>
    auswahl != null && elternIds.includes(auswahl.id)

  const statusVon = (id: string) => berechnet.status.get(id) ?? 'in_planung'
  const punkt = (id: string) => ({
    statusToken: STATUS_TOKEN[statusVon(id)],
    statusLabel: STATUS[statusVon(id)],
  })

  const ziele = daten.goal_vision
    .filter((gv) => gv.vision_id === vision.id)
    .sort((a, b) => a.sort_index - b.sort_index)
    .map((gv) => daten.goal.find((g) => g.id === gv.goal_id))
    .filter((g): g is NonNullable<typeof g> => g != null)
    .filter((g) => zeigen(g.id))

  // Passt gar nichts, sagt TX-10 das – statt einer leeren Fläche
  if (sichtbar != null && !zeigen(vision.id)) {
    return <p className="t-label">{TX['TX-10']}</p>
  }

  return (
    <div className="tree-liste" role="tree" aria-label={UI.sidepanel.titelListe}>
      <TreeRow
        text={vision.title}
        aufgeklappt={!zugeklappt.has(vision.id)}
        onAufklappen={() => umklappen(vision.id)}
        ausgewaehlt={istAusgewaehlt({ typ: 'vision', id: vision.id })}
        onAuswahl={() => waehleKarte({ typ: 'vision', id: vision.id })}
        {...punkt(vision.id)}
      />

      {!zugeklappt.has(vision.id) && (
        <>
          {ziele.map((ziel) => {
            const initiativen = daten.initiative
              .filter((i) => i.goal_id === ziel.id)
              .filter((i) => zeigen(i.id))
              .sort((a, b) => a.sort_index - b.sort_index)
            const zielOffen = !zugeklappt.has(ziel.id)
            return (
              <div key={ziel.id}>
                <TreeRow
                  text={ziel.title}
                  ebene={1}
                  aufgeklappt={zielOffen}
                  onAufklappen={() => umklappen(ziel.id)}
                  ausgewaehlt={istAusgewaehlt({ typ: 'goal', id: ziel.id })}
                  kindDerAuswahl={istKindDerAuswahl([vision.id])}
                  onAuswahl={() => waehleKarte({ typ: 'goal', id: ziel.id })}
                  symbol={
                    <span
                      className="ziel-farbe"
                      style={{ background: `var(--${ziel.color})` }}
                      aria-hidden="true"
                    />
                  }
                  {...punkt(ziel.id)}
                />

                {zielOffen && (
                  <>
                    {initiativen.map((initiative) => {
                      const metriken = daten.metric
                        .filter((m) => m.initiative_id === initiative.id)
                        .filter((m) => zeigen(m.id))
                      const initiativeOffen = !zugeklappt.has(initiative.id)
                      return (
                        <div key={initiative.id}>
                          <TreeRow
                            text={initiative.title}
                            ebene={2}
                            aufgeklappt={
                              metriken.length > 0 ? initiativeOffen : undefined
                            }
                            onAufklappen={() => umklappen(initiative.id)}
                            ausgewaehlt={istAusgewaehlt({
                              typ: 'initiative',
                              id: initiative.id,
                            })}
                            kindDerAuswahl={istKindDerAuswahl([ziel.id])}
                            onAuswahl={() =>
                              waehleKarte({
                                typ: 'initiative',
                                id: initiative.id,
                              })
                            }
                            {...punkt(initiative.id)}
                          />
                          {initiativeOffen &&
                            metriken.map((metrik) => (
                              <TreeRow
                                key={metrik.id}
                                text={metrik.title}
                                ebene={3}
                                ausgewaehlt={istAusgewaehlt({
                                  typ: 'metric',
                                  id: metrik.id,
                                })}
                                kindDerAuswahl={istKindDerAuswahl([
                                  initiative.id,
                                ])}
                                onAuswahl={() =>
                                  waehleKarte({ typ: 'metric', id: metrik.id })
                                }
                              />
                            ))}
                        </div>
                      )
                    })}

                    {initiativen.length === 0 && (
                      <p className="t-label ind-2 py-1">
                        {UI.leer.zielOhneInitiativen}
                      </p>
                    )}

                    <div className="tree-aktion ind-2">
                      <Button
                        variante="ghost"
                        groesse="sm"
                        onClick={() => onNeueKarte('initiative', ziel.id)}
                      >
                        <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
                        {UI.leer.zielOhneInitiativenButton}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          <div className="tree-aktion ind-1">
            <Button
              variante="ghost"
              groesse="sm"
              onClick={() => onNeueKarte('goal', vision.id)}
            >
              <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
              {UI.dialog.neuesZiel}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
