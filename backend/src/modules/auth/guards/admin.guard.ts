import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No se proporcionó token de autenticación');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Comprobar si el usuario es administrador
      if (!payload.isAdmin) {
        throw new UnauthorizedException('Acceso solo para administradores');
      }

      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o usuario sin privilegios');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
