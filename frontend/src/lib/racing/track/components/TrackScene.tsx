import { Physics, RigidBody, interactionGroups } from '@react-three/rapier'
import { OrbitControls } from '@react-three/drei'
import type { ReactNode } from 'react'
import type { Track, TrackViewSettings } from '../types/index'
import Track3D from './Track3D'
import TrackWalls from './TrackWalls'
import TrackWaypoints from './TrackWaypoints'

interface TrackSceneProps {
    track: Track
    settings: TrackViewSettings
    onGroundClick?: (event: any) => void
    onWaypointClick?: (index: number, event: any) => void
    highlightedWaypoint?: number
    children?: ReactNode
    enablePhysics?: boolean
    enableControls?: boolean
}

// main track scene component combining all track elements
export default function TrackScene({
    track,
    settings,
    onGroundClick,
    onWaypointClick,
    highlightedWaypoint = -1,
    children,
    enablePhysics = true,
    enableControls = true
}: TrackSceneProps) {
    const sceneContent = (
        <>
            {/* lighting setup */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 7]} intensity={1} />

            {/* ground plane with physics */}
            <RigidBody
                type="fixed"
                colliders="cuboid"
                restitution={0}
                friction={5.0}
                collisionGroups={interactionGroups(2, [1])}
                solverGroups={interactionGroups(2, [1])}
            >
                <mesh
                    position={[0, -0.8, 0]}
                    receiveShadow
                    {...(settings.editMode && onGroundClick && { onClick: onGroundClick })}
                >
                    <boxGeometry args={[200, 0.2, 200]} />
                    <meshStandardMaterial
                        color={
                            settings.editMode
                                ? 'lightblue'
                                : 'lightgreen'
                        }
                        transparent={settings.editMode}
                        opacity={settings.editMode ? 0.7 : 1}
                    />
                </mesh>
            </RigidBody>

            {/* track components */}
            <Track3D pieces={track.pieces} visible={settings.showTrack} />
            <TrackWalls walls={track.walls} visible={settings.showWalls} />
            <TrackWaypoints
                waypoints={track.waypoints}
                visible={settings.showWaypoints}
                editMode={settings.editMode}
                {...(onWaypointClick && { onWaypointClick })}
                highlightedIndex={highlightedWaypoint}
            />

            {/* custom children (cars, UI, etc) */}
            {children}

            {/* camera controls */}
            {enableControls && <OrbitControls enablePan enableZoom enableRotate />}
        </>
    )

    // wrap in physics world if enabled
    if (enablePhysics) {
        return (
            <Physics gravity={[0, -9.81, 0]} paused={false}>
                {sceneContent}
            </Physics>
        )
    }

    return <>{sceneContent}</>
}
