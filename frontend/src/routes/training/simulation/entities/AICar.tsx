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
    
    if (!neatContext) {
        return null
    }
    
    const { isTraining, generation } = neatContext    
    const carPositionRef = useRef<Vector3>(new Vector3(...carData.position))
    const carHeadingRef = useRef<number>(carData.rotation || 0)

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

    useEffect(() => {
        if (carRef.current) {
            carRef.current.resetPosition(carData.position, [0, carData.rotation || 0, 0])
            
            const startPos = new Vector3(...carData.position)
            fitnessTracker.reset(startPos)
        }
    }, [generation, carData.position, carData.rotation, fitnessTracker])

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

                const carPosition = new Vector3(position.x, position.y, position.z)
                carPositionRef.current = carPosition
                carHeadingRef.current = heading
                const centerOffset = { x: -1, y: 0.2, z: 0 }
                const readings = createSensorReadings(carPosition, heading, track.walls, DEFAULT_SENSOR_CONFIG, centerOffset)
                fitnessTracker.updateSensorFitness(readings)
                const actions = controller.getControlActions(readings)
                if (Math.random() < 0.001) { 
                    console.log(`${carData.id} - Actions:`, {
                        throttle: actions.throttle.toFixed(3),
                        steering: actions.steering.toFixed(3),
                        position: { x: position.x.toFixed(2), z: position.z.toFixed(2) },
                        speed: Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z).toFixed(2)
                    })
                }
                controller.applyActions(actions, rb)
                const currentPosition = new Vector3(position.x, position.y, position.z)
                const currentVelocity = new Vector3(velocity.x, velocity.y, velocity.z)
                fitnessTracker.update(currentPosition, currentVelocity)
                if (frame % 180 === 0 && onFitnessUpdate) {
                    const metrics = fitnessTracker.getFitnessMetrics()
                    const fitness = fitnessTracker.calculateFitness()  
                    onFitnessUpdate(carData.id, fitness, metrics)
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
    }, [track, controller, fitnessTracker, carData.id, onFitnessUpdate, isEliminated, isTraining])

    const handleCollision = () => {
        const now = Date.now()
        if (now - lastCollisionTime > 100 && !isEliminated) {
            fitnessTracker.recordCollision()
            setLastCollisionTime(now)

            if (onCarElimination) {
                onCarElimination(carData.id)
            }

            console.log(`Car ${carData.id} crashed and eliminated!`)
        }
    }

    useEffect(() => {
        if (isEliminated && carRef.current?.rigidBody) {
            const rb = carRef.current.rigidBody
            rb.setLinvel({ x: 0, y: 0, z: 0 })
            rb.setAngvel({ x: 0, y: 0, z: 0 })
        }
    }, [isEliminated])

    const centerOffset = { x: 0, y: 0.2, z: -1 }
    const currentPosition = carPositionRef.current
    const currentRotation = carHeadingRef.current
    const currentSensorReadings = createSensorReadings(
        currentPosition,
        currentRotation,
        track.walls,
        DEFAULT_SENSOR_CONFIG,
        centerOffset
    )
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
            <SensorVisualization
                carPosition={currentPosition}
                carRotation={currentRotation}
                sensorReadings={currentSensorReadings}
                config={DEFAULT_SENSOR_CONFIG}
                visualConfig={{ centerOffset }}
                visible={showCollisions}
            />

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
