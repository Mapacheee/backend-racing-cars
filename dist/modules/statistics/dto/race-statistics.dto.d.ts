declare class ParticipantDto {
    aiModelId: string;
    position: number;
    finishTime?: number;
    distanceCompleted: number;
    lapTimes: number[];
}
declare class TrackInfoDto {
    trackId: string;
    trackName: string;
    numberOfLaps: number;
}
declare class RaceConditionsDto {
    weather?: string;
    difficulty?: string;
    numberOfParticipants: number;
}
declare class RaceMetricsDto {
    averageSpeed: number;
    bestLapTime: number;
    totalRaceTime: number;
    collisions: number;
}
export declare class CreateRaceStatisticsDto {
    participants: ParticipantDto[];
    trackInfo: TrackInfoDto;
    raceConditions?: RaceConditionsDto;
    raceMetrics?: RaceMetricsDto;
}
export declare class RaceStatisticsFilterDto {
    trackId?: string;
    aiModelId?: string;
    dateFrom?: string;
    dateTo?: string;
    difficulty?: string;
}
export {};
