import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModelsModule } from './modules/ai-models/ai-models.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { RacesModule } from './modules/races/races.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { getDatabaseConfig } from './config/database.config';

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
    UsersModule,
    AuthModule,
    AiModelsModule,
    TracksModule,
    RacesModule,
    StatisticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
