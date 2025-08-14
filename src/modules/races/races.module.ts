import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RacesService } from './races.service';
import { RacesController } from './races.controller';
import { Race } from './entities/race.entity';
import { RaceParticipant } from './entities/race-participant.entity';
import { TracksModule } from '../tracks/tracks.module';
import { AiModelsModule } from '../ai-models/ai-models.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Race, RaceParticipant]),
    TracksModule,
    AiModelsModule,
  ],
  controllers: [RacesController],
  providers: [RacesService],
  exports: [RacesService],
})
export class RacesModule {}
