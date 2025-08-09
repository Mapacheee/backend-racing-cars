import { Vector3 } from 'three'
import type { FitnessMetrics } from '../../types/neat'
import type { Waypoint } from '../../../../../lib/racing/track'
import type { SensorReading } from '../../types/sensors'
import { TrackDistanceTracker } from './TrackDistanceTracker'

export class CarFitnessTracker {
    private metrics: FitnessMetrics
    private carId: string
    private startTime: number
    private lastProgressTime: number
    private speedSamples: number[] = []
    private sensorBonusAccumulator: number = 0
    private trackDistanceTracker: TrackDistanceTracker
    private waypointTimes: number[] = []
    private lapCompleted: boolean = false
    private currentWaypointIndex: number = 0
    private waypoints: Waypoint[]

    constructor(carId: string, startPosition: Vector3, waypoints: Waypoint[]) {
        this.carId = carId
        this.waypoints = waypoints
        this.metrics = {
            distanceTraveled: 0,
            timeAlive: 0,
            averageSpeed: 0,
            checkpointsReached: 0,
            collisions: 0,
            backwardMovement: 0,
        }

        this.startTime = Date.now()
        this.lastProgressTime = this.startTime
        this.sensorBonusAccumulator = 0
        this.trackDistanceTracker = new TrackDistanceTracker(waypoints)

        // Initialize car in distance tracker
        this.trackDistanceTracker.resetCar(this.carId, startPosition)
    }

    update(currentPosition: Vector3, velocity: Vector3): void {
        const now = Date.now()
        const deltaTime = (now - this.startTime) / 1000

        // Update time alive
        this.metrics.timeAlive = deltaTime

        // Calculate car's forward direction from velocity
        const forwardDirection =
            velocity.length() > 0.1
                ? velocity.clone().normalize()
                : this.getForwardDirectionToNextWaypoint(currentPosition)

        // Update track-based distance tracking
        const trackingResult = this.trackDistanceTracker.updateCarPosition(
            this.carId,
            currentPosition,
            forwardDirection
        )

        // Update distance metrics
        this.metrics.distanceTraveled = trackingResult.totalDistance

        // Update progress tracking - only if car is making forward progress
        if (trackingResult.distanceDelta > 0.1) {
            this.lastProgressTime = now
        }

        // Accumulate backward movement
        if (trackingResult.distanceDelta < -0.1) {
            this.metrics.backwardMovement += Math.abs(
                trackingResult.distanceDelta
            )
        }

        // Calculate current speed
        const currentSpeed = velocity.length()
        this.speedSamples.push(currentSpeed)

        // Keep only the last 60 samples (approx 1 second at 60fps)
        if (this.speedSamples.length > 60) {
            this.speedSamples.shift()
        }

        // Calculate average speed
        this.metrics.averageSpeed =
            this.speedSamples.reduce((a, b) => a + b, 0) /
            this.speedSamples.length

        // Check waypoint progress
        this.updateCheckpoints(currentPosition)

        // Debug logging (occasional)
        if (Math.random() < 0.001) {
            console.log(
                `🏁 Car ${this.carId} - Distance: ${trackingResult.totalDistance.toFixed(1)}, ` +
                    `Progress: ${(trackingResult.progress * 100).toFixed(1)}%, ` +
                    `Forward: ${trackingResult.isGoingForward}, ` +
                    `Track Distance: ${trackingResult.distanceFromTrack.toFixed(2)}`
            )
        }
    }

    /**
     * Get forward direction toward next waypoint when velocity is too low
     */
    private getForwardDirectionToNextWaypoint(
        currentPosition: Vector3
    ): Vector3 {
        const targetWaypoint = this.waypoints[this.currentWaypointIndex]

        if (targetWaypoint) {
            const direction = new Vector3(
                targetWaypoint.x - currentPosition.x,
                0,
                targetWaypoint.z - currentPosition.z
            )

            return direction.length() > 0
                ? direction.normalize()
                : new Vector3(0, 0, 1)
        }

        return new Vector3(0, 0, 1) // Default forward
    }

    recordCollision(): void {
        this.metrics.collisions++
    }

    updateSensorFitness(sensorReadings: SensorReading): void {
        const sensorSum =
            sensorReadings.left +
            sensorReadings.leftCenter +
            sensorReadings.center +
            sensorReadings.rightCenter +
            sensorReadings.right

        const sensorBonus = (sensorSum / 5) * 0.03
        this.sensorBonusAccumulator += sensorBonus

        // Bonus for keeping center sensor clear (good track following)
        if (sensorReadings.center > 0.8) {
            this.sensorBonusAccumulator += 0.02
        }

        // Bonus for all sensors showing clear path
        if (sensorSum > 4.0) {
            this.sensorBonusAccumulator += 0.01
        }
    }

    /**
     * Check waypoint progress (for checkpoint scoring)
     */
    private updateCheckpoints(position: Vector3): void {
        const currentWaypoint = this.waypoints[this.currentWaypointIndex]
        if (currentWaypoint) {
            const distance = Math.sqrt(
                Math.pow(position.x - currentWaypoint.x, 2) +
                    Math.pow(position.z - currentWaypoint.z, 2)
            )
            const waypointRadius = Math.max(currentWaypoint.radius || 3.0, 4.0)

            if (distance < waypointRadius) {
                const now = Date.now()
                this.waypointTimes.push(now - this.startTime)
                this.lastProgressTime = now

                // Give points for reaching waypoints (except first one)
                if (this.currentWaypointIndex > 0) {
                    this.metrics.checkpointsReached++
                    console.log(
                        `🎯 Car ${this.carId} reached waypoint ${this.currentWaypointIndex + 1}/${this.waypoints.length}`
                    )
                }

                this.currentWaypointIndex++
                if (this.currentWaypointIndex >= this.waypoints.length) {
                    this.lapCompleted = true
                    console.log(
                        `🏁 Car ${this.carId} completed lap in ${(now - this.startTime) / 1000}s`
                    )
                }
            }
        }
    }

    getFitnessMetrics(): FitnessMetrics {
        return { ...this.metrics }
    }

    getCurrentCheckpoint(): number {
        return this.currentWaypointIndex
    }

    getProgress(): number {
        return (this.metrics.checkpointsReached / this.waypoints.length) * 100
    }

    /**
     * Enhanced fitness calculation using track-based distance
     */
    calculateFitness(): number {
        const now = Date.now()
        const timeAlive = (now - this.startTime) / 1000

        // Distance bonus - much more important now with accurate tracking
        const distanceBonus = Math.min(this.metrics.distanceTraveled * 0.8, 40)

        // Survival bonus - rewarding staying alive
        const survivalBonus = Math.min(timeAlive * 0.5, 10)

        // Speed bonus - rewarding faster movement
        const speedBonus = Math.min(this.metrics.averageSpeed * 6, 25)

        // Sensor bonus - rewarding good navigation
        const sensorBonus = Math.min(this.sensorBonusAccumulator, 15)

        // Waypoint rewards - major bonuses for reaching checkpoints
        const waypointPoints = this.metrics.checkpointsReached * 60
        const waypointBonus =
            Math.pow(this.metrics.checkpointsReached, 1.8) * 15

        // Lap completion bonus
        const lapBonus = this.lapCompleted
            ? Math.max(60 - timeAlive / 3, 20)
            : 0

        // Penalties
        const backwardPenalty = this.metrics.backwardMovement * -0.5
        const collisionPenalty = this.metrics.collisions * -3
        const inactivityPenalty = this.getInactivityPenalty()

        const totalFitness =
            distanceBonus +
            survivalBonus +
            speedBonus +
            sensorBonus +
            waypointPoints +
            waypointBonus +
            lapBonus +
            backwardPenalty +
            collisionPenalty +
            inactivityPenalty

        return Math.max(1.0, totalFitness)
    }

    private getInactivityPenalty(): number {
        const now = Date.now()
        const timeSinceProgress = (now - this.lastProgressTime) / 1000

        if (timeSinceProgress > 8) return -8
        if (timeSinceProgress > 6) return -4
        if (timeSinceProgress > 4) return -1

        return 0
    }

    hasTimeout(): boolean {
        const now = Date.now()
        const timeSinceProgress = (now - this.lastProgressTime) / 1000
        return timeSinceProgress > 5 // Slightly longer timeout with better tracking
    }

    isLapCompleted(): boolean {
        return this.lapCompleted
    }

    /**
     * Reset tracking with new position
     */
    reset(startPosition: Vector3): void {
        this.metrics = {
            distanceTraveled: 0,
            timeAlive: 0,
            averageSpeed: 0,
            checkpointsReached: 0,
            collisions: 0,
            backwardMovement: 0,
        }

        this.startTime = Date.now()
        this.lastProgressTime = this.startTime
        this.speedSamples = []
        this.currentWaypointIndex = 0
        this.waypointTimes = []
        this.lapCompleted = false
        this.sensorBonusAccumulator = 0

        // Reset track distance tracking
        this.trackDistanceTracker.resetCar(this.carId, startPosition)
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.trackDistanceTracker.removeCar(this.carId)
    }
}
