import { RigidBody, interactionGroups } from '@react-three/rapier'
import type { Wall } from '../systems/TrackSystem'

interface TrackWallsProps {
    walls: Wall[]
    visible?: boolean
}

export default function TrackWalls({ walls, visible = true }: TrackWallsProps) {
    return (
        <>
            {walls.map((wall, index) => {
                const centerX = (wall.start.x + wall.end.x) / 2
                const centerZ = (wall.start.z + wall.end.z) / 2
                const dx = wall.end.x - wall.start.x
                const dz = wall.end.z - wall.start.z
                const length = Math.sqrt(dx * dx + dz * dz)
                const rotation = Math.atan2(dx, dz)
                
                return (
                    <RigidBody 
                        key={`wall-${index}`} 
                        type="fixed" 
                        colliders="cuboid"
                        userData={{ type: 'wall' }}
                        restitution={0.1}
                        friction={2.0}
                        collisionGroups={interactionGroups(2, [1])}     // Walls in group 2, collide with group 1 (cars)
                        solverGroups={interactionGroups(2, [1])}      // Same groups for force calculation
                    >
                        {visible && (
                            <mesh 
                                position={[centerX, 0.25, centerZ]}
                                rotation={[0, rotation, 0]}
                            >
                                <boxGeometry args={[0.2, 0.5, length]} />
                                <meshBasicMaterial 
                                    color={wall.side === 'left' ? 'red' : 'blue'} 
                                    transparent 
                                    opacity={0.7} 
                                />
                            </mesh>
                        )}
                    </RigidBody>
                )
            })}
        </>
    )
}
