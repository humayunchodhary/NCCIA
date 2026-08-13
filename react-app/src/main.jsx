import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const VERSION_KEY = 'nccia_app_v'
const PENDING_UPDATE_KEY = 'nccia_pending_update'

function isWorkingOnForm() {
  const path = window.location.pathname || ''
  if (/\/(create|edit)(\/|$)/.test(path)) return true
  if (path.includes('import-pdf') || path.includes('/adp')) return true
  if (path.includes('/forensic/requests/')) return true
  const active = document.activeElement
  if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return true
  return false
}

async function checkForAppUpdate() {
  try {
    const res = await fetch(`/react/version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    const next = String(data?.v || '')
    if (!next) return

    const prev = localStorage.getItem(VERSION_KEY)
    if (prev && prev !== next) {
      // Never hard-reload while typing/editing — show banner instead
      if (isWorkingOnForm()) {
        sessionStorage.setItem(PENDING_UPDATE_KEY, next)
        window.dispatchEvent(new CustomEvent('nccia:app-update', { detail: { v: next } }))
        return
      }
      localStorage.setItem(VERSION_KEY, next)
      sessionStorage.removeItem(PENDING_UPDATE_KEY)
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
setTimeout(checkForAppUpdate, 2500)
setInterval(checkForAppUpdate, 60_000)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
