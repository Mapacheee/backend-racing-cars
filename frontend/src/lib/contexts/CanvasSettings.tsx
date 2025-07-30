import React, { createContext, useState, type ReactNode } from 'react'

export interface CanvasSettings {
    showCollisions: boolean
    setShowCollisions: (value: boolean) => void
    showWaypoints: boolean
    setShowWaypoints: (value: boolean) => void
    editMode: boolean
    setEditMode: (value: boolean) => void
}

export const CanvasSettingsContext = createContext<CanvasSettings | undefined>(undefined)

export function CanvasSettingsProvider({ children }: { children: ReactNode }) {
    const [showCollisions, setShowCollisions] = useState(false)
    const [showWaypoints, setShowWaypoints] = useState(true)
    const [editMode, setEditMode] = useState(false)

    const value = React.useMemo(() => ({
        showCollisions, 
        setShowCollisions, 
        showWaypoints, 
        setShowWaypoints, 
        editMode, 
        setEditMode 
    }), [showCollisions, showWaypoints, editMode])

    return (
        <CanvasSettingsContext.Provider value={value}>
            {children}
        </CanvasSettingsContext.Provider>
    )
}
