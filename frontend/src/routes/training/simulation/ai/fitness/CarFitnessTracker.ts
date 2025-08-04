import { Vector3 } from 'three'
import type { FitnessMetrics } from '../../types/neat'
import type { Waypoint } from '../../types/track'

export class CarFitnessTracker {
    private metrics: FitnessMetrics
    private lastPosition: Vector3
    private startTime: number
    private totalDistance: number = 0
    private speedSamples: number[] = []
    private lastCheckpointIndex: number = -1
    private waypoints: Waypoint[]
    
    constructor(startPosition: Vector3, waypoints: Waypoint[]) {
        this.metrics = {
            distanceTraveled: 0,
            timeAlive: 0,
            averageSpeed: 0,
            checkpointsReached: 0,
            collisions: 0,
            backwardMovement: 0
        }
        
        this.lastPosition = startPosition.clone()
        this.startTime = Date.now()
        this.waypoints = waypoints
    }
    
    update(currentPosition: Vector3, velocity: Vector3): void {
        const now = Date.now()
        const deltaTime = (now - this.startTime) / 1000 // segundos
        
        // Actualizar tiempo de vida
        this.metrics.timeAlive = deltaTime
        
        // Calcular distancia recorrida
        const positionDelta = currentPosition.distanceTo(this.lastPosition)
        this.totalDistance += positionDelta
        this.metrics.distanceTraveled = this.totalDistance
        
        // Calcular velocidad actual
        const currentSpeed = velocity.length()
        this.speedSamples.push(currentSpeed)
        
        // Mantener solo las últimas 60 muestras (aprox 1 segundo a 60fps)
        if (this.speedSamples.length > 60) {
            this.speedSamples.shift()
        }
        
        // Calcular velocidad promedio
        this.metrics.averageSpeed = this.speedSamples.reduce((a, b) => a + b, 0) / this.speedSamples.length
        
        // Detectar movimiento hacia atrás
        const forwardDirection = this.getForwardDirection(currentPosition)
        const movementDirection = currentPosition.clone().sub(this.lastPosition).normalize()
        
        if (positionDelta > 0.01) { // Solo si se movió significativamente
            const dot = forwardDirection.dot(movementDirection)
            if (dot < -0.5) { // Moviéndose hacia atrás
                this.metrics.backwardMovement += positionDelta
            }
        }
        
        // Verificar checkpoints
        this.updateCheckpoints(currentPosition)
        
        this.lastPosition = currentPosition.clone()
    }
    
    recordCollision(): void {
        this.metrics.collisions++
    }
    
    private updateCheckpoints(position: Vector3): void {
        // Verificar si pasó por el siguiente checkpoint
        const nextCheckpointIndex = (this.lastCheckpointIndex + 1) % this.waypoints.length
        const nextWaypoint = this.waypoints[nextCheckpointIndex]
        
        if (nextWaypoint) {
            const distance = Math.sqrt(
                Math.pow(position.x - nextWaypoint.x, 2) + 
                Math.pow(position.z - nextWaypoint.z, 2)
            )
            
            // Si está dentro del radio del checkpoint
            if (distance < nextWaypoint.radius) {
                this.lastCheckpointIndex = nextCheckpointIndex
                this.metrics.checkpointsReached++
            }
        }
    }
    
    private getForwardDirection(currentPosition: Vector3): Vector3 {
        // Calcular dirección hacia el siguiente waypoint
        const nextCheckpointIndex = (this.lastCheckpointIndex + 1) % this.waypoints.length
        const nextWaypoint = this.waypoints[nextCheckpointIndex]
        
        if (nextWaypoint) {
            const direction = new Vector3(
                nextWaypoint.x - currentPosition.x,
                0,
                nextWaypoint.z - currentPosition.z
            ).normalize()
            
            return direction
        }
        
        return new Vector3(0, 0, 1) // Forward por defecto
    }
    
    getFitnessMetrics(): FitnessMetrics {
        return { ...this.metrics }
    }
    
    getCurrentCheckpoint(): number {
        return this.lastCheckpointIndex
    }
    
    getProgress(): number {
        // Progreso como porcentaje del circuito completado
        return (this.metrics.checkpointsReached / this.waypoints.length) * 100
    }
    
    reset(startPosition: Vector3): void {
        this.metrics = {
            distanceTraveled: 0,
            timeAlive: 0,
            averageSpeed: 0,
            checkpointsReached: 0,
            collisions: 0,
            backwardMovement: 0
        }
        
        this.lastPosition = startPosition.clone()
        this.startTime = Date.now()
        this.totalDistance = 0
        this.speedSamples = []
        this.lastCheckpointIndex = -1
    }
}
