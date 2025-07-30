import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import type { JSX } from 'react'
import type { TrackPiece } from './TrackSystem'

interface Track3DProps {
    pieces: TrackPiece[]
}

function TrackPieceComponent({ piece }: { piece: TrackPiece }): JSX.Element {
    if (piece.model === 'road_segment') {
        return (
            <mesh 
                position={piece.position}
                rotation={piece.rotation}
            >
                <boxGeometry args={[3, 0.2, 4]} /> {/* ancho, alto, largo de la carretra*/}
                <meshStandardMaterial color="#444444" />
            </mesh>
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
