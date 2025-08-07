import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLoginResponse } from './interfaces/admin-login-response.dto';
import {
  AdminTokenPayload,
  AdminTokenPayloadResponse,
} from './interfaces/admin-token-payload.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateAdminToken(admin: AdminTokenPayloadResponse): string {
    const payload: AdminTokenPayload = {
      sub: admin.username,
      iat: Math.floor(Date.now() / 1000),
      jti: randomUUID(),
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    return this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: '24h',
    });
  }

  private verifyAdminToken(token: string): AdminTokenPayloadResponse {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const decoded = this.jwtService.verify<AdminTokenPayload>(token, {
        secret: jwtSecret,
      });

      if ('aiGeneration' in decoded) {
        throw new UnauthorizedException('Invalid token for admin');
      }

      return {
        username: decoded.sub,
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

  login(loginDto: AdminLoginDto): AdminLoginResponse {
    const { username, password } = loginDto;

    const adminUsername = this.configService.get<string>(
      'ADMIN_USERNAME',
    ) as string;
    const adminPassword = this.configService.get<string>(
      'ADMIN_PASSWORD',
    ) as string;

    if (username !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException(
        'Credenciales de administrador inválidas',
      );
    }

    const admin = { username: adminUsername };

    const token = this.generateAdminToken({ username: admin.username });

    return {
      username: admin.username,
      token,
    };
  }

  refreshToken(token: string): AdminLoginResponse {
    try {
      const decoded = this.verifyAdminToken(token);

      const newToken = this.generateAdminToken({ username: decoded.username });

      return {
        username: decoded.username,
        token: newToken,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
