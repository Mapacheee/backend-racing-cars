export interface LeaderboardEntry {
    aiModelId: string;
    aiModelName: string;
    username: string;
    totalRaces: number;
    victories: number;
    podiums: number;
    victoryRate: number;
    podiumRate: number;
    averageTime: number;
    bestTime: number | null;
}
