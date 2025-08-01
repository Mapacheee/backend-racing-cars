import { Canvas } from '@react-three/fiber'
import type { JSX, ReactNode } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CarScene from './CarScene'
import WaypointModal from './WaypointModal'
import { WaypointModalProvider } from './WaypointModalContext'
import { useCanvasSettings } from '../../../lib/contexts/useCanvasSettings'
import { CarProvider } from '../../../lib/contexts/CarContext'
import { RaceResetProvider } from '../../../lib/contexts/RaceResetContext'
import { TRACKS } from './TrackSystem'

function CanvasSettingsMenu(): JSX.Element {
    const {
        showCollisions,
        setShowCollisions,
        showWaypoints,
        setShowWaypoints,
        showWalls,
        setShowWalls,
        editMode,
        setEditMode,
    } = useCanvasSettings()
    const navigate = useNavigate()
    const [trainingMode, setTrainingMode] = useState(true)

    const track = TRACKS['main_circuit']

    const handleBackToMenu = () => {
        navigate('/training/menu')
    }

    return (
        <div className="absolute top-4 left-4 bg-white/90 rounded shadow-lg p-4 z-50 min-w-[200px]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 text-sm">ajustes</h3>
                <button
                    onClick={handleBackToMenu}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                    title="volver al menu"
                >
                    volver
                </button>
            </div>

            <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 text-sm">
                    <input
                        type="checkbox"
                        checked={showCollisions}
                        onChange={e => setShowCollisions(e.target.checked)}
                        className="accent-cyan-600"
                    />
                    ver colisiones
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 text-sm">
                    <input
                        type="checkbox"
                        checked={showWaypoints}
                        onChange={e => setShowWaypoints(e.target.checked)}
                        className="accent-orange-600"
                    />
                    ver waypoints
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 text-sm">
                    <input
                        type="checkbox"
                        checked={showWalls}
                        onChange={e => setShowWalls(e.target.checked)}
                        className="accent-red-600"
                    />
                    ver paredes
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 text-sm">
                    <input
                        type="checkbox"
                        checked={editMode}
                        onChange={e => setEditMode(e.target.checked)}
                        className="accent-purple-600"
                    />
                    editar waypoints
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 text-sm">
                    <input
                        type="checkbox"
                        checked={trainingMode}
                        onChange={e => setTrainingMode(e.target.checked)}
                        className="accent-green-600"
                    />
                    modo entreno ia
                </label>

                <div className="border-t pt-2 mt-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                        Pista: {track.name}
                    </div>
                    <div className="text-xs text-gray-500">
                        {track.waypoints.length} Puntos •{' '}
                        {Math.round(track.length)}m
                    </div>
                </div>

                {trainingMode && !editMode && (
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-green-50 rounded">
                        La ia se está entrenando en {track.name}
                    </div>
                )}

                {editMode && (
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-purple-50 rounded">
                        <div className="font-medium text-purple-700 mb-1">
                            Modo Edición
                        </div>
                        <div>
                            • <strong>clic suelo:</strong> agregar waypoint
                        </div>
                        <div>
                            • <strong>clic waypoint:</strong> abrir menú de
                            opciones
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

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
                <Canvas
                    camera={{ position: [0, 80, 120], fov: 30 }}
                    style={{ display: 'block', userSelect: 'none' }}
                    className="no-drag"
                >
                    <CarScene />
                </Canvas>
                <WaypointModal />
            </div>
        </SimulatorProviders>
    )
}
