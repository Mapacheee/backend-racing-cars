export interface AIModelStats {
  totalRaces: number;
  totalDistance: number;
  positions: number[];
  lapTimes: number[];
  averagePosition?: number;
  bestPosition?: number;
  bestLapTime?: number;
  averageLapTime?: number;
}

export interface TrackLeaderboardEntry {
  aiModelId: string;
  bestPosition: number;
  bestLapTime: number;
  totalRaces: number;
  wins: number;
}

export interface PlayerStatistics {
  totalRaces: number;
  totalWins: number;
  bestPosition: number;
  totalDistance: number;
  bestLapTime: number;
  averageLapTime: number;
  allLapTimes?: number[];
}
