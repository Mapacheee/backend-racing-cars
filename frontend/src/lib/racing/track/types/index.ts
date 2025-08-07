// shared track types for both training and admin modules
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

// track editing and interaction types
export interface TrackEditMode {
    enabled: boolean
    mode: 'add' | 'move' | 'remove' | 'swap'
    selectedWaypoint?: number
}

export interface TrackViewSettings {
    showWaypoints: boolean
    showWalls: boolean
    showTrack: boolean
    editMode: boolean
}
