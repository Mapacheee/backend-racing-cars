import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PlayersService } from '../../players/player.service';
import { PlayerLoginDto, PlayerLoginResponseDto } from './dto/player-login.dto';
import { PlayerRegisterDto } from './dto/player-register.dto';
import {
  JwtPlayerPayload,
  PlayerFromJwt,
} from './interfaces/player-jwt.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayerAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly playersService: PlayersService,
  ) {}

  private generatePlayerToken(player: PlayerFromJwt): string {
    const payload: JwtPlayerPayload = {
      sub: player.id,
      username: player.username,
      aiGeneration: player.aiGeneration,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    return this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: '24h',
    });
  }

  private verifyPlayerToken(token: string): PlayerFromJwt {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const decoded = this.jwtService.verify<JwtPlayerPayload>(token, {
        secret: jwtSecret,
      });

      return {
        id: decoded.sub,
        username: decoded.username,
        aiGeneration: decoded.aiGeneration,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('expired')) {
        throw new UnauthorizedException('Token expirado');
      }
      if (
        errorMessage.includes('invalid') ||
        errorMessage.includes('malformed')
      ) {
        throw new UnauthorizedException('Token inválido');
      }
      throw new UnauthorizedException('La verificación del token falló');
    }
  }

  async register(
    registerDto: PlayerRegisterDto,
  ): Promise<PlayerLoginResponseDto> {
    const { username, password } = registerDto;

    try {
      const existingPlayer = await this.playersService.findByUsername(username);
      if (existingPlayer) {
        throw new ConflictException('El usuario ya existe');
      }

      const newPlayer = await this.playersService.create({
        username,
        password,
      });

      const token = this.generatePlayerToken({
        id: newPlayer.id,
        username: newPlayer.username,
        aiGeneration: newPlayer.aiGeneration,
      });

      return {
        id: newPlayer.id,
        username: newPlayer.username,
        aiGeneration: newPlayer.aiGeneration,
        token,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Error al crear el usuario');
    }
  }

  async login(loginDto: PlayerLoginDto): Promise<PlayerLoginResponseDto> {
    const { username, password } = loginDto;

    try {
      const player = await this.playersService.findByUsername(username);

      if (!player) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        player.password_hash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('La contraseña es incorrecta');
      }

      const token = this.generatePlayerToken({
        id: player.id,
        username: player.username,
        aiGeneration: player.aiGeneration,
      });

      return {
        id: player.id,
        username: player.username,
        aiGeneration: player.aiGeneration,
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error de autenticación');
    }
  }

  refreshToken(token: string): PlayerLoginResponseDto {
    try {
      const decoded = this.verifyPlayerToken(token);

      const newToken = this.generatePlayerToken({
        id: decoded.id,
        username: decoded.username,
        aiGeneration: decoded.aiGeneration,
      });

      return {
        id: decoded.id,
        username: decoded.username,
        aiGeneration: decoded.aiGeneration,
        token: newToken,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
