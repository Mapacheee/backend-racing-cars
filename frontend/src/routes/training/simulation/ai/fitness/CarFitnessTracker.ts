import { Vector3 } from 'three'
import type { FitnessMetrics } from '../../types/neat'
import type { Waypoint } from '../../../../../lib/racing/track'
import type { SensorReading } from '../../types/sensors'

export class CarFitnessTracker {
    private metrics: FitnessMetrics
    private lastPosition: Vector3
    private startTime: number
    private totalDistance: number = 0
    private speedSamples: number[] = []
    private currentWaypointIndex: number = 0
    private waypoints: Waypoint[]
    private lastProgressTime: number
    private waypointTimes: number[] = []
    private lapCompleted: boolean = false
    private sensorBonusAccumulator: number = 0

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
        this.lastProgressTime = this.startTime
        this.waypoints = waypoints
        this.sensorBonusAccumulator = 0
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

        // Actualizar progreso por movimiento significativo
        if (positionDelta > 0.05) {  
            this.lastProgressTime = now 
        }
        
        // Calcular velocidad actual
        const currentSpeed = velocity.length()
        this.speedSamples.push(currentSpeed)
        
        // Mantener solo las últimas 60 muestras (aprox 1 segundo a 60fps)
        if (this.speedSamples.length > 60) {
            this.speedSamples.shift()
        }
        
        // Calcular velocidad promedio
        this.metrics.averageSpeed = this.speedSamples.reduce((a, b) => a + b, 0) / this.speedSamples.length
        
        // Detectar movimiento hacia atrás (menos estricto)
        const forwardDirection = this.getForwardDirection(currentPosition)
        const movementDirection = currentPosition.clone().sub(this.lastPosition).normalize()
        
        if (positionDelta > 0.02) { // Reducido el threshold
            const dot = forwardDirection.dot(movementDirection)
            if (dot < -0.7) { // Menos estricto: solo penalizar movimiento muy hacia atrás
                this.metrics.backwardMovement += positionDelta
            }
        }
        
        // check main waypoints
        this.updateCheckpoints(currentPosition)
        
        this.lastPosition = currentPosition.clone()
    }
    
    recordCollision(): void {
        this.metrics.collisions++
    }
    
    updateSensorFitness(sensorReadings: SensorReading): void {
        const sensorSum = sensorReadings.left + sensorReadings.leftCenter + 
                         sensorReadings.center + sensorReadings.rightCenter + 
                         sensorReadings.right
        
        const sensorBonus = (sensorSum / 5) * 0.03  
        this.sensorBonusAccumulator += sensorBonus
        
        if (sensorReadings.center > 0.8) {
            this.sensorBonusAccumulator += 0.02  
        }
        
        if (sensorSum > 4.0) { 
            this.sensorBonusAccumulator += 0.01  
        }
    }
    
    // checks if the car reached the next main waypoint (ignores first for scoring)
    private updateCheckpoints(position: Vector3): void {
        const currentWaypoint = this.waypoints[this.currentWaypointIndex];
        if (currentWaypoint) {
            const distance = Math.sqrt(
                Math.pow(position.x - currentWaypoint.x, 2) +
                Math.pow(position.z - currentWaypoint.z, 2)
            );
            const waypointRadius = Math.max(currentWaypoint.radius || 3.0, 4.0);
            if (distance < waypointRadius) {
                const now = Date.now();
                this.waypointTimes.push(now - this.startTime);
                this.lastProgressTime = now;
                // only give points if not the first waypoint
                if (this.currentWaypointIndex > 0) {
                    this.metrics.checkpointsReached++;
                    // log for debug
                    console.log(`🎯 Car reached waypoint ${this.currentWaypointIndex + 1}/${this.waypoints.length} (distance: ${distance.toFixed(2)})`);
                }
                this.currentWaypointIndex++;
                if (this.currentWaypointIndex >= this.waypoints.length) {
                    this.lapCompleted = true;
                    console.log(`🏁 Car completed lap in ${(now - this.startTime) / 1000}s`);
                }
            }
        }
    }

    
    private getForwardDirection(currentPosition: Vector3): Vector3 {
        // Calcular dirección hacia el siguiente waypoint (secuencial)
        const targetWaypoint = this.waypoints[this.currentWaypointIndex]
        
        if (targetWaypoint) {
            const direction = new Vector3(
                targetWaypoint.x - currentPosition.x,
                0,
                targetWaypoint.z - currentPosition.z
            ).normalize()
            
            return direction
        }
        
        return new Vector3(0, 0, 1) // Forward por defecto
    }
    
    getFitnessMetrics(): FitnessMetrics {
        return { ...this.metrics }
    }
    
    getCurrentCheckpoint(): number {
        return this.currentWaypointIndex
    }
    
    getProgress(): number {
        return (this.metrics.checkpointsReached / this.waypoints.length) * 100
    }
    
    calculateFitness(): number {
        const now = Date.now()
        const timeAlive = (now - this.startTime) / 1000
        
        const movementBonus = Math.min(this.metrics.distanceTraveled * 0.5, 25) 
        const survivalBonus = Math.min(timeAlive * 0.6, 12)  
        const speedBonus = Math.min(this.metrics.averageSpeed * 8, 30) 
        const sensorBonus = Math.min(this.sensorBonusAccumulator, 20)  
                const waypointPoints = this.metrics.checkpointsReached * 50  
        const waypointBonus = Math.pow(this.metrics.checkpointsReached, 1.5) * 10 
        
        const timeBonus = this.lapCompleted ? Math.max(50 - timeAlive / 2, 0) : 0 
        
        const timeoutPenalty = this.hasTimeout() ? -5 : 0 
        const collisionPenalty = this.metrics.collisions * -2  
        const inactivityPenalty = this.getInactivityPenalty()  
        
        const totalFitness = movementBonus + survivalBonus + speedBonus + sensorBonus + 
                           waypointPoints + waypointBonus + timeBonus + 
                           timeoutPenalty + collisionPenalty + inactivityPenalty
        
        return Math.max(1.0, totalFitness)  
    }
    
    private getInactivityPenalty(): number {
        const now = Date.now()
        const timeSinceProgress = (now - this.lastProgressTime) / 1000
        
        if (timeSinceProgress > 6) return -5 
        if (timeSinceProgress > 4) return -2  
        if (timeSinceProgress > 2) return -0.5 
        
        return 0  
    }
    
    hasTimeout(): boolean {
        const now = Date.now()
        const timeSinceProgress = (now - this.lastProgressTime) / 1000
        return timeSinceProgress > 3
    }
    
    isLapCompleted(): boolean {
        return this.lapCompleted
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
        this.lastProgressTime = this.startTime
        this.totalDistance = 0
        this.speedSamples = []
        this.currentWaypointIndex = 0  
        this.waypointTimes = []
        this.lapCompleted = false
        this.sensorBonusAccumulator = 0  
    }
}
