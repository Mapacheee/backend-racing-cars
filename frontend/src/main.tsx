import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PlayerProvider } from './lib/contexts/PlayerContext.tsx'
import { CanvasSettingsProvider } from './lib/contexts/CanvasSettings.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CanvasSettingsProvider>
            <PlayerProvider>
                <App />
            </PlayerProvider>
        </CanvasSettingsProvider>
    </StrictMode>
)
