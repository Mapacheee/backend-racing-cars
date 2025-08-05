import { Network } from './neat/Network'
import type { Genome, NetworkOutput } from '../types/neat'
import type { SensorReading } from '../types/sensors'

export class NEATCarController {
    private network: Network
    private genome: Genome
    private startTime: number
    private isControlActive: boolean
    
    constructor(genome: Genome) {
        this.genome = genome
        this.network = new Network(genome)
        this.startTime = Date.now()
        this.isControlActive = false
    }
    
    // Procesar sensores y obtener acciones de control
    getControlActions(sensorReadings: SensorReading): NetworkOutput {
        const actions = this.network.activate(sensorReadings)
        
        // Comportamiento más arcade y agresivo para completar la pista rápido
        let throttle = 0
        let steering = 0
        
        // OBJETIVO: Ir MUY rápido pero evitar choques - comportamiento más agresivo
        if (sensorReadings.center > 0.5) {
            throttle = 1.0  // ¡Aceleración completa cuando hay espacio!
        } else if (sensorReadings.center < 0.2) {
            throttle = -0.3  // Frenar menos agresivamente
        } else {
            throttle = 0.7  // Velocidad alta en casos dudosos
        }
        
        // Direccion más agresiva para evitar paredes
        const leftClearance = sensorReadings.left
        const rightClearance = sensorReadings.right
        
        if (leftClearance < 0.3 && rightClearance > 0.5) {
            steering = 0.7  // Giro fuerte a la derecha
        } else if (rightClearance < 0.3 && leftClearance > 0.5) {
            steering = -0.7  // Giro fuerte a la izquierda
        } else {
            // Usar la salida de NEAT más agresivamente
            steering = Math.max(-0.8, Math.min(0.8, actions.steering * 3))
        }
        
        // Dar MÁS control a NEAT para que aprenda a ir rápido
        const neatInfluence = 0.7  // AUMENTADO: 70% influencia de NEAT, 30% lógica básica
        throttle = throttle * (1 - neatInfluence) + (actions.throttle * neatInfluence)
        steering = steering * (1 - neatInfluence) + (actions.steering * neatInfluence)
        
        // Asegurar velocidad mínima más alta para mantener avance constante
        if (throttle < 0.3) {
            throttle = 0.3  // Velocidad mínima aumentada para mayor avance
        }
        
        // Clamp final values
        throttle = Math.max(-1, Math.min(1, throttle))
        steering = Math.max(-1, Math.min(1, steering))
        
        return {
            throttle,
            steering
        }
    }
    
    // Aplicar las acciones al RigidBody del carro
    applyActions(actions: NetworkOutput, rigidBody: any): void {
        if (!rigidBody) {
            console.log('ERROR: No rigidBody provided to applyActions')
            return
        }
        
        // AI CONTROL DELAY: Sin delay para arcade - ¡acción inmediata!
        const elapsedTime = Date.now() - this.startTime
        if (elapsedTime < 100) { // Solo 100ms para estabilizar física
            this.isControlActive = false
            return
        }
        
        this.isControlActive = true
        
        // EMERGENCY CHECK: Prevent cars from falling through ground
        const position = rigidBody.translation()
        if (position.y < -5) {
            console.log('🚨 Car fell through ground! Resetting position...')
            rigidBody.setTranslation({ x: position.x, y: 1.0, z: position.z }, true)
            rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true)
            rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true)
            return
        }
        
        const { throttle, steering } = actions
        
        // VEHICLE CONTROL SYSTEM más suave
        // Usar umbrales más bajos para acciones más frecuentes
        
        if (throttle > 0.1) {  // Umbral mucho más bajo
            this.accelerate(rigidBody)
        } else if (throttle < -0.1) {  // Umbral mucho más bajo
            this.brake(rigidBody)
        }
        
        if (steering > 0.15) {  // Umbral más bajo para giros más frecuentes
            this.turnRight(rigidBody)
        } else if (steering < -0.15) {  // Umbral más bajo
            this.turnLeft(rigidBody)
        } else {
            this.stabilizeSteering(rigidBody)
        }
        
        // Apply natural resistance
        this.applyNaturalResistance(rigidBody)
    }
    
    // VEHICLE CONTROL FUNCTIONS - Real car physics constraints
    
    /**
     * Accelerate like an arcade racer - rápido y divertido!
     */
    private accelerate(rigidBody: any): void {
        const rotation = rigidBody.rotation()
        const velocity = rigidBody.linvel()
        
        // Calculate current speed in the forward direction only
        const forward = {
            x: Math.sin(rotation.y),
            y: 0,
            z: Math.cos(rotation.y)
        }
        
        // Project current velocity onto forward direction
        const forwardSpeed = velocity.x * forward.x + velocity.z * forward.z
        
        // Arcade max speed - mucho más alto para mayor velocidad
        const MAX_SPEED = 15  // Aumentado de 10 a 15 para más velocidad
        if (forwardSpeed >= MAX_SPEED) return
        
        // Arcade acceleration - más potente para avance rápido
        const ACCELERATION_FORCE = 4.5  // Aumentado de 3.0 a 4.5 para más potencia
        
        rigidBody.applyImpulse({
            x: forward.x * ACCELERATION_FORCE,
            y: 0,
            z: forward.z * ACCELERATION_FORCE
        }, true)
    }
    
    /**
     * Brake like a real car - friction-based deceleration
     */
    private brake(rigidBody: any): void {
        const velocity = rigidBody.linvel()
        const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
        
        // Only brake if moving
        if (currentSpeed <= 0.2) return
        
        // Real car braking - más suave
        const BRAKE_FORCE = 0.85
        rigidBody.setLinvel({
            x: velocity.x * BRAKE_FORCE,
            y: velocity.y,
            z: velocity.z * BRAKE_FORCE
        }, true)
    }
    
    /**
     * Turn left like an arcade racer - ¡giros rápidos y divertidos!
     */
    private turnLeft(rigidBody: any): void {
        const velocity = rigidBody.linvel()
        const rotation = rigidBody.rotation()
        
        // Calculate forward speed
        const forward = {
            x: Math.sin(rotation.y),
            z: Math.cos(rotation.y)
        }
        const forwardSpeed = velocity.x * forward.x + velocity.z * forward.z
        
        // Arcade turning - permitir giros incluso a baja velocidad
        const MIN_TURN_SPEED = 0.1  // Muy bajo para arcade
        if (forwardSpeed <= MIN_TURN_SPEED) return
        
        // Turn force más agresivo para arcade
        const speedFactor = Math.min(forwardSpeed / 8, 1.0)
        const TURN_FORCE = -1.2 * speedFactor  // Más agresivo para arcade
        
        rigidBody.applyTorqueImpulse({
            x: 0,
            y: TURN_FORCE,
            z: 0
        }, true)
    }
    
    /**
     * Turn right like an arcade racer - ¡giros rápidos y divertidos!
     */
    private turnRight(rigidBody: any): void {
        const velocity = rigidBody.linvel()
        const rotation = rigidBody.rotation()
        
        // Calculate forward speed
        const forward = {
            x: Math.sin(rotation.y),
            z: Math.cos(rotation.y)
        }
        const forwardSpeed = velocity.x * forward.x + velocity.z * forward.z
        
        // Arcade turning - permitir giros incluso a baja velocidad
        const MIN_TURN_SPEED = 0.1  // Muy bajo para arcade
        if (forwardSpeed <= MIN_TURN_SPEED) return
        
        // Turn force más agresivo para arcade
        const speedFactor = Math.min(forwardSpeed / 8, 1.0)
        const TURN_FORCE = 1.2 * speedFactor  // Más agresivo para arcade
        
        rigidBody.applyTorqueImpulse({
            x: 0,
            y: TURN_FORCE,
            z: 0
        }, true)
    }
    
    /**
     * Keep the car stable like a real car with suspension
     */
    private stabilizeSteering(rigidBody: any): void {
        const angularVelocity = rigidBody.angvel()
        const velocity = rigidBody.linvel()
        
        // Real cars naturally straighten out due to wheel alignment - más suave
        const STABILIZATION_FACTOR = 0.92  // Más suave
        if (Math.abs(angularVelocity.y) > 0.02) {
            rigidBody.setAngvel({
                x: 0,
                y: angularVelocity.y * STABILIZATION_FACTOR,
                z: 0
            }, true)
        }
        
        // Prevent sideways sliding (like real tires have grip)
        this.preventSidewaysSliding(rigidBody, velocity)
    }
    
    /**
     * Prevent unrealistic sideways sliding - simulate tire grip
     */
    private preventSidewaysSliding(rigidBody: any, velocity: any): void {
        const rotation = rigidBody.rotation()
        
        // Calculate car's right direction for sideways detection
        const right = {
            x: Math.cos(rotation.y),
            z: -Math.sin(rotation.y)
        }
        
        // Calculate sideways velocity component
        const sidewaysVelocity = velocity.x * right.x + velocity.z * right.z
        
        // Apply tire grip - reduce sideways motion
        const TIRE_GRIP = 0.85  // Strong grip like real tires
        if (Math.abs(sidewaysVelocity) > 0.5) {
            const correctionX = -right.x * sidewaysVelocity * (1 - TIRE_GRIP)
            const correctionZ = -right.z * sidewaysVelocity * (1 - TIRE_GRIP)
            
            rigidBody.setLinvel({
                x: velocity.x + correctionX,
                y: velocity.y,
                z: velocity.z + correctionZ
            }, true)
        }
    }
    
    /**
     * Apply realistic rolling resistance and air drag
     */
    private applyNaturalResistance(rigidBody: any): void {
        const velocity = rigidBody.linvel()
        const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
        
        // Real car resistance increases with speed
        let resistanceFactor = 0.992  // Base rolling resistance
        
        // Add air resistance at higher speeds
        if (currentSpeed > 8) {
            resistanceFactor = 0.985  // More resistance at high speed
        }
        
        if (currentSpeed > 0.2) {
            rigidBody.setLinvel({
                x: velocity.x * resistanceFactor,
                y: velocity.y,
                z: velocity.z * resistanceFactor
            }, true)
        }
    }
    
    getGenome(): Genome {
        return this.genome
    }
    
    getNetworkStats() {
        return {
            nodeCount: this.network.getNodeCount(),
            connectionCount: this.network.getActiveConnectionCount()
        }
    }
    
    isAIControlActive(): boolean {
        return this.isControlActive
    }
    
    getControlDelay(): number {
        const elapsedTime = Date.now() - this.startTime
        return Math.max(0, 100 - elapsedTime)  // Actualizado a 100ms para arcade
    }
}
