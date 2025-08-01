export type Player = {
    name: string
    role: 'player'
    aiGeneration: number
    token: string
}
export type Admin = {
    name: string
    role: 'admin'
    token: string
}
export type User = Player | Admin

export type PlayerResponse = {
    name: string
    aiGeneration: number
    token: string
}
export type AdminResponse = { name: string; token: string }

export type AuthContextType = {
    auth: User | null
    setPlayer: (player: PlayerResponse) => void
    setAdmin: (admin: AdminResponse) => void
    clearAuth: () => void
    isAdmin: () => boolean
    isPlayer: () => boolean
}

export interface PlayerAuth extends AuthContextType {
    auth: Player
}

export interface AdminAuth extends AuthContextType {
    auth: Admin
}
