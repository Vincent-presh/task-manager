import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/common/ErrorBoundary'
import { validateEnvironment, generateCSP } from './utils/security'

// Validate environment variables on startup
const envValidation = validateEnvironment()
if (!envValidation.isValid) {
  console.error('Environment validation failed:', envValidation.errors)
  // In production, you might want to show an error page
}

// Set Content Security Policy
if (import.meta.env.PROD) {
  const csp = generateCSP()
  const meta = document.createElement('meta')
  meta.httpEquiv = 'Content-Security-Policy'
  meta.content = csp
  document.head.appendChild(meta)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
