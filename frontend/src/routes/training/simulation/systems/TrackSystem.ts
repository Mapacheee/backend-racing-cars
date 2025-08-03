import type { Waypoint, Track, TrackPiece, Wall } from '../types/track'
import { ROAD_GEOMETRY, TRACK_GENERATION } from '../config/constants'

export type { Waypoint, Track, TrackPiece, Wall } from '../types/track'

const MAIN_TRACK: Track = {
    id: 'main_circuit',
    name: 'circuito 1',
    waypoints: [
        { x: 0, z: 0, radius: 6 }, 
        { x: 15, z: 0, radius: 6 },  
        { x: 25, z: 10, radius: 4 }, 
        { x: 25, z: 20, radius: 4 }, 
        { x: 15, z: 30, radius: 6 },
        { x: 0, z: 30, radius: 6 }, 
        { x: -15, z: 30, radius: 6 }, 
        { x: -25, z: 20, radius: 4 },
        { x: -25, z: 10, radius: 4 },
        { x: -15, z: 0, radius: 6 }, 
    ],
    pieces: [],
    walls: [],
    length: 200
}

MAIN_TRACK.pieces = generateRoad(MAIN_TRACK.waypoints)
MAIN_TRACK.walls = generateTrackWalls(MAIN_TRACK.waypoints)

export const TRACKS: Record<string, Track> = {
    main_circuit: MAIN_TRACK
}

function catmullRom(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const t2 = t * t
    const t3 = t2 * t
    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    )
}

function catmullRomDerivative(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const t2 = t * t
    return 0.5 * (
        (-p0 + p2) +
        2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) * t +
        3 * (-p0 + 3 * p1 - 3 * p2 + p3) * t2
    )
}

export function generateRoad(waypoints: Waypoint[]): TrackPiece[] {
    if (waypoints.length < TRACK_GENERATION.minimumWaypoints) return []
    
    const pieces: TrackPiece[] = []
    const { segmentsPerSection } = TRACK_GENERATION
    
    for (let i = 0; i < waypoints.length; i++) {
        const p0 = waypoints[(i - 1 + waypoints.length) % waypoints.length]
        const p1 = waypoints[i]
        const p2 = waypoints[(i + 1) % waypoints.length]
        const p3 = waypoints[(i + 2) % waypoints.length]
        
        for (let j = 0; j < segmentsPerSection; j++) {
            const t = j / segmentsPerSection
            
            const x = catmullRom(t, p0.x, p1.x, p2.x, p3.x)
            const z = catmullRom(t, p0.z, p1.z, p2.z, p3.z)
            const dx = catmullRomDerivative(t, p0.x, p1.x, p2.x, p3.x)
            const dz = catmullRomDerivative(t, p0.z, p1.z, p2.z, p3.z)
            const rotation = Math.atan2(dx, dz)
            
            pieces.push({
                model: 'road_segment',
                position: [x, -ROAD_GEOMETRY.height / 2, z],
                rotation: [0, rotation, 0]
            })
        }
    }
    
    return pieces
}

export function generateTrackWalls(waypoints: Waypoint[]): Wall[] {
    const walls: Wall[] = []
    const { segmentsPerSection, wallLength } = TRACK_GENERATION
    const roadHalfWidth = ROAD_GEOMETRY.width / 2
    
    for (let i = 0; i < waypoints.length; i++) {
        const p0 = waypoints[(i - 1 + waypoints.length) % waypoints.length]
        const p1 = waypoints[i]
        const p2 = waypoints[(i + 1) % waypoints.length]
        const p3 = waypoints[(i + 2) % waypoints.length]
        
        for (let j = 0; j < segmentsPerSection; j++) {
            if (j % 2 !== 0) continue
            
            const t = j / segmentsPerSection
            const x = catmullRom(t, p0.x, p1.x, p2.x, p3.x)
            const z = catmullRom(t, p0.z, p1.z, p2.z, p3.z)
            const dx = catmullRomDerivative(t, p0.x, p1.x, p2.x, p3.x)
            const dz = catmullRomDerivative(t, p0.z, p1.z, p2.z, p3.z)
            
            const dirLength = Math.sqrt(dx * dx + dz * dz)
            if (dirLength === 0) continue
            
            const normalizedDx = dx / dirLength
            const normalizedDz = dz / dirLength
            const perpX = -normalizedDz
            const perpZ = normalizedDx
            
            const trackHalfWidth = roadHalfWidth
            
            walls.push({
                start: { 
                    x: x + perpX * trackHalfWidth - normalizedDx * wallLength * 0.5, 
                    z: z + perpZ * trackHalfWidth - normalizedDz * wallLength * 0.5 
                },
                end: { 
                    x: x + perpX * trackHalfWidth + normalizedDx * wallLength * 0.5, 
                    z: z + perpZ * trackHalfWidth + normalizedDz * wallLength * 0.5 
                },
                side: 'left'
            })
            
            walls.push({
                start: { 
                    x: x - perpX * trackHalfWidth - normalizedDx * wallLength * 0.5, 
                    z: z - perpZ * trackHalfWidth - normalizedDz * wallLength * 0.5 
                },
                end: { 
                    x: x - perpX * trackHalfWidth + normalizedDx * wallLength * 0.5, 
                    z: z - perpZ * trackHalfWidth + normalizedDz * wallLength * 0.5 
                },
                side: 'right'
            })
        }
    }
    
    return walls
}

export function getDistanceToWaypoint(carX: number, carZ: number, waypoint: Waypoint): number {
    const dx = waypoint.x - carX
    const dz = waypoint.z - carZ
    return Math.sqrt(dx * dx + dz * dz)
}

export function getDirectionToWaypoint(carX: number, carZ: number, waypoint: Waypoint): { x: number, z: number } {
    const dx = waypoint.x - carX
    const dz = waypoint.z - carZ
    const distance = Math.sqrt(dx * dx + dz * dz)
    
    if (distance === 0) return { x: 0, z: 0 }
    
    return {
        x: dx / distance,
        z: dz / distance
    }
}

export function findNextWaypoint(carX: number, carZ: number, track: Track, currentWaypointIndex: number): number {
    const currentWaypoint = track.waypoints[currentWaypointIndex]
    const distance = getDistanceToWaypoint(carX, carZ, currentWaypoint)
    
    if (distance < currentWaypoint.radius) {
        return (currentWaypointIndex + 1) % track.waypoints.length
    }
    
    return currentWaypointIndex
}
