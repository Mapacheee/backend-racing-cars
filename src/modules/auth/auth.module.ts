import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthController } from './admin/admin-auth.controller';
import { PlayerAuthController } from './player/player-auth.controller';
import { AdminAuthService } from './admin/admin-auth.service';
import { PlayerAuthService } from './player/player-auth.service';
import { PlayersModule } from '../players/player.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PlayersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
      }),
    }),
  ],
  controllers: [AdminAuthController, PlayerAuthController],
  providers: [AdminAuthService, PlayerAuthService, JwtStrategy],
  exports: [AdminAuthService, PlayerAuthService],
})
export class AuthModule {}
