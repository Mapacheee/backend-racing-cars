import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import type { User, Player, Admin, AuthState } from '../types/auth.types';

type AuthContextType = {
    auth: AuthState;
    setPlayer: (player: Player) => void;
    setAdmin: (admin: Admin, token: string) => void;
    clearAuth: () => void;
    isAdmin: () => boolean;
    isPlayer: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState>(() => {
        // Check for admin session in localStorage
        const adminData = localStorage.getItem('admin');
        if (adminData) {
            try {
                return JSON.parse(adminData);
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
                    user: {
                        name: playerData.name,
                        aiGeneration: playerData.aiGeneration,
                        role: 'player'
                    } as Player
                };
            } catch {
                return { user: null };
            }
        }

        return { user: null };
    });

    const setPlayer = (player: Player) => {
        setAuth({ user: player });
        Cookies.set('player', JSON.stringify({
            name: player.name,
            aiGeneration: player.aiGeneration
        }), { expires: 7 });
    };

    const setAdmin = (admin: Admin, token: string) => {
        const authState = { user: admin, token };
        setAuth(authState);
        localStorage.setItem('admin', JSON.stringify(authState));
    };

    const clearAuth = () => {
        setAuth({ user: null });
        Cookies.remove('player');
        localStorage.removeItem('admin');
    };

    const isAdmin = () => auth.user?.role === 'admin';
    const isPlayer = () => auth.user?.role === 'player';

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

    return (
        <AuthContext.Provider value={{ 
            auth, 
            setPlayer, 
            setAdmin, 
            clearAuth,
            isAdmin,
            isPlayer
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
