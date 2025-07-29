import { Suspense } from 'react'
import type { JSX } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Physics, useBox } from '@react-three/cannon'
import Car from './Car'

function Ground() {
    const [ref] = useBox(() => ({
        args: [40, 1, 40],
        position: [0, -0.5, 0],
        type: 'Static',
    }))
    return (
        <mesh ref={ref} receiveShadow>
            <boxGeometry args={[40, 1, 40]} />
            <meshStandardMaterial color="white" />
        </mesh>
    )
}

export default function CarScene(): JSX.Element {
    return (
        <Physics gravity={[0, -9.81, 0]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 7]} intensity={1} />
            <Ground />
            <Suspense fallback={null}>
                <Car />
            </Suspense>
            <OrbitControls enablePan enableZoom enableRotate />
        </Physics>
    )
}
