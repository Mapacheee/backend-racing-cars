import { Link, useNavigate } from 'react-router-dom'
import { usePlayer } from '../../../lib/contexts/PlayerContext'

export default function TrainingMenu() {
    const navigate = useNavigate()
    const { player } = usePlayer()

    const userName: string = player?.name || 'Usuario Anónimo'
    const aiGeneration: number = player?.aiGeneration || 1

    function handleLogout() {
        alert('Sesión cerrada')
        // TODO: Add logout logic (clear context, redirect, etc.)

        navigate('/')
    }

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-background relative">
            <div className="w-full max-w-3xl bg-white/80 rounded-xl shadow-lg border border-accent flex flex-col md:flex-row overflow-hidden">
                {/* User Info Column */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 border-b md:border-b-0 md:border-r border-accent bg-background">
                    <div className="text-lg text-secondary font-medium">
                        Usuario
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {userName}
                    </div>
                    <div className="text-base text-secondary mt-4">
                        AI Generación
                    </div>
                    <div className="text-lg font-semibold text-primary">
                        Gen {aiGeneration}
                    </div>
                </div>
                {/* Actions Column */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                    <Link
                        to="/training/simulation"
                        className="w-full text-center rounded-md px-4 py-3 font-medium bg-primary text-white hover:bg-secondary hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        {aiGeneration === 1
                            ? 'Empezar Entrenamiento'
                            : 'Continuar Entrenamiento'}
                    </Link>
                    <Link
                        to="/training/room"
                        className="w-full text-center rounded-md px-4 py-3 font-medium border border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        Unirse a una sala
                    </Link>
                </div>
            </div>
            {/* Logout Button Fixed to Lower Right */}
            <button
                onClick={handleLogout}
                className="fixed right-6 bottom-6 border-1 z-50 w-auto rounded-md px-4 py-3 font-medium  text-secondary hover:text-secondary shadow-none transition-colors focus:outline-none focus:ring-2 focus:ring-secondary bg-transparent border-secondary"
            >
                Cerrar sesión
            </button>
        </div>
    )
}
