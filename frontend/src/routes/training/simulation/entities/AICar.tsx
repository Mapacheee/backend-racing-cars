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
    type AICar as AICarType,
} from '../../../../lib/racing/cars'
import {
    NEATCarController,
    CarFitnessTracker,
    GenomeBuilder,
    ManualCarController,
} from '../ai'
import { DEFAULT_NEAT_CONFIG } from '../ai/neat/NEATConfig'
import type { FitnessMetrics } from '../types/neat'
import { useNEATTraining } from '../contexts/NEATTrainingContext'
import { CAR_PHYSICS_CONFIG } from '../config/physics'
import { globalKeyboardInput } from '../ai/utils/KeyboardInput'

interface AICarProps {
    carData: AICarType
    onFitnessUpdate?: (
        carId: string,
        fitness: number,
        metrics: FitnessMetrics
    ) => void
    onCarElimination?: (carId: string) => void
    isEliminated?: boolean
}

export default function AICar({
    carData,
    onFitnessUpdate,
    onCarElimination,
    isEliminated,
}: AICarProps) {
    const carRef = useRef<Car3DRef>(null)
    const { showCollisions } = useCanvasSettings()
    const neatContext = useNEATTraining()

    if (!neatContext) {
        return null
    }

    const { isTraining, generation } = neatContext
    const [carPosition, setCarPosition] = useState<Vector3>(
        new Vector3(...carData.position)
    )
    const [carHeading, setCarHeading] = useState<number>(carData.rotation || 0)

    const track = TRACKS[carData.trackId || 'circuito 1']
    const [controller] = useState(() => {
        const genome =
            carData.genome || GenomeBuilder.createMinimal(DEFAULT_NEAT_CONFIG)
        return new NEATCarController(genome, carData.id) // Pass car ID for debug control
    })

    // Separate manual controller for WASD testing (only for ai-1)
    const [manualController] = useState(() => {
        return carData.id === 'ai-1'
            ? new ManualCarController(carData.id)
            : null
    })

    const [fitnessTracker] = useState(() => {
        const startPos = new Vector3(...carData.position)
        return new CarFitnessTracker(carData.id, startPos, track.waypoints)
    })

    const [lastCollisionTime, setLastCollisionTime] = useState(0)

    useEffect(() => {
        if (carRef.current) {
            carRef.current.resetPosition(carData.position, [
                0,
                carData.rotation || 0,
                0,
            ])

            const startPos = new Vector3(...carData.position)
            fitnessTracker.reset(startPos)
        }
    }, [generation, carData.position, carData.rotation, fitnessTracker])

    const SENSOR_CENTER_OFFSET = { x: -21.2, y: -2.5, z: -4.4 }

    useEffect(() => {
        if (isEliminated || !isTraining) return

        let frame = 0
        function updateSimulation() {
            const car = carRef.current
            if (car?.rigidBody && track && isTraining) {
                // Debug: Check initial state
                if (Math.random() < 0.02) {
                    console.log(`🔧 ${carData.id} Simulation Update:`, {
                        hasCarRef: !!car,
                        hasRigidBody: !!car.rigidBody,
                        hasTrack: !!track,
                        isTraining,
                        isEliminated,
                        velocityBefore: {
                            x: car.rigidBody.linvel().x.toFixed(3),
                            z: car.rigidBody.linvel().z.toFixed(3),
                        },
                    })
                }

                const rb = car.rigidBody
                const position = rb.translation()
                const rotation = rb.rotation()
                const velocity = rb.linvel()

                const heading = Math.atan2(
                    2 * (rotation.w * rotation.y + rotation.x * rotation.z),
                    1 - 2 * (rotation.y * rotation.y + rotation.z * rotation.z)
                )

                const newCarPosition = new Vector3(
                    position.x,
                    position.y,
                    position.z
                )
                setCarPosition(newCarPosition)
                setCarHeading(heading)
                const readings = createSensorReadings(
                    newCarPosition,
                    heading,
                    track.walls,
                    DEFAULT_SENSOR_CONFIG,
                )
                fitnessTracker.updateSensorFitness(readings)

                // Check for wall collision (when any sensor reading indicates actual contact)
                const WALL_COLLISION_DISTANCE = 0.08 // Distance threshold for wall collision (actual contact)
                const sensorValues = [
                    readings.left,
                    readings.leftCenter,
                    readings.center,
                    readings.rightCenter,
                    readings.right,
                ]
                const hasWallCollision = sensorValues.some(
                    distance => distance < WALL_COLLISION_DISTANCE
                )

                if (hasWallCollision && !isEliminated) {
                    console.log(
                        `💥 Car ${carData.id} touched wall during training - eliminating`
                    )
                    if (onCarElimination) {
                        onCarElimination(carData.id)
                    }
                    return // Stop processing this car
                }

                // Determine which controller to use
                let actions
                let controllerUsed = 'AI'

                // Debug: Always log for ai-1 to see what's happening
                if (carData.id === 'ai-1' && Math.random() < 0.2) {
                    console.log(`🔧 ai-1 Controller Check:`, {
                        carId: carData.id,
                        hasManualController: !!manualController,
                        keyboardIsActive: globalKeyboardInput.isActive(),
                        keyboardHasInput: globalKeyboardInput.hasActiveInput(),
                        currentKeys: globalKeyboardInput.getCurrentKeys(),
                        willUseManual: !!(
                            carData.id === 'ai-1' &&
                            manualController &&
                            globalKeyboardInput.isActive()
                        ),
                    })
                }

                // Check if this is ai-1 and manual control is active
                if (
                    carData.id === 'ai-1' &&
                    manualController &&
                    globalKeyboardInput.isActive()
                ) {
                    // Use manual control - completely separate from AI
                    actions = manualController.getControlActions()
                    controllerUsed = 'Manual'

                    // Debug: Always log when manual control is used
                    console.log(
                        `🎮 MANUAL CONTROL ACTIVATED for ${carData.id}!`,
                        {
                            throttle: actions.throttle.toFixed(2),
                            steering: actions.steering.toFixed(2),
                            timestamp: new Date().toLocaleTimeString(),
                        }
                    )

                    // Debug: Check rigid body before applying manual physics
                    if (Math.random() < 0.1) {
                        console.log(
                            `🔧 ${carData.id} Manual - Before Physics:`,
                            {
                                rigidBodyExists: !!rb,
                                velocity: rb
                                    ? {
                                          x: rb.linvel().x.toFixed(3),
                                          z: rb.linvel().z.toFixed(3),
                                      }
                                    : 'no-rb',
                                actions: {
                                    throttle: actions.throttle.toFixed(2),
                                    steering: actions.steering.toFixed(2),
                                },
                            }
                        )
                    }

                    // Apply manual physics directly
                    manualController.applyActions(actions, rb)

                    // Debug: Check rigid body after applying manual physics
                    if (Math.random() < 0.1) {
                        console.log(
                            `🔧 ${carData.id} Manual - After Physics:`,
                            {
                                velocity: rb
                                    ? {
                                          x: rb.linvel().x.toFixed(3),
                                          z: rb.linvel().z.toFixed(3),
                                      }
                                    : 'no-rb',
                                speed: rb
                                    ? Math.sqrt(
                                          rb.linvel().x * rb.linvel().x +
                                              rb.linvel().z * rb.linvel().z
                                      ).toFixed(2)
                                    : 'no-rb',
                            }
                        )
                    }
                } else {
                    // Use AI control (normal behavior)
                    actions = controller.getControlActions(readings)

                    // AI assistance for early training
                    if (fitnessTracker.getFitnessMetrics().timeAlive < 2) {
                        actions.throttle = 1
                        actions.steering = 0
                    }
                    const speed = Math.sqrt(
                        velocity.x * velocity.x + velocity.z * velocity.z
                    )
                    if (speed < 0.5) {
                        actions.throttle = 1
                        actions.steering = 0
                    }

                    // Debug: Check rigid body before applying AI physics
                    if (Math.random() < 0.02) {
                        console.log(`🔧 ${carData.id} AI - Before Physics:`, {
                            rigidBodyExists: !!rb,
                            velocity: rb
                                ? {
                                      x: rb.linvel().x.toFixed(3),
                                      z: rb.linvel().z.toFixed(3),
                                  }
                                : 'no-rb',
                            actions: {
                                throttle: actions.throttle.toFixed(2),
                                steering: actions.steering.toFixed(2),
                            },
                        })
                    }

                    // Apply AI physics
                    controller.applyActions(actions, rb)

                    // Debug: Check rigid body after applying AI physics
                    if (Math.random() < 0.02) {
                        console.log(`🔧 ${carData.id} AI - After Physics:`, {
                            velocity: rb
                                ? {
                                      x: rb.linvel().x.toFixed(3),
                                      z: rb.linvel().z.toFixed(3),
                                  }
                                : 'no-rb',
                            speed: rb
                                ? Math.sqrt(
                                      rb.linvel().x * rb.linvel().x +
                                          rb.linvel().z * rb.linvel().z
                                  ).toFixed(2)
                                : 'no-rb',
                        })
                    }
                }

                // Debug: Final check after all physics applied
                if (Math.random() < 0.02) {
                    const finalVelocity = rb.linvel()
                    const finalPosition = rb.translation()
                    console.log(`🔧 ${carData.id} End of Frame:`, {
                        finalVelocity: {
                            x: finalVelocity.x.toFixed(3),
                            z: finalVelocity.z.toFixed(3),
                        },
                        finalPosition: {
                            x: finalPosition.x.toFixed(2),
                            y: finalPosition.y.toFixed(2),
                            z: finalPosition.z.toFixed(2),
                        },
                        speedMagnitude: Math.sqrt(
                            finalVelocity.x * finalVelocity.x +
                                finalVelocity.z * finalVelocity.z
                        ).toFixed(3),
                        actions: {
                            throttle: actions.throttle.toFixed(2),
                            steering: actions.steering.toFixed(2),
                        },
                    })
                }

                // Debug logging
                if (Math.random() < 0.001) {
                    console.log(`${carData.id} - ${controllerUsed} Actions:`, {
                        throttle: actions.throttle.toFixed(3),
                        steering: actions.steering.toFixed(3),
                        position: {
                            x: position.x.toFixed(2),
                            z: position.z.toFixed(2),
                        },
                        speed: Math.sqrt(
                            velocity.x * velocity.x + velocity.z * velocity.z
                        ).toFixed(2),
                    })
                }
                const currentPosition = new Vector3(
                    position.x,
                    position.y,
                    position.z
                )
                const currentVelocity = new Vector3(
                    velocity.x,
                    velocity.y,
                    velocity.z
                )
                fitnessTracker.update(currentPosition, currentVelocity)
                if (frame % 180 === 0 && onFitnessUpdate) {
                    const metrics = fitnessTracker.getFitnessMetrics()
                    const fitness = fitnessTracker.calculateFitness()
                    onFitnessUpdate(carData.id, fitness, metrics)
                    // Timeout elimination removed - cars only die from wall collisions
                }
            }
            frame++
            frame = requestAnimationFrame(updateSimulation)
        }
        frame = requestAnimationFrame(updateSimulation)
        return () => cancelAnimationFrame(frame)
    }, [
        track,
        controller,
        fitnessTracker,
        carData.id,
        onFitnessUpdate,
        isEliminated,
        isTraining,
    ])

    const handleCollision = () => {
        const now = Date.now()
        if (now - lastCollisionTime > 100 && !isEliminated) {
            // Only eliminate cars during training
            if (isTraining && onCarElimination) {
                fitnessTracker.recordCollision()
                setLastCollisionTime(now)
                onCarElimination(carData.id)
                console.log(
                    `💥 Car ${carData.id} crashed and eliminated during training!`
                )
            } else {
                console.log(
                    `💥 Car ${carData.id} crashed (no elimination - not training)`
                )
            }
        }
    }

    useEffect(() => {
        if (isEliminated && carRef.current?.rigidBody) {
            const rb = carRef.current.rigidBody
            rb.setLinvel({ x: 0, y: 0, z: 0 })
            rb.setAngvel({ x: 0, y: 0, z: 0 })
        }
    }, [isEliminated])

    // Cleanup effect for fitness tracker
    useEffect(() => {
        return () => {
            fitnessTracker.destroy()
        }
    }, [fitnessTracker])

    // Get real-time car position from physics body for sensor visualization
    const getRealTimeCarData = () => {
        if (carRef.current?.rigidBody) {
            const rb = carRef.current.rigidBody
            const position = rb.translation()
            const rotation = rb.rotation()

            const heading = Math.atan2(
                2 * (rotation.w * rotation.y + rotation.x * rotation.z),
                1 - 2 * (rotation.y * rotation.y + rotation.z * rotation.z)
            )

            return {
                position: new Vector3(position.x, position.y, position.z),
                heading,
            }
        }

        // Fallback to state variables if physics body not available
        return {
            position: carPosition,
            heading: carHeading,
        }
    }

    const realTimeCarData = getRealTimeCarData()
    const currentSensorReadings = createSensorReadings(
        realTimeCarData.position,
        realTimeCarData.heading,
        track.walls,
        DEFAULT_SENSOR_CONFIG,
    )
    return (
        <BaseCar3D
            ref={carRef}
            car={carData}
            modelPath={
                isEliminated && isTraining
                    ? CAR_MODELS.eliminated
                    : CAR_MODELS.default
            }
            onCollision={handleCollision}
            physics={{
                mass: 1.0,
                friction: 1.5,
                restitution: 0.1,
                angularDamping: CAR_PHYSICS_CONFIG.angularDamping,
                linearDamping: CAR_PHYSICS_CONFIG.linearDamping,
            }}
        >
            <SensorVisualization
                carPosition={realTimeCarData.position}
                carRotation={realTimeCarData.heading}
                sensorReadings={currentSensorReadings}
                config={DEFAULT_SENSOR_CONFIG}
                visualConfig={{ centerOffset: SENSOR_CENTER_OFFSET }}
                showCollisions={showCollisions}
                visible={true}
            />

            {showCollisions && (
                <mesh position={[-0.5, 0.2, -1]}>
                    <boxGeometry args={[1, 0.4, 2]} />
                    <meshBasicMaterial
                        color={carData.color || 'blue'}
                        wireframe
                        transparent
                        opacity={0.5}
                    />
                </mesh>
            )}

            {/* Debug indicator for manual control */}
            {carData.id === 'ai-1' && globalKeyboardInput.isActive() && (
                <mesh position={[0, 2, 0]}>
                    <sphereGeometry args={[0.3]} />
                    <meshBasicMaterial
                        color="#00ff00"
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            )}
        </BaseCar3D>
    )
}
