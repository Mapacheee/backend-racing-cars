import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react'
import { useAuth } from './AuthContext'
import { racingWebSocketService } from '../services/racing-websocket'
import type { AdminAuth } from '../types/auth'
import type {
    RaceRoom,
    RoomParticipant,
    RaceConfiguration,
    RacePackage,
} from '../types/racing-stream'

interface AdminRoomContextType {
    // Connection state
    isConnected: boolean
    connectionError: string | null

    // Room state
    currentRoom: RaceRoom | null
    participants: RoomParticipant[]
    racePackage: RacePackage | null

    // Loading states
    isCreatingRoom: boolean
    isConfiguringRace: boolean
    isStartingRace: boolean
    isClosingRoom: boolean

    // Error states
    roomError: string | null

    // Room management methods
    createRoom: (maxParticipants?: number) => Promise<void>
    configureRace: (config: RaceConfiguration) => Promise<void>
    startRace: () => Promise<void>
    closeRoom: () => Promise<void>
    removeParticipant: (userId: string) => Promise<void>

    // Utility methods
    clearErrors: () => void
    disconnect: () => void
}

const AdminRoomContext = createContext<AdminRoomContextType | undefined>(
    undefined
)

interface AdminRoomProviderProps {
    children: React.ReactNode
}

export const AdminRoomProvider: React.FC<AdminRoomProviderProps> = ({
    children,
}) => {
    const { auth } = useAuth<AdminAuth>()

    // Connection state
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)

    // Room state
    const [currentRoom, setCurrentRoom] = useState<RaceRoom | null>(null)
    const [participants, setParticipants] = useState<RoomParticipant[]>([])
    const [racePackage, setRacePackage] = useState<RacePackage | null>(null)

    // Loading states
    const [isCreatingRoom, setIsCreatingRoom] = useState(false)
    const [isConfiguringRace, setIsConfiguringRace] = useState(false)
    const [isStartingRace, setIsStartingRace] = useState(false)
    const [isClosingRoom, setIsClosingRoom] = useState(false)

    // Error states
    const [roomError, setRoomError] = useState<string | null>(null)

    // Auto-create room flag
    const [hasAttemptedRoomCreation, setHasAttemptedRoomCreation] =
        useState(false)

    // Initialize WebSocket connection when authenticated
    useEffect(() => {
        try {
            // 🔑 Connect with JWT token - all WebSocket endpoints require authentication
            const socket = racingWebSocketService.connect(auth.token)

            // Connection event handlers
            socket.on('connect', () => {
                setIsConnected(true)
                setConnectionError(null)
                console.log('🟢 Admin connected to racing server')
            })

            socket.on('disconnect', () => {
                setIsConnected(false)
                console.log('🔴 Admin disconnected from racing server')
            })

            socket.on('connect_error', error => {
                setConnectionError(`Connection failed: ${error.message}`)
                console.error('🔴 Admin connection error:', error)
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
    }, [auth.token])

    // Auto-create room when connected
    useEffect(() => {
        if (
            isConnected &&
            !currentRoom &&
            !hasAttemptedRoomCreation &&
            !isCreatingRoom
        ) {
            console.log('🔄 Auto-creating room for admin...')
            setHasAttemptedRoomCreation(true)
            createRoom(10).catch(error => {
                console.error('❌ Auto room creation failed:', error)
                // Reset the flag so user can manually retry
                setHasAttemptedRoomCreation(false)
            })
        }
    }, [isConnected, currentRoom, hasAttemptedRoomCreation, isCreatingRoom])

    // Setup room event handlers
    const setupRoomEventHandlers = useCallback(() => {
        // Player joined event
        racingWebSocketService.onPlayerJoined(data => {
            if (data.room) {
                setCurrentRoom(data.room)
                setParticipants(data.room.participants)
                console.log(
                    `👤 Player ${data.participant.username} joined room`
                )
            }
        })

        // Player left event
        racingWebSocketService.onPlayerLeft(data => {
            if (data.room) {
                setCurrentRoom(data.room)
                setParticipants(data.room.participants)
                console.log(`👤 Player left room`)
            }
        })

        // Participant removed event
        racingWebSocketService.onParticipantRemoved(data => {
            console.log(
                `👤 Participant ${data.userId} was removed: ${data.message}`
            )
        })

        // Room closed event
        racingWebSocketService.onRoomClosed(data => {
            setCurrentRoom(null)
            setParticipants([])
            setRacePackage(null)
            setHasAttemptedRoomCreation(false) // Allow creating a new room
            console.log(`🚪 Room closed: ${data.message}`)
        })
    }, [])

    // Room management methods
    const createRoom = useCallback(
        async (maxParticipants = 30): Promise<void> => {
            setIsCreatingRoom(true)
            setRoomError(null)

            return new Promise((resolve, reject) => {
                console.log('🔄 Creating room from admin...')
                racingWebSocketService.createRoom(
                    {
                        adminUsername: auth.username,
                        maxParticipants,
                    },
                    response => {
                        setCurrentRoom(response.room)
                        setParticipants(response.room.participants)
                        setIsCreatingRoom(false)
                        console.log(
                            '🏁 Room created successfully:',
                            response.room.id
                        )
                        resolve()
                    },
                    error => {
                        setRoomError(error.message)
                        setIsCreatingRoom(false)
                        console.error('❌ Failed to create room:', error)
                        reject(new Error(error.message))
                    }
                )
            })
        },
        [auth.username, isConnected]
    )

    const configureRace = useCallback(
        async (config: RaceConfiguration): Promise<void> => {
            if (!isConnected || !currentRoom) {
                throw new Error('Not connected, or no active room')
            }

            setIsConfiguringRace(true)
            setRoomError(null)

            return new Promise((resolve, reject) => {
                racingWebSocketService.configureRace(
                    {
                        roomId: currentRoom.id,
                        adminUsername: auth.username,
                        raceConfig: config,
                    },
                    response => {
                        setCurrentRoom(response.room)
                        setIsConfiguringRace(false)
                        console.log('⚙️ Race configured successfully')
                        resolve()
                    },
                    racePackageData => {
                        setRacePackage(racePackageData)
                        console.log('📦 Race package received')
                    },
                    error => {
                        setRoomError(error.message)
                        setIsConfiguringRace(false)
                        console.error('❌ Failed to configure race:', error)
                        reject(new Error(error.message))
                    }
                )
            })
        },
        [auth.username, isConnected, currentRoom]
    )

    const startRace = useCallback(async (): Promise<void> => {
        if (!isConnected || !currentRoom) {
            throw new Error('Not connected, or no active room')
        }

        setIsStartingRace(true)
        setRoomError(null)

        return new Promise((resolve, reject) => {
            racingWebSocketService.startRace(
                {
                    roomId: currentRoom.id,
                    adminUsername: auth.username,
                },
                response => {
                    setCurrentRoom(response.room)
                    setIsStartingRace(false)
                    console.log('🏁 Race started successfully')
                    resolve()
                },
                error => {
                    setRoomError(error.message)
                    setIsStartingRace(false)
                    console.error('❌ Failed to start race:', error)
                    reject(new Error(error.message))
                }
            )
        })
    }, [auth.username, isConnected, currentRoom])

    const closeRoom = useCallback(async (): Promise<void> => {
        if (!isConnected || !currentRoom) {
            throw new Error('Not connected, or no active room')
        }

        setIsClosingRoom(true)
        setRoomError(null)

        return new Promise((resolve, reject) => {
            racingWebSocketService.closeRoom(
                {
                    roomId: currentRoom.id,
                    adminUsername: auth.username,
                },
                _response => {
                    setCurrentRoom(null)
                    setParticipants([])
                    setRacePackage(null)
                    setHasAttemptedRoomCreation(false) // Allow creating a new room
                    setIsClosingRoom(false)
                    console.log('🚪 Room closed successfully')
                    resolve()
                },
                error => {
                    setRoomError(error.message)
                    setIsClosingRoom(false)
                    console.error('❌ Failed to close room:', error)
                    reject(new Error(error.message))
                }
            )
        })
    }, [auth.username, isConnected, currentRoom])

    const removeParticipant = useCallback(
        async (userId: string): Promise<void> => {
            if (!isConnected || !currentRoom) {
                throw new Error('Not connected, or no active room')
            }

            setRoomError(null)

            return new Promise((resolve, reject) => {
                racingWebSocketService.removeParticipant(
                    {
                        roomId: currentRoom.id,
                        userId,
                        adminUsername: auth.username,
                    },
                    response => {
                        setCurrentRoom(response.room)
                        setParticipants(response.room.participants)
                        console.log(
                            `👤 Participant ${userId} removed successfully`
                        )
                        resolve()
                    },
                    error => {
                        setRoomError(error.message)
                        console.error('❌ Failed to remove participant:', error)
                        reject(new Error(error.message))
                    }
                )
            })
        },
        [auth.username, isConnected, currentRoom]
    )

    // Utility methods
    const clearErrors = useCallback(() => {
        setConnectionError(null)
        setRoomError(null)
    }, [])

    const disconnect = useCallback(() => {
        racingWebSocketService.disconnect()
        setIsConnected(false)
        setCurrentRoom(null)
        setParticipants([])
        setRacePackage(null)
        setHasAttemptedRoomCreation(false)
    }, [])

    const value = {
        // Connection state
        isConnected,
        connectionError,

        // Room state
        currentRoom,
        participants,
        racePackage,

        // Loading states
        isCreatingRoom,
        isConfiguringRace,
        isStartingRace,
        isClosingRoom,

        // Error states
        roomError,

        // Room management methods
        createRoom,
        configureRace,
        startRace,
        closeRoom,
        removeParticipant,

        // Utility methods
        clearErrors,
        disconnect,
    }

    return (
        <AdminRoomContext.Provider value={value}>
            {children}
        </AdminRoomContext.Provider>
    )
}

export const useAdminRoomContext = (): AdminRoomContextType => {
    const context = useContext(AdminRoomContext)
    if (context === undefined) {
        throw new Error(
            'useAdminRoomContext must be used within an AdminRoomProvider'
        )
    }
    return context
}
