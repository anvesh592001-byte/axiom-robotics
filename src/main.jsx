import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// React 18 StrictMode is intentionally omitted: the scene owns a WebGL context
// and a GLTF instance that must not be double-mounted in development.
const container = document.getElementById('root')
createRoot(container).render(<App />)

// Surface anything that would otherwise fail silently in the preview.
window.addEventListener('error', (e) => {
  console.error('[axiom] uncaught', e.error || e.message)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[axiom] unhandled rejection', e.reason)
})
