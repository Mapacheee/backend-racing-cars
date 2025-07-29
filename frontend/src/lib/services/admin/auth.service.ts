import type { LoginCredentials } from '../../types/auth'

const API_URL = 'http://localhost:3000/api'

export const AdminAuthService = {
    async login(credentials: LoginCredentials) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Authentication failed')
        }

        return response.json()
    },
}
