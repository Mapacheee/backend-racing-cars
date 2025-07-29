import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

type ProtectedRouteProps = {
    children: ReactNode
    redirectIfLoggedIn?: boolean
}

export default function ProtectedRoute({
    children,
    redirectIfLoggedIn = false,
}: ProtectedRouteProps) {
    console.log('ProtectedRoute: ', 'the protected route is active')
    const { isAdmin, isPlayer } = useAuth()
    if (isAdmin()) {
        // TODO: navigate to admin menu instead
        return <Navigate to="/admin/login" replace />
    }

    if (redirectIfLoggedIn && isPlayer()) {
        // If already logged in, redirect from login to menu
        return <Navigate to="/training/menu" replace />
    }

    if (!redirectIfLoggedIn && !isPlayer()) {
        // If not logged in, redirect to login
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
