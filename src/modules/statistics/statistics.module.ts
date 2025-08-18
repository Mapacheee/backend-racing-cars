import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { PlayersModule } from '../players/player.module';
import { AiModelsModule } from '../ai-models/ai-models.module';

import { RaceStatistics } from './entities/race-statistics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaceStatistics]),
    PlayersModule,
    AiModelsModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
