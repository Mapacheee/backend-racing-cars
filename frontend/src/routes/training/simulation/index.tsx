import type { JSX, ReactNode } from 'react'
import CanvasSettingsMenu from './components/CanvasSettingsMenu'
import SimulationCanvas from './components/SimulationCanvas'
import WaypointModal from './components/WaypointModal'
import { WaypointModalProvider } from './contexts/WaypointModalContext'
import { CarProvider } from '../../../lib/contexts/CarContext'
import { RaceResetProvider } from '../../../lib/contexts/RaceResetContext'

function SimulatorProviders({
    children,
}: {
    children: ReactNode
}): JSX.Element {
    return (
        <WaypointModalProvider>
            <RaceResetProvider>
                <CarProvider>{children}</CarProvider>
            </RaceResetProvider>
        </WaypointModalProvider>
    )
}

export default function TrainingSimulation(): JSX.Element {
    return (
        <SimulatorProviders>
            <div className="fixed inset-0 w-screen h-screen bg-cyan-200 z-50">
                <CanvasSettingsMenu />
                <SimulationCanvas />
                <WaypointModal />
            </div>
        </SimulatorProviders>
    )
}
