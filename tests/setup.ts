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

/**
 * jsdom kennt weder Pointer Capture noch ResizeObserver noch
 * scrollIntoView. Die Radix-Primitive (Popover, Dialog) verlangen sie und
 * bleiben sonst beim Öffnen hängen. Ergänzt wird nur, was fehlt.
 */
const element = window.Element.prototype as unknown as Record<string, unknown>

if (element.hasPointerCapture == null) {
  element.hasPointerCapture = () => false
}
if (element.setPointerCapture == null) {
  element.setPointerCapture = () => {}
}
if (element.releasePointerCapture == null) {
  element.releasePointerCapture = () => {}
}
if (element.scrollIntoView == null) {
  element.scrollIntoView = () => {}
}

if (!('ResizeObserver' in window)) {
  class ResizeObserverAttrappe {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(window as unknown as Record<string, unknown>).ResizeObserver =
    ResizeObserverAttrappe
}

if (!('DOMRect' in window)) {
  // Ohne Parameter-Eigenschaften: tsconfig steht auf erasableSyntaxOnly.
  class DOMRectAttrappe {
    x: number
    y: number
    width: number
    height: number

    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    }

    get top() {
      return this.y
    }
    get left() {
      return this.x
    }
    get right() {
      return this.x + this.width
    }
    get bottom() {
      return this.y + this.height
    }
  }
  ;(window as unknown as Record<string, unknown>).DOMRect = DOMRectAttrappe
}
