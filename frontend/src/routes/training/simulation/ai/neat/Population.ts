import type { Genome, Species, NEATConfig } from '../../types/neat'
import { GenomeBuilder, GenomeUtils } from './Genome'
import { Mutations } from './Mutations'
import { DEFAULT_NEAT_CONFIG } from './NEATConfig'

export class Population {
    private genomes: Genome[] = []
    private species: Species[] = []
    private generation: number = 0
    private config: NEATConfig
    
    constructor(config: NEATConfig = DEFAULT_NEAT_CONFIG) {
        this.config = config
        this.initializePopulation()
    }
    
    private initializePopulation(): void {
        this.genomes = []
        
        for (let i = 0; i < this.config.populationSize; i++) {
            const genome = GenomeBuilder.createMinimal(this.config)
            this.genomes.push(genome)
        }
    }
    
    // Obtener todos los genomas de la población actual
    getGenomes(): Genome[] {
        return [...this.genomes]
    }
    
    // Avanzar a la próxima generación
    evolve(): void {
        // 1. Especiación
        this.speciate()
        
        // 2. Calcular fitness ajustado
        this.calculateAdjustedFitness()
        
        // 3. Crear nueva generación
        this.createNextGeneration()
        
        this.generation++
    }
    
    private speciate(): void {
        this.species = []
        
        this.genomes.forEach(genome => {
            let placed = false
            
            // Intentar colocar en una especie existente
            for (const species of this.species) {
                const compatibility = GenomeUtils.calculateCompatibility(
                    genome, 
                    species.representative, 
                    this.config
                )
                
                if (compatibility < this.config.speciation.compatibilityThreshold) {
                    species.members.push(genome)
                    genome.species = species.id
                    placed = true
                    break
                }
            }
            
            // Si no encaja en ninguna especie, crear nueva
            if (!placed) {
                const newSpecies: Species = {
                    id: this.species.length,
                    representative: genome,
                    members: [genome],
                    averageFitness: 0,
                    staleness: 0,
                    bestFitness: genome.fitness
                }
                
                this.species.push(newSpecies)
                genome.species = newSpecies.id
            }
        })
        
        // Calcular estadísticas de especies
        this.species.forEach(species => {
            const totalFitness = species.members.reduce((sum, genome) => sum + genome.fitness, 0)
            species.averageFitness = totalFitness / species.members.length
            species.bestFitness = Math.max(...species.members.map(g => g.fitness))
        })
    }
    
    private calculateAdjustedFitness(): void {
        this.species.forEach(species => {
            species.members.forEach(genome => {
                // Fitness ajustado = fitness / tamaño de la especie
                genome.adjustedFitness = genome.fitness / species.members.length
            })
        })
    }
    
    private createNextGeneration(): void {
        const newGenomes: Genome[] = []
        
        // Calcular total de fitness ajustado
        const totalAdjustedFitness = this.genomes.reduce(
            (sum, genome) => sum + genome.adjustedFitness, 0
        )
        
        // Élite: mantener los mejores genomas
        const elite = this.getBestGenomes(this.config.survival.eliteSize)
        elite.forEach(genome => {
            newGenomes.push(GenomeBuilder.copy(genome))
        })
        
        // Llenar el resto de la población
        while (newGenomes.length < this.config.populationSize) {
            // Selección por torneo o proporcional al fitness
            const parent1 = this.selectParent(totalAdjustedFitness)
            
            let offspring: Genome
            
            if (Math.random() < 0.25) {
                // 25% crossover
                const parent2 = this.selectParent(totalAdjustedFitness)
                offspring = GenomeBuilder.crossover(parent1, parent2)
            } else {
                // 75% asexual reproduction
                offspring = GenomeBuilder.copy(parent1)
            }
            
            // Mutación
            Mutations.mutate(offspring, this.config)
            
            newGenomes.push(offspring)
        }
        
        this.genomes = newGenomes
    }
    
    private selectParent(totalFitness: number): Genome {
        // Selección por ruleta
        let randomValue = Math.random() * totalFitness
        
        for (const genome of this.genomes) {
            randomValue -= genome.adjustedFitness
            if (randomValue <= 0) {
                return genome
            }
        }
        
        // Fallback: devolver genoma aleatorio
        return this.genomes[Math.floor(Math.random() * this.genomes.length)]
    }
    
    private getBestGenomes(count: number): Genome[] {
        return [...this.genomes]
            .sort((a, b) => b.fitness - a.fitness)
            .slice(0, count)
    }
    
    // Obtener estadísticas de la población
    getStats() {
        const fitnesses = this.genomes.map(g => g.fitness)
        const bestFitness = Math.max(...fitnesses)
        const averageFitness = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length
        
        return {
            generation: this.generation,
            populationSize: this.genomes.length,
            speciesCount: this.species.length,
            bestFitness,
            averageFitness,
            bestGenome: this.genomes.find(g => g.fitness === bestFitness)
        }
    }
}
