import type { NEATConfig } from '../../types/neat'

export const DEFAULT_NEAT_CONFIG: NEATConfig = {
    populationSize: 5,        // 5 carros
    inputNodes: 5,            // 5 sensores del carro
    outputNodes: 2,           // throttle y steering
    
    mutationRates: {
        addNode: 0.05,            // Aumentado para más diversidad
        addConnection: 0.08,      // Aumentado para más conexiones
        weightMutation: 0.9,      // Alto para cambios constantes
        disableConnection: 0.15,  // Aumentado para poda
        weightPerturbation: 0.85  // Alto para variación
    },
    
    speciation: {
        compatibilityThreshold: 2.5,  // Reducido para más especies
        c1: 1.0,  // Excess genes
        c2: 1.0,  // Disjoint genes
        c3: 0.4   // Weight differences
    },
    
    survival: {
        survivalRate: 0.4,  // 40% sobrevive (2 de 5)
        eliteSize: 1        // El mejor siempre sobrevive
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
        distance: 500,           // Reducido para pistas más pequeñas
        speed: 15,               // Aumentado para arcade
        time: 30,                // Reducido: queremos que sean rápidos
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
