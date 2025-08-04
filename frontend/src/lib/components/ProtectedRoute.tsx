import { Navigate, Outlet } from 'react-router-dom'
import type { JSX } from 'react'
import { useAuth } from '../contexts/AuthContext'

type ProtectedRouteProps = {
    redirectIfLoggedIn?: boolean
}

export default function ProtectedRoute({
    redirectIfLoggedIn = false,
}: ProtectedRouteProps): JSX.Element {
    const { isAdmin, isPlayer } = useAuth()

    if (redirectIfLoggedIn && isAdmin()) {
        return <Navigate to="/admin/menu" replace />
    }

    if (!redirectIfLoggedIn && isAdmin()) {
        return <Outlet />
    }

    if (redirectIfLoggedIn && isPlayer()) {
        return <Navigate to="/training/menu" replace />
    }

    if (!redirectIfLoggedIn && isPlayer()) {
        return <Outlet />
    }

    return <Navigate to="/" replace />
}
