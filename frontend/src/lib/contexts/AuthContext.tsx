import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'
import Cookies from 'js-cookie'
import type { AuthState } from '../types/auth'

type SetPlayer = { name: string; aiGeneration: number }
type SetAdmin = { name: string; email: string }

type AuthContextType = {
    auth: AuthState | null
    setPlayer: (player: SetPlayer) => void
    setAdmin: (admin: SetAdmin, token: string) => void
    clearAuth: () => void
    isAdmin: () => boolean
    isPlayer: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState>(() => {
        const adminData = Cookies.get('admin')
        console.log('AuthProvider: adminData:', adminData)
        if (adminData) {
            try {
                return JSON.parse(adminData) as AuthState
            } catch {}
        }

        // Check for player in cookies
        const playerCookie = Cookies.get('player')
        console.log('AuthProvider: playerCookie:', playerCookie)
        if (playerCookie) {
            try {
                const playerData = JSON.parse(playerCookie) as AuthState
                return playerData
            } catch {
                return { user: null, token: null }
            }
        }

        Cookies.remove('player')
        Cookies.remove('admin')

        return { user: null, token: null }
    })

    useEffect(() => {
        if (auth.user) {
            Cookies.set('player', JSON.stringify(auth), { expires: 7 })
        } else {
            Cookies.remove('player')
        }
        if (auth.token) {
            Cookies.set('admin', JSON.stringify(auth), { expires: 7 })
        } else {
            Cookies.remove('admin')
        }
    }, [auth])

    const setPlayer = ({ name, aiGeneration }: SetPlayer) => {
        setAuth({ user: { name, aiGeneration, role: 'player' }, token: null })
        Cookies.set('player', JSON.stringify(auth), { expires: 7 })
    }

    const setAdmin = ({ name, email }: SetAdmin, token: string) => {
        const authState: AuthState = {
            user: { name, email, role: 'admin' },
            token,
        }
        setAuth(authState)
        Cookies.set('admin', JSON.stringify(auth), {
            expires: 7,
        })
    }

    const clearAuth = () => {
        setAuth({ user: null, token: null })
        Cookies.remove('player')
        Cookies.remove('admin')
    }

    const isAdmin = () => auth?.user?.role === 'admin'
    const isPlayer = () => auth?.user?.role === 'player'

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

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
