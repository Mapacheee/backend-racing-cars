import type { NEATConfig } from '../../types/neat'

export const DEFAULT_NEAT_CONFIG: NEATConfig = {
    populationSize: 100,
    inputNodes: 5,    // 5 sensores del carro
    outputNodes: 2,   // throttle y steering
    
    mutationRates: {
        addNode: 0.03,
        addConnection: 0.05,
        weightMutation: 0.8,
        disableConnection: 0.1,
        weightPerturbation: 0.9
    },
    
    speciation: {
        compatibilityThreshold: 3.0,
        c1: 1.0,  // Excess genes
        c2: 1.0,  // Disjoint genes
        c3: 0.4   // Weight differences
    },
    
    survival: {
        survivalRate: 0.2,  // 20% sobrevive
        eliteSize: 2        // Los 2 mejores siempre sobreviven
    }
}

// Configuración de fitness
export const FITNESS_CONFIG = {
    // Pesos para diferentes métricas
    weights: {
        distance: 1.0,
        speed: 0.5,
        time: 0.3,
        checkpoints: 2.0,
        collisionPenalty: -0.5,
        backwardPenalty: -0.2
    },
    
    // Valores máximos para normalización
    maxValues: {
        distance: 1000,
        speed: 10,
        time: 60,
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
