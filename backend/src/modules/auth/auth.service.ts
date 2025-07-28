import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      return null;
    }

    // para usuarios administradores, verificar contraseña
    if (user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, isAdmin: user.isAdmin };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      },
    };
  }

  generateSimpleToken(user: any) {
    const payload = { username: user.username, sub: user.id, isAdmin: false };
    return this.jwtService.sign(payload);
  }

  validateSimpleToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }
}