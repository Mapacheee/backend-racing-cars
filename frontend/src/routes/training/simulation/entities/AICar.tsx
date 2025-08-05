import { useGLTF } from '@react-three/drei'
import type { JSX } from 'react'
import { useRef, useEffect, useState } from 'react'
import { Vector3 } from 'three'
import { useCanvasSettings } from '../../../../lib/contexts/useCanvasSettings'
import { RigidBody, interactionGroups } from '@react-three/rapier'
import { TRACKS } from '../systems/TrackSystem'
import { createSensorReadings, DEFAULT_SENSOR_CONFIG, type SensorReading } from './CarSensors'
import type { AICar } from '../types/car'
import { CAR_MODEL_PATH } from '../config/constants'
import { CAR_PHYSICS_CONFIG } from '../config/physics'
import { NEATCarController, CarFitnessTracker, GenomeBuilder } from '../ai'
import { DEFAULT_NEAT_CONFIG } from '../ai/neat/NEATConfig'
import type { FitnessMetrics } from '../types/neat'
import { useNEATTraining } from '../contexts/NEATTrainingContext'

interface AICarProps {
    carData: AICar
    onFitnessUpdate?: (carId: string, fitness: number, metrics: FitnessMetrics) => void
    onCarElimination?: (carId: string) => void
    isEliminated?: boolean
}

export default function AICar({ carData, onFitnessUpdate, onCarElimination, isEliminated }: AICarProps): JSX.Element {
    // Determinar qué modelo usar según el estado
    const modelPath = isEliminated ? '/assets/models/raceCarOrange.glb' : CAR_MODEL_PATH
    const { scene } = useGLTF(modelPath)
    const { showCollisions } = useCanvasSettings()
    const { isTraining } = useNEATTraining() // Obtener estado de entrenamiento
    const rigidBody = useRef<any>(null)
    const [sensorReadings, setSensorReadings] = useState<SensorReading>({
        left: 1,
        leftCenter: 1,
        center: 1,
        rightCenter: 1,
        right: 1
    })

    const track = TRACKS[carData.trackId || 'main_circuit']
    
    // Inicializar controlador NEAT y tracker de fitness
    const [controller] = useState(() => {
        const genome = carData.genome || GenomeBuilder.createMinimal(DEFAULT_NEAT_CONFIG)
        return new NEATCarController(genome)
    })
    
    const [fitnessTracker] = useState(() => {
        const startPos = new Vector3(...carData.position)
        return new CarFitnessTracker(startPos, track.waypoints)
    })
    
    const [lastCollisionTime, setLastCollisionTime] = useState(0)

    // Efecto para la simulación del carro
    useEffect(() => {
        if (isEliminated || !isTraining) return // No actualizar si está eliminado O si no está entrenando

        let frame: number
        
        function updateSimulation() {
            const rb = rigidBody.current
            if (rb && track && isTraining) { // Verificar isTraining también aquí
                const position = rb.translation()
                const rotation = rb.rotation()
                const velocity = rb.linvel()
                
                const heading = Math.atan2(
                    2 * (rotation.w * rotation.y + rotation.x * rotation.z),
                    1 - 2 * (rotation.y * rotation.y + rotation.z * rotation.z)
                )
                
                // Calcular posición real del centro del carro para sensores
                const centerOffsetX = -0.5
                const centerOffsetZ = -1
                const realCenterX = position.x + Math.sin(heading) * centerOffsetZ + Math.cos(heading) * centerOffsetX
                const realCenterZ = position.z + Math.cos(heading) * centerOffsetZ - Math.sin(heading) * centerOffsetX
                
                const carPosition = new Vector3(realCenterX, position.y, realCenterZ)
                
                // Actualizar sensores
                const readings = createSensorReadings(carPosition, heading, track.walls, DEFAULT_SENSOR_CONFIG)
                setSensorReadings(readings)
                
                // Actualizar fitness basado en sensores
                fitnessTracker.updateSensorFitness(readings)
                
                // Usar NEAT para obtener acciones de control
                const actions = controller.getControlActions(readings)
                
                // DEBUG: Log las acciones que se están intentando aplicar (reducido para 50 carros)
                if (Math.random() < 0.001) { // 0.1% de las veces (era 5%)
                    console.log(`${carData.id} - Actions:`, {
                        throttle: actions.throttle.toFixed(3),
                        steering: actions.steering.toFixed(3),
                        position: { x: position.x.toFixed(2), z: position.z.toFixed(2) },
                        speed: Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z).toFixed(2)
                    })
                }
                
                // Aplicar acciones al carro
                controller.applyActions(actions, rb)
                
                // Actualizar métricas de fitness
                const currentPosition = new Vector3(position.x, position.y, position.z)
                const currentVelocity = new Vector3(velocity.x, velocity.y, velocity.z)
                fitnessTracker.update(currentPosition, currentVelocity)
                
                // Calcular y reportar fitness aún menos frecuentemente para mejor rendimiento
                if (frame % 180 === 0 && onFitnessUpdate) { // Cada 3 segundos aprox
                    const metrics = fitnessTracker.getFitnessMetrics()
                    const fitness = fitnessTracker.calculateFitness()  // Usar el nuevo método
                    onFitnessUpdate(carData.id, fitness, metrics)
                    
                    // Verificar timeout y eliminar si es necesario
                    if (fitnessTracker.hasTimeout() && !isEliminated && onCarElimination) {
                        console.log(`⏰ Car ${carData.id} timed out - no progress for 8s`)
                        onCarElimination(carData.id)
                    }
                }
            }
            
            frame = requestAnimationFrame(updateSimulation)
        }
        
        frame = requestAnimationFrame(updateSimulation)
        return () => cancelAnimationFrame(frame)
    }, [track, controller, fitnessTracker, carData.id, onFitnessUpdate, isEliminated, isTraining]) // Agregar isTraining a dependencies

    // Manejar colisiones
    const handleCollision = () => {
        const now = Date.now()
        if (now - lastCollisionTime > 100 && !isEliminated) { // Solo procesar si no está eliminado
            fitnessTracker.recordCollision()
            setLastCollisionTime(now)

            // Llamar al callback de eliminación
            if (onCarElimination) {
                onCarElimination(carData.id)
            }

            console.log(`Car ${carData.id} crashed and eliminated!`)
        }
    }

    const renderSensorLines = () => {
        if (!showCollisions) return null
        
        const centerX = -0.5
        const centerY = 0.5
        const centerZ = -1
        
        const sensors = [
            { angle: DEFAULT_SENSOR_CONFIG.angles.left, reading: sensorReadings.left },
            { angle: DEFAULT_SENSOR_CONFIG.angles.leftCenter, reading: sensorReadings.leftCenter },
            { angle: DEFAULT_SENSOR_CONFIG.angles.center, reading: sensorReadings.center },
            { angle: DEFAULT_SENSOR_CONFIG.angles.rightCenter, reading: sensorReadings.rightCenter },
            { angle: DEFAULT_SENSOR_CONFIG.angles.right, reading: sensorReadings.right }
        ]

        const result = sensors.map((sensor, index) => {
            const angleRad = sensor.angle * Math.PI / 180
            const distance = sensor.reading * DEFAULT_SENSOR_CONFIG.maxDistance
            const endX = centerX + Math.sin(angleRad) * distance
            const endZ = centerZ + Math.cos(angleRad) * distance
            const color = sensor.reading > 0.8 ? 'green' : 'red'
            
            return (
                <line key={`sensor-${carData.id}-${index}`}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([
                                centerX, centerY, centerZ,
                                endX, centerY, endZ
                            ])}
                            itemSize={3}
                            args={[new Float32Array([
                                centerX, centerY, centerZ,
                                endX, centerY, endZ
                            ]), 3]}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color={color} />
                </line>
            )
        })
        
        return result
    }

    // Efecto para manejar la eliminación del carro
    useEffect(() => {
        if (isEliminated) {
            const rb = rigidBody.current
            if (rb) {
                // Detener completamente el carro
                rb.setLinvel({ x: 0, y: 0, z: 0 })
                rb.setAngvel({ x: 0, y: 0, z: 0 })
                // Removed setSleeping as it doesn't exist in this version
            }
        }
    }, [isEliminated])

    return (
        <>
            <RigidBody
                ref={rigidBody}
                colliders="cuboid"
                position={carData.position}
                rotation={carData.rotation ? [0, carData.rotation, 0] : undefined}
                angularDamping={CAR_PHYSICS_CONFIG.angularDamping}
                linearDamping={CAR_PHYSICS_CONFIG.linearDamping}
                onCollisionEnter={handleCollision}
                mass={1.5}                // Reasonable mass
                restitution={0}           // No bounce 
                friction={3.0}            // High friction
                canSleep={false}
                enabledRotations={[false, true, false]}
                ccd={true}                // Continuous collision detection
                gravityScale={1.0}        // Ensure gravity works properly
                collisionGroups={interactionGroups(1, [2])}     // Cars in group 1, ONLY collide with group 2 (walls/ground) - NO car-to-car collision
                solverGroups={interactionGroups(1, [2])}      // Same groups for force calculation
            >
                <group>
                    <primitive object={scene.clone()} scale={1.5} />
                    {showCollisions && (
                        <mesh position={[-0.5, 0.2, -1]}>
                            <boxGeometry args={[1, 0.4, 2]} />
                            <meshBasicMaterial
                                color={carData.color || "blue"}
                                wireframe
                                transparent
                                opacity={0.5}
                            />
                        </mesh>
                    )}
                    {renderSensorLines()}
                </group>
            </RigidBody>
        </>
    )
}
