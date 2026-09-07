import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * US-01, Fehlerfall E-04: „Gegeben ich gebe eine nicht freigegebene E-Mail
 * ein, dann sehe ich E-04 und es wird keine Mail gesendet.“
 *
 * Der zweite Teil ist der wichtige: sendeMagicLink darf Supabase in diesem
 * Fall gar nicht erst aufrufen. Genau das prüft der Spion.
 */

const signInWithOtp = vi.fn(async () => ({ data: {}, error: null }))

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { signInWithOtp } },
}))

vi.mock('@/lib/env', () => ({
  env: {
    supabaseUrl: 'https://beispiel.supabase.co',
    supabasePublishableKey: 'sb_publishable_test',
    appUrl: 'http://localhost:5173',
    allowedEmail: 'connynaumann@gmail.com',
  },
}))

const {
  istEmailForm,
  istFreigegebeneEmail,
  leseAnmeldeFehler,
  sendeMagicLink,
} = await import('@/lib/auth')

beforeEach(() => {
  signInWithOtp.mockClear()
})

describe('istEmailForm', () => {
  it.each([
    ['conny@example.com', true],
    ['conny@example', false],
    ['conny example.com', false],
    ['@example.com', false],
    ['', false],
  ])('%s → %s', (eingabe, erwartet) => {
    expect(istEmailForm(eingabe)).toBe(erwartet)
  })
})

describe('istFreigegebeneEmail', () => {
  it('erkennt die freigegebene Adresse', () => {
    expect(istFreigegebeneEmail('connynaumann@gmail.com')).toBe(true)
  })

  it('ignoriert Groß- und Kleinschreibung und Leerzeichen', () => {
    expect(istFreigegebeneEmail('  ConnyNaumann@Gmail.com ')).toBe(true)
  })

  it('lehnt jede andere Adresse ab', () => {
    expect(istFreigegebeneEmail('jemand@example.com')).toBe(false)
    expect(istFreigegebeneEmail('connynaumann@gmail.co')).toBe(false)
    expect(istFreigegebeneEmail('')).toBe(false)
  })
})

describe('sendeMagicLink', () => {
  it('sendet für die freigegebene Adresse', async () => {
    const ergebnis = await sendeMagicLink('connynaumann@gmail.com')
    expect(ergebnis).toEqual({ ok: true })
    expect(signInWithOtp).toHaveBeenCalledTimes(1)
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'connynaumann@gmail.com',
      options: {
        emailRedirectTo: 'http://localhost:5173',
        shouldCreateUser: true,
      },
    })
  })

  it('E-04: sendet für eine fremde Adresse keine Mail', async () => {
    const ergebnis = await sendeMagicLink('jemand@example.com')
    expect(ergebnis).toEqual({ ok: false, grund: 'nicht-freigegeben' })
    expect(signInWithOtp).not.toHaveBeenCalled()
  })

  it('meldet einen Fehler des Versands', async () => {
    signInWithOtp.mockResolvedValueOnce({
      data: {},
      error: { message: 'kaputt' },
    } as never)
    const ergebnis = await sendeMagicLink('connynaumann@gmail.com')
    expect(ergebnis).toEqual({ ok: false, grund: 'versand-fehlgeschlagen' })
  })
})

describe('leseAnmeldeFehler – Query und Hash', () => {
  it('erkennt einen abgelaufenen Link als Query-Parameter', () => {
    expect(
      leseAnmeldeFehler(
        'http://localhost:5173/?error=access_denied&error_code=otp_expired',
      ),
    ).toBe('abgelaufen')
  })

  it('erkennt einen abgelaufenen Link als Hash-Parameter', () => {
    expect(
      leseAnmeldeFehler(
        'http://localhost:5173/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
      ),
    ).toBe('abgelaufen')
  })

  it('erkennt die Sperre der Datenbank als E-04', () => {
    expect(
      leseAnmeldeFehler(
        'http://localhost:5173/?error=server_error&error_description=E-Mail-Adresse%20ist%20nicht%20freigegeben',
      ),
    ).toBe('nicht-freigegeben')
  })

  it('gibt null zurück, wenn kein Fehler in der Adresse steht', () => {
    expect(leseAnmeldeFehler('http://localhost:5173/')).toBeNull()
    expect(leseAnmeldeFehler('http://localhost:5173/?code=abc')).toBeNull()
  })

  it('fällt bei unbekannten Fehlern auf „allgemein“ zurück', () => {
    expect(
      leseAnmeldeFehler('http://localhost:5173/?error=irgendwas_neues'),
    ).toBe('allgemein')
  })
})
