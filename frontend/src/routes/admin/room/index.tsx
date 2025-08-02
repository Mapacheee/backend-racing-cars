import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../lib/contexts/AuthContext'
import type { AdminAuth } from '../../../lib/types/auth'
import { FaTrash, FaChartBar, FaPlay, FaBroom, FaPlus } from 'react-icons/fa'

// Fake player data
const fakePlayersData = [
    { id: 1, name: 'Carlos_Racing', aiGeneration: 3 },
    { id: 2, name: 'Maria_Speed', aiGeneration: 2 },
    { id: 3, name: 'Pedro_Fast', aiGeneration: 4 },
    { id: 4, name: 'Ana_Turbo', aiGeneration: 1 },
    { id: 5, name: 'Luis_Velocity', aiGeneration: 3 },
    { id: 6, name: 'Carmen_Rush', aiGeneration: 2 },
    { id: 7, name: 'Diego_Drift', aiGeneration: 4 },
    { id: 8, name: 'Sofia_Boost', aiGeneration: 3 },
    { id: 9, name: 'Miguel_Flash', aiGeneration: 2 },
    { id: 10, name: 'Isabella_Storm', aiGeneration: 1 },
]

export default function AdminRoom() {
    const navigate = useNavigate()
    const { clearAuth } = useAuth<AdminAuth>()
    const [players, setPlayers] = useState(fakePlayersData)
    const roomNumber = 2345

    useEffect(() => {
        document.title = 'Administración de Sala - Carrera neuronal 🏎️🧠'
    }, [])

    function handleLogout() {
        clearAuth()
        navigate('/admin')
    }

    function handleDeletePlayer(playerId: number) {
        setPlayers(players.filter(player => player.id !== playerId))
    }

    function handleShowStats(playerId: number) {
        // TODO: Implement stats functionality
        console.log(`Showing stats for player ${playerId}`)
    }

    function handleStartRace() {
        // TODO: Implement start race functionality
        console.log('Starting race...')
    }

    function handleNewRoom() {
        // TODO: Implement new room functionality
        console.log('Creating new room...')
    }

    function handleClearRoom() {
        setPlayers([])
    }

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background relative">
            {/* Title */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary text-center">
                    Administración de Sala
                </h1>
            </div>

            {/* Main Menu */}
            <div className="w-full max-w-5xl bg-white/80 rounded-xl shadow-lg border border-accent overflow-hidden">
                {/* Room Number Header */}
                <div className="flex flex-col items-center justify-center p-6 border-b border-accent bg-background">
                    <div className="text-lg text-secondary font-medium">
                        Sala Número
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {roomNumber}
                    </div>
                    <div className="text-sm text-secondary mt-2">
                        {players.length} jugadores conectados
                    </div>
                </div>

                {/* Players Table */}
                <div className="p-6">
                    <div className="bg-background rounded-lg border border-accent overflow-hidden">
                        <div className="max-h-80 overflow-y-auto">
                            {players.length === 0 ? (
                                <div className="p-8 text-center text-secondary">
                                    No hay jugadores en la sala
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-accent/20 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-primary">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-primary">
                                                Jugador
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-primary">
                                                Generación IA
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-primary">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map((player, index) => (
                                            <tr
                                                key={player.id}
                                                className="border-b border-accent/30 hover:bg-accent/10 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-sm text-secondary">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-primary">
                                                    {player.name}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                                                        Gen{' '}
                                                        {player.aiGeneration}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleShowStats(
                                                                    player.id
                                                                )
                                                            }
                                                            className="p-1.5 rounded text-info hover:bg-info/10 transition-colors focus:outline-none focus:ring-2 focus:ring-info/20"
                                                            title="Ver estadísticas"
                                                        >
                                                            <FaChartBar
                                                                size={14}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeletePlayer(
                                                                    player.id
                                                                )
                                                            }
                                                            className="p-1.5 rounded text-error hover:bg-error/10 transition-colors focus:outline-none focus:ring-2 focus:ring-error/20"
                                                            title="Eliminar jugador"
                                                        >
                                                            <FaTrash
                                                                size={14}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Start Race Button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleStartRace}
                            disabled={players.length === 0}
                            className="flex items-center gap-2 px-6 py-3 font-medium bg-primary text-white hover:bg-secondary hover:text-background disabled:bg-accent/50 disabled:text-secondary disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-secondary rounded-md"
                        >
                            <FaPlay size={16} />
                            Iniciar Carrera
                        </button>
                    </div>
                </div>
            </div>

            {/* Back to Menu Button */}
            <div className="mt-6 flex justify-center">
                <Link
                    to="/admin/menu"
                    className="rounded-md px-3 py-2 font-medium text-xs text-secondary bg-white/60 border border-accent shadow-sm hover:bg-accent hover:text-primary transition-colors"
                >
                    Volver al Menú
                </Link>
            </div>

            {/* Bottom Right Action Buttons */}
            <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-50">
                <button
                    onClick={handleNewRoom}
                    className="flex items-center gap-2 rounded-md px-4 py-3 font-medium text-secondary hover:text-secondary shadow-none transition-colors focus:outline-none focus:ring-2 focus:ring-secondary bg-white/60 border border-secondary"
                >
                    <FaPlus size={14} />
                    Nueva Sala
                </button>
                <button
                    onClick={handleClearRoom}
                    className="flex items-center gap-2 rounded-md px-4 py-3 font-medium text-warning hover:text-warning shadow-none transition-colors focus:outline-none focus:ring-2 focus:ring-warning bg-white/60 border border-warning"
                >
                    <FaBroom size={14} />
                    Limpiar Sala
                </button>
                <button
                    onClick={handleLogout}
                    className="rounded-md px-4 py-3 font-medium text-secondary hover:text-secondary shadow-none transition-colors focus:outline-none focus:ring-2 focus:ring-secondary bg-transparent border border-secondary"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )
}
