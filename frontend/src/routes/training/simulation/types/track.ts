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

export interface TrackGeometry {
    width: number
    height: number
    length: number
}
