import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLoginResponseDto } from './dto/admin-login-response.dto';
import { AdminTokenPayloadDto } from './dto/admin-token-payload.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateAdminToken(id: string, username: string): string {
    const payload: AdminTokenPayloadDto = {
      sub: id,
      username: username,
    };

    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  private verifyAdminToken(token: string): {
    id: string;
    username: string;
  } {
    try {
      const decoded = this.jwtService.verify<AdminTokenPayloadDto>(token);

      if ('aiGeneration' in decoded) {
        throw new UnauthorizedException('Invalid token for admin');
      }

      return {
        id: decoded.sub,
        username: decoded.username,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('expired')) {
        throw new UnauthorizedException('Token expired');
      }
      if (
        errorMessage.includes('invalid') ||
        errorMessage.includes('malformed')
      ) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  login(loginDto: AdminLoginDto): AdminLoginResponseDto {
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

    const admin = {
      id: 'admin-' + Date.now(),
      username: adminUsername,
    };

    const token = this.generateAdminToken(admin.id, admin.username);

    return {
      id: admin.id,
      username: admin.username,
      token,
    };
  }

  refreshToken(token: string): AdminLoginResponseDto {
    try {
      const decoded = this.verifyAdminToken(token);

      const newToken = this.generateAdminToken(decoded.id, decoded.username);

      return {
        id: decoded.id,
        username: decoded.username,
        token: newToken,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
