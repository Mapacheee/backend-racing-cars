import type { CarPhysicsConfig, CarCollisionGroups, SensorConfig } from '../types'

// default car physics configuration for realistic car behavior
export const DEFAULT_CAR_PHYSICS: CarPhysicsConfig = {
    angularDamping: 3.0,  // higher damping to prevent wild spinning
    linearDamping: 0.12,  // more damping to prevent erratic movement
    spawnHeight: 0.6,     // just above track level (track height is 1.2)
    mass: 1.0,
    friction: 0.8,
    restitution: 0.1
}

// collision groups for car physics interactions
export const COLLISION_GROUPS: CarCollisionGroups = {
    cars: 1,     // group 1: cars 
    walls: 2,    // group 2: walls and ground
    track: 4     // group 4: track elements
}

// gravity configuration for car physics
export const GRAVITY = [0, -3, 0] as const  // softer gravity for controlled falling

// default sensor configuration for obstacle detection
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

// car model configuration
export const CAR_MODELS = {
    default: '/assets/models/raceCarRed.glb',
    eliminated: '/assets/models/raceCarOrange.glb',
    player: '/assets/models/raceCarBlue.glb'
} as const

// car control limits and constants
export const CAR_CONTROLS = {
    maxThrottle: 1.0,
    maxBrake: 1.0,
    maxSteering: 1.0,
    steeringSpeed: 2.0,
    accelerationForce: 8.0,
    brakeForce: 12.0,
    maxSpeed: 25.0
} as const
