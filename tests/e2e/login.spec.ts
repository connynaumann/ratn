import { expect, test } from '@playwright/test'

/**
 * Abnahmetest T-02 (US-01): „S-01 → andere E-Mail → E-04, keine Mail.“
 *
 * T-01 (freigegebene Adresse, Link im Postfach öffnen) lässt sich nicht
 * automatisieren und bleibt ein manueller Test – siehe README, Abschnitt
 * „Manuelle Abnahme“.
 */

const E04 = 'Diese E-Mail-Adresse ist nicht freigegeben.'

test.describe('S-01 Anmeldung', () => {
  test('zeigt die Anmeldeseite als Einstieg', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole('heading', { name: 'System Map' }),
    ).toBeVisible()
    await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Link senden' })).toBeDisabled()
  })

  test('T-02 · fremde Adresse zeigt E-04 und sendet keine Mail', async ({
    page,
  }) => {
    const anfragen: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('/auth/v1/otp')) anfragen.push(r.url())
    })

    await page.goto('/login')
    await page.getByLabel('E-Mail-Adresse').fill('jemand@example.com')
    await page.getByRole('button', { name: 'Link senden' }).click()

    await expect(page.getByRole('alert')).toHaveText(E04)
    expect(anfragen).toHaveLength(0)
  })

  test('die Dev-Routen sind ohne Anmeldung nicht erreichbar', async ({
    page,
  }) => {
    await page.goto('/dev/components')
    await expect(page).toHaveURL(/\/login$/)
    await page.goto('/dev/seed')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('E-05 nach einem abgelaufenen Link', async ({ page }) => {
    await page.goto('/?error=access_denied&error_code=otp_expired')
    await expect(page.getByRole('alert')).toHaveText(
      'Der Link ist abgelaufen. Fordere einen neuen an.',
    )
  })
})
