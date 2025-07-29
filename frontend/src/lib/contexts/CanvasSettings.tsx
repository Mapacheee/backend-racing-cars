import { createContext, useContext, useState, type ReactNode } from 'react'

type CanvasSettings = {
    showCollisions: boolean
    setShowCollisions: (value: boolean) => void
    // Add more canvas-wide settings here as needed
}

const CanvasSettingsContext = createContext<CanvasSettings | undefined>(
    undefined
)

export function CanvasSettingsProvider({ children }: { children: ReactNode }) {
    const [showCollisions, setShowCollisions] = useState(false)

    return (
        <CanvasSettingsContext.Provider
            value={{ showCollisions, setShowCollisions }}
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
