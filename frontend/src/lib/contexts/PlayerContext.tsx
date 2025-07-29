import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    type JSX,
} from 'react'
import Cookies from 'js-cookie'

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

export function PlayerProvider({
    children,
}: {
    children: ReactNode
}): JSX.Element {
    // Initialize from cookie if present
    const [player, setPlayerState] = useState<PlayerData>(() => {
        const cookie = Cookies.get('player')
        if (cookie) {
            try {
                return JSON.parse(cookie)
            } catch {
                return { name: '', aiGeneration: 0 }
            }
        }
        return { name: '', aiGeneration: 0 }
    })

    const setPlayer = (data: PlayerData) => {
        setPlayerState(data)
        Cookies.set('player', JSON.stringify(data), { expires: 7 })
    }
    const clearPlayer = () => {
        setPlayerState({ name: '', aiGeneration: 0 })
        Cookies.remove('player')
    }

    // Keep cookie in sync with state (optional, for robustness)
    useEffect(() => {
        if (player) {
            Cookies.set('player', JSON.stringify(player), { expires: 7 })
        } else {
            Cookies.remove('player')
        }
    }, [player])

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
