export declare class RaceStatistics {
    id: string;
    raceDate: Date;
    participants: {
        aiModelId: string;
        position: number;
        finishTime?: number;
        distanceCompleted: number;
        lapTimes: number[];
    }[];
    trackInfo: {
        trackId: string;
        trackName: string;
        numberOfLaps: number;
    };
    raceConditions: {
        weather?: string;
        difficulty?: string;
        numberOfParticipants: number;
    };
    raceMetrics: {
        averageSpeed: number;
        bestLapTime: number;
        totalRaceTime: number;
        collisions: number;
    };
}
