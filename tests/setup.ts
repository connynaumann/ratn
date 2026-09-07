import '@testing-library/jest-dom/vitest'
import { beforeAll } from 'vitest'

/**
 * jsdom setzt data-theme nicht selbst – index.html tut das im Browser.
 * Ohne das Attribut greifen die Tokens nicht, und Komponententests würden
 * gegen ungesetzte Variablen prüfen.
 */
beforeAll(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
})
