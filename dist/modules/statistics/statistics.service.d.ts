import { Repository } from 'typeorm';
import { RaceStatistics } from './entities/race-statistics.entity';
import { CreateRaceStatisticsDto, RaceStatisticsFilterDto } from './dto/race-statistics.dto';
import { AIModelStats, TrackLeaderboardEntry, PlayerStatistics } from './interfaces/statistics.interface';
export declare class StatisticsService {
    private readonly raceStatisticsRepository;
    constructor(raceStatisticsRepository: Repository<RaceStatistics>);
    create(createRaceStatisticsDto: CreateRaceStatisticsDto): Promise<RaceStatistics>;
    findAll(filters: RaceStatisticsFilterDto): Promise<RaceStatistics[]>;
    getAIModelStats(aiModelId: string): Promise<AIModelStats>;
    getTrackLeaderboard(trackId: string): Promise<TrackLeaderboardEntry[]>;
    getPlayerStatistics(_id: string): Promise<PlayerStatistics>;
}
