import { useEffect, useState, type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCanvasSettings } from '../../../../lib/contexts/useCanvasSettings'
import { useNEATTraining } from '../contexts/NEATTrainingContext'
import { TRACKS, regenerateMainTrack } from '../../../../lib/racing/track'
import { getPopulationSize } from '../ai/neat/NEATConfig'
import { globalKeyboardInput } from '../ai/utils/KeyboardInput'

export default function CanvasSettingsMenu(): JSX.Element {
    const {
        showCollisions,
        setShowCollisions,
        showWaypoints,
        setShowWaypoints,
        showWalls,
        setShowWalls,
    } = useCanvasSettings()

    const neatContext = useNEATTraining()
    const navigate = useNavigate()

    // State for WASD control
    const [isWASDEnabled, setIsWASDEnabled] = useState(false)

    // Sync WASD state with keyboard input
    useEffect(() => {
        const checkKeyboardState = () => {
            setIsWASDEnabled(globalKeyboardInput.isActive())
        }

        // Check initial state
        checkKeyboardState()

        // Set up interval to check state changes
        const interval = setInterval(checkKeyboardState, 500)

        return () => clearInterval(interval)
    }, [])

    const handleWASDToggle = (enabled: boolean) => {
        console.log(`🔧 WASD Toggle called with enabled: ${enabled}`)

        if (enabled) {
            globalKeyboardInput.startListening()
            console.log('🎮 WASD control enabled for car ai-1')
            console.log('🔧 KeyboardInput state after startListening:', {
                isActive: globalKeyboardInput.isActive(),
                timestamp: new Date().toLocaleTimeString(),
            })
        } else {
            globalKeyboardInput.stopListening()
            console.log('🎮 WASD control disabled')
        }
        setIsWASDEnabled(enabled)
    }

    if (!neatContext) {
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
        evolveToNextGeneration,
    } = neatContext

    const track = TRACKS['main_circuit']

    const totalCars = getPopulationSize() // Obtener dinámicamente de la configuración NEAT
    const aliveCars =
        totalCars -
        Array.from(carStates.values()).filter(car => car.isEliminated).length

    useEffect(() => {
        document.title = 'Entrenamiento de la ia - Carrera neuronal 🏎️🧠'
    }, [])

    const handleBackToMenu = () => {
        navigate('/training/menu')
    }

    const handleGenerateNewTrack = () => {
        const seed = Math.floor(Math.random() * 1000000)

        // Use regenerateMainTrack to properly update the main circuit
        regenerateMainTrack(seed)

        console.log(`🔄 Generated new track with seed: ${seed}`)

        // No need for page reload - the track update event system will handle it
        // The useTrackUpdates hook in CarScene will detect the change and trigger re-render
    }

    return (
        <div className="absolute top-4 left-4 bg-white/90 rounded shadow-lg p-4 z-50 min-w-[250px]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 text-sm">
                    Control Panel
                </h3>
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
                <h4 className="font-semibold text-gray-700 text-sm mb-2">
                    🧠 NEAT Training
                </h4>

                {/* Estadísticas */}
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div>
                        Generación:{' '}
                        <span className="font-medium">{generation}</span>
                    </div>
                    <div>
                        Carros Vivos:{' '}
                        <span className="font-medium">
                            {aliveCars}/{totalCars}
                        </span>
                    </div>
                    <div>
                        Pista:{' '}
                        <span className="font-medium text-purple-600">
                            {Math.round(track.length)}m total
                        </span>
                    </div>
                    <div>
                        Mejor Fitness:{' '}
                        <span className="font-medium">
                            {bestFitness.toFixed(2)}
                        </span>
                    </div>

                    {/* Nueva métrica: Mejor progreso en waypoints */}
                    {Array.from(carStates.values()).length > 0 && (
                        <div>
                            Mejor Progreso:{' '}
                            <span className="font-medium text-green-600">
                                {Math.max(
                                    ...Array.from(carStates.values()).map(
                                        car =>
                                            car.metrics?.checkpointsReached || 0
                                    )
                                )}
                                /{track.waypoints.length} waypoints
                            </span>
                        </div>
                    )}

                    {/* Nueva métrica: Mejor distancia recorrida */}
                    {Array.from(carStates.values()).length > 0 && (() => {
                        const cars = Array.from(carStates.values())
                        const bestDistanceCar = cars.reduce((best, car) => {
                            const carDistance = car.metrics?.distanceTraveled || 0
                            const bestDistance = best.metrics?.distanceTraveled || 0
                            return carDistance > bestDistance ? car : best
                        })
                        const bestDistance = bestDistanceCar.metrics?.distanceTraveled || 0
                        
                        return (
                            <div>
                                Mejor Distancia:{' '}
                                <span className="font-medium text-blue-600">
                                    {bestDistance.toFixed(1)}m
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                    (Car {bestDistanceCar.id})
                                </span>
                            </div>
                        )
                    })()}

                    <div
                        className={`${isTraining ? 'text-green-600' : 'text-red-600'}`}
                    >
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
                            onClick={() => {
                                restartGeneration()
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs transition-colors"
                        >
                            Reiniciar
                        </button>

                        <button
                            onClick={evolveToNextGeneration}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-xs transition-colors"
                            title={
                                isTraining
                                    ? 'Detener entrenamiento y evolucionar'
                                    : 'Evolucionar a siguiente generación'
                            }
                        >
                            {isTraining ? 'Evolucionar' : 'Evolucionar'}
                        </button>
                    </div>
                </div>

                {/* Barra de progreso */}
                {isTraining && (
                    <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">
                            Progreso Generación
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: `${((totalCars - aliveCars) / totalCars) * 100}%`,
                                }}
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
                <h4 className="font-semibold text-gray-700 text-sm mb-2">
                    ⚙️ Ajustes Visuales
                </h4>

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

                {/* WASD Control Toggle */}
                <div className="border-t pt-2 mt-2">
                    <h5 className="font-semibold text-gray-700 text-xs mb-2">
                        🎮 Control Manual
                    </h5>
                    <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 text-sm">
                        <input
                            type="checkbox"
                            checked={isWASDEnabled}
                            onChange={e => handleWASDToggle(e.target.checked)}
                            className="accent-green-600"
                        />
                        <span className="flex-1">WASD car ai-1</span>
                        {isWASDEnabled && (
                            <span className="text-xs text-green-600 font-medium">
                                ACTIVO
                            </span>
                        )}
                    </label>
                    {isWASDEnabled && (
                        <div className="text-xs text-gray-500 mt-1 ml-5">
                            W/S: Acelerar/Frenar • A/D: Girar • ESC: Desactivar
                        </div>
                    )}
                </div>

                <div className="border-t pt-2 mt-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                        Pista: {track.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                        {track.waypoints.length} Puntos •{' '}
                        {Math.round(track.length)}m
                    </div>
                    <button
                        onClick={handleGenerateNewTrack}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-1 px-2 rounded text-xs transition-colors"
                        title="Generar una nueva pista con algoritmo procedural"
                    >
                        🔄 Generar Nueva Pista
                    </button>
                </div>
            </div>
        </div>
    )
}
