import axios from 'axios'
import type { AdminResponse } from '../../types/auth'

//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = 'http://localhost:3000/api'

// Configure axios defaults
axios.defaults.withCredentials = true

export const AdminAuthService = {
    async login(email: string, password: string): Promise<AdminResponse> {
        try {
            const response = await axios.post(`${API_URL}/auth/admin/login`, {
                email,
                password,
            })
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    error.response.data.message || 'Error de autenticación'
                )
            }
            throw new Error('Error de autenticación')
        }
    },

    async logout(): Promise<void> {
        try {
            await axios.post(`${API_URL}/auth/admin/logout`)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    error.response.data.message || 'Error al cerrar sesión'
                )
            }
            throw new Error('Error al cerrar sesión')
        }
    },

    async refreshToken(): Promise<AdminResponse> {
        try {
            const response = await axios.post(`${API_URL}/auth/admin/refresh`)
            return response.data
        } catch (error) {
            throw new Error('Sesión expirada')
        }
    },
}
