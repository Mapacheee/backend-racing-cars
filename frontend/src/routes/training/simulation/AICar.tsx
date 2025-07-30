import { useGLTF } from '@react-three/drei'
import type { JSX } from 'react'
import { useRef } from 'react'
import { useCanvasSettings } from '../../../lib/contexts/useCanvasSettings'
import { RigidBody } from '@react-three/rapier'

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

    // TODO: logica IA acá

    return (
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
            </group>
        </RigidBody>
    )
}
