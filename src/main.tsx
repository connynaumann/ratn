import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Inter Variable liegt im Build; kein Aufruf einer Schrift-CDN zur Laufzeit
// (Brief A-16).
import '@fontsource-variable/inter'

// React Flow bringt eigene Grundstile mit; sie stehen vor map.css, damit
// unsere Tokens gewinnen.
import '@xyflow/react/dist/style.css'

import './styles/tokens.css'
import './styles/theme.css'
import './styles/base.css'
import './styles/components.css'
import './styles/map.css'

import { App } from './App'

const wurzel = document.getElementById('root')
if (wurzel == null) throw new Error('Element #root fehlt in index.html')

createRoot(wurzel).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
