import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const VERSION_KEY = 'nccia_app_v'

async function checkForAppUpdate() {
  try {
    const res = await fetch(`/react/version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    const next = String(data?.v || '')
    if (!next) return

    const prev = localStorage.getItem(VERSION_KEY)
    if (prev && prev !== next) {
      localStorage.setItem(VERSION_KEY, next)
      // Soft reload — picks up new hashed JS/CSS without Ctrl+F5
      window.location.reload()
      return
    }
    if (!prev) localStorage.setItem(VERSION_KEY, next)
  } catch {
    // ignore offline / missing version file
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkForAppUpdate()
})
window.addEventListener('focus', checkForAppUpdate)
// First check shortly after boot, then periodically while tab is open
setTimeout(checkForAppUpdate, 2500)
setInterval(checkForAppUpdate, 60_000)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
