import { createContext, useContext, useState, type ReactNode } from 'react'
import Cookies from 'js-cookie'
import type {
    Admin,
    AdminAuth,
    AuthContextType,
    Player,
    PlayerAuth,
    SetAdmin,
    SetPlayer,
    User,
} from '../types/auth'

function clearAuthCookies(role: 'player' | 'admin' | 'both') {
    if (role === 'player') {
        Cookies.remove('player')
    } else if (role === 'admin') {
        Cookies.remove('admin')
    } else if (role === 'both') {
        Cookies.remove('player')
        Cookies.remove('admin')
    }
}

function setAuthCookies(data: User): void {
    Cookies.set('player', JSON.stringify(data), { expires: 7 })
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<User | null>(() => {
        const adminCookie = Cookies.get('admin')
        if (adminCookie) {
            try {
                const adminData: User = JSON.parse(adminCookie)
                return adminData
            } catch {}
        }

        // Check for player in cookies
        const playerCookie = Cookies.get('player')
        if (playerCookie) {
            try {
                const playerData: User = JSON.parse(playerCookie)
                return playerData
            } catch {
                clearAuthCookies('both')
                return null
            }
        }

        clearAuthCookies('both')
        return null
    })

    const setPlayer = (playerData: SetPlayer) => {
        const player: Player = {
            role: 'player',
            ...playerData,
        }
        setAuth(player)
        setAuthCookies(player)
    }

    const setAdmin = (adminData: SetAdmin) => {
        const admin: Admin = {
            role: 'admin',
            ...adminData,
        }
        setAuth(admin)
        setAuthCookies(admin)
    }

    const clearAuth = () => {
        setAuth(null)
        clearAuthCookies('both')
    }

    const isAdmin = () => auth?.role === 'admin'
    const isPlayer = () => auth?.role === 'player'

    return (
        <AuthContext.Provider
            value={{
                auth,
                setPlayer,
                setAdmin,
                clearAuth,
                isAdmin,
                isPlayer,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth<
    T extends AuthContextType | PlayerAuth | AdminAuth = AuthContextType,
>(): T {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context as T
}
