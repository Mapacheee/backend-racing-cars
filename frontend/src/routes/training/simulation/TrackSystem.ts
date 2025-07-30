export interface Waypoint {
    x: number
    z: number
    radius: number
}

export interface TrackPiece {
    model: string
    position: [number, number, number]
    rotation: [number, number, number]
}

export interface Wall {
    start: { x: number; z: number }
    end: { x: number; z: number }
    side: 'left' | 'right'
}

export interface Track {
    id: string
    name: string
    waypoints: Waypoint[]
    pieces: TrackPiece[]
    walls: Wall[]
    length: number
}

export const ROAD_GEOMETRY = {
    width: 2.9,      // ancho carretera
    height: 0.3,     // altura carretera
    length: 4        // largo carretera
} as const

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

export function generateRoad(waypoints: Waypoint[]): TrackPiece[] {
    if (waypoints.length < 3) return []
    
    const pieces: TrackPiece[] = []
    const segmentsPerSection = 8
    
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
    
    for (let i = 0; i < waypoints.length; i++) {
        const p0 = waypoints[(i - 1 + waypoints.length) % waypoints.length]
        const p1 = waypoints[i]
        const p2 = waypoints[(i + 1) % waypoints.length]
        const p3 = waypoints[(i + 2) % waypoints.length]
        
        for (let j = 0; j < segmentsPerSection; j++) {
            const t = j / segmentsPerSection
            
            // formula catmull-rom
            const x = catmullRom(t, p0.x, p1.x, p2.x, p3.x)
            const z = catmullRom(t, p0.z, p1.z, p2.z, p3.z)
            const dx = catmullRomDerivative(t, p0.x, p1.x, p2.x, p3.x)
            const dz = catmullRomDerivative(t, p0.z, p1.z, p2.z, p3.z)
            const rotation = Math.atan2(dx, dz)
            
            pieces.push({
                model: 'road_segment',
                position: [x, 0, z],
                rotation: [0, rotation, 0]
            })
        }
    }
    
    return pieces
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

export function addWaypoint(trackId: string, x: number, z: number): void {
    const track = TRACKS[trackId]
    if (!track) return
    
    const newWaypoint: Waypoint = { x, z, radius: 6 }
    track.waypoints.push(newWaypoint)
    
    track.pieces = generateRoad(track.waypoints)
    track.walls = generateTrackWalls(track.waypoints)
}

export function removeWaypoint(trackId: string, index: number): void {
    const track = TRACKS[trackId]
    if (!track || track.waypoints.length <= 3) {
        console.log(`no se pudo remover el waypoint: ${track ? `solo qyedan ${track.waypoints.length} waypoints` : 'pista no encontrada'}`)
        return
    }
    
    track.waypoints.splice(index, 1)
    
    track.pieces = generateRoad(track.waypoints)
    track.walls = generateTrackWalls(track.waypoints)
}

export function moveWaypoint(trackId: string, index: number, x: number, z: number): void {
    const track = TRACKS[trackId]
    if (!track || index < 0 || index >= track.waypoints.length) return
    
    track.waypoints[index].x = x
    track.waypoints[index].z = z
    
    track.pieces = generateRoad(track.waypoints)
    track.walls = generateTrackWalls(track.waypoints)
}

export function generateTrackWalls(waypoints: Waypoint[]): Wall[] {
    const walls: Wall[] = []
    const segmentsPerSection = 8
    const wallLength = 2.0  
    const roadHalfWidth = ROAD_GEOMETRY.width / 2 
    
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
            const dirLength = Math.sqrt(dx * dx + dz * dz)
            if (dirLength === 0) continue
            
            const normalizedDx = dx / dirLength
            const normalizedDz = dz / dirLength
            const perpX = -normalizedDz
            const perpZ = normalizedDx
            
            // Usar el ancho real de la carretera en lugar del radio del waypoint
            const trackHalfWidth = roadHalfWidth
            
            // Pared izquierda - justo en el borde izquierdo de la carretera
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
            
            // Pared derecha - justo en el borde derecho de la carretera
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

export function getWaypoints(trackId: string): Waypoint[] {
    const track = TRACKS[trackId]
    return track ? [...track.waypoints] : []
}

export function reorderWaypoints(trackId: string, fromIndex: number, toIndex: number): void {
    const track = TRACKS[trackId]
    if (!track || fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= track.waypoints.length || toIndex >= track.waypoints.length) return
    
    const temp = track.waypoints[fromIndex]
    track.waypoints[fromIndex] = track.waypoints[toIndex]
    track.waypoints[toIndex] = temp
    
    track.pieces = generateRoad(track.waypoints)
    track.walls = generateTrackWalls(track.waypoints)
}
