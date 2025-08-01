import { Vector3 } from 'three'
import type { Wall } from './TrackSystem'

export interface SensorReading {
    left: number
    leftCenter: number
    center: number
    rightCenter: number
    right: number
}

export interface CarSensorConfig {
    maxDistance: number
    angles: {
        left: number
        leftCenter: number
        center: number
        rightCenter: number
        right: number
    }
}

const DEFAULT_SENSOR_CONFIG: CarSensorConfig = {
    maxDistance: 5.0,
    angles: {
        left: -45,        
        leftCenter: -22.5, 
        center: 0,        
        rightCenter: 22.5,
        right: 45        
    }
}

export function createSensorReadings(
    carPosition: Vector3,
    carRotation: number,
    walls: Wall[],
    config: CarSensorConfig = DEFAULT_SENSOR_CONFIG
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
    const totalAngle = carRotation + (sensorAngle * Math.PI / 180)
    const rayDirection = new Vector3(
        Math.sin(totalAngle),
        0,
        Math.cos(totalAngle)
    )
    
    const rayEnd = new Vector3(
        carPosition.x + rayDirection.x * maxDistance,
        carPosition.y,
        carPosition.z + rayDirection.z * maxDistance
    )
    
    let closestDistance = maxDistance
    
    for (const wall of walls) {
        const intersection = getLineIntersection(
            carPosition.x, carPosition.z,
            rayEnd.x, rayEnd.z,
            wall.start.x, wall.start.z,
            wall.end.x, wall.end.z
        )
        
        if (intersection) {
            const distance = Math.sqrt(
                Math.pow(intersection.x - carPosition.x, 2) + 
                Math.pow(intersection.z - carPosition.z, 2)
            )
            
            if (distance < closestDistance) {
                closestDistance = distance
            }
        }
    }
    
    const normalizedDistance = closestDistance / maxDistance
    return normalizedDistance
}

function getLineIntersection(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
): 
{ x: number; z: number } | null {
    let result: { x: number; z: number } | null = null
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    
    if (Math.abs(denominator) >= 1e-10) {
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator
        
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            const intersectionX = x1 + t * (x2 - x1)
            const intersectionZ = y1 + t * (y2 - y1)
            result = { x: intersectionX, z: intersectionZ }
        }
    }
    
    return result
}

export { DEFAULT_SENSOR_CONFIG }
