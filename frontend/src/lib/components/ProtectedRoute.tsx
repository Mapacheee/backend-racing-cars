import { Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import type { ReactNode } from 'react'

type ProtectedRouteProps = {
    children: ReactNode
    redirectIfLoggedIn?: boolean
}

export default function ProtectedRoute({
    children,
    redirectIfLoggedIn = false,
}: ProtectedRouteProps) {
    const playerCookie = Cookies.get('player')

    if (redirectIfLoggedIn && playerCookie) {
        // If already logged in, redirect from login to menu
        return <Navigate to="/training/menu" replace />
    }

    if (!redirectIfLoggedIn && !playerCookie) {
        // If not logged in, redirect to login
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
