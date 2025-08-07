import { useMemo } from 'react'
import { Vector3 } from 'three'
import type { SensorReading, SensorConfig, SensorVisualizationConfig } from '../types'

interface SensorVisualizationProps {
    carPosition: Vector3
    carRotation: number
    sensorReadings: SensorReading
    config: SensorConfig
    visualConfig?: Partial<SensorVisualizationConfig>
    visible?: boolean
}

// default visualization configuration
const DEFAULT_VISUAL_CONFIG: SensorVisualizationConfig = {
    centerOffset: { x: 0, y: 0.2, z: 1 },
    colors: {
        noObstacle: '#00ff00',
        obstacle: '#ff0000'
    }
}

// visual representation of car sensors for debugging and display
export default function SensorVisualization({
    carPosition,
    carRotation,
    sensorReadings,
    config,
    visualConfig = {},
    visible = true
}: SensorVisualizationProps) {
    const finalVisualConfig = { ...DEFAULT_VISUAL_CONFIG, ...visualConfig }

    // calculate sensor line positions and colors
    const sensorLines = useMemo(() => {
        if (!visible) return []

        const sensors = [
            { reading: sensorReadings.left, angle: config.angles.left, key: 'left' },
            { reading: sensorReadings.leftCenter, angle: config.angles.leftCenter, key: 'leftCenter' },
            { reading: sensorReadings.center, angle: config.angles.center, key: 'center' },
            { reading: sensorReadings.rightCenter, angle: config.angles.rightCenter, key: 'rightCenter' },
            { reading: sensorReadings.right, angle: config.angles.right, key: 'right' }
        ]

        return sensors.map(sensor => {
            const angleRad = (sensor.angle * Math.PI) / 180
            const totalAngle = carRotation + angleRad
            
            // calculate sensor start position (offset from car center)
            const startX = carPosition.x + Math.sin(carRotation) * finalVisualConfig.centerOffset.z
            const startY = carPosition.y + finalVisualConfig.centerOffset.y
            const startZ = carPosition.z + Math.cos(carRotation) * finalVisualConfig.centerOffset.z
            
            // calculate sensor end position based on reading
            const actualDistance = sensor.reading * config.maxDistance
            const endX = startX + Math.sin(totalAngle) * actualDistance
            const endY = startY
            const endZ = startZ + Math.cos(totalAngle) * actualDistance
            
            // determine color based on obstacle detection
            const hasObstacle = sensor.reading < 0.8
            const color = hasObstacle ? finalVisualConfig.colors.obstacle : finalVisualConfig.colors.noObstacle
            
            return {
                key: sensor.key,
                start: [startX, startY, startZ] as [number, number, number],
                end: [endX, endY, endZ] as [number, number, number],
                color,
                opacity: hasObstacle ? 0.8 : 0.4
            }
        })
    }, [carPosition, carRotation, sensorReadings, config, finalVisualConfig, visible])

    if (!visible) return null

    return (
        <group>
            {sensorLines.map(line => (
                <group key={line.key}>
                    {/* sensor line */}
                    <mesh position={[
                        (line.start[0] + line.end[0]) / 2,
                        (line.start[1] + line.end[1]) / 2,
                        (line.start[2] + line.end[2]) / 2
                    ]}>
                        <cylinderGeometry args={[0.02, 0.02, Math.sqrt(
                            Math.pow(line.end[0] - line.start[0], 2) +
                            Math.pow(line.end[1] - line.start[1], 2) +
                            Math.pow(line.end[2] - line.start[2], 2)
                        )]} />
                        <meshBasicMaterial
                            color={line.color}
                            transparent
                            opacity={line.opacity}
                        />
                    </mesh>

                    {/* sensor endpoint indicator */}
                    <mesh position={line.end}>
                        <sphereGeometry args={[0.1]} />
                        <meshBasicMaterial
                            color={line.color}
                            transparent
                            opacity={line.opacity}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    )
}
