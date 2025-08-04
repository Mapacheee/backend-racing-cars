import type { Track } from '../types/track'
import type { AICar } from '../types/car'
import { CAR_PHYSICS_CONFIG } from '../config/physics'
import { GenomeBuilder, DEFAULT_NEAT_CONFIG } from '../ai'
import { TRACKS } from './TrackSystem'

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
        firstWaypoint.x, 
        CAR_PHYSICS_CONFIG.spawnHeight, 
        firstWaypoint.z
    ]
    
    const dx = secondWaypoint.x - firstWaypoint.x
    const dz = secondWaypoint.z - firstWaypoint.z
    const rotation = Math.atan2(dx, dz)
    
    return { position, rotation }
}

export function generateAICars(config: SpawnConfig): AICar[] {
    // Use the actual track from config instead of hardcoded values
    const track = TRACKS[config.trackId] || TRACKS['main_circuit']
    const { position, rotation } = calculateSpawnTransform(track)
    
    const cars: AICar[] = []
    
    for (let i = 0; i < config.carCount; i++) {
        // Spawn all cars at the exact same waypoint position
        const car: AICar = {
            id: `ai-${i + 1}`,
            position: [
                position[0],            // Same X position (same waypoint)
                position[1],            // Same height (waypoint level)
                position[2]             // Same Z position (same waypoint)
            ],
            rotation,
            color: config.colors[i % config.colors.length] || 'blue',
            trackId: config.trackId
        }
        
        // Generar genoma NEAT si está habilitado
        if (config.useNEAT) {
            car.genome = GenomeBuilder.createMinimal(DEFAULT_NEAT_CONFIG)
        }
        
        cars.push(car)
    }
    
    return cars
}
