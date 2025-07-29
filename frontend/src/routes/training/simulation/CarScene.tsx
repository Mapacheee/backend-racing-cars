import { Suspense } from 'react'
import type { JSX } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import Car from './Car'

// CarScene contains the 3D scene logic
export default function CarScene(): JSX.Element {
    return (
        <Physics gravity={[0, -9.81, 0]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 7]} intensity={1} />
            {/* Physics ground */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -0.5, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[40, 40]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </RigidBody>
            <Suspense fallback={null}>
                <Car />
            </Suspense>
            <OrbitControls enablePan enableZoom enableRotate />
        </Physics>
    )
}
