import { TRACKS, generateRoad, generateTrackWalls } from './TrackSystem'
import type { Waypoint } from '../types/index'

// waypoint editing functions for track modification
export function addWaypoint(trackId: string, x: number, z: number): void {
    const track = TRACKS[trackId]
    if (!track) return
    
    const newWaypoint: Waypoint = { x, z, radius: 6 }
    track.waypoints.push(newWaypoint)
    
    // regenerate track geometry
    track.pieces = generateRoad(track.waypoints)
    track.walls = generateTrackWalls(track.waypoints)
}

export function removeWaypoint(trackId: string, index: number): void {
    const track = TRACKS[trackId]
    if (!track || track.waypoints.length <= 3) {
        console.log(`cannot remove waypoint: ${track ? `only ${track.waypoints.length} waypoints remain` : 'track not found'}`)
        return
    }
    
    track.waypoints.splice(index, 1)
    
    // regenerate track geometry
    track.pieces = generateRoad(track.waypoints)
    track.walls = generateTrackWalls(track.waypoints)
}

export function moveWaypoint(trackId: string, index: number, x: number, z: number): void {
    const track = TRACKS[trackId]
    if (!track || index < 0 || index >= track.waypoints.length) return
    
    track.waypoints[index].x = x
    track.waypoints[index].z = z
    
    // regenerate track geometry
    track.pieces = generateRoad(track.waypoints)
    track.walls = generateTrackWalls(track.waypoints)
}

export function reorderWaypoints(trackId: string, fromIndex: number, toIndex: number): void {
    const track = TRACKS[trackId]
    if (!track || fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= track.waypoints.length || toIndex >= track.waypoints.length) return
    
    // swap waypoints
    const temp = track.waypoints[fromIndex]
    track.waypoints[fromIndex] = track.waypoints[toIndex]
    track.waypoints[toIndex] = temp
    
    // regenerate track geometry
    track.pieces = generateRoad(track.waypoints)
    track.walls = generateTrackWalls(track.waypoints)
}

export function getWaypoints(trackId: string): Waypoint[] {
    const track = TRACKS[trackId]
    return track ? [...track.waypoints] : []
}

// utility function to validate track integrity
export function validateTrack(trackId: string): boolean {
    const track = TRACKS[trackId]
    if (!track) return false
    
    return track.waypoints.length >= 3 && 
           track.pieces.length > 0 && 
           track.walls.length > 0
}
