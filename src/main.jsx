import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { TournamentProvider } from './context/TournamentContext'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <TournamentProvider>
          <App />
        </TournamentProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
