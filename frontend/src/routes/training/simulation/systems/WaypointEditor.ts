import { TRACKS, generateRoad, generateTrackWalls } from './TrackSystem'
import type { Waypoint } from '../types/track'

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
        console.log(`no se pudo remover el waypoint: ${track ? `solo quedan ${track.waypoints.length} waypoints` : 'pista no encontrada'}`)
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

export function getWaypoints(trackId: string): Waypoint[] {
    const track = TRACKS[trackId]
    return track ? [...track.waypoints] : []
}
