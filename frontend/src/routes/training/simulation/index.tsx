import { Canvas } from '@react-three/fiber'
import type { JSX, ReactNode } from 'react'
import CarScene from './CarScene'
import { useCanvasSettings } from '../../../lib/contexts/CanvasSettings'
import { CarProvider } from '../../../lib/contexts/CarContext'

function CanvasSettingsMenu(): JSX.Element {
    const { showCollisions, setShowCollisions } = useCanvasSettings()
    return (
        <div className="absolute top-4 left-4 bg-white/90 rounded shadow-lg p-4 z-50 min-w-[180px]">
            <h3 className="font-semibold mb-2 text-gray-700 text-sm">
                Canvas Settings
            </h3>
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 text-sm">
                <input
                    type="checkbox"
                    checked={showCollisions}
                    onChange={e => setShowCollisions(e.target.checked)}
                    className="accent-cyan-600"
                />
                Show Collisions
            </label>
        </div>
    )
}

function SimulatorProviders({
    children,
}: {
    children: ReactNode
}): JSX.Element {
    return (
        <>
            <CarProvider>{children}</CarProvider>
        </>
    )
}

export default function TrainingSimulation(): JSX.Element {
    return (
        <SimulatorProviders>
            <div className="fixed inset-0 w-screen h-screen bg-cyan-200 z-50">
                <CanvasSettingsMenu />
                <Canvas
                    camera={{ position: [0, 2, 5], fov: 50 }}
                    style={{ display: 'block', userSelect: 'none' }}
                    className="no-drag"
                >
                    <CarScene />
                </Canvas>
            </div>
        </SimulatorProviders>
    )
}
