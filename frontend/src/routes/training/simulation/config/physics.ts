import type { CarPhysicsConfig, CarCollisionGroups } from '../types/car'

export const CAR_PHYSICS_CONFIG: CarPhysicsConfig = {
    angularDamping: 2,
    linearDamping: 0.7,
    spawnHeight: 0.5
}

export const COLLISION_GROUPS: CarCollisionGroups = {
    cars: 0x00020001,    
    walls: 0x00010002,   
    track: 0x00010002  
}

export const GRAVITY = [0, -9.81, 0] as const
