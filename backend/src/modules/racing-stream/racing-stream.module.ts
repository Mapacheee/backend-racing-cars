import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RacingController } from './racing-stream.controller';
import { RaceGateway } from './racing-stream.gateway';
import { RoomService } from './services/room.service';
import { RacePackageService } from './services/race-package.service';
import { Track } from '../tracks/entities/track.entity';
import { AIModel } from '../ai-models/entities/ai-model.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Track, AIModel]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  controllers: [RacingController],
  providers: [RaceGateway, RoomService, RacePackageService],
  exports: [RoomService, RacePackageService],
})
export class RacingModule {}
