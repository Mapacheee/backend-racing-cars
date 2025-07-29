import { useGLTF } from '@react-three/drei'
import type { JSX } from 'react'
import { useEffect, useRef } from 'react'
import { useCanvasSettings } from '../../../lib/contexts/CanvasSettings'
import { useBox } from '@react-three/cannon'
import { useCar } from '../../../lib/contexts/CarContext'

// Adjust the path to your actual car model .glb file
const CAR_MODEL_PATH = '/src/assets/models/raceCarRed.glb'

// CarModel is now prop-ready for future extensibility
// No props needed, use context
// CarModel is now prop-ready for future extensibility
// No props needed, use context
export default function Car(): JSX.Element {
    const { position } = useCar() // Only use for initial spawn
    const { scene } = useGLTF(CAR_MODEL_PATH)
    const { showCollisions } = useCanvasSettings()

    // Cannon.js car body
    const [ref, api] = useBox(() => ({
        mass: 1,
        position,
        args: [1, 0.5, 2.7],
        angularDamping: 2,
        linearDamping: 0.7,
    }))

    // Natural car movement: use physics
    type CarKey = 'w' | 'a' | 's' | 'd'
    const keys = useRef<Record<CarKey, boolean>>({
        w: false,
        s: false,
        a: false,
        d: false,
    })

    // Keyboard event listeners
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const key = e.key.toLowerCase() as CarKey
            if (key in keys.current) keys.current[key] = true
        }
        function handleKeyUp(e: KeyboardEvent) {
            const key = e.key.toLowerCase() as CarKey
            if (key in keys.current) keys.current[key] = false
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    // Physics-based car movement
    useEffect(() => {
        let frame: number
        function animate() {
            api.rotation.subscribe(([, y]) => {
                const heading = y
                const maxSpeed = 6
                const accel = 2
                const turnSpeed = 1.5 // radians/sec
                api.velocity.subscribe(([vx, , vz]) => {
                    const speed = Math.sqrt(vx * vx + vz * vz)
                    // Forward/backward
                    if (keys.current.w) {
                        api.applyImpulse(
                            [
                                Math.sin(heading) * accel,
                                0,
                                Math.cos(heading) * accel,
                            ],
                            true
                        )
                    }
                    if (keys.current.s) {
                        api.applyImpulse(
                            [
                                -Math.sin(heading) * accel,
                                0,
                                -Math.cos(heading) * accel,
                            ],
                            true
                        )
                    }
                    // Steering (A/D): apply torque
                    if (keys.current.a) {
                        api.applyTorque([0, turnSpeed, 0], true)
                    }
                    if (keys.current.d) {
                        api.applyTorque([0, -turnSpeed, 0], true)
                    }
                    // Clamp speed
                    if (speed > maxSpeed) {
                        const scale = maxSpeed / speed
                        api.velocity.set([vx * scale, 0, vz * scale])
                    }
                })
            })
            frame = requestAnimationFrame(animate)
        }
        frame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(frame)
    }, [api])

    // Only set initial position
    return (
        <group ref={ref}>
            <primitive object={scene} scale={1.5} />
            {showCollisions && (
                <mesh position={[-0.5, 0.2, -1]}>
                    <boxGeometry args={[1, 0.4, 2.7]} />
                    <meshBasicMaterial
                        color="red"
                        wireframe
                        transparent
                        opacity={0.5}
                    />
                </mesh>
            )}
        </group>
    )
}
