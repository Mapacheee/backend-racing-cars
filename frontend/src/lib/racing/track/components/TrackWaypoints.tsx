import { Text } from '@react-three/drei'
import type { Waypoint } from '../types/index'

interface TrackWaypointsProps {
    waypoints: Waypoint[]
    visible?: boolean
    editMode?: boolean
    onWaypointClick?: (index: number, event: any) => void
    highlightedIndex?: number
    startPointColor?: string
    waypointColor?: string
    highlightColor?: string
}

// visual waypoint markers for track editing and navigation
export default function TrackWaypoints({
    waypoints,
    visible = true,
    editMode = false,
    onWaypointClick,
    highlightedIndex = -1,
    startPointColor = 'green',
    waypointColor = 'red',
    highlightColor = 'cyan'
}: TrackWaypointsProps) {
    if (!visible) return <></>

    return (
        <>
            {waypoints.map((waypoint, index) => {
                const nextIndex = (index + 1) % waypoints.length
                const nextWaypoint = waypoints[nextIndex]
                const isStartPoint = index === 0
                const isHighlighted = highlightedIndex === index

                // determine waypoint color based on state
                const getWaypointColor = () => {
                    if (isStartPoint) return startPointColor
                    if (isHighlighted) return highlightColor
                    if (editMode) return 'orange'
                    return waypointColor
                }

                return (
                    <group key={`waypoint-${index}`}>
                        {/* waypoint sphere marker */}
                        <mesh
                            position={[waypoint.x, 0.3, waypoint.z]}
                            {...(editMode && onWaypointClick && {
                                onClick: (e: any) => {
                                    e.stopPropagation()
                                    onWaypointClick(index, e)
                                }
                            })}
                        >
                            <sphereGeometry args={[editMode ? 0.5 : 0.3]} />
                            <meshStandardMaterial
                                color={getWaypointColor()}
                                transparent={editMode}
                                opacity={isHighlighted ? 1 : editMode ? 0.8 : 1}
                            />
                        </mesh>

                        {/* waypoint number label in edit mode */}
                        {editMode && (
                            <Text
                                position={[waypoint.x, 0.8, waypoint.z]}
                                fontSize={0.4}
                                color="black"
                                anchorX="center"
                                anchorY="middle"
                                rotation={[-Math.PI / 2, 0, 0]}
                            >
                                {(index + 1).toString()}
                            </Text>
                        )}

                        {/* connection line to next waypoint */}
                        <mesh
                            position={[
                                (waypoint.x + nextWaypoint.x) / 2,
                                0.05,
                                (waypoint.z + nextWaypoint.z) / 2,
                            ]}
                            rotation={[
                                0,
                                Math.atan2(
                                    nextWaypoint.x - waypoint.x,
                                    nextWaypoint.z - waypoint.z
                                ),
                                0,
                            ]}
                        >
                            <boxGeometry
                                args={[
                                    0.5,
                                    0.1,
                                    Math.sqrt(
                                        (nextWaypoint.x - waypoint.x) ** 2 +
                                        (nextWaypoint.z - waypoint.z) ** 2
                                    ),
                                ]}
                            />
                            <meshStandardMaterial
                                color="gray"
                                transparent
                                opacity={0.6}
                            />
                        </mesh>
                    </group>
                )
            })}
        </>
    )
}
