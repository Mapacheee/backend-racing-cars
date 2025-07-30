import type { LoginResponse } from '../../types/auth.types';

//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = 'http://localhost:3000/api';

export const AdminAuthService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error de autenticación');
        }

        return response.json();
    },

    async logout(): Promise<void> {
        const response = await fetch(`${API_URL}/auth/admin/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al cerrar sesión');
        }
    },

    async refreshToken(): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/admin/refresh`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Sesión expirada');
        }

        return response.json();
    }
};
