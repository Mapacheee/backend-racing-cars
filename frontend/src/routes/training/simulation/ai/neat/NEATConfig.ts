import type { NEATConfig } from '../../types/neat'

export const DEFAULT_NEAT_CONFIG: NEATConfig = {
    populationSize: 20,       // numero de autillos
    inputNodes: 5,           
    outputNodes: 2,        
    
    mutationRates: {
        addNode: 0.02,           // Reducido: cambios estructurales más graduales 
        addConnection: 0.05,     // Reducido: nuevas conexiones más graduales
        weightMutation: 0.6,     // Reducido: menos mutación de pesos (era 0.9)
        disableConnection: 0.08, // Reducido: menos desactivación de conexiones
        weightPerturbation: 0.4  // Reducido significativamente: cambios más sutiles (era 0.85)
    },
    
    speciation: {
        compatibilityThreshold: 2.5,  
        c1: 1.0,  // Excess genes
        c2: 1.0,  // Disjoint genes
        c3: 0.4   // Weight differences
    },
    
    survival: {
        survivalRate: 0.3,  // Reducido: solo 30% sobrevive (6 de 20) para más diversidad
        eliteSize: 2        // Aumentado: conservar 2 mejores para estabilidad
    }
}

// Configuración de fitness optimizada para pistas rápidas
export const FITNESS_CONFIG = {
    // Pesos para diferentes métricas - enfocados en velocidad y completar pista
    weights: {
        distance: 2.0,           // Aumentado: recompensar distancia
        speed: 1.5,              // Aumentado: recompensar velocidad
        time: 0.8,               // Recompensar supervivencia
        checkpoints: 5.0,        // MUY ALTO: completar la pista es crucial
        collisionPenalty: -2.0,  // Penalización fuerte por chocar
        backwardPenalty: -1.0    // Penalizar ir hacia atrás
    },
    
    // Valores máximos para normalización
    maxValues: {
        distance: 500,          
        speed: 15,              
        time: 30,              
        checkpoints: 10
    }
}

// ID counter para innovation numbers
export class InnovationCounter {
    private static instance: InnovationCounter
    private counter: number = 0
    
    static getInstance(): InnovationCounter {
        if (!InnovationCounter.instance) {
            InnovationCounter.instance = new InnovationCounter()
        }
        return InnovationCounter.instance
    }
    
    getNext(): number {
        return this.counter++
    }
    
    reset(): void {
        this.counter = 0
    }
}

export function getPopulationSize(): number {
    return DEFAULT_NEAT_CONFIG.populationSize
}

// Función para obtener tasas de mutación adaptativas basadas en la generación
export function getAdaptiveMutationRates(generation: number): typeof DEFAULT_NEAT_CONFIG.mutationRates {
    const baseRates = DEFAULT_NEAT_CONFIG.mutationRates
    
    // Factor de escalamiento basado en generación (1.0 a 1.5 en 20 generaciones)
    const scaleFactor = Math.min(1 + (generation * 0.025), 1.5)
    
    return {
        addNode: Math.min(baseRates.addNode * scaleFactor, 0.1),
        addConnection: Math.min(baseRates.addConnection * scaleFactor, 0.15),
        weightMutation: Math.min(baseRates.weightMutation * scaleFactor, 0.8),
        disableConnection: Math.min(baseRates.disableConnection * scaleFactor, 0.2),
        weightPerturbation: Math.min(baseRates.weightPerturbation * scaleFactor, 0.6)
    }
}
