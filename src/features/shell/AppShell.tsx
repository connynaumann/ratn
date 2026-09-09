import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Button } from '@/components/ui'
import { E, UI } from '@/content/texte'
import type { Kartentyp, KartenRef } from '@/lib/model'
import { betroffeneKarten } from '@/lib/aktionen'
import { zaehleInitiativen } from '@/lib/zaehler'
import { MapView } from '@/features/map/MapView'
import { LoeschenDialog } from '@/features/dialoge/LoeschenDialog'
import { AbhaengigkeitDialog } from '@/features/dialoge/AbhaengigkeitDialog'
import { NeueKarteDialog } from '@/features/dialoge/NeueKarteDialog'
import { SidePanel } from '@/features/sidepanel/SidePanel'
import { useStore } from '@/store/useStore'
import { EmptyState } from './EmptyState'
import { Header } from './Header'
import { LadeZustand } from './LadeZustand'
import { SpeicherHinweis } from './SpeicherHinweis'

/**
 * S-02 App-Rahmen: Header oben, Hauptfläche links, Sidepanel rechts.
 *
 * Seit Scheibe 3 steht auf der Hauptfläche die Map. Der ReactFlowProvider
 * umschließt Header und Canvas gemeinsam, damit „Fit to Screen“ im Header
 * dieselbe Instanz erreicht wie die Zoom-Steuerung auf dem Canvas.
 */
type NeueKarte = { typ: Kartentyp; elternId: string }

export function AppShell() {
  const store = useStore()
  const {
    ladeStatus,
    ladeFehler,
    neuLaden,
    daten,
    berechnet,
    aktiveVision,
    waehleKarte,
  } = store

  const [neueKarte, setNeueKarte] = useState<NeueKarte | null>(null)
  const [zuLoeschen, setZuLoeschen] = useState<KartenRef | null>(null)
  const [abhaengigkeitFuer, setAbhaengigkeitFuer] = useState<string | null>(null)

  if (ladeStatus === 'laedt') return <LadeZustand />

  if (ladeStatus === 'fehler') {
    return (
      <div className="flex h-dvh flex-col" style={{ background: 'var(--bg-app)' }}>
        <Header vision={null} initiativenGesamt={0} initiativenAbgeschlossen={0} />
        <EmptyState
          text={E['E-02']}
          aktion={
            <>
              <Button variante="primary" onClick={neuLaden}>
                {UI.fehlerErneutLaden}
              </Button>
              {ladeFehler != null && (
                <p className="t-label">{ladeFehler}</p>
              )}
            </>
          }
        />
      </div>
    )
  }

  // Zähler über alle Initiativen der aktiven Vision, unabhängig vom Filter
  // (Brief A-40). Die Rechnung steht in src/lib/zaehler.ts.
  const zaehler = zaehleInitiativen(daten, berechnet, aktiveVision?.id ?? null)

  function anlegen(titel: string) {
    if (neueKarte == null) return
    const { typ, elternId } = neueKarte
    let id: string | null = null
    if (typ === 'vision') id = store.visionAnlegen(titel)
    else if (typ === 'goal') id = store.zielAnlegen(elternId, titel)
    else if (typ === 'initiative') id = store.initiativeAnlegen(elternId, titel)
    else id = store.metrikAnlegen(elternId, titel)
    setNeueKarte(null)
    // Metriken bleiben im Detail der Initiative sichtbar; alles andere wird
    // ausgewählt, damit die neue Karte gleich bearbeitet werden kann.
    if (typ !== 'metric' && id != null) waehleKarte({ typ, id })
  }

  const loeschKarte =
    zuLoeschen != null
      ? (() => {
          const liste =
            zuLoeschen.typ === 'vision'
              ? daten.vision
              : zuLoeschen.typ === 'goal'
                ? daten.goal
                : zuLoeschen.typ === 'initiative'
                  ? daten.initiative
                  : daten.metric
          return (liste as Array<{ id: string; title: string }>).find(
            (z) => z.id === zuLoeschen.id,
          )
        })()
      : undefined

  return (
    <ReactFlowProvider>
    <div className="flex h-dvh flex-col" style={{ background: 'var(--bg-app)' }}>
      <Header
        vision={aktiveVision}
        initiativenGesamt={zaehler.gesamt}
        initiativenAbgeschlossen={zaehler.abgeschlossen}
      />
      <SpeicherHinweis />
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          {aktiveVision == null ? (
            <EmptyState
              text={UI.leer.keineVision}
              aktion={
                <Button
                  variante="primary"
                  onClick={() => setNeueKarte({ typ: 'vision', elternId: '' })}
                >
                  {UI.leer.keineVisionButton}
                </Button>
              }
            />
          ) : (
            <MapView
              vision={aktiveVision}
              onNeueKarte={(typ, elternId) => setNeueKarte({ typ, elternId })}
            />
          )}
        </main>
        <SidePanel
          vision={aktiveVision}
          onNeueKarte={(typ, elternId) => setNeueKarte({ typ, elternId })}
          onLoeschen={setZuLoeschen}
          onAbhaengigkeit={setAbhaengigkeitFuer}
        />
      </div>

      <NeueKarteDialog
        typ={neueKarte?.typ ?? null}
        onAbbrechen={() => setNeueKarte(null)}
        onAnlegen={anlegen}
      />

      <AbhaengigkeitDialog
        zielId={abhaengigkeitFuer}
        onSchliessen={() => setAbhaengigkeitFuer(null)}
      />

      {zuLoeschen != null && loeschKarte != null && (
        <LoeschenDialog
          offen
          typ={zuLoeschen.typ}
          titel={loeschKarte.title}
          betroffen={betroffeneKarten(daten, zuLoeschen).length}
          onAbbrechen={() => setZuLoeschen(null)}
          onLoeschen={() => {
            store.karteLoeschen(zuLoeschen)
            setZuLoeschen(null)
          }}
        />
      )}
    </div>
    </ReactFlowProvider>
  )
}
