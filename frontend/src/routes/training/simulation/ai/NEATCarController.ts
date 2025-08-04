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
        
        // TEMPORAL: Amplificar mucho las salidas para que sean detectables
        let amplifiedThrottle = actions.throttle * 8  // Amplificación muy alta
        let amplifiedSteering = actions.steering * 8  // Amplificación muy alta
        
        // Comportamiento más agresivo basado en sensores
        if (sensorReadings.center > 0.8) {
            amplifiedThrottle = 0.8  // Acelerar cuando el camino esté libre
        } else if (sensorReadings.center < 0.3) {
            amplifiedThrottle = -0.6  // Reversa cuando haya obstáculo
        }
        
        // Giro más agresivo basado en sensores laterales
        if (sensorReadings.left < 0.4 && sensorReadings.right > 0.6) {
            amplifiedSteering = 0.7  // Girar derecha
        } else if (sensorReadings.right < 0.4 && sensorReadings.left > 0.6) {
            amplifiedSteering = -0.7  // Girar izquierda
        }
        
        // Clamp values
        amplifiedThrottle = Math.max(-1, Math.min(1, amplifiedThrottle))
        amplifiedSteering = Math.max(-1, Math.min(1, amplifiedSteering))
        
        // Debug temporal - ver qué está generando la red
        if (Math.random() < 0.01) { // Log cada ~100 frames
            console.log('NEAT Output:', {
                original_throttle: actions.throttle.toFixed(3),
                amplified_throttle: amplifiedThrottle.toFixed(3),
                original_steering: actions.steering.toFixed(3),
                amplified_steering: amplifiedSteering.toFixed(3),
                center_sensor: sensorReadings.center.toFixed(2)
            })
        }
        
        return {
            throttle: amplifiedThrottle,
            steering: amplifiedSteering
        }
    }
    
    // Aplicar las acciones al RigidBody del carro
    applyActions(actions: NetworkOutput, rigidBody: any): void {
        if (!rigidBody) {
            console.log('ERROR: No rigidBody provided to applyActions')
            return
        }
        
        // AI CONTROL DELAY: Wait 1 second before AI takes control
        const elapsedTime = Date.now() - this.startTime
        if (elapsedTime < 1000) { // 1000ms = 1 second
            this.isControlActive = false
            // Keep car stable during waiting period
            const angularVelocity = rigidBody.angvel()
            
            // Apply light stabilization during wait
            if (Math.abs(angularVelocity.y) > 0.1) {
                rigidBody.setAngvel({
                    x: 0,
                    y: angularVelocity.y * 0.95,
                    z: 0
                }, true)
            }
            
            if (Math.random() < 0.02) {
                console.log(`⏱️ AI Control activates in ${((1000 - elapsedTime) / 1000).toFixed(1)}s`)
            }
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
        
        // Debug temporal - verificar si estamos recibiendo acciones
        if (Math.random() < 0.05) {
            console.log('NEAT Actions:', { 
                throttle: throttle.toFixed(3), 
                steering: steering.toFixed(3)
            })
        }

        // VEHICLE CONTROL SYSTEM
        // Interpret NEAT outputs as discrete commands with realistic thresholds
        
        if (throttle > 0.3) {
            this.accelerate(rigidBody)
        } else if (throttle < -0.3) {
            this.brake(rigidBody)
        }
        
        if (steering > 0.4) {
            this.turnRight(rigidBody)
        } else if (steering < -0.4) {
            this.turnLeft(rigidBody)
        } else {
            this.stabilizeSteering(rigidBody)
        }
        
        // Apply natural resistance
        this.applyNaturalResistance(rigidBody)
    }
    
    // VEHICLE CONTROL FUNCTIONS - Real car physics constraints
    
    /**
     * Accelerate like a real car - only forward/backward along the car's direction
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
        
        // Project current velocity onto forward direction (like real car)
        const forwardSpeed = velocity.x * forward.x + velocity.z * forward.z
        
        // Real car max speed limit
        const MAX_SPEED = 8  // Reduced from 12
        if (forwardSpeed >= MAX_SPEED) return
        
        // Real car acceleration - very gentle
        const ACCELERATION_FORCE = 2.0  // Reduced from 3.5
        
        rigidBody.applyImpulse({
            x: forward.x * ACCELERATION_FORCE,
            y: 0,
            z: forward.z * ACCELERATION_FORCE
        }, true)
        
        if (Math.random() < 0.01) {
            console.log('🚗 Accelerating')
        }
    }
    
    /**
     * Brake like a real car - friction-based deceleration
     */
    private brake(rigidBody: any): void {
        const velocity = rigidBody.linvel()
        const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
        
        // Only brake if moving
        if (currentSpeed <= 0.3) return
        
        // Real car braking - strong but not instant
        const BRAKE_FORCE = 0.80  // Realistic braking friction
        rigidBody.setLinvel({
            x: velocity.x * BRAKE_FORCE,
            y: velocity.y,
            z: velocity.z * BRAKE_FORCE
        }, true)
        
        if (Math.random() < 0.01) {
            console.log('🛑 Braking')
        }
    }
    
    /**
     * Turn left like a real car - only when moving forward
     */
    private turnLeft(rigidBody: any): void {
        const velocity = rigidBody.linvel()
        const rotation = rigidBody.rotation()
        
        // Calculate forward speed (not total speed)
        const forward = {
            x: Math.sin(rotation.y),
            z: Math.cos(rotation.y)
        }
        const forwardSpeed = velocity.x * forward.x + velocity.z * forward.z
        
        // Real cars only turn effectively when moving forward
        const MIN_TURN_SPEED = 2.0
        if (forwardSpeed <= MIN_TURN_SPEED) return
        
        // Turn force proportional to speed (like real steering)
        const speedFactor = Math.min(forwardSpeed / 8, 1.0)
        const TURN_FORCE = -1.0 * speedFactor  // Much gentler turning
        
        rigidBody.applyTorqueImpulse({
            x: 0,
            y: TURN_FORCE,
            z: 0
        }, true)
        
        if (Math.random() < 0.01) {
            console.log('⬅️ Turning left')
        }
    }
    
    /**
     * Turn right like a real car - only when moving forward
     */
    private turnRight(rigidBody: any): void {
        const velocity = rigidBody.linvel()
        const rotation = rigidBody.rotation()
        
        // Calculate forward speed (not total speed)
        const forward = {
            x: Math.sin(rotation.y),
            z: Math.cos(rotation.y)
        }
        const forwardSpeed = velocity.x * forward.x + velocity.z * forward.z
        
        // Real cars only turn effectively when moving forward
        const MIN_TURN_SPEED = 2.0
        if (forwardSpeed <= MIN_TURN_SPEED) return
        
        // Turn force proportional to speed (like real steering)
        const speedFactor = Math.min(forwardSpeed / 8, 1.0)
        const TURN_FORCE = 1.0 * speedFactor  // Much gentler turning
        
        rigidBody.applyTorqueImpulse({
            x: 0,
            y: TURN_FORCE,
            z: 0
        }, true)
        
        if (Math.random() < 0.01) {
            console.log('➡️ Turning right')
        }
    }
    
    /**
     * Keep the car stable like a real car with suspension
     */
    private stabilizeSteering(rigidBody: any): void {
        const angularVelocity = rigidBody.angvel()
        const velocity = rigidBody.linvel()
        
        // Real cars naturally straighten out due to wheel alignment
        const STABILIZATION_FACTOR = 0.88
        if (Math.abs(angularVelocity.y) > 0.02) {
            rigidBody.setAngvel({
                x: 0,
                y: angularVelocity.y * STABILIZATION_FACTOR,
                z: 0
            }, true)
        }
        
        // Prevent sideways sliding (like real tires have grip)
        this.preventSidewaysSliding(rigidBody, velocity)
        
        if (Math.random() < 0.002) {
            console.log('⚖️ Stabilizing')
        }
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
        return Math.max(0, 1000 - elapsedTime)
    }
}
