import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Hide the splash screen after a minimum display time.
 * This ensures the splash feels intentional rather than just a flash.
 */
function hideSplash() {
  const splash = document.getElementById('splash')
  if (splash) {
    // Minimum 800ms display time for the splash to feel intentional
    setTimeout(() => {
      splash.classList.add('splash-hidden')
      // Remove from DOM after fade-out animation completes
      setTimeout(() => splash.remove(), 400)
    }, 800)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Hide splash after React has mounted
hideSplash()
