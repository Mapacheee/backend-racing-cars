import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersService } from './player.service';
import { PlayersController } from './player.controller';
import { Player } from './entities/player.entity';
import { AIModel } from '../ai-models/entities/ai-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, AIModel])],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
