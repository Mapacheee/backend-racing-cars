import { Suspense, useState, useEffect } from 'react'
import type { JSX } from 'react'
import AICar from '../entities/AICar'
import { TrackScene } from '../../../../lib/racing/track'
import { TRACKS } from '../../../../lib/racing/track'
import { addWaypoint, moveWaypoint, reorderWaypoints } from '../../../../lib/racing/track'
import { generateAICars } from '../systems/SpawnSystem'
import { useCanvasSettings } from '../../../../lib/contexts/useCanvasSettings'
import { useRaceReset } from '../../../../lib/contexts/RaceResetContext'
import { useWaypointModal } from '../contexts/WaypointModalContext'
import { useNEATTraining } from '../contexts/NEATTrainingContext'

export default function CarScene(): JSX.Element {
    const { showWaypoints, showWalls, editMode } = useCanvasSettings()
    const { triggerReset, resetCounter } = useRaceReset()
    const { modalState, openModal, closeModal } = useWaypointModal()
    const [, forceUpdate] = useState({})
    const neatContext = useNEATTraining()
    
    if (!neatContext) {
        return <div>Loading NEAT context...</div>
    }

    const { generation, carStates, handleFitnessUpdate, handleCarElimination, population } = neatContext

    // regenerate cars when generation changes
    const [aiCars, setAiCars] = useState(() => {
        const initialGenomes = population.getGenomes().slice(0, 20)
        return generateAICars({
            trackId: 'main_circuit',
            carCount: 20,
            colors: ['red', 'blue', 'green', 'yellow', 'purple',
                   'orange', 'pink', 'cyan', 'magenta', 'lime',
                   'indigo', 'maroon', 'navy', 'olive', 'teal',
                   'silver', 'gold', 'coral', 'salmon', 'khaki'],
            useNEAT: true,
            generation: generation,
            genomes: initialGenomes
        })
    })

    const currentTrack = 'main_circuit'
    const track = TRACKS[currentTrack]

    // update cars when generation changes
    useEffect(() => {
        const allGenomes = population.getGenomes()
        const config: any = {
            trackId: currentTrack,
            carCount: 20,
            colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta', 'lime', 'indigo', 'maroon', 'navy', 'olive', 'teal', 'silver', 'gold', 'coral', 'salmon', 'khaki'],
            useNEAT: true,
            generation: generation,
            genomes: allGenomes 
        }
                
        const newCars = generateAICars(config)
        setAiCars(newCars)
        forceUpdate({})
    }, [generation, currentTrack, population, resetCounter])

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
                editMode
            }}
            onGroundClick={handleGroundClick}
            onWaypointClick={handleWaypointClick}
            highlightedWaypoint={getHighlightedWaypoint()}
            enablePhysics={true}
            enableControls={true}
        >
            {/* render ai cars */}
            {aiCars.map(carData => {
                const carState = carStates.get(carData.id)
                const isCarEliminated = carState?.isEliminated || false

                return (
                    <Suspense key={carData.id} fallback={null}>
                        <AICar
                            carData={carData}
                            onFitnessUpdate={handleFitnessUpdate}
                            onCarElimination={handleCarElimination}
                            isEliminated={isCarEliminated}
                        />
                    </Suspense>
                )
            })}
        </TrackScene>
    )
}