import { createContext, useContext, useState, type ReactNode } from 'react'

// Define the shape of the user/player data
export type PlayerData = {
    name: string
    aiGeneration: number
}

type PlayerContextType = {
    player: PlayerData
    setPlayer: (player: PlayerData) => void
    clearPlayer: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [player, setPlayerState] = useState<PlayerData | null>(null)

    const setPlayer = (data: PlayerData) => setPlayerState(data)
    const clearPlayer = () => setPlayerState(null)

    // Ensure player is always defined
    // todo: implement logic to ensure player is always defined

    return (
        <PlayerContext.Provider value={{ player, setPlayer, clearPlayer }}>
            {children}
        </PlayerContext.Provider>
    )
}

export function usePlayer(): PlayerContextType {
    const context = useContext(PlayerContext)
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider')
    }
    return context
}
