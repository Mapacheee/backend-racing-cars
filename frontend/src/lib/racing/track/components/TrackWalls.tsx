import { RigidBody, interactionGroups } from '@react-three/rapier'
import type { Wall } from '../types/index'

interface TrackWallsProps {
    walls: Wall[]
    visible?: boolean
    showColors?: boolean
}

// track boundary walls component with collision physics
export default function TrackWalls({ walls, visible = true, showColors = true }: TrackWallsProps) {
    if (!visible) return <></>
    
    return (
        <>
            {walls.map((wall, index) => {
                // calculate wall position and rotation from start/end points
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
                        userData={{ type: 'wall', side: wall.side }}
                        restitution={0.1}
                        friction={2.0}
                        collisionGroups={interactionGroups(2, [1])}     // walls in group 2, collide with cars (group 1)
                        solverGroups={interactionGroups(2, [1])}        // physics interaction groups
                    >
                        <mesh 
                            position={[centerX, 0.25, centerZ]}
                            rotation={[0, rotation, 0]}
                        >
                            <boxGeometry args={[0.2, 0.5, length]} />
                            <meshBasicMaterial 
                                color={showColors ? (wall.side === 'left' ? 'red' : 'blue') : 'gray'} 
                                transparent 
                                opacity={0.7} 
                            />
                        </mesh>
                    </RigidBody>
                )
            })}
        </>
    )
}
