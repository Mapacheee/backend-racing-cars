import { useEffect, type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCanvasSettings } from '../../../../lib/contexts/useCanvasSettings'
import { useNEATTraining } from '../contexts/NEATTrainingContext'
import { TRACKS } from '../systems/TrackSystem'

export default function CanvasSettingsMenu(): JSX.Element {
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

    // Agregar contexto NEAT con manejo de errores
    let neatContext
    try {
        neatContext = useNEATTraining()
    } catch (error) {
        console.error('Failed to get NEAT context:', error)
        // Render un componente simplificado si no hay contexto
        return (
            <div className="absolute top-4 left-4 bg-white/90 rounded shadow-lg p-4 z-50 min-w-[250px]">
                <div className="text-red-600 text-sm">
                    Error: NEAT Context not available. Please refresh the page.
                </div>
            </div>
        )
    }

    const {
        generation,
        isTraining,
        bestFitness,
        carStates,
        startTraining,
        stopTraining,
        restartGeneration,
        evolveToNextGeneration
    } = neatContext

    const navigate = useNavigate()
    const track = TRACKS['main_circuit']

    const aliveCars = 5 - Array.from(carStates.values()).filter(car => car.isEliminated).length
    const totalCars = 5

    useEffect(() => {
        document.title = 'Entrenamiento de la ia - Carrera neuronal 🏎️🧠'
    }, [])

    const handleBackToMenu = () => {
        navigate('/training/menu')
    }

    return (
        <div className="absolute top-4 left-4 bg-white/90 rounded shadow-lg p-4 z-50 min-w-[250px]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 text-sm">Control Panel</h3>
                <button
                    onClick={handleBackToMenu}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                    title="volver al menu"
                >
                    volver
                </button>
            </div>

            {/* Sección NEAT Training */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold text-gray-700 text-sm mb-2">🧠 NEAT Training</h4>

                {/* Estadísticas */}
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div>Generación: <span className="font-medium">{generation}</span></div>
                    <div>Carros Vivos: <span className="font-medium">{aliveCars}/{totalCars}</span></div>
                    <div>Mejor Fitness: <span className="font-medium">{bestFitness.toFixed(2)}</span></div>
                    <div className={`${isTraining ? 'text-green-600' : 'text-red-600'}`}>
                        Estado: {isTraining ? 'Entrenando' : 'Detenido'}
                    </div>
                </div>

                {/* Controles */}
                <div className="space-y-2">
                    {!isTraining ? (
                        <button
                            onClick={startTraining}
                            className="w-auto px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                        >
                            Iniciar
                        </button>
                    ) : (
                        <button
                            onClick={stopTraining}
                            className="w-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                        >
                            Detener
                        </button>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={restartGeneration}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs transition-colors"
                            disabled={!isTraining}
                        >
                            Reiniciar
                        </button>

                        <button
                            onClick={evolveToNextGeneration}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-xs transition-colors"
                            disabled={!isTraining}
                        >
                            Evolucionar
                        </button>
                    </div>
                </div>

                {/* Barra de progreso */}
                {isTraining && (
                    <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Progreso Generación</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${((totalCars - aliveCars) / totalCars) * 100}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {totalCars - aliveCars} de {totalCars} eliminados
                        </div>
                    </div>
                )}
            </div>

            {/* Sección ajustes existente */}
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-sm mb-2">⚙️ Ajustes Visuales</h4>

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

                <div className="border-t pt-2 mt-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                        Pista: {track.name}
                    </div>
                    <div className="text-xs text-gray-500">
                        {track.waypoints.length} Puntos •{' '}
                        {Math.round(track.length)}m
                    </div>
                </div>

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
