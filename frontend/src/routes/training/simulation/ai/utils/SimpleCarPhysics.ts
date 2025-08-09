/**
 * Simexport class SimpleCarPhysics {
    // Physics constants - tuned to overcome ground friction
    private static readonly MAX_SPEED = 25.0
    private static readonly ACCELERATION = 20.0  // High acceleration to overcome friction
    private static readonly DECELERATION = 10.0
    private static readonly TURN_SPEED = 4.0
    private static readonly MIN_TURN_SPEED = 0.5  // Allow turning at very low speeds reliable car physics system
 * Supports both AI and manual control with the same physics
 */

export interface CarControls {
    throttle: number // -1 to 1 (negative = reverse)
    steering: number // -1 to 1 (negative = left, positive = right)
}

export class SimpleCarPhysics {
    // Physics constants - tuned for fun arcade feel
    private static readonly MAX_SPEED = 20.0
    private static readonly ACCELERATION = 3.0
    private static readonly DECELERATION = 8.0
    private static readonly TURN_SPEED = 3.0
    private static readonly MIN_TURN_SPEED = 2.0 // Minimum speed to turn effectively

    /**
     * Apply simple car physics to a rigid body
     * Works for both AI and manual control
     */
    static updateCarPhysics(
        rigidBody: any,
        controls: CarControls,
        deltaTime: number = 1 / 60
    ): void {
        if (!rigidBody) {
            console.warn('SimpleCarPhysics: No rigid body provided')
            return
        }

        // Get current state
        const position = rigidBody.translation()
        const rotation = rigidBody.rotation()
        const velocity = rigidBody.linvel()

        // Emergency reset if car falls through ground
        if (position.y < -5) {
            console.log('🚨 Car fell through ground! Resetting...')
            rigidBody.setTranslation(
                { x: position.x, y: 1.0, z: position.z },
                true
            )
            rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true)
            rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true)
            return
        }

        // Get car's forward direction from rotation
        const forward = this.getForwardDirection(rotation)
        const right = { x: forward.z, z: -forward.x } // Perpendicular to forward

        // Calculate current speeds
        const currentSpeed = this.getForwardSpeed(velocity, forward)
        const sidewaysSpeed = velocity.x * right.x + velocity.z * right.z

        // === ACCELERATION CONTROL ===
        let targetSpeed = currentSpeed
        const { throttle, steering } = controls

        if (Math.abs(throttle) > 0.1) {
            if (throttle > 0) {
                // Forward acceleration
                targetSpeed = Math.min(
                    currentSpeed + this.ACCELERATION * throttle * deltaTime,
                    this.MAX_SPEED
                )
            } else {
                // Braking or reverse
                if (currentSpeed > 0) {
                    // Braking
                    targetSpeed = Math.max(
                        currentSpeed + this.DECELERATION * throttle * deltaTime,
                        0
                    )
                } else {
                    // Reverse
                    targetSpeed = Math.max(
                        currentSpeed + this.ACCELERATION * throttle * deltaTime,
                        -this.MAX_SPEED * 0.6 // Reverse is slower
                    )
                }
            }
        } else {
            // Natural deceleration when no throttle
            const deceleration =
                currentSpeed > 0
                    ? -this.DECELERATION * 0.3
                    : this.DECELERATION * 0.3
            targetSpeed = currentSpeed + deceleration * deltaTime

            // Stop very slow movement
            if (Math.abs(targetSpeed) < 0.5) {
                targetSpeed = 0
            }
        }

        // === STEERING CONTROL ===
        let angularVelocity = 0

        if (
            Math.abs(steering) > 0.1 &&
            Math.abs(currentSpeed) > this.MIN_TURN_SPEED
        ) {
            // Turn based on speed and steering input
            const speedFactor = Math.min(Math.abs(currentSpeed) / 10.0, 1.0)
            angularVelocity = steering * this.TURN_SPEED * speedFactor

            // Reverse steering when going backwards
            if (currentSpeed < 0) {
                angularVelocity *= -1
            }
        }

        // === APPLY PHYSICS ===
        // Calculate new velocity (forward speed + reduced sideways sliding)
        const newVelocity = {
            x: forward.x * targetSpeed + right.x * sidewaysSpeed * 0.1, // Reduce sliding
            y: velocity.y, // Keep gravity
            z: forward.z * targetSpeed + right.z * sidewaysSpeed * 0.1,
        }

        // Debug: Check if rigid body methods exist
        if (Math.random() < 0.05) {
            console.log('🔧 Physics Debug - Rigid Body Check:', {
                rigidBodyExists: !!rigidBody,
                hasSetLinvel: !!(rigidBody && rigidBody.setLinvel),
                hasSetAngvel: !!(rigidBody && rigidBody.setAngvel),
                currentVel: rigidBody
                    ? {
                          x: velocity.x.toFixed(3),
                          z: velocity.z.toFixed(3),
                      }
                    : 'no-rb',
                newVel: {
                    x: newVelocity.x.toFixed(3),
                    z: newVelocity.z.toFixed(3),
                },
                forward: {
                    x: forward.x.toFixed(3),
                    z: forward.z.toFixed(3),
                },
                targetSpeed: targetSpeed.toFixed(3),
            })
        }

        // Apply to rigid body - Use force-based approach for better ground interaction
        try {
            // Apply force instead of directly setting velocity for better physics
            const currentVel = rigidBody.linvel()
            const forceMagnitude = 5.0 // Force strength

            // Calculate force needed to reach target velocity
            const forceX = (newVelocity.x - currentVel.x) * forceMagnitude
            const forceZ = (newVelocity.z - currentVel.z) * forceMagnitude

            // Apply force at car's center of mass
            rigidBody.addForce({ x: forceX, y: 0, z: forceZ }, true)

            // Still set angular velocity directly for responsive steering
            rigidBody.setAngvel({ x: 0, y: angularVelocity, z: 0 }, true)

            // Verify the force was applied
            if (Math.random() < 0.03) {
                const afterVel = rigidBody.linvel()
                console.log('🔧 Force Applied - Verification:', {
                    forceApplied: {
                        x: forceX.toFixed(3),
                        z: forceZ.toFixed(3),
                    },
                    velocityBefore: {
                        x: currentVel.x.toFixed(3),
                        z: currentVel.z.toFixed(3),
                    },
                    velocityAfter: {
                        x: afterVel.x.toFixed(3),
                        z: afterVel.z.toFixed(3),
                    },
                    velocityChange: {
                        x: (afterVel.x - currentVel.x).toFixed(3),
                        z: (afterVel.z - currentVel.z).toFixed(3),
                    },
                })
            }
        } catch (error) {
            console.error('🚨 Error applying physics to rigid body:', error)
        } // Debug logging (very rare)
        if (Math.random() < 0.002) {
            console.log('🚗 Car Physics:', {
                throttle: throttle.toFixed(2),
                steering: steering.toFixed(2),
                currentSpeed: currentSpeed.toFixed(2),
                targetSpeed: targetSpeed.toFixed(2),
                angularVel: angularVelocity.toFixed(2),
            })
        }
    }

    /**
     * Get forward direction vector from quaternion rotation
     * Using a simple and reliable method
     */
    private static getForwardDirection(rotation: any): {
        x: number
        z: number
    } {
        // Convert quaternion to Y-axis rotation angle (simpler and more reliable)
        const { x, y, z, w } = rotation

        // Extract Y-axis rotation from quaternion
        const yAngle = Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + z * z))

        // Calculate forward direction based on Y rotation
        // Fix: Corrected forward direction for proper W=forward, S=backward
        return {
            x: Math.sin(yAngle), // Positive sin for correct X direction
            z: Math.cos(yAngle), // Positive cos for correct Z direction
        }
    }

    /**
     * Calculate forward speed (speed in the direction the car is facing)
     */
    private static getForwardSpeed(
        velocity: any,
        forward: { x: number; z: number }
    ): number {
        return velocity.x * forward.x + velocity.z * forward.z
    }

    /**
     * Get speed magnitude
     */
    static getSpeedMagnitude(velocity: any): number {
        return Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
    }
}
