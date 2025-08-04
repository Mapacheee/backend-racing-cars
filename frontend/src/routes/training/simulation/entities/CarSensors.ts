import { Vector3 } from 'three'
import type { Wall } from '../types/track'
import type { SensorReading, SensorConfig } from '../types/sensors'
import { DEFAULT_SENSOR_CONFIG } from '../config/constants'
export { DEFAULT_SENSOR_CONFIG }
export type { SensorReading, SensorConfig }

export function createSensorReadings(
    carPosition: Vector3,
    carRotation: number,
    walls: Wall[],
    config: SensorConfig
): SensorReading {
    const readings: SensorReading = {
        left: getSensorDistance(carPosition, carRotation, config.angles.left, walls, config.maxDistance),
        leftCenter: getSensorDistance(carPosition, carRotation, config.angles.leftCenter, walls, config.maxDistance),
        center: getSensorDistance(carPosition, carRotation, config.angles.center, walls, config.maxDistance),
        rightCenter: getSensorDistance(carPosition, carRotation, config.angles.rightCenter, walls, config.maxDistance),
        right: getSensorDistance(carPosition, carRotation, config.angles.right, walls, config.maxDistance)
    }
    
    return readings
}

function getSensorDistance(
    carPosition: Vector3,
    carRotation: number,
    sensorAngle: number,
    walls: Wall[],
    maxDistance: number
): number {
    const angleRad = (sensorAngle * Math.PI) / 180
    const totalAngle = carRotation + angleRad
    
    const sensorEnd = new Vector3(
        carPosition.x + Math.sin(totalAngle) * maxDistance,
        carPosition.y,
        carPosition.z + Math.cos(totalAngle) * maxDistance
    )
    
    let minDistance = 1.0
    
    for (const wall of walls) {
        const intersection = getLineIntersection(
            carPosition.x, carPosition.z,
            sensorEnd.x, sensorEnd.z,
            wall.start.x, wall.start.z,
            wall.end.x, wall.end.z
        )
        
        if (intersection) {
            const distance = Math.sqrt(
                Math.pow(intersection.x - carPosition.x, 2) + 
                Math.pow(intersection.z - carPosition.z, 2)
            )
            const normalizedDistance = Math.min(distance / maxDistance, 1.0)
            minDistance = Math.min(minDistance, normalizedDistance)
        }
    }
    
    return minDistance
}

function getLineIntersection(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
): { x: number, z: number } | null {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if (Math.abs(denom) < 1e-10) return null
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            z: y1 + t * (y2 - y1)
        }
    }
    
    return null
}
