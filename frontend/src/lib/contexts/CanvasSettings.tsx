import { createContext, useContext, useState, type ReactNode } from 'react'

type CanvasSettings = {
    showCollisions: boolean
    setShowCollisions: (value: boolean) => void
    showWaypoints: boolean
    setShowWaypoints: (value: boolean) => void
    editMode: boolean
    setEditMode: (value: boolean) => void
}

const CanvasSettingsContext = createContext<CanvasSettings | undefined>(
    undefined
)

export function CanvasSettingsProvider({ children }: { children: ReactNode }) {
    const [showCollisions, setShowCollisions] = useState(false)
    const [showWaypoints, setShowWaypoints] = useState(true)
    const [editMode, setEditMode] = useState(false)

    return (
        <CanvasSettingsContext.Provider
            value={{ showCollisions, setShowCollisions, showWaypoints, setShowWaypoints, editMode, setEditMode }}
        >
            {children}
        </CanvasSettingsContext.Provider>
    )
}

export function useCanvasSettings() {
    const ctx = useContext(CanvasSettingsContext)
    if (!ctx)
        throw new Error(
            'useCanvasSettings must be used within a CanvasSettingsProvider'
        )
    return ctx
}
