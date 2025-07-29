/// <reference types="vite/client" />

import type { RaceFormData, Track, AIModel } from '../../types/race.types';

const API_URL = 'http://localhost:3000/api';

export const AdminRaceService = {
    async getTracks(): Promise<Track[]> {
        const response = await fetch(`${API_URL}/tracks`);
        if (!response.ok) throw new Error('error al obtener pistas');
        return response.json();
    },

    async getAIModels(): Promise<AIModel[]> {
        const response = await fetch(`${API_URL}/ai-models`);
        if (!response.ok) throw new Error('error al obtener modelos de IA');
        return response.json();
    },

    async createRace(raceData: RaceFormData) {
        const token = localStorage.getItem('admin') 
            ? JSON.parse(localStorage.getItem('admin')!).token 
            : null;

        if (!token) {
            throw new Error('auth requerido');
        }

        const response = await fetch(`${API_URL}/races`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(raceData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'error al crear la carrera');
        }

        return response.json();
    }
};
