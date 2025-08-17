import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import {
  JwtPlayerPayload,
  PlayerFromJwt,
} from '../player/interfaces/player-jwt.interface';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient<Socket>();
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        throw new WsException('Authentication token not provided');
      }

      const payload = this.validateToken(token);

      (client.data as { user?: PlayerFromJwt }).user = payload;

      return true;
    } catch (_error) {
      throw new WsException('Authentication failed');
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const authToken: unknown = client.handshake.auth?.token;
    if (authToken && typeof authToken === 'string') {
      return authToken;
    }

    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }

  private validateToken(token: string): PlayerFromJwt {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify<JwtPlayerPayload>(token, {
        secret: jwtSecret,
      });

      if (!payload.sub) {
        throw new WsException('Invalid token payload');
      }

      return {
        id: payload.sub,
        username: payload.username,
        aiGeneration: payload.aiGeneration,
      };
    } catch (_error) {
      throw new WsException('Invalid or expired token');
    }
  }
}
