import type { AIModel, Track, RaceFormData } from '../types/race.types';

/// <reference types="vite/client" />
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const RaceService = {
  async getTracks(): Promise<Track[]> {
    const response = await fetch(`${API_URL}/tracks`);
    if (!response.ok) throw new Error('Failed to fetch tracks');
    return response.json();
  },

  async getAIModels(): Promise<AIModel[]> {
    const response = await fetch(`${API_URL}/ai-models`);
    if (!response.ok) throw new Error('Failed to fetch AI models');
    return response.json();
  },

  async createRace(raceData: RaceFormData) {
    const response = await fetch(`${API_URL}/races`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(raceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create race');
    }

    return response.json();
  }
};
