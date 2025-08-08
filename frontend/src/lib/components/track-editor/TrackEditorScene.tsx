import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { TrackScene } from '../../racing/track'
import { TRACKS } from '../../racing/track'
import { addWaypoint, moveWaypoint, reorderWaypoints } from '../../racing/track'
import { useCanvasSettings } from '../../contexts/useCanvasSettings'
import { useRaceReset } from '../../contexts/RaceResetContext'
import { useWaypointModal } from '../../../routes/training/simulation/contexts/WaypointModalContext'

export default function TrackEditorScene(): JSX.Element {
    const { showWaypoints, showWalls, editMode } = useCanvasSettings()
    const { triggerReset, resetCounter } = useRaceReset()
    const { modalState, openModal, closeModal } = useWaypointModal()
    const [, forceUpdate] = useState({})

    const currentTrack = 'main_circuit'
    const track = TRACKS[currentTrack]

    // force re-render when reset is triggered
    useEffect(() => {
        forceUpdate({})
    }, [resetCounter])

    const refreshTrack = () => {
        forceUpdate({})
        triggerReset()
    }

    // handle ground clicks for waypoint editing
    const handleGroundClick = (event: any) => {
        if (!editMode) return

        if (modalState.isOpen) {
            closeModal()
            return
        }

        if (modalState.mode === 'move' && modalState.waypointIndex >= 0) {
            const [x, , z] = event.point
            moveWaypoint(currentTrack, modalState.waypointIndex, x, z)
            refreshTrack()
            closeModal()
        } else {
            const [x, , z] = event.point
            addWaypoint(currentTrack, x, z)
            refreshTrack()
        }
    }

    // handle waypoint clicks for editing
    const handleWaypointClick = (index: number, event: any) => {
        if (!editMode) return
        event.stopPropagation()

        if (
            modalState.mode === 'swap' &&
            modalState.waypointIndex >= 0 &&
            modalState.waypointIndex !== index
        ) {
            reorderWaypoints(currentTrack, modalState.waypointIndex, index)
            refreshTrack()
            closeModal()
        } else {
            openModal(index, {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2 - 100,
            })
        }
    }

    // determine highlighted waypoint based on modal state
    const getHighlightedWaypoint = () => {
        if (modalState.mode === 'swap' && modalState.waypointIndex >= 0) {
            return modalState.waypointIndex
        }
        return -1
    }

    return (
        <TrackScene
            track={track}
            settings={{
                showWaypoints,
                showWalls,
                showTrack: true,
                editMode,
            }}
            onGroundClick={handleGroundClick}
            onWaypointClick={handleWaypointClick}
            highlightedWaypoint={getHighlightedWaypoint()}
            enablePhysics={false} // No physics needed for track editor
            enableControls={true}
        >
            {/* No cars or AI components - just the track */}
        </TrackScene>
    )
}
