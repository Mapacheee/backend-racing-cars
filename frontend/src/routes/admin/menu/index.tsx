import type { JSX } from 'react/jsx-runtime'
import { useAuth } from '../../../lib/contexts/AuthContext'
import type { AdminAuth } from '../../../lib/types/auth'
import { Link } from 'react-router-dom'

export default function AdminMenu(): JSX.Element {
    const { auth, clearAuth } = useAuth<AdminAuth>()

    function handleLogout() {
        clearAuth()
        window.location.reload()
    }

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background relative">
            <div className="w-full max-w-3xl bg-white/80 rounded-xl shadow-lg border border-accent flex flex-col md:flex-row overflow-hidden">
                {/* User Info Column */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 border-b md:border-b-0 md:border-r border-accent bg-background">
                    <div className="text-lg text-secondary font-medium">
                        Admin
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {auth.username}
                    </div>
                    <div className="text-base text-secondary mt-4">
                        Jugadores en la sala
                    </div>
                    <div className="text-lg font-semibold text-primary">
                        {/* {room.players.length} */} 20 jugadores
                    </div>
                </div>
                {/* Actions Column */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                    <Link
                        to="/admin/menu"
                        className="w-full text-center rounded-md px-4 py-3 font-medium bg-primary text-white hover:bg-secondary hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        Administrar mapa
                    </Link>
                    <Link
                        to="/admin/room"
                        className="w-full text-center rounded-md px-4 py-3 font-medium border border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        Administrar sala
                    </Link>
                    <Link
                        to="/admin/dashboard"
                        className="text-center rounded-md text-sm px-3 py-1 font-extralight bg-primary text-white hover:bg-secondary hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        Administración avanzada
                    </Link>
                </div>
            </div>
            {/* Room Number Display - Centered below main menu */}
            <div className="mt-6 flex justify-center">
                <div className="rounded-md px-3 py-2 font-medium text-xs text-secondary bg-white/60 border border-accent shadow-sm">
                    Sala: 2345 {/* room.number */}
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
