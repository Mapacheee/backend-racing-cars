import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react'
import { useAuth } from './AuthContext'
import { racingWebSocketService } from '../services/racing-websocket'
import type { PlayerAuth } from '../types/auth'
import type { RaceRoom, RoomParticipant } from '../types/racing-stream'

interface PlayerRoomContextType {
    // Connection state
    isConnected: boolean
    connectionError: string | null

    // Room state
    currentRoom: RaceRoom | null
    participants: RoomParticipant[]
    isInRoom: boolean

    // Loading states
    isJoiningRoom: boolean
    isLeavingRoom: boolean

    // Error states
    roomError: string | null

    // Room management methods
    joinRoom: (roomId: string) => Promise<void>
    leaveRoom: () => Promise<void>

    // Utility methods
    clearErrors: () => void
    disconnect: () => void
}

const PlayerRoomContext = createContext<PlayerRoomContextType | undefined>(
    undefined
)

export const usePlayerRoomContext = (): PlayerRoomContextType => {
    const context = useContext(PlayerRoomContext)
    if (!context) {
        throw new Error(
            'usePlayerRoomContext must be used within a PlayerRoomProvider'
        )
    }
    return context
}

interface PlayerRoomProviderProps {
    children: React.ReactNode
}

export const PlayerRoomProvider: React.FC<PlayerRoomProviderProps> = ({
    children,
}) => {
    const { auth } = useAuth<PlayerAuth>()

    // Connection state
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)

    // Room state
    const [currentRoom, setCurrentRoom] = useState<RaceRoom | null>(null)
    const [participants, setParticipants] = useState<RoomParticipant[]>([])
    const [isInRoom, setIsInRoom] = useState(false)

    // Loading states
    const [isJoiningRoom, setIsJoiningRoom] = useState(false)
    const [isLeavingRoom, setIsLeavingRoom] = useState(false)

    // Error states
    const [roomError, setRoomError] = useState<string | null>(null)

    // Initialize room state from localStorage
    useEffect(() => {
        const savedRoom = localStorage.getItem('player-current-room')
        if (savedRoom) {
            try {
                const room = JSON.parse(savedRoom) as RaceRoom
                setCurrentRoom(room)
                setParticipants(room.participants)
                setIsInRoom(true)
                console.log(
                    '🔄 Restored player room from localStorage:',
                    room.id
                )
            } catch (error) {
                console.error(
                    'Failed to restore room from localStorage:',
                    error
                )
                localStorage.removeItem('player-current-room')
            }
        }
    }, [])

    // Initialize WebSocket connection when authenticated
    useEffect(() => {
        if (!auth?.token) return

        try {
            // 🔑 Connect with JWT token - all WebSocket endpoints require authentication
            const socket = racingWebSocketService.connect(auth.token)

            // Connection event handlers
            socket.on('connect', () => {
                setIsConnected(true)
                setConnectionError(null)
                console.log('🟢 Player connected to racing server')
            })

            socket.on('disconnect', () => {
                setIsConnected(false)
                console.log('🔴 Player disconnected from racing server')
            })

            socket.on('connect_error', error => {
                setConnectionError(`Connection failed: ${error.message}`)
                console.error('🔴 Player connection error:', error)
            })

            // Room event handlers
            setupRoomEventHandlers()
        } catch (error) {
            console.error('Failed to connect to racing server:', error)
            setConnectionError('Failed to initialize WebSocket connection')
        }

        return () => {
            racingWebSocketService.disconnect()
            setIsConnected(false)
        }
    }, [auth?.token])

    // Check for existing room status when connected
    useEffect(() => {
        if (isConnected && currentRoom && isInRoom) {
            // Verify the room still exists on the server
            racingWebSocketService.getRoomStatus(
                currentRoom.id,
                room => {
                    setCurrentRoom(room)
                    setParticipants(room.participants)
                    console.log('🔄 Player room status updated:', room.id)
                },
                error => {
                    console.log('❌ Room no longer exists on server:', error)
                    // Clear the room from localStorage if it doesn't exist
                    setCurrentRoom(null)
                    setParticipants([])
                    setIsInRoom(false)
                    localStorage.removeItem('player-current-room')
                }
            )
        }
    }, [isConnected, currentRoom?.id, isInRoom])

    // Save room state to localStorage whenever it changes
    useEffect(() => {
        if (currentRoom && isInRoom) {
            localStorage.setItem(
                'player-current-room',
                JSON.stringify(currentRoom)
            )
        } else {
            localStorage.removeItem('player-current-room')
        }
    }, [currentRoom, isInRoom])

    // Setup room event handlers
    const setupRoomEventHandlers = useCallback(() => {
        // Player joined event
        racingWebSocketService.onPlayerJoined(data => {
            if (data.room && isInRoom) {
                setCurrentRoom(data.room)
                setParticipants(data.room.participants)
                console.log(
                    `👤 Player ${data.participant.username} joined room`
                )
            }
        })

        // Player left event
        racingWebSocketService.onPlayerLeft(data => {
            if (data.room && isInRoom) {
                setCurrentRoom(data.room)
                setParticipants(data.room.participants)
                console.log(`👤 Player left room`)
            }
        })

        // Participant removed event (kicked by admin)
        racingWebSocketService.onParticipantRemoved(data => {
            if (data.userId === auth.id) {
                // This player was removed
                setCurrentRoom(null)
                setParticipants([])
                setIsInRoom(false)
                localStorage.removeItem('player-current-room')
                setRoomError(
                    'Has sido removido de la sala por el administrador'
                )
                console.log(
                    `❌ You were removed from the room: ${data.message}`
                )
            }
        })

        // Room closed event
        racingWebSocketService.onRoomClosed(data => {
            setCurrentRoom(null)
            setParticipants([])
            setIsInRoom(false)
            localStorage.removeItem('player-current-room')
            setRoomError('La sala ha sido cerrada por el administrador')
            console.log(`🚪 Room closed: ${data.message}`)
        })

        // Race started event
        racingWebSocketService.onRaceEvent(event => {
            if (event.type === 'race_start') {
                console.log('🏁 Race started!')
                // TODO: Navigate to race view or update UI
            }
        })
    }, [auth.id, isInRoom])

    // Room management methods
    const joinRoom = useCallback(
        async (roomId: string): Promise<void> => {
            if (!auth?.id || !auth?.username) {
                throw new Error('User authentication required')
            }

            setIsJoiningRoom(true)
            setRoomError(null)

            return new Promise((resolve, reject) => {
                console.log(`🔄 Joining room ${roomId} as ${auth.username}...`)
                racingWebSocketService.joinRoom(
                    {
                        roomId,
                        userId: auth.id,
                        aiGeneration: auth.aiGeneration,
                        username: auth.username,
                    },
                    response => {
                        setCurrentRoom(response.room)
                        setParticipants(response.room.participants)
                        setIsInRoom(true)
                        setIsJoiningRoom(false)
                        console.log(
                            `🏁 Successfully joined room ${roomId}:`,
                            response.room
                        )
                        resolve()
                    },
                    error => {
                        setRoomError(error.message)
                        setIsJoiningRoom(false)
                        console.error(
                            `❌ Failed to join room ${roomId}:`,
                            error
                        )
                        reject(new Error(error.message))
                    }
                )
            })
        },
        [auth?.id, auth?.username]
    )

    const leaveRoom = useCallback(async (): Promise<void> => {
        if (!currentRoom || !auth?.id) {
            return
        }

        setIsLeavingRoom(true)
        setRoomError(null)

        return new Promise((resolve, reject) => {
            console.log(`🔄 Leaving room ${currentRoom.id}...`)
            racingWebSocketService.leaveRoom(
                currentRoom.id,
                auth.id,
                _response => {
                    setCurrentRoom(null)
                    setParticipants([])
                    setIsInRoom(false)
                    setIsLeavingRoom(false)
                    localStorage.removeItem('player-current-room')
                    console.log('🚪 Successfully left room')
                    resolve()
                },
                error => {
                    setRoomError(error.message)
                    setIsLeavingRoom(false)
                    console.error('❌ Failed to leave room:', error)
                    reject(new Error(error.message))
                }
            )
        })
    }, [currentRoom, auth?.id])

    const clearErrors = useCallback(() => {
        setRoomError(null)
        setConnectionError(null)
    }, [])

    const disconnect = useCallback(() => {
        racingWebSocketService.disconnect()
        setIsConnected(false)
        setCurrentRoom(null)
        setParticipants([])
        setIsInRoom(false)
        localStorage.removeItem('player-current-room')
    }, [])

    const value = {
        // Connection state
        isConnected,
        connectionError,

        // Room state
        currentRoom,
        participants,
        isInRoom,

        // Loading states
        isJoiningRoom,
        isLeavingRoom,

        // Error states
        roomError,

        // Room management methods
        joinRoom,
        leaveRoom,

        // Utility methods
        clearErrors,
        disconnect,
    }

    return (
        <PlayerRoomContext.Provider value={value}>
            {children}
        </PlayerRoomContext.Provider>
    )
}
