import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersModule } from './modules/players/player.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModelsModule } from './modules/ai-models/ai-models.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { getDatabaseConfig } from './config/database.config';
import { RacingModule } from './modules/racing-stream/racing-stream.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    PlayersModule,
    AuthModule,
    AiModelsModule,
    TracksModule,
    StatisticsModule,
    RacingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
