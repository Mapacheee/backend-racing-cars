import { Suspense, useState } from 'react'
import type { JSX } from 'react'
import { OrbitControls, Text } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import Car from './Car'
import AICar from './AICar'
import Track3D from './Track3D'
import { TRACKS, addWaypoint, reorderWaypoints, moveWaypoint } from './TrackSystem'
import { useCanvasSettings } from '../../../lib/contexts/useCanvasSettings'
import { useRaceReset } from '../../../lib/contexts/RaceResetContext'
import { useWaypointModal } from './WaypointModalContext'

export default function CarScene(): JSX.Element {
    const { showWaypoints, editMode } = useCanvasSettings()
    const { triggerReset } = useRaceReset()
    const { modalState, openModal, closeModal } = useWaypointModal()
    const [, forceUpdate] = useState({})

    const currentTrack = 'main_circuit'
    const track = TRACKS[currentTrack]
    const refreshTrack = () => {
        forceUpdate({})
        triggerReset() 
    }

    const handleGroundClick = (event: any) => {
        if (!editMode) return
        
        if (modalState.isOpen) {
            closeModal()
            return
        }
        
        if (modalState.mode === 'move' && modalState.waypointIndex >= 0) {
            const [x, , z] = event.point
            moveWaypoint(currentTrack, modalState.waypointIndex, x, z)
            refreshTrack()
            closeModal()
        } 
        else {
            const [x, , z] = event.point
            addWaypoint(currentTrack, x, z)
            refreshTrack()
        }
    }

    const handleWaypointClick = (event: any, index: number) => {
        if (!editMode) return
        event.stopPropagation()
        
        if (modalState.mode === 'swap' && modalState.waypointIndex >= 0 && modalState.waypointIndex !== index) {
            reorderWaypoints(currentTrack, modalState.waypointIndex, index)
            refreshTrack()
            closeModal()
        } 
        else {
            openModal(index, { 
                x: window.innerWidth / 2, 
                y: window.innerHeight / 2 - 100
            })
        }
    }

    const aiCars = [
        { id: 'ai-1', position: [-4, 1, -2] as [number, number, number], color: 'red', trackId: currentTrack },
        { id: 'ai-2', position: [-4, 1, 2] as [number, number, number], color: 'blue', trackId: currentTrack },
        { id: 'ai-3', position: [-7, 1, -2] as [number, number, number], color: 'green', trackId: currentTrack },
        { id: 'ai-4', position: [-7, 1, 2] as [number, number, number], color: 'yellow', trackId: currentTrack },
        { id: 'ai-5', position: [-10, 1, 0] as [number, number, number], color: 'purple', trackId: currentTrack },
    ]

    const renderTrackWaypoints = () => {
        const track = TRACKS[currentTrack]
        if (!track || !showWaypoints) return null
        
        return track.waypoints.map((waypoint, index) => {
            const nextIndex = (index + 1) % track.waypoints.length
            const nextWaypoint = track.waypoints[nextIndex]
            const isStartPoint = index === 0
            const isHighlighted = modalState.mode === 'swap' && modalState.waypointIndex >= 0 && modalState.waypointIndex !== index
            
            return (
                <group key={index}>
                    <mesh 
                        position={[waypoint.x, 0.3, waypoint.z]}
                        {...(editMode && { 
                            onClick: (e) => handleWaypointClick(e, index)
                        })}
                    >
                        <sphereGeometry args={[editMode ? 0.5 : 0.3]} />
                        <meshStandardMaterial 
                            color={
                                isStartPoint ? "green" : 
                                isHighlighted ? "cyan" :
                                editMode ? "orange" : 
                                "red"
                            } 
                            transparent={editMode}
                            opacity={isHighlighted ? 1 : (editMode ? 0.8 : 1)}
                        />
                    </mesh>
                    
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
                    
                    <mesh 
                        position={[
                            (waypoint.x + nextWaypoint.x) / 2,
                            0.05,
                            (waypoint.z + nextWaypoint.z) / 2
                        ]}
                        rotation={[
                            0,
                            Math.atan2(nextWaypoint.x - waypoint.x, nextWaypoint.z - waypoint.z),
                            0
                        ]}
                    >
                        <boxGeometry args={[
                            0.5,
                            0.1,
                            Math.sqrt((nextWaypoint.x - waypoint.x) ** 2 + (nextWaypoint.z - waypoint.z) ** 2)
                        ]} />
                        <meshStandardMaterial color="gray" transparent opacity={0.6} />
                    </mesh>
                </group>
            )
        })
    }

    const renderTrack3D = () => {
        return <Track3D pieces={track.pieces} />
    }

    return (
        <Physics gravity={[0, -9.81, 0]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 7]} intensity={1} />
                
                <RigidBody type="fixed" colliders="cuboid">
                    <mesh
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, -0.5, 0]}
                        receiveShadow
                        {...(editMode && { onClick: handleGroundClick })}
                    >
                        <planeGeometry args={[80, 80]} />
                        <meshStandardMaterial 
                            color={
                                editMode ? 
                                    (modalState.mode === 'move' ? "lightcoral" : "lightblue") : 
                                    "lightgreen"
                            } 
                            transparent={editMode}
                            opacity={editMode ? 0.7 : 1}
                        />
                    </mesh>
                </RigidBody>

                {renderTrack3D()}
                {renderTrackWaypoints()}

                <Suspense fallback={null}>
                    <Car />
                </Suspense>

                {aiCars.map((carData) => (
                    <Suspense key={carData.id} fallback={null}>
                        <AICar carData={carData} />
                    </Suspense>
                ))}

                <OrbitControls enablePan enableZoom enableRotate />
            </Physics>
    )
}
