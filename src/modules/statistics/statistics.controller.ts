import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayerFromJwt } from '../auth/player/interfaces/player-jwt.interface.d';
import {
  CreateRaceStatisticsDto,
  RaceStatisticsFilterDto,
} from './dto/race-statistics.dto';
import {
  AIModelStats,
  PlayerStatistics,
  TrackLeaderboardEntry,
} from './interfaces/statistics.interface';
import { RaceStatistics } from './entities/race-statistics.entity';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('player')
  getPlayerStatistics(
    @Request() { user: player }: { user: PlayerFromJwt },
  ): Promise<PlayerStatistics> {
    return this.statisticsService.getPlayerStatistics(player.id);
  }

  @Get('ai-model/:id')
  getAiModelStatistics(@Param('id') id: string): Promise<AIModelStats> {
    return this.statisticsService.getAIModelStats(id);
  }

  @Get('track/:id/leaderboard')
  getTrackLeaderboard(
    @Param('id') id: string,
  ): Promise<TrackLeaderboardEntry[]> {
    return this.statisticsService.getTrackLeaderboard(id);
  }

  @Post('race')
  @UseGuards(JwtAuthGuard)
  createRaceStatistics(
    @Body() createRaceStatisticsDto: CreateRaceStatisticsDto,
  ): Promise<RaceStatistics> {
    return this.statisticsService.create(createRaceStatisticsDto);
  }

  @Get('races')
  @UseGuards(JwtAuthGuard)
  getRaceStatistics(
    @Query() filters: RaceStatisticsFilterDto,
  ): Promise<RaceStatistics[]> {
    return this.statisticsService.findAll(filters);
  }

  @Get('ai-model/:id/performance')
  getAIModelPerformance(@Param('id') id: string): Promise<AIModelStats> {
    return this.statisticsService.getAIModelStats(id);
  }
}
