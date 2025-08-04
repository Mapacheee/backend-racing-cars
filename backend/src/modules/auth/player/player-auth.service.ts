import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { PlayerLoginDto } from './dto/player-login.dto';
import { PlayerRegisterDto } from './dto/player-register.dto';
import { PlayerLoginResponseDto } from './dto/player-login-response.dto';
import { PlayerTokenPayloadDto } from './dto/player-token-payload.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayerAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private generatePlayerToken(player: {
    id: string;
    username: string;
    aiGeneration: number;
  }): string {
    const payload: PlayerTokenPayloadDto = {
      sub: player.id,
      username: player.username,
      aiGeneration: player.aiGeneration,
    };

    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  private verifyPlayerToken(token: string): {
    id: string;
    username: string;
    aiGeneration: number;
  } {
    try {
      const decoded = this.jwtService.verify<PlayerTokenPayloadDto>(token);

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
      // Check if user already exists
      const existingPlayer = await this.usersService.findByUsername(username);
      if (existingPlayer) {
        throw new ConflictException('El usuario ya existe');
      }

      // Create new player
      const newPlayer = await this.usersService.create({
        username,
        password,
      });

      // Generate token
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
      const player = await this.usersService.findByUsername(username);

      if (!player) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(
        password,
        player.password_hash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('La contraseña es incorrecta');
      }

      // Generate token
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

      // Generate new token
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
