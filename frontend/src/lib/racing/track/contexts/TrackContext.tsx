import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Track, TrackViewSettings } from '../types/index'
import { TRACKS } from '../systems/TrackSystem'
import { addWaypoint, moveWaypoint, removeWaypoint, reorderWaypoints } from '../systems/WaypointEditor'

interface TrackContextType {
    // current track state
    currentTrackId: string
    currentTrack: Track
    
    // view settings
    viewSettings: TrackViewSettings
    setViewSettings: (settings: Partial<TrackViewSettings>) => void
    
    // track editing functions
    addWaypoint: (x: number, z: number) => void
    moveWaypoint: (index: number, x: number, z: number) => void
    removeWaypoint: (index: number) => void
    reorderWaypoints: (fromIndex: number, toIndex: number) => void
    
    // track switching
    switchTrack: (trackId: string) => void
    
    // force refresh for track updates
    refreshTrack: () => void
}

const TrackContext = createContext<TrackContextType | null>(null)

interface TrackProviderProps {
    children: ReactNode
    initialTrackId?: string
    initialSettings?: Partial<TrackViewSettings>
}

// track context provider for managing track state across components
export function TrackProvider({ 
    children, 
    initialTrackId = 'main_circuit',
    initialSettings = {}
}: TrackProviderProps) {
    const [currentTrackId, setCurrentTrackId] = useState(initialTrackId)
    const [refreshKey, setRefreshKey] = useState(0)
    const [viewSettings, setViewSettingsState] = useState<TrackViewSettings>({
        showWaypoints: true,
        showWalls: true,
        showTrack: true,
        editMode: false,
        ...initialSettings
    })

    const currentTrack = TRACKS[currentTrackId]

    // force refresh key dependency to re-render when track changes  
    useEffect(() => {
        // track updates cause re-render through refreshKey dependency
    }, [refreshKey])

    const setViewSettings = useCallback((settings: Partial<TrackViewSettings>) => {
        setViewSettingsState(prev => ({ ...prev, ...settings }))
    }, [])

    const handleAddWaypoint = useCallback((x: number, z: number) => {
        addWaypoint(currentTrackId, x, z)
        setRefreshKey(prev => prev + 1)
    }, [currentTrackId])

    const handleMoveWaypoint = useCallback((index: number, x: number, z: number) => {
        moveWaypoint(currentTrackId, index, x, z)
        setRefreshKey(prev => prev + 1)
    }, [currentTrackId])

    const handleRemoveWaypoint = useCallback((index: number) => {
        removeWaypoint(currentTrackId, index)
        setRefreshKey(prev => prev + 1)
    }, [currentTrackId])

    const handleReorderWaypoints = useCallback((fromIndex: number, toIndex: number) => {
        reorderWaypoints(currentTrackId, fromIndex, toIndex)
        setRefreshKey(prev => prev + 1)
    }, [currentTrackId])

    const switchTrack = useCallback((trackId: string) => {
        if (TRACKS[trackId]) {
            setCurrentTrackId(trackId)
            setRefreshKey(prev => prev + 1)
        }
    }, [])

    const refreshTrack = useCallback(() => {
        setRefreshKey(prev => prev + 1)
    }, [])

    const contextValue: TrackContextType = {
        currentTrackId,
        currentTrack,
        viewSettings,
        setViewSettings,
        addWaypoint: handleAddWaypoint,
        moveWaypoint: handleMoveWaypoint,
        removeWaypoint: handleRemoveWaypoint,
        reorderWaypoints: handleReorderWaypoints,
        switchTrack,
        refreshTrack
    }

    return (
        <TrackContext.Provider value={contextValue}>
            {children}
        </TrackContext.Provider>
    )
}

// hook to access track context
export function useTrack() {
    const context = useContext(TrackContext)
    if (!context) {
        throw new Error('useTrack must be used within a TrackProvider')
    }
    return context
}
