export type UserRole = 'player' | 'admin'

export interface BaseUser {
    name: string
    role: UserRole
}

export interface Player extends BaseUser {
    role: 'player'
    aiGeneration: number
}

export interface Admin extends BaseUser {
    role: 'admin'
    email: string
}

export type User = Player | Admin

export interface AuthState {
    user: User | null
    token: string | null
}

export interface LoginCredentials {
    email: string
    password: string
}
