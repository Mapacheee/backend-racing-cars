// NEAT Core Classes
export { Network } from './neat/Network'
export { GenomeBuilder, GenomeUtils } from './neat/Genome'
export { Mutations } from './neat/Mutations'
export { Population } from './neat/Population'
export { DEFAULT_NEAT_CONFIG, FITNESS_CONFIG, InnovationCounter } from './neat/NEATConfig'

// Fitness Evaluation
export { FitnessEvaluator } from './fitness/FitnessEvaluator'
export { CarFitnessTracker } from './fitness/CarFitnessTracker'

// Car Control
export { NEATCarController } from './NEATCarController'

// Types
export type {
    NEATConfig,
    Genome,
    NodeGene,
    Gene,
    Species,
    NetworkOutput,
    FitnessMetrics
} from '../types/neat'
