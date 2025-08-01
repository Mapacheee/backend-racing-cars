import { useGLTF } from '@react-three/drei'
import type { JSX } from 'react'
import { useRef, useEffect, useState } from 'react'
import { Vector3 } from 'three'
import { useCanvasSettings } from '../../../lib/contexts/useCanvasSettings'
import { RigidBody } from '@react-three/rapier'
import { TRACKS } from './TrackSystem'
import { createSensorReadings, DEFAULT_SENSOR_CONFIG, type SensorReading } from './CarSensors'

const CAR_MODEL_PATH = '/src/assets/models/raceCarRed.glb'

interface AICar {
    id: string
    position: [number, number, number]
    color?: string
    trackId?: string
}

interface AICarProps {
    carData: AICar
}

export default function AICar({ carData }: AICarProps): JSX.Element {
    const { scene } = useGLTF(CAR_MODEL_PATH)
    const { showCollisions } = useCanvasSettings()
    const rigidBody = useRef<any>(null)
    const [sensorReadings, setSensorReadings] = useState<SensorReading>({
        left: 1,
        leftCenter: 1,
        center: 1,
        rightCenter: 1,
        right: 1
    })

    const track = TRACKS[carData.trackId || 'main_circuit']

    useEffect(() => {
        let frame: number
        
        function updateSensors() {
            const rb = rigidBody.current
            if (rb && track) {
                const position = rb.translation()
                const rotation = rb.rotation()
                
                const heading = Math.atan2(
                    2 * (rotation.w * rotation.y + rotation.x * rotation.z),
                    1 - 2 * (rotation.y * rotation.y + rotation.z * rotation.z)
                )
                const centerOffsetX = -0.5
                const centerOffsetZ = -1
                const realCenterX = position.x + Math.sin(heading) * centerOffsetZ + Math.cos(heading) * centerOffsetX
                const realCenterZ = position.z + Math.cos(heading) * centerOffsetZ - Math.sin(heading) * centerOffsetX
                
                const carPosition = new Vector3(realCenterX, position.y, realCenterZ)
                const readings = createSensorReadings(carPosition, heading, track.walls, DEFAULT_SENSOR_CONFIG)
                setSensorReadings(readings)
            }
            
            frame = requestAnimationFrame(updateSensors)
        }
        
        frame = requestAnimationFrame(updateSensors)
        return () => cancelAnimationFrame(frame)
    }, [track])

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

    // TODO: logica IA acá

    return (
        <>
            <RigidBody
                ref={rigidBody}
                colliders="cuboid"
                position={carData.position}
                angularDamping={2}
                linearDamping={0.7}
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
