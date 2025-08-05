import { Vector3 } from 'three'
import type { FitnessMetrics } from '../../types/neat'
import type { Waypoint } from '../../types/track'
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
        this.sensorBonusAccumulator = 0  // Inicializar acumulador
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
        
        // NUEVO: Actualizar progreso por movimiento significativo
        if (positionDelta > 0.05) {  // Si se movió más de 0.05 unidades
            this.lastProgressTime = now  // Resetear timeout por cualquier movimiento
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
        
        // Verificar checkpoints
        this.updateCheckpoints(currentPosition)
        
        this.lastPosition = currentPosition.clone()
    }
    
    recordCollision(): void {
        this.metrics.collisions++
    }
    
    // FUNCIÓN MEJORADA: Actualizar fitness basado en sensores con MÁS RECOMPENSAS
    updateSensorFitness(sensorReadings: SensorReading): void {
        // Calcular fitness por tener sensores libres (no detectar paredes)
        const sensorSum = sensorReadings.left + sensorReadings.leftCenter + 
                         sensorReadings.center + sensorReadings.rightCenter + 
                         sensorReadings.right
        
        // Factor aumentado para recompensar posición libre
        const sensorBonus = (sensorSum / 5) * 0.03  // TRIPLICADO: 0.03 puntos por frame (era 0.01)
        this.sensorBonusAccumulator += sensorBonus
        
        // Bonus especial AUMENTADO si el sensor central está muy libre (buena posición)
        if (sensorReadings.center > 0.8) {
            this.sensorBonusAccumulator += 0.02  // CUADRUPLICADO: 0.02 bonus extra (era 0.005)
        }
        
        // NUEVO: Bonus adicional por tener TODOS los sensores relativamente libres
        if (sensorSum > 4.0) {  // Si la suma es mayor a 4 (promedio >0.8)
            this.sensorBonusAccumulator += 0.01  // Bonus extra por excelente posicionamiento
        }
    }
    
    private updateCheckpoints(position: Vector3): void {
        // Verificar si alcanzó el waypoint actual (secuencial)
        const currentWaypoint = this.waypoints[this.currentWaypointIndex]
        
        if (currentWaypoint) {
            const distance = Math.sqrt(
                Math.pow(position.x - currentWaypoint.x, 2) + 
                Math.pow(position.z - currentWaypoint.z, 2)
            )
            
            // Radio más generoso para facilitar progreso inicial
            const waypointRadius = Math.max(currentWaypoint.radius || 3.0, 4.0)
            
            // Si está dentro del radio del waypoint actual
            if (distance < waypointRadius) {
                const now = Date.now()
                this.waypointTimes.push(now - this.startTime)
                this.lastProgressTime = now  // Progreso real por waypoint
                this.metrics.checkpointsReached++
                
                console.log(`🎯 Car reached waypoint ${this.currentWaypointIndex + 1}/${this.waypoints.length} (distance: ${distance.toFixed(2)})`)
                
                // Avanzar al siguiente waypoint
                this.currentWaypointIndex++
                
                // Verificar si completó la vuelta
                if (this.currentWaypointIndex >= this.waypoints.length) {
                    this.lapCompleted = true
                    console.log(`🏁 Car completed lap in ${(now - this.startTime) / 1000}s`)
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
        // Progreso como porcentaje del circuito completado
        return (this.metrics.checkpointsReached / this.waypoints.length) * 100
    }
    
    // Nueva función: Calcular fitness total con el nuevo sistema
    calculateFitness(): number {
        const now = Date.now()
        const timeAlive = (now - this.startTime) / 1000
        
        // 1. INCENTIVOS BÁSICOS AUMENTADOS - Recompensar mucho más el movimiento
        const movementBonus = Math.min(this.metrics.distanceTraveled * 0.3, 15)  // TRIPLICADO: 0.3 punto por unidad, max 15
        const survivalBonus = Math.min(timeAlive * 0.4, 8)  // DUPLICADO: 0.4 puntos por segundo, max 8  
        const speedBonus = Math.min(this.metrics.averageSpeed * 5, 20)  // AUMENTADO: 5x velocidad, max 20
        const sensorBonus = Math.min(this.sensorBonusAccumulator, 15)  // AUMENTADO: Max 15 puntos por sensores
        
        // 2. OBJETIVOS PRINCIPALES - Waypoints con MÁS RECOMPENSA
        const waypointPoints = this.metrics.checkpointsReached * 25  // AUMENTADO: 25 puntos por waypoint (era 15)
        
        // 3. BONIFICACIONES AVANZADAS
        const timeBonus = this.lapCompleted ? Math.max(25 - timeAlive / 3, 0) : 0  // Bonus por completar rápido
        
        // 4. PENALIZACIONES
        const timeoutPenalty = this.hasTimeout() ? -10 : 0  // Mayor penalización por timeout
        const collisionPenalty = this.metrics.collisions * -3  // Aumentado: -3 por colisión
        const inactivityPenalty = this.getInactivityPenalty()  // Nueva penalización por inactividad
        
        const totalFitness = movementBonus + survivalBonus + speedBonus + sensorBonus + waypointPoints + 
                           timeBonus + timeoutPenalty + collisionPenalty + inactivityPenalty
        
        return Math.max(0.1, totalFitness)  // Mínimo 0.1 para evitar 0 total
    }
    
    // Nueva función: Penalizar inactividad severa
    private getInactivityPenalty(): number {
        const now = Date.now()
        const timeSinceProgress = (now - this.lastProgressTime) / 1000
        
        // Penalización progresiva por inactividad
        if (timeSinceProgress > 6) return -5  // Muy parado
        if (timeSinceProgress > 4) return -2  // Algo parado
        if (timeSinceProgress > 2) return -0.5  // Poco movimiento
        
        return 0  // Sin penalización si se mueve regularmente
    }
    
    // Nueva función: Verificar si el carro ha hecho timeout
    hasTimeout(): boolean {
        const now = Date.now()
        const timeSinceProgress = (now - this.lastProgressTime) / 1000
        return timeSinceProgress > 8  // 8 segundos sin progreso = timeout
    }
    
    // Nueva función: Verificar si completó la vuelta
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
        this.currentWaypointIndex = 0  // Empezar desde el primer waypoint
        this.waypointTimes = []
        this.lapCompleted = false
        this.sensorBonusAccumulator = 0  // Resetear bonus de sensores
    }
}
