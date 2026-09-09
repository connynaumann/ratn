import { Button, Checkbox } from '@/components/ui'
import { STATUS, UI } from '@/content/texte'
import { istFilterAktiv, LEERER_FILTER } from '@/lib/filter'
import type { Status } from '@/lib/model'
import { useStore } from '@/store/useStore'

/**
 * Inhalt des Filters: Status und Ziele als Mehrfachauswahl (US-19, A-39).
 *
 * Getrennt vom Popover-Rahmen, damit er ohne Radix testbar bleibt – die
 * Positionsrechnung des Popovers kostet in jsdom Sekunden pro Klick.
 */
export function FilterInhalt() {
  const { daten, aktiveVision, filter, setzeFilter } = useStore()

  const ziele = daten.goal_vision
    .filter((gv) => gv.vision_id === aktiveVision?.id)
    .sort((a, b) => a.sort_index - b.sort_index)
    .map((gv) => daten.goal.find((g) => g.id === gv.goal_id))
    .filter((g): g is NonNullable<typeof g> => g != null)

  function statusWechsel(status: Status, an: boolean) {
    setzeFilter({
      ...filter,
      status: an
        ? [...filter.status, status]
        : filter.status.filter((s) => s !== status),
    })
  }

  function zielWechsel(id: string, an: boolean) {
    setzeFilter({
      ...filter,
      zielIds: an
        ? [...filter.zielIds, id]
        : filter.zielIds.filter((z) => z !== id),
    })
  }

  return (
    <>
      <div className="filter-gruppe">
        <span className="sec-label">{UI.sidepanel.felder.status}</span>
        {(Object.keys(STATUS) as Status[]).map((status) => (
          <label key={status} className="filter-zeile">
            <Checkbox
              an={filter.status.includes(status)}
              label={STATUS[status]}
              onWechsel={(an) => statusWechsel(status, an)}
            />
            <span className="t-label">{STATUS[status]}</span>
          </label>
        ))}
      </div>

      {ziele.length > 0 && (
        <>
          <div className="divider" />
          <div className="filter-gruppe">
            <span className="sec-label">{UI.dialog.neuesZiel}</span>
            {ziele.map((ziel) => (
              <label key={ziel.id} className="filter-zeile">
                <Checkbox
                  an={filter.zielIds.includes(ziel.id)}
                  label={ziel.title}
                  onWechsel={(an) => zielWechsel(ziel.id, an)}
                />
                <span
                  className="ziel-farbe"
                  style={{ background: `var(--${ziel.color})` }}
                  aria-hidden="true"
                />
                <span className="t-label">{ziel.title}</span>
              </label>
            ))}
          </div>
        </>
      )}

      {istFilterAktiv(filter) && (
        <div className="filter-fuss">
          <Button
            variante="ghost"
            groesse="sm"
            onClick={() => setzeFilter(LEERER_FILTER)}
          >
            {UI.header.filterZuruecksetzen}
          </Button>
        </div>
      )}
    </>
  )
}
