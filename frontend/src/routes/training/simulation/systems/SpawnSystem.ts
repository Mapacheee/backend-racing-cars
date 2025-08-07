import type { Track } from '../../../../lib/racing/track'
import type { AICar } from '../types/car'
import { GenomeBuilder, DEFAULT_NEAT_CONFIG } from '../ai'
import { TRACKS } from '../../../../lib/racing/track'

export interface SpawnConfig {
    trackId: string
    carCount: number
    colors: string[]
    useNEAT?: boolean
}

export function calculateSpawnTransform(track: Track): {
    position: [number, number, number]
    rotation: number
} {
    const firstWaypoint = track.waypoints[0]
    const secondWaypoint = track.waypoints[1]

    const position: [number, number, number] = [
        firstWaypoint.x + 0.5,
        0,
        firstWaypoint.z - 1,
    ]

    // Calcular rotación hacia el segundo waypoint para que miren en la dirección correcta
    const dx = secondWaypoint.x - firstWaypoint.x
    const dz = secondWaypoint.z - firstWaypoint.z
    const rotation = Math.atan2(dx, dz)

    return { position, rotation }
}

export function generateAICars(config: {
    trackId: string
    carCount: number
    colors: string[]
    useNEAT: boolean
    generation: number
    genomes?: any[] // Genomas evolucionados opcionales
}): AICar[] {
    // Use the actual track from config instead of hardcoded values
    const track = TRACKS[config.trackId] || TRACKS['main_circuit']
    const { position, rotation } = calculateSpawnTransform(track)

    const cars: AICar[] = []

    for (let i = 0; i < config.carCount; i++) {
        // Todos los carros aparecen en la misma posición (son fantasmas entre sí)
        const car: AICar = {
            id: `ai-${i + 1}`,
            position: [
                position[0],  // Posición X exacta del spawn point
                position[1],  // Misma altura
                position[2],  // Posición Z exacta del spawn point
            ],
            rotation,
            color: config.colors[i % config.colors.length] || 'blue',
            trackId: config.trackId,
        }

        // Usar genoma evolucionado si está disponible, sino crear uno nuevo
        if (config.useNEAT) {
            if (config.genomes && config.genomes[i]) {
                car.genome = config.genomes[i]
                console.log(`🧬 Car ${car.id} using evolved genome from generation ${config.generation}`)
            } else {
                car.genome = GenomeBuilder.createMinimal(DEFAULT_NEAT_CONFIG)
                console.log(`🆕 Car ${car.id} using new random genome`)
            }
        }

        cars.push(car)
    }

    return cars
}
