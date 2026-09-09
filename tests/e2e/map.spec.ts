import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * US-12 (Karten frei anordnen) und US-13 (Zoom und Fit to Screen) auf der
 * Prüfvorrichtung unter tests/fixture/map.html.
 *
 * Warum dort und nicht in der App: die Map braucht einen echten Browser mit
 * echten Maßen – in jsdom hat React Flow keine –, und die App selbst liegt
 * hinter dem Magic-Link-Login. Die Vorrichtung zeigt dieselbe Oberfläche mit
 * denselben Aktionen, gespeist aus docs/testdaten.json.
 *
 * Deckt ab: T-08 (Ziehen bleibt nach dem Neuladen) und T-18 (Zoomgrenzen,
 * Fit to Screen, Fit beim Laden).
 */

const VORRICHTUNG = '/tests/fixture/map.html'

async function oeffne(page: Page, frisch = true) {
  await page.goto(frisch ? `${VORRICHTUNG}?frisch` : VORRICHTUNG)
  await page.waitForSelector('.react-flow__node')
  // Fit beim Laden braucht eine Messung der Knoten
  await page.waitForFunction(
    () =>
      (document.querySelector('.react-flow__viewport') as HTMLElement)?.style
        .transform !== 'translate(0px, 0px) scale(1)',
    undefined,
    { timeout: 5000 },
  )
}

function transform(page: Page) {
  return page.evaluate(
    () =>
      (document.querySelector('.react-flow__viewport') as HTMLElement).style
        .transform,
  )
}

async function zoomProzent(page: Page) {
  const t = await transform(page)
  const treffer = t.match(/scale\(([\d.]+)\)/)
  return treffer ? Math.round(parseFloat(treffer[1]!) * 100) : null
}

/** Verschiebung eines Knotens, unabhängig vom Zoom. */
async function knotenTransform(page: Page, id: string) {
  return page.evaluate(
    (nodeId) =>
      (document.querySelector(`[data-id="${nodeId}"]`) as HTMLElement | null)
        ?.style.transform ?? null,
    id,
  )
}

test.describe('US-13 · Zoom und Fit to Screen', () => {
  test('T-18: die Map startet mit Fit to Screen', async ({ page }) => {
    await oeffne(page)
    const prozent = await zoomProzent(page)
    // Die Testdaten spannen deutlich mehr als einen Bildschirm auf, also
    // muss der Start unter 100 % liegen – und alle Karten müssen hineinpassen.
    expect(prozent).not.toBeNull()
    expect(prozent!).toBeLessThan(100)
    expect(prozent!).toBeGreaterThanOrEqual(10)

    const passt = await page.evaluate(() => {
      const flaeche = document
        .querySelector('.react-flow')!
        .getBoundingClientRect()
      return [...document.querySelectorAll('.react-flow__node')].every((k) => {
        const r = k.getBoundingClientRect()
        return (
          r.left >= flaeche.left - 1 &&
          r.right <= flaeche.right + 1 &&
          r.top >= flaeche.top - 1 &&
          r.bottom <= flaeche.bottom + 1
        )
      })
    })
    expect(passt, 'alle Karten liegen im sichtbaren Bereich').toBe(true)
  })

  test('T-18: zoomt zwischen 10 % und 200 %', async ({ page }) => {
    await oeffne(page)

    for (let i = 0; i < 20; i += 1) {
      await page.getByLabel('Herauszoomen').click()
    }
    await expect.poll(() => zoomProzent(page)).toBe(10)

    for (let i = 0; i < 30; i += 1) {
      await page.getByLabel('Hineinzoomen').click()
    }
    await expect.poll(() => zoomProzent(page)).toBe(200)
  })

  test('T-18: Fit to Screen aus dem Header holt alle Karten zurück', async ({
    page,
  }) => {
    await oeffne(page)
    const beimStart = await zoomProzent(page)

    for (let i = 0; i < 6; i += 1) {
      await page.getByLabel('Herauszoomen').click()
    }
    await expect.poll(() => zoomProzent(page)).not.toBe(beimStart)

    await page.locator('header').getByLabel('Fit to Screen').click()
    await expect.poll(() => zoomProzent(page)).toBe(beimStart)
  })

  test('T-18: Fit to Screen gibt es auch auf dem Canvas', async ({ page }) => {
    await oeffne(page)
    const beimStart = await zoomProzent(page)
    await page.getByLabel('Hineinzoomen').click()
    await expect.poll(() => zoomProzent(page)).not.toBe(beimStart)
    await page.locator('.map-zoom').getByLabel('Fit to Screen').click()
    await expect.poll(() => zoomProzent(page)).toBe(beimStart)
  })
})

test.describe('US-12 · Karten frei anordnen', () => {
  test('T-08: eine gezogene Karte bleibt liegen – auch nach dem Neuladen', async ({
    page,
  }) => {
    await oeffne(page)

    const knoten = page.locator('.react-flow__node').first()
    const id = (await knoten.getAttribute('data-id'))!
    const vorher = await knotenTransform(page, id)

    const kasten = (await knoten.boundingBox())!
    await page.mouse.move(
      kasten.x + kasten.width / 2,
      kasten.y + kasten.height / 2,
    )
    await page.mouse.down()
    // In Schritten bewegen: React Flow erkennt einen Sprung nicht als Ziehen
    for (let i = 1; i <= 5; i += 1) {
      await page.mouse.move(
        kasten.x + kasten.width / 2 + i * 24,
        kasten.y + kasten.height / 2 + i * 16,
      )
    }
    await page.mouse.up()

    await expect.poll(() => knotenTransform(page, id)).not.toBe(vorher)
    const nachZiehen = await knotenTransform(page, id)

    // Die Knoten entstehen bei jedem Rendern neu aus den Daten. Bleibt die
    // Karte liegen, wurde die Position gespeichert.
    //
    // Neu geladen wird ohne `?frisch` – sonst setzte die Vorrichtung den
    // Ausgangszustand wieder her und vergäbe neue IDs.
    await oeffne(page, false)
    await expect.poll(() => knotenTransform(page, id)).toBe(nachZiehen)
  })

  test('die gespeicherte Position ist auf ganze Pixel gerundet', async ({
    page,
  }) => {
    await oeffne(page)
    const knoten = page.locator('.react-flow__node').first()
    const id = (await knoten.getAttribute('data-id'))!
    const kasten = (await knoten.boundingBox())!

    await page.mouse.move(kasten.x + 20, kasten.y + 20)
    await page.mouse.down()
    for (let i = 1; i <= 4; i += 1) {
      await page.mouse.move(kasten.x + 20 + i * 13, kasten.y + 20 + i * 7)
    }
    await page.mouse.up()

    await expect
      .poll(async () => {
        const t = await knotenTransform(page, id)
        return /translate\(-?\d+px, -?\d+px\)/.test(t ?? '')
      })
      .toBe(true)
  })
})
