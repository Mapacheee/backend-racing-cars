import { createContext, useContext, useState, useCallback, useRef, type ReactNode, type JSX } from 'react'
import { Population } from '../ai/neat/Population'
import { DEFAULT_NEAT_CONFIG } from '../ai/neat/NEATConfig'
import type { FitnessMetrics } from '../types/neat'

// Estado de los carros durante el entrenamiento
interface CarState {
    id: string
    isEliminated: boolean
    fitness: number
    metrics: FitnessMetrics
    lastUpdateTime: number
}

interface NEATTrainingContextType {
    // Estados
    generation: number
    isTraining: boolean
    carStates: Map<string, CarState>
    bestFitness: number
    population: Population
    simulationActive: React.MutableRefObject<boolean>

    // Funciones
    handleFitnessUpdate: (carId: string, fitness: number, metrics: FitnessMetrics) => void
    handleCarElimination: (carId: string) => void
    areAllCarsEliminated: () => boolean
    startTraining: () => void
    stopTraining: () => void
    restartGeneration: () => void
    evolveToNextGeneration: () => void
}

const NEATTrainingContext = createContext<NEATTrainingContextType | null>(null)

export function useNEATTraining(): NEATTrainingContextType {
    const context = useContext(NEATTrainingContext)
    if (!context) {
        throw new Error('useNEATTraining must be used within a NEATTrainingProvider')
    }
    return context
}

interface NEATTrainingProviderProps {
    children: ReactNode
    onReset?: () => void
}

export function NEATTrainingProvider({ children, onReset }: NEATTrainingProviderProps): JSX.Element {
    // Estados para el entrenamiento NEAT
    const [generation, setGeneration] = useState(1)
    const [isTraining, setIsTraining] = useState(false)
    const [carStates, setCarStates] = useState<Map<string, CarState>>(new Map())
    const [population] = useState(() => new Population(DEFAULT_NEAT_CONFIG))
    const [bestFitness, setBestFitness] = useState(0)

    // Ref para controlar la simulación
    const simulationActive = useRef(true)

    // Callback para recibir actualizaciones de fitness
    const handleFitnessUpdate = useCallback((carId: string, fitness: number, metrics: FitnessMetrics) => {
        setCarStates(prev => {
            const newState = new Map(prev)
            const carState = newState.get(carId)

            if (carState) {
                // Actualizar estado del carro existente
                carState.fitness = fitness
                carState.metrics = metrics
                carState.lastUpdateTime = Date.now()
            } else {
                // Agregar nuevo carro si no existe
                newState.set(carId, {
                    id: carId,
                    isEliminated: false,
                    fitness,
                    metrics,
                    lastUpdateTime: Date.now(),
                } as CarState)
            }

            return newState
        })

        // Actualizar mejor fitness
        setBestFitness(prev => Math.max(prev, fitness))

        // Log de fitness para debug (temporal)
        console.log(`Car ${carId}: Fitness ${fitness.toFixed(2)}, Distance: ${metrics.distanceTraveled.toFixed(1)}, Checkpoints: ${metrics.checkpointsReached}`)
    }, [])

    // Función para eliminar un carro (cuando choca)
    const handleCarElimination = useCallback((carId: string) => {
        setCarStates(prev => {
            const newState = new Map(prev)
            const carState = newState.get(carId)
            if (carState) {
                carState.isEliminated = true
                console.log(`Car ${carId} eliminated! Fitness: ${carState.fitness.toFixed(2)}`)
            }
            return newState
        })
    }, [])

    // Verificar si todos los carros están eliminados
    const areAllCarsEliminated = useCallback(() => {
        if (carStates.size === 0) return false
        return Array.from(carStates.values()).every(car => car.isEliminated)
    }, [carStates])

    // Iniciar nuevo entrenamiento
    const startTraining = useCallback(() => {
        setIsTraining(true)
        simulationActive.current = true
        setCarStates(new Map())
        console.log(`Starting generation ${generation}`)
    }, [generation])

    // Parar entrenamiento
    const stopTraining = useCallback(() => {
        setIsTraining(false)
        simulationActive.current = false
        console.log('Training stopped')
    }, [])

    // Reiniciar generación actual
    const restartGeneration = useCallback(() => {
        console.log(`🔄 Restarting generation ${generation}`)
        setCarStates(new Map())
        simulationActive.current = true
        onReset?.()
        console.log(`Generation ${generation} restarted - all cars reset to starting positions`)
    }, [generation, onReset])

    // Evolucionar a siguiente generación
    const evolveToNextGeneration = useCallback(() => {
        // Obtener datos de fitness de todos los carros
        const fitnessData = Array.from(carStates.values()).map(car => ({
            genome: car.id, // Aquí necesitarás el genoma real
            fitness: car.fitness
        }))

        if (fitnessData.length === 0) {
            console.warn('No fitness data available for evolution')
            return
        }

        // Evolucionar la población
        console.log(`🧬 Evolving from generation ${generation} to ${generation + 1}`)
        console.log('Fitness data:', fitnessData.map(d => `${d.genome}: ${d.fitness.toFixed(2)}`))

        // Actualizar mejor fitness histórico
        const currentBest = Math.max(...fitnessData.map(d => d.fitness))
        setBestFitness(prev => Math.max(prev, currentBest))

        // TODO: Aquí implementar la lógica NEAT real:
        // 1. Seleccionar mejores genomas
        // 2. Aplicar mutación y crossover
        // 3. Crear nueva población

        // Avanzar generación (esto triggerará la regeneración de carros en CarScene)
        setGeneration(prev => prev + 1)
        setCarStates(new Map())
        simulationActive.current = true
        onReset?.()

        console.log(`✅ Generation ${generation + 1} started with evolved genomes!`)
        console.log(`Best fitness so far: ${Math.max(bestFitness, currentBest).toFixed(2)}`)
    }, [carStates, generation, bestFitness, onReset])

    const value: NEATTrainingContextType = {
        generation,
        isTraining,
        carStates,
        bestFitness,
        population,
        simulationActive,
        handleFitnessUpdate,
        handleCarElimination,
        areAllCarsEliminated,
        startTraining,
        stopTraining,
        restartGeneration,
        evolveToNextGeneration,
    }

    return (
        <NEATTrainingContext.Provider value={value}>
            {children}
        </NEATTrainingContext.Provider>
    )
}
