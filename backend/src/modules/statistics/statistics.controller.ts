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
import {
  CreateRaceStatisticsDto,
  RaceStatisticsFilterDto,
} from './dto/race-statistics.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUserStatistics(@Request() req) {
    return this.statisticsService.getUserStatistics(req.user.userId);
  }

  @Get('ai-model/:id')
  getAiModelStatistics(@Param('id') id: string) {
    return this.statisticsService.getAIModelStats(id);
  }

  @Get('track/:id/leaderboard')
  getTrackLeaderboard(@Param('id') id: string) {
    return this.statisticsService.getTrackLeaderboard(id);
  }

  @Post('race')
  @UseGuards(JwtAuthGuard)
  createRaceStatistics(
    @Body() createRaceStatisticsDto: CreateRaceStatisticsDto,
  ) {
    return this.statisticsService.create(createRaceStatisticsDto);
  }

  @Get('races')
  @UseGuards(JwtAuthGuard)
  getRaceStatistics(@Query() filters: RaceStatisticsFilterDto) {
    return this.statisticsService.findAll(filters);
  }

  @Get('ai-model/:id/performance')
  getAIModelPerformance(@Param('id') id: string) {
    return this.statisticsService.getAIModelStats(id);
  }
}
