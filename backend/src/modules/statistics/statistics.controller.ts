import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { LeaderboardEntry } from './interfaces/leaderboard-entry.interface';

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
    return this.statisticsService.getAiModelStatistics(id);
  }

  @Get('leaderboard')
  getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.statisticsService.getLeaderboard();
  }
}
