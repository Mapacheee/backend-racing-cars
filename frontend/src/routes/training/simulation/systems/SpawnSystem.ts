import type { Track } from '../types/track'
import type { AICar } from '../types/car'
import { CAR_PHYSICS_CONFIG } from '../config/physics'

export interface SpawnConfig {
    trackId: string
    carCount: number
    colors: string[]
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
    const { position, rotation } = calculateSpawnTransform(
        { waypoints: [{ x: 0, z: 0, radius: 6 }, { x: 15, z: 0, radius: 6 }] } as Track
    )
    
    const cars: AICar[] = []
    
    for (let i = 0; i < config.carCount; i++) {
        cars.push({
            id: `ai-${i + 1}`,
            position: [
                position[0], 
                position[1] + (i * 0.1),
                position[2]
            ],
            rotation,
            color: config.colors[i % config.colors.length] || 'blue',
            trackId: config.trackId
        })
    }
    
    return cars
}
