import { useGLTF } from '@react-three/drei'
import { RigidBody, interactionGroups } from '@react-three/rapier'
import type { JSX } from 'react'
import type { TrackPiece } from '../types/index'
import { ROAD_GEOMETRY } from '../systems/TrackSystem'

interface Track3DProps {
    pieces: TrackPiece[]
    visible?: boolean
}

// individual track piece component with physics collision
function TrackPieceComponent({ piece }: { piece: TrackPiece }): JSX.Element {
    if (piece.model === 'road_segment') {
        return (
            <RigidBody 
                type="fixed" 
                colliders="cuboid"
                restitution={0}
                friction={3.0}
                collisionGroups={interactionGroups(2, [1])}     // track in group 2, collides with cars (group 1)
                solverGroups={interactionGroups(2, [1])}        // physics interaction groups
            >
                <mesh 
                    position={piece.position}
                    rotation={piece.rotation}
                >
                    <boxGeometry args={[ROAD_GEOMETRY.width, ROAD_GEOMETRY.height, ROAD_GEOMETRY.length]} />
                    <meshStandardMaterial color="#444444" />
                </mesh>
            </RigidBody>
        )
    }
    
    // for custom 3d models (future expansion)
    const { scene } = useGLTF(`/assets/models/${piece.model}`)
    return (
        <RigidBody type="fixed" colliders="trimesh">
            <primitive
                object={scene.clone()}
                position={piece.position}
                rotation={piece.rotation}
                scale={1}
            />
        </RigidBody>
    )
}

// main track 3d component - renders all track pieces with physics
export default function Track3D({ pieces, visible = true }: Track3DProps): JSX.Element {
    if (!visible) return <></>
    
    return (
        <>
            {pieces.map((piece, index) => (
                <TrackPieceComponent key={`track-piece-${index}`} piece={piece} />
            ))}
        </>
    )
}
