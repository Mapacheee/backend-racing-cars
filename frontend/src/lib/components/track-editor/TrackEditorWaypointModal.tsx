import { useWaypointModal } from '../../../routes/training/simulation/contexts/WaypointModalContext'
import { TRACKS } from '../../racing/track'
import { removeWaypoint } from '../../racing/track'
import { useRaceReset } from '../../contexts/RaceResetContext'

export default function TrackEditorWaypointModal() {
    const { modalState, closeModal, setMode } = useWaypointModal()
    const { triggerReset } = useRaceReset()

    if (!modalState.isOpen) return null

    const currentTrack = 'main_circuit'
    const track = TRACKS[currentTrack]

    const refreshTrack = () => {
        triggerReset()
    }

    const handleMove = () => {
        setMode('move')
        closeModal()
    }

    const handleSwap = () => {
        setMode('swap')
    }

    const handleDelete = () => {
        if (track.waypoints.length <= 3) return
        removeWaypoint(currentTrack, modalState.waypointIndex)
        refreshTrack()
        closeModal()
    }

    return (
        <div
            className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-48"
            style={{ zIndex: 9999 }}
            onClick={e => e.stopPropagation()}
        >
            <div className="text-sm font-semibold text-gray-700 mb-2 text-center">
                🎯 Waypoint {modalState.waypointIndex + 1}
            </div>

            <div className="space-y-1">
                <button
                    onClick={handleMove}
                    className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors flex items-center gap-2"
                >
                    <span>📍</span> Mover a otro lugar
                </button>

                <button
                    onClick={handleSwap}
                    className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-purple-50 rounded transition-colors flex items-center gap-2"
                >
                    <span>🔄</span> Intercambiar con otro
                </button>

                <button
                    onClick={handleDelete}
                    disabled={track.waypoints.length <= 3}
                    className={`w-full text-left px-2 py-1 text-sm rounded transition-colors flex items-center gap-2 ${
                        track.waypoints.length > 3
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <span>🗑️</span> Eliminar{' '}
                    {track.waypoints.length <= 3 ? '(mín. 3)' : ''}
                </button>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">
                    Waypoint: {modalState.waypointIndex + 1} de{' '}
                    {track.waypoints.length}
                </div>
                <button
                    onClick={closeModal}
                    className="w-full text-center px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 rounded transition-colors"
                >
                    ❌ Cancelar
                </button>
            </div>
        </div>
    )
}
