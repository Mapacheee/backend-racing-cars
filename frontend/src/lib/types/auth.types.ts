export type UserRole = 'player' | 'admin';

export interface BaseUser {
    id: string;
    name: string;
    role: UserRole;
}

export interface Player extends BaseUser {
    role: 'player';
    aiGeneration: number;
}

export interface Admin extends BaseUser {
    role: 'admin';
    email: string;
}

export type User = Player | Admin;

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthContextType {
    auth: AuthState;
    login: (email: string, password: string) => Promise<void>;
    adminLogin: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

export interface LoginResponse {
    user: User;
    token: string;
}
