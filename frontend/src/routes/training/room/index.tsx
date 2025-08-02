import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../lib/contexts/AuthContext'
import type { PlayerAuth } from '../../../lib/types/auth'

// Fake data for players in the room
const fakePlayersData = [
    { id: 1, name: 'JuanCarlos23' },
    { id: 2, name: 'MariaGamer' },
    { id: 3, name: 'AlexRunner' },
    { id: 4, name: 'SofiaSpeed' },
    { id: 5, name: 'DiegoRacer' },
    { id: 6, name: 'LuciaFast' },
    { id: 7, name: 'CarlosVelocity' },
    { id: 8, name: 'AnaQuick' },
    { id: 9, name: 'MiguelTurbo' },
    { id: 10, name: 'ValentinaRush' },
    { id: 11, name: 'RobertoSpeed' },
    { id: 12, name: 'CamilaRace' },
]

export default function PlayerRoom() {
    const navigate = useNavigate()
    const { auth, clearAuth } = useAuth<PlayerAuth>()
    const [players] = useState(fakePlayersData)
    const [roomNumber] = useState('2345') // Fake room number

    useEffect(() => {
        document.title = `Sala de Competición - Carrera neuronal 🏎️🧠`
    }, [])

    function handleLogout() {
        clearAuth()
        navigate('/')
    }

    function handleBackToMenu() {
        navigate('/training/menu')
    }

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background relative">
            {/* Title */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary text-center">
                    Sala de Entrenamiento
                </h1>
            </div>

            {/* Main Menu Card */}
            <div className="w-full max-w-4xl bg-white/80 rounded-xl shadow-lg border border-accent overflow-hidden">
                {/* Header */}
                <div className="bg-background border-b border-accent p-6 text-center">
                    <h2 className="text-2xl font-bold text-primary mb-2">
                        Sala: {roomNumber}
                    </h2>
                    <p className="text-secondary">
                        {players.length} jugadores conectados
                    </p>
                </div>

                {/* Players List */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-4 text-center">
                        Jugadores en la sala
                    </h3>

                    <div className="max-h-80 overflow-y-auto border border-accent rounded-md bg-background">
                        <div className="p-4 space-y-3">
                            {players.map((player, index) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-3 bg-white/60 rounded-md border border-accent hover:bg-white/80 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-primary">
                                            {player.name}
                                        </span>
                                        {player.name === auth.name && (
                                            <span className="px-2 py-1 bg-accent text-secondary text-xs rounded-full font-medium">
                                                Tú
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Waiting Status */}
                    <div className="mt-6 text-center">
                        <div className="p-4 rounded-md">
                            <p className="text-info font-medium">
                                Esperando a que el administrador inicie la
                                carrera...
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Menu Button */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleBackToMenu}
                    className="rounded-md px-4 py-2 font-medium text-sm text-secondary bg-white/60 border border-accent shadow-sm hover:bg-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                    Salir de la sala
                </button>
            </div>

            {/* Logout Button Fixed to Lower Right */}
            <button
                onClick={handleLogout}
                className="fixed right-6 bottom-6 border-1 z-50 w-auto rounded-md px-4 py-3 font-medium text-secondary hover:text-secondary shadow-none transition-colors focus:outline-none focus:ring-2 focus:ring-secondary bg-transparent border-secondary"
            >
                Cerrar sesión
            </button>
        </div>
    )
}
