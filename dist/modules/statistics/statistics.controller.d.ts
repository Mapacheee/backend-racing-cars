import { StatisticsService } from './statistics.service';
import { PlayerFromJwt } from '../auth/player/interfaces/player-jwt.interface.d';
import { CreateRaceStatisticsDto, RaceStatisticsFilterDto } from './dto/race-statistics.dto';
import { AIModelStats, PlayerStatistics, TrackLeaderboardEntry } from './interfaces/statistics.interface';
import { RaceStatistics } from './entities/race-statistics.entity';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getPlayerStatistics({ user: player }: {
        user: PlayerFromJwt;
    }): Promise<PlayerStatistics>;
    getAiModelStatistics(id: string): Promise<AIModelStats>;
    getTrackLeaderboard(id: string): Promise<TrackLeaderboardEntry[]>;
    createRaceStatistics(createRaceStatisticsDto: CreateRaceStatisticsDto): Promise<RaceStatistics>;
    getRaceStatistics(filters: RaceStatisticsFilterDto): Promise<RaceStatistics[]>;
    getAIModelPerformance(id: string): Promise<AIModelStats>;
}
