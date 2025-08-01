import { Outlet } from 'react-router-dom'
import { useAuth } from '../../../lib/contexts/AuthContext'
import type { AdminAuth } from '../../../lib/types/auth'

export function AdminLayout() {
    const { auth, clearAuth } = useAuth<AdminAuth>()

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Admin Dashboard
                        </h1>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-4">
                                {auth.name}
                            </span>
                            <button
                                onClick={clearAuth}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    )
}
