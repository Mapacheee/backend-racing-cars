import { useRef, useEffect, useState } from 'react'
import { Vector3 } from 'three'
import { useCanvasSettings } from '../../../../lib/contexts/useCanvasSettings'
import { TRACKS } from '../../../../lib/racing/track'
import { 
    BaseCar3D, 
    SensorVisualization, 
    createSensorReadings, 
    DEFAULT_SENSOR_CONFIG, 
    CAR_MODELS,
    type Car3DRef,
    type SensorReading,
    type AICar as AICarType
} from '../../../../lib/racing/cars'
import { NEATCarController, CarFitnessTracker, GenomeBuilder } from '../ai'
import { DEFAULT_NEAT_CONFIG } from '../ai/neat/NEATConfig'
import type { FitnessMetrics } from '../types/neat'
import { useNEATTraining } from '../contexts/NEATTrainingContext'

interface AICarProps {
    carData: AICarType
    onFitnessUpdate?: (carId: string, fitness: number, metrics: FitnessMetrics) => void
    onCarElimination?: (carId: string) => void
    isEliminated?: boolean
}

export default function AICar({ carData, onFitnessUpdate, onCarElimination, isEliminated }: AICarProps) {
    const carRef = useRef<Car3DRef>(null)
    const { showCollisions } = useCanvasSettings()
    const neatContext = useNEATTraining()
    
    const [sensorReadings, setSensorReadings] = useState<SensorReading>({
        left: 1,
        leftCenter: 1,
        center: 1,
        rightCenter: 1,
        right: 1
    })
    
    const [carPosition, setCarPosition] = useState<Vector3>(new Vector3(...carData.position))
    const [carHeading, setCarHeading] = useState<number>(carData.rotation || 0)

    const track = TRACKS[carData.trackId || 'main_circuit']
    
    const [controller] = useState(() => {
        const genome = carData.genome || GenomeBuilder.createMinimal(DEFAULT_NEAT_CONFIG)
        return new NEATCarController(genome)
    })
    
    const [fitnessTracker] = useState(() => {
        const startPos = new Vector3(...carData.position)
        return new CarFitnessTracker(startPos, track.waypoints)
    })
    
    const [lastCollisionTime, setLastCollisionTime] = useState(0)
    
    if (!neatContext) {
        return null
    }
    
    const { isTraining, generation } = neatContext

    // Reset posición cuando cambia la generación
    useEffect(() => {
        if (carRef.current) {
            carRef.current.resetPosition(carData.position, [0, carData.rotation || 0, 0])
            
            // Reset fitness tracker
            const startPos = new Vector3(...carData.position)
            fitnessTracker.reset(startPos)
        }
    }, [generation, carData.position, carData.rotation, fitnessTracker])

    // Efecto para la simulación del carro
    useEffect(() => {
        if (isEliminated || !isTraining) return

        let frame = 0
        
        function updateSimulation() {
            const car = carRef.current
            
            if (car?.rigidBody && track && isTraining) {
                const rb = car.rigidBody
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
                
                // update state for sensor visualization
                setCarPosition(carPosition)
                setCarHeading(heading)
                
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
            
            frame++
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

    // Efecto para manejar la eliminación del carro
    useEffect(() => {
        if (isEliminated && carRef.current?.rigidBody) {
            const rb = carRef.current.rigidBody
            rb.setLinvel({ x: 0, y: 0, z: 0 })
            rb.setAngvel({ x: 0, y: 0, z: 0 })
        }
    }, [isEliminated])

    return (
        <BaseCar3D
            ref={carRef}
            car={carData}
            modelPath={isEliminated ? CAR_MODELS.eliminated : CAR_MODELS.default}
            onCollision={handleCollision}
            physics={{
                mass: 1.5,
                friction: 3.0,
                restitution: 0,
                angularDamping: 3.0,
                linearDamping: 0.12
            }}
        >
            {/* sensor visualization for debugging */}
            {showCollisions && (
                <SensorVisualization
                    carPosition={carPosition}
                    carRotation={carHeading}
                    sensorReadings={sensorReadings}
                    config={DEFAULT_SENSOR_CONFIG}
                    visible={showCollisions}
                />
            )}

            {/* collision debug visualization */}
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
        </BaseCar3D>
    )
}
