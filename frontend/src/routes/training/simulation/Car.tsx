import { useGLTF } from '@react-three/drei'
import type { JSX } from 'react'
import { useEffect, useRef } from 'react'
import { useCanvasSettings } from '../../../lib/contexts/useCanvasSettings'
import { RigidBody } from '@react-three/rapier'
import { useCar } from '../../../lib/contexts/CarContext'
import { useRaceReset } from '../../../lib/contexts/RaceResetContext'

const CAR_MODEL_PATH = '/src/assets/models/raceCarRed.glb'

export default function Car(): JSX.Element {
    const { position } = useCar()
    const { scene } = useGLTF(CAR_MODEL_PATH)
    const { showCollisions } = useCanvasSettings()
    const { resetCounter } = useRaceReset()
    type CarKey = 'w' | 'a' | 's' | 'd'
    const keys = useRef<Record<CarKey, boolean>>({
        w: false,
        s: false,
        a: false,
        d: false,
    })
    const rigidBody = useRef<any>(null) 

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

    useEffect(() => {
        const rb = rigidBody.current
        if (rb) {
            rb.setTranslation(position, true)
            rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
            rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
            rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
        }
    }, [resetCounter, position])

    useEffect(() => {
        let frame: number
        function animate() {
            const rb = rigidBody.current
            if (rb) {
                const rotation = rb.rotation()
                const vel = rb.linvel()
                const angularVel = rb.angvel()
                
                const heading = Math.atan2(
                    2 * (rotation.w * rotation.y + rotation.x * rotation.z),
                    1 - 2 * (rotation.y * rotation.y + rotation.z * rotation.z)
                )
                
                const maxSpeed = 8
                const accel = 0.5
                const maxTurnSpeed = 2
                const turnDamping = 0.9
                
                if (keys.current.w) {
                    rb.applyImpulse(
                        {
                            x: Math.sin(heading) * accel,
                            y: 0,
                            z: Math.cos(heading) * accel,
                        },
                        true
                    )
                }
                if (keys.current.s) {
                    rb.applyImpulse(
                        {
                            x: -Math.sin(heading) * accel * 0.7, 
                            y: 0,
                            z: -Math.cos(heading) * accel * 0.7,
                        },
                        true
                    )
                }
                
                const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z)
                const speedFactor = Math.min(speed / 3, 1)
                
                if (keys.current.a && speed > 0.1) {
                    if (Math.abs(angularVel.y) < maxTurnSpeed) {
                        rb.applyTorqueImpulse({ x: 0, y: speedFactor * 0.3, z: 0 }, true)
                    }
                }
                if (keys.current.d && speed > 0.1) {
                    if (Math.abs(angularVel.y) < maxTurnSpeed) {
                        rb.applyTorqueImpulse({ x: 0, y: -speedFactor * 0.3, z: 0 }, true)
                    }
                }
                
                if (!keys.current.a && !keys.current.d) {
                    rb.setAngvel({
                        x: angularVel.x * turnDamping,
                        y: angularVel.y * turnDamping,
                        z: angularVel.z * turnDamping
                    }, true)
                }
                
                if (speed > maxSpeed) {
                    const scale = maxSpeed / speed
                    rb.setLinvel(
                        { x: vel.x * scale, y: vel.y, z: vel.z * scale },
                        true
                    )
                }
            }
            frame = requestAnimationFrame(animate)
        }
        frame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(frame)
    }, [])   
    return (
        <RigidBody
            ref={rigidBody}
            colliders="cuboid"
            position={position}
            angularDamping={2}
            linearDamping={0.7}
        >
            <group>
                <primitive object={scene} scale={1.5} />
                {showCollisions && (
                    <mesh position={[-0.5, 0.2, -1]}>
                        <boxGeometry args={[1, 0.4, 2]} />
                        <meshBasicMaterial
                            color="red"
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
