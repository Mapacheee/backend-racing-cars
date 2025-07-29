export interface RaceFormData {
  trackId: string;
  aiModels: string[];
  raceConditions: {
    weather?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    numberOfParticipants: number;
  };
  raceConfig: {
    numberOfLaps: number;
    maxTime?: number;
  };
}

export interface Track {
  id: string;
  name: string;
  description: string;
  length: number;
  difficulty: string;
}

export interface AIModel {
  id: string;
  name: string;
  userId: string;
  username: string;
  performance: {
    wins: number;
    races: number;
    bestLapTime: number;
  };
}
