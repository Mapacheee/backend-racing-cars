import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { RacesModule } from '../races/races.module';
import { UsersModule } from '../users/users.module';
import { AiModelsModule } from '../ai-models/ai-models.module';

@Module({
  imports: [RacesModule, UsersModule, AiModelsModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
