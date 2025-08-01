import type { Admin, Player } from '../types/auth'
import Cookies from 'js-cookie'

export function getAdminData(): Admin | never {
    const adminData = Cookies.get('admin')
    if (!adminData) {
        throw new Error('No admin data found')
    }

    try {
        return JSON.parse(adminData)
    } catch {
        throw new Error('Invalid admin data')
    }
}

export function getPlayerData(): Player | never {
    const playerData = Cookies.get('player')
    if (!playerData) {
        throw new Error('No player data found')
    }

    try {
        return JSON.parse(playerData)
    } catch {
        throw new Error('Invalid player data')
    }
}
