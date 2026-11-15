// FRESH:FILE  Entry point: boots React and wraps <App/> in the location, lite-mode, emergency and app-data providers.
// FRESH:AREA  Layout

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { AppProvider } from './context/AppContext'
import { LocationProvider } from './context/LocationContext'
import { EmergencyProvider } from './context/EmergencyContext'
import { LiteModeProvider } from './context/LiteModeContext'
import './index.css'

// FRESH:Layout  Mounts the provider tree and renders <App/> into #root.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LocationProvider>
        <LiteModeProvider>
          <EmergencyProvider>
            <AppProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </AppProvider>
          </EmergencyProvider>
        </LiteModeProvider>
      </LocationProvider>
    </BrowserRouter>
  </StrictMode>,
)
