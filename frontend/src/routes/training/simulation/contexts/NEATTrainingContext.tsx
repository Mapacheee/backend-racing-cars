import { createContext, useContext, useState, useCallback, useRef, type ReactNode, type JSX } from 'react'
import { Population } from '../ai/neat/Population'
import { DEFAULT_NEAT_CONFIG } from '../ai/neat/NEATConfig'
import { useRaceReset } from '../../../../lib/contexts/RaceResetContext'
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
        console.error('useNEATTraining: Context is null. Make sure the component is wrapped in NEATTrainingProvider')
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
    const [generation, setGeneration] = useState(1)  // Empezar en 1 para mostrar al usuario
    const [isTraining, setIsTraining] = useState(true)  // ✅ Iniciar automáticamente
    const [carStates, setCarStates] = useState<Map<string, CarState>>(new Map())
    const [population] = useState(() => new Population(DEFAULT_NEAT_CONFIG))
    const [bestFitness, setBestFitness] = useState(0)

    // Hook para manejar reset de la escena
    const { triggerReset } = useRaceReset()

    // Ref para controlar la simulación
    const simulationActive = useRef(true)  // ✅ Iniciar automáticamente

    // Callback para recibir actualizaciones de fitness
    const handleFitnessUpdate = useCallback((carId: string, fitness: number, metrics: FitnessMetrics) => {
        console.log(`📊 Fitness update for ${carId}: ${fitness.toFixed(2)}`)  // ✅ Debug fitness updates
        
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
        console.log(`🚀 Training started for generation ${generation}`)
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
        setIsTraining(false)  
        setBestFitness(0)  
        simulationActive.current = false
        
        triggerReset()
        setTimeout(() => {
            simulationActive.current = true
            console.log(`Generation ${generation} restarted - all cars reset to starting positions`)
            if (onReset) {
                onReset()
            }
        }, 100)
    }, [generation, onReset, triggerReset])

    // Evolucionar a siguiente generación
    const evolveToNextGeneration = useCallback(() => {
        console.log('🔥 EVOLVE BUTTON CLICKED! Current generation:', generation)
        console.log('🔥 Training state:', isTraining)
        console.log('🔥 Car states count:', carStates.size)
        
        // EVOLUCIONAR DIRECTAMENTE sin detener el entrenamiento
        console.log('🧬 Starting evolution with current fitness data...')
        performEvolution()
        
    }, [isTraining, carStates.size, generation])  // Dependencias para debugging
    
    // Función separada para realizar la evolución
    const performEvolution = useCallback(() => {
        console.log('🧬 PERFORM EVOLUTION STARTED!')
        console.log('🧬 Current generation before evolution:', generation)
        
        // Obtener datos de fitness de todos los carros
        const carStatesArray = Array.from(carStates.values())
        
        if (carStatesArray.length === 0) {
            console.warn('⚠️ No fitness data available for evolution')
            return
        }

        console.log(`🧬 Starting evolution with ${carStatesArray.length} cars evaluated`)

        // Actualizar fitness en los genomas de la población
        carStatesArray.forEach(carState => {
            // Encontrar el genoma correspondiente en la población
            const genomes = population.getGenomes()
            const genomeIndex = parseInt(carState.id.split('-')[1]) - 1 // ai-1 -> index 0, ai-2 -> index 1, etc.
            
            if (genomeIndex >= 0 && genomeIndex < genomes.length) {
                genomes[genomeIndex].fitness = carState.fitness
                console.log(`🧬 Updated genome ${genomeIndex} fitness: ${carState.fitness.toFixed(2)}`)
            }
        })

        // Obtener estadísticas antes de evolucionar
        const statsBefore = population.getStats()
        console.log(`📊 Generation ${statsBefore.generation} Stats:`, {
            best: statsBefore.bestFitness.toFixed(2),
            average: statsBefore.averageFitness.toFixed(2),
            species: statsBefore.speciesCount,
            evaluated: carStatesArray.length
        })

        // ¡EVOLUCIONAR LA POBLACIÓN!
        population.evolve()
        
        // Obtener estadísticas después de evolucionar
        const statsAfter = population.getStats()
        console.log(`🎉 Evolution complete! Generation ${statsAfter.generation}:`, {
            best: statsAfter.bestFitness.toFixed(2),
            average: statsAfter.averageFitness.toFixed(2),
            species: statsAfter.speciesCount
        })

        // Actualizar mejor fitness histórico
        const currentBest = statsBefore.bestFitness
        setBestFitness(prev => Math.max(prev, currentBest))

        // Sincronizar generación con la Population + 1 para UI (Population empieza en 0)
        const populationGen = population.getGeneration()
        const newGeneration = populationGen + 1
        console.log(`🔄 Population generation: ${populationGen}`)
        console.log(`🔄 Setting UI generation from ${generation} to ${newGeneration}`)
        console.log(`🔄 Before setGeneration call`)
        setGeneration(newGeneration)
        console.log(`🔄 After setGeneration call`)
        
        // Reiniciar estado para nueva generación
        setCarStates(new Map())
        setIsTraining(true)  // ✅ Reiniciar entrenamiento para nueva generación
        simulationActive.current = true
        onReset?.()

        console.log(`✅ Generation ${newGeneration} started with evolved genomes!`)
        console.log(`🚀 Training restarted for generation ${newGeneration}`)
        console.log(`🏆 Best fitness so far: ${Math.max(bestFitness, currentBest).toFixed(2)}`)
    }, [carStates, bestFitness, onReset, population])  // Removido 'generation' de las dependencias

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
