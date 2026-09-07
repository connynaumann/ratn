import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Field,
  Input,
  Panel,
  PanelBody,
  PanelHead,
  PropRow,
  Segmented,
  Select,
  Tabs,
  Toggle,
  TreeRow,
} from '@/components/ui'
import { PRIORITAET, STATUS, UI } from '@/content/texte'
import { navigiere, ROUTEN } from '@/router'

/**
 * /dev/components – Schaukasten aller Basis-Komponenten (Brief Abschnitt 12,
 * Abnahmetest T-12). Zum Vergleich neben docs/design-system/framer-dark.html
 * öffnen: Farben, Radien, Größen und Hover-Zustände müssen übereinstimmen.
 *
 * Gezeigt werden die acht Komponenten aus Scheibe 1 plus Tabs, Feld und
 * Select. Slider, Stepper, Breakpoint-Bar und Cursor-Label aus der
 * Design-System-Datei kommen im Prototyp nicht vor und fehlen deshalb.
 */

function Abschnitt({
  nummer,
  titel,
  children,
}: {
  nummer: string
  titel: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <div className="sec-label">{nummer}</div>
      <h2 className="t-h2 mb-4">{titel}</h2>
      <div
        className="flex flex-wrap items-center gap-4 p-8"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        {children}
      </div>
    </section>
  )
}

const STATUS_TOKEN = {
  in_planung: 'status-in-planung',
  begonnen: 'status-begonnen',
  abgeschlossen: 'status-abgeschlossen',
  blockiert: 'status-blockiert',
} as const

export function ComponentsShowcase() {
  const [seg, setSeg] = useState<'flexible' | 'sorted' | 'net'>('flexible')
  const [tab, setTab] = useState<'map' | 'linear'>('map')
  const [toggle, setToggle] = useState(true)
  const [check, setCheck] = useState(true)
  const [auswahl, setAuswahl] = useState('g1')

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10">
      <header className="mb-10">
        <div className="sec-label">Nur für die Entwicklung</div>
        <h1 className="t-h2">Basis-Komponenten</h1>
        <p className="t-body mt-2">
          Vergleichsfläche zu docs/design-system/framer-dark.html. Diese Seite
          ist nirgends verlinkt und nur angemeldet erreichbar.
        </p>
        <div className="mt-4">
          <Button onClick={() => navigiere(ROUTEN.app)}>Zur App</Button>
        </div>
      </header>

      <Abschnitt nummer="01" titel="Buttons">
        <Button variante="primary">Anlegen</Button>
        <Button variante="secondary">Hinzufügen</Button>
        <Button variante="ghost">Abbrechen</Button>
        <Button variante="danger">Löschen</Button>
        <Button variante="primary" disabled>
          Deaktiviert
        </Button>
        <Button variante="primary" groesse="sm">
          Klein
        </Button>
        <Button variante="secondary" groesse="sm">
          Klein
        </Button>
        <Button variante="primary" groesse="lg">
          Groß
        </Button>
      </Abschnitt>

      <Abschnitt nummer="02" titel="Felder">
        <Field label={UI.sidepanel.felder.titel} placeholder="Portfolio erstellen" />
        <Field
          label={UI.login.feld}
          defaultValue="conny@example.com"
          type="email"
        />
        <Field
          label={UI.sidepanel.felder.titel}
          defaultValue=""
          fehler="Bitte gib einen Titel mit 1 bis 80 Zeichen ein."
        />
        <div className="field">
          <label htmlFor="sc-suche">Suche</label>
          <Input
            id="sc-suche"
            placeholder={UI.dialog.abhaengigkeitSuche}
            symbol={<Search size={13} strokeWidth={1.5} />}
          />
        </div>
        <div className="field">
          <label htmlFor="sc-status">{UI.sidepanel.felder.status}</label>
          <Select
            id="sc-status"
            optionen={Object.entries(STATUS).map(([wert, text]) => ({
              wert,
              text,
            }))}
          />
        </div>
        <div className="field" style={{ minWidth: 120 }}>
          <label htmlFor="sc-ist">{UI.sidepanel.istwert}</label>
          <Input id="sc-ist" numerisch defaultValue="12" einheit="Seiten" />
        </div>
      </Abschnitt>

      <Abschnitt nummer="03" titel="Umschalter">
        <Tabs
          optionen={[
            { wert: 'map', text: UI.header.view.map },
            { wert: 'linear', text: UI.header.view.linear },
          ]}
          wert={tab}
          onWechsel={setTab}
          label="Ansicht"
        />
        <Segmented
          optionen={[
            { wert: 'flexible', text: UI.header.layout.flexible },
            { wert: 'sorted', text: UI.header.layout.sorted },
            { wert: 'net', text: UI.header.layout.net },
          ]}
          wert={seg}
          onWechsel={setSeg}
          label="Layout"
        />
        <Segmented
          optionen={[
            { wert: 'week', text: UI.header.zeitskala.week },
            { wert: 'month', text: UI.header.zeitskala.month },
          ]}
          wert="week"
          onWechsel={() => {}}
          label="Zeitskala"
        />
      </Abschnitt>

      <Abschnitt nummer="04" titel="Toggle und Checkbox">
        <Toggle an={toggle} onWechsel={setToggle} label={UI.sidepanel.manuellSetzen} />
        <Toggle an={false} onWechsel={() => {}} label="Aus" />
        <Checkbox an={check} onWechsel={setCheck} label="Metrik erledigt" />
        <Checkbox an={false} onWechsel={() => {}} label="Metrik offen" />
      </Abschnitt>

      <Abschnitt nummer="05" titel="Badges">
        {Object.entries(STATUS).map(([schluessel, text]) => (
          <Badge
            key={schluessel}
            punkt
            farbToken={STATUS_TOKEN[schluessel as keyof typeof STATUS_TOKEN]}
          >
            {text}
          </Badge>
        ))}
        <Badge ton="blue">3</Badge>
        <Badge ton="green" punkt>
          12 / 30 Initiativen abgeschlossen
        </Badge>
        <Badge>{PRIORITAET.hoch.kuerzel}</Badge>
        <Badge>{PRIORITAET.mittel.kuerzel}</Badge>
        <Badge>{PRIORITAET.niedrig.kuerzel}</Badge>
      </Abschnitt>

      <Abschnitt nummer="06" titel="Panel und Property Rows">
        <Panel>
          <PanelHead titel="Ziel" onSchliessen={() => {}} schliessenLabel="Schließen" />
          <Divider />
          <PanelBody className="pt-4">
            <PropRow label={UI.sidepanel.felder.titel}>
              <Input defaultValue="Finanzierung" />
            </PropRow>
            <PropRow label={UI.sidepanel.felder.status}>
              <Select
                optionen={Object.entries(STATUS).map(([wert, text]) => ({
                  wert,
                  text,
                }))}
              />
            </PropRow>
            <PropRow label={UI.sidepanel.manuellSetzen}>
              <Toggle
                an={toggle}
                onWechsel={setToggle}
                label={UI.sidepanel.manuellSetzen}
              />
            </PropRow>
            <Divider />
            <PropRow label={UI.sidepanel.felder.fortschritt}>
              <span className="t-mono" data-numeric>
                50 %
              </span>
            </PropRow>
          </PanelBody>
        </Panel>

        <div className="tree">
          <TreeRow
            text="Freier bildender Künstler"
            aufgeklappt
            statusToken="status-begonnen"
            statusLabel={STATUS.begonnen}
          />
          <TreeRow
            text="Künstlerische Richtung"
            ebene={1}
            aufgeklappt={false}
            statusToken="status-in-planung"
            statusLabel={STATUS.in_planung}
            onAuswahl={() => setAuswahl('g1')}
            ausgewaehlt={auswahl === 'g1'}
          />
          <TreeRow
            text="Professionalität"
            ebene={1}
            aufgeklappt
            statusToken="status-blockiert"
            statusLabel={STATUS.blockiert}
            onAuswahl={() => setAuswahl('g2')}
            ausgewaehlt={auswahl === 'g2'}
          />
          <TreeRow
            text="Portfolio erstellen"
            ebene={2}
            kindDerAuswahl={auswahl === 'g2'}
            statusToken="status-abgeschlossen"
            statusLabel={STATUS.abgeschlossen}
          />
          <TreeRow
            text="Portfolio liegt als PDF vor"
            ebene={3}
            kindDerAuswahl={auswahl === 'g2'}
          />
        </div>
      </Abschnitt>
    </div>
  )
}
