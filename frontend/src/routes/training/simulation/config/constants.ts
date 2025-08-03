import type { TrackGeometry } from '../types/track'
import type { SensorConfig } from '../types/sensors'

export const ROAD_GEOMETRY: TrackGeometry = {
    width: 2.9,
    height: 0.3,
    length: 4
}

export const DEFAULT_SENSOR_CONFIG: SensorConfig = {
    maxDistance: 5,
    angles: {
        left: -45,
        leftCenter: -22.5,
        center: 0,
        rightCenter: 22.5,
        right: 45
    }
}

export const TRACK_GENERATION = {
    segmentsPerSection: 16,
    wallLength: 1.2,
    minimumWaypoints: 3
}

export const CAR_MODEL_PATH = '/src/assets/models/raceCarRed.glb'
