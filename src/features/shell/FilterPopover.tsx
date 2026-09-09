import * as Popover from '@radix-ui/react-popover'
import { Filter as FilterSymbol } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { UI } from '@/content/texte'
import { anzahlKriterien, istFilterAktiv } from '@/lib/filter'
import { useStore } from '@/store/useStore'
import { FilterInhalt } from './FilterInhalt'

/**
 * Filter im Header (US-19, Brief Abschnitt 4):
 * `.btn-secondary sm` mit `.badge.blue` und der Anzahl aktiver Kriterien,
 * Popover als `.panel`. Der Inhalt steht in FilterInhalt.
 */
export function FilterPopover() {
  const { aktiveVision, filter } = useStore()
  const aktiv = istFilterAktiv(filter)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variante="secondary" groesse="sm" disabled={aktiveVision == null}>
          <FilterSymbol size={14} strokeWidth={1.5} aria-hidden="true" />
          {UI.header.filter}
          {aktiv && (
            <Badge ton="blue" data-numeric>
              {anzahlKriterien(filter)}
            </Badge>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="panel filter-panel"
          align="end"
          sideOffset={8}
        >
          <FilterInhalt />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
