import type { CarPhysicsConfig, CarCollisionGroups } from '../types/car'

export const CAR_PHYSICS_CONFIG: CarPhysicsConfig = {
    angularDamping: 3.0,  // Higher damping to prevent wild spinning
    linearDamping: 0.12,  // More damping to prevent erratic movement
    spawnHeight: 0.6      // Just above track level (track height is 1.2)
}

export const COLLISION_GROUPS: CarCollisionGroups = {
    cars: 1,     // Grupo 1: Carros 
    walls: 2,    // Grupo 2: Paredes y suelo
    track: 4     // Grupo 4: Track elementos
}

// Configuración de Rapier con máscaras de bits:
// Carros: collisionGroups=0b0001 (soy bit 1), solverGroups=0b0010 (colisiono con bit 2)
// Suelo/Paredes: collisionGroups=0b0010 (soy bit 2), solverGroups=0b0001 (colisiono con bit 1)
// Resultado: Carros NO chocan entre sí, SÍ chocan con suelo/paredes

export const GRAVITY = [0, -3, 0] as const  // Gravedad más suave para caída controlada
