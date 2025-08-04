import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { RacesModule } from '../races/races.module';
import { UsersModule } from '../users/users.module';
import { AiModelsModule } from '../ai-models/ai-models.module';
// import { Race } from '../races/entities/race.entity';
// import { RaceParticipant } from '../races/entities/race-participant.entity';
// import { AIModel } from '../ai-models/entities/ai-model.entity';
import { RaceStatistics } from './entities/race-statistics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaceStatistics]),
    RacesModule,
    UsersModule,
    AiModelsModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
