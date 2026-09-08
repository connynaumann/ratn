import type { CSSProperties, ReactNode } from 'react'
import { SR } from '@/content/texte'
import { cx } from './klassen'

/**
 * .tree-row aus dem Design System, Abschnitt 07.
 * Im Prototyp: Accordion Vision → Ziel → Initiative → Metrik im Sidepanel.
 */
type Props = {
  text: string
  /** 0 = Vision, 1 = Ziel, 2 = Initiative, 3 = Metrik */
  ebene?: 0 | 1 | 2 | 3
  ausgewaehlt?: boolean
  /** Kind der ausgewählten Zeile (.sel-child, --accent-muted) */
  kindDerAuswahl?: boolean
  /** true = aufgeklappt (▾), false = zugeklappt (›), undefined = kein Caret */
  aufgeklappt?: boolean
  onAufklappen?: () => void
  onAuswahl?: () => void
  /** Token-Name der Statusfarbe, z. B. 'status-blockiert' */
  statusToken?: string
  statusLabel?: string
  symbol?: ReactNode
}

export function TreeRow({
  text,
  ebene = 0,
  ausgewaehlt = false,
  kindDerAuswahl = false,
  aufgeklappt,
  onAufklappen,
  onAuswahl,
  statusToken,
  statusLabel,
  symbol,
}: Props) {
  const einzug = ebene > 0 ? `ind-${ebene}` : undefined
  const statusStil: CSSProperties | undefined =
    statusToken != null ? { color: `var(--${statusToken})` } : undefined
  return (
    <div
      className={cx(
        'tree-row',
        einzug,
        ausgewaehlt && 'sel',
        kindDerAuswahl && 'sel-child',
      )}
      role="treeitem"
      aria-selected={ausgewaehlt}
      aria-expanded={aufgeklappt}
      tabIndex={0}
      onClick={onAuswahl}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAuswahl?.()
        }
      }}
    >
      {aufgeklappt != null && (
        <span
          className="caret"
          role="button"
          aria-label={aufgeklappt ? SR['SR-02'] : SR['SR-01']}
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation()
            onAufklappen?.()
          }}
        >
          {aufgeklappt ? '▾' : '›'}
        </span>
      )}
      {symbol != null && <span className="tree-ico">{symbol}</span>}
      <span className="tree-label">{text}</span>
      {statusToken != null && (
        <span
          className="tree-status"
          style={statusStil}
          role="img"
          aria-label={statusLabel ?? ''}
        />
      )}
    </div>
  )
}
