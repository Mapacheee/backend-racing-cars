import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import type { JSX } from 'react'
import type { TrackPiece } from './TrackSystem'
import { ROAD_GEOMETRY } from './TrackSystem'

interface Track3DProps {
    pieces: TrackPiece[]
}

function TrackPieceComponent({ piece }: { piece: TrackPiece }): JSX.Element {
    if (piece.model === 'road_segment') {
        return (
            <RigidBody 
                type="fixed" 
                colliders="cuboid"
                collisionGroups={0x00010002} 
                solverGroups={0x00010002}
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
    const { scene } = useGLTF(`/src/assets/models/${piece.model}`)
    
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

export default function Track3D({ pieces }: Track3DProps): JSX.Element {
    return (
        <>
            {pieces.map((piece, index) => (
                <TrackPieceComponent key={index} piece={piece} />
            ))}
        </>
    )
}
