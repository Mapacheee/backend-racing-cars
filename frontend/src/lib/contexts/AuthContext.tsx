import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import type { User, Player, Admin, AuthState, AuthContextType } from '../types/auth.types';
import { AdminAuthService } from '../services/admin/auth.service';

const AuthContext = createContext<AuthContextType>({
    auth: { isAuthenticated: false, user: null },
    login: async () => {},
    adminLogin: async () => {},
    logout: async () => {},
    error: null
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState>(() => {
        // Check for admin session in localStorage
        const adminData = localStorage.getItem('admin');
        if (adminData) {
            try {
                const data = JSON.parse(adminData);
                return {
                    isAuthenticated: true,
                    user: data.user
                };
            } catch {
                // Invalid admin data, check for player
            }
        }

        // Check for player in cookies
        const playerCookie = Cookies.get('player');
        if (playerCookie) {
            try {
                const playerData = JSON.parse(playerCookie);
                return {
                    isAuthenticated: true,
                    user: {
                        id: playerData.id || 'local',
                        name: playerData.name,
                        aiGeneration: playerData.aiGeneration,
                        role: 'player'
                    } as Player
                };
            } catch {
                return { isAuthenticated: false, user: null };
            }
        }

        return { isAuthenticated: false, user: null };
    });

    const [error, setError] = useState<string | null>(null);

    const login = async (username: string, password: string) => {
        try {
            setError(null);
            // Para mantener compatibilidad con el login actual
            setAuth({ 
                isAuthenticated: true,
                user: {
                    id: 'local',
                    name: username,
                    aiGeneration: 1,
                    role: 'player'
                } 
            });
            Cookies.set('player', JSON.stringify({
                name: username,
                aiGeneration: 1
            }), { expires: 7 });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
            throw err;
        }
    };

    const adminLogin = async (email: string, password: string) => {
        try {
            setError(null);
            const response = await AdminAuthService.login(email, password);
            setAuth({
                isAuthenticated: true,
                user: response.user
            });
            localStorage.setItem('admin', JSON.stringify(response));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
            throw err;
        }
    };

    const logout = async () => {
        try {
            setError(null);
            if (auth.user?.role === 'admin') {
                await AdminAuthService.logout();
                localStorage.removeItem('admin');
            } else {
                Cookies.remove('player');
            }
            setAuth({ isAuthenticated: false, user: null });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
            throw err;
        }
    };

    // Keep storage in sync with state
    useEffect(() => {
        if (!auth.user) {
            Cookies.remove('player');
            localStorage.removeItem('admin');
            return;
        }

        if (auth.user.role === 'player') {
            Cookies.set('player', JSON.stringify({
                name: auth.user.name,
                aiGeneration: auth.user.aiGeneration
            }), { expires: 7 });
        } else if (auth.user.role === 'admin') {
            localStorage.setItem('admin', JSON.stringify(auth));
        }
    }, [auth]);

    // Sincronizar el almacenamiento con el estado
    useEffect(() => {
        if (!auth.isAuthenticated || !auth.user) {
            Cookies.remove('player');
            localStorage.removeItem('admin');
            return;
        }

        if (auth.user.role === 'player') {
            Cookies.set('player', JSON.stringify({
                id: auth.user.id,
                name: auth.user.name,
                aiGeneration: (auth.user as Player).aiGeneration
            }), { expires: 7 });
        }
    }, [auth]);

    return (
        <AuthContext.Provider value={{ 
            auth,
            login,
            adminLogin,
            logout,
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
