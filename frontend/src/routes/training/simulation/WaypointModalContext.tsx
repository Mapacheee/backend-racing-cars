import React, { createContext, useContext, useState, type ReactNode } from 'react'

interface ModalState {
    isOpen: boolean
    waypointIndex: number
    position: { x: number; y: number }
    mode: 'none' | 'move' | 'swap'
}

interface WaypointModalContextType {
    modalState: ModalState
    setModalState: React.Dispatch<React.SetStateAction<ModalState>>
    openModal: (waypointIndex: number, position: { x: number; y: number }) => void
    closeModal: () => void
    setMode: (mode: 'none' | 'move' | 'swap') => void
}

const WaypointModalContext = createContext<WaypointModalContextType | undefined>(undefined)

export function WaypointModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        waypointIndex: -1,
        position: { x: 0, y: 0 },
        mode: 'none'
    })

    const openModal = (waypointIndex: number, position: { x: number; y: number }) => {
        setModalState({
            isOpen: true,
            waypointIndex,
            position,
            mode: 'none'
        })
    }

    const closeModal = () => {
        setModalState({
            isOpen: false,
            waypointIndex: -1,
            position: { x: 0, y: 0 },
            mode: 'none'
        })
    }

    const setMode = (mode: 'none' | 'move' | 'swap') => {
        setModalState(prev => ({ ...prev, mode }))
    }

    return (
        <WaypointModalContext.Provider value={{
            modalState,
            setModalState,
            openModal,
            closeModal,
            setMode
        }}>
            {children}
        </WaypointModalContext.Provider>
    )
}

export function useWaypointModal() {
    const context = useContext(WaypointModalContext)
    if (context === undefined) {
        throw new Error('useWaypointModal must be used within a WaypointModalProvider')
    }
    return context
}
